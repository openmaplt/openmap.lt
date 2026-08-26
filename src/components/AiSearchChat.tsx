"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Navigation, Send, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown, {
  type Components,
  defaultUrlTransform,
} from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/useIsMobile";

// Mirrors AiSearchRoutePayload (src/lib/aiSearchClient.ts) — the shape of
// the "data-aiSearchRoute" transient part written by streamSearchResponse.
// Redeclared here (not imported) the same way data-aiSearchResultIds below
// is just cast to string[] — aiSearchClient.ts is "server-only".
export type AiSearchRoutePayload = {
  profile: "foot" | "bike" | "car";
  // stops[0] IS the route start, stops[last] IS the end.
  stops: { id: string; name: string; lng: number; lat: number }[];
};

interface AiSearchChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pos: [number, number];
  onSelectPoiId: (id: string) => void;
  // Called with the full AI search result id set (see streamSearchResponse
  // in src/lib/aiSearchClient.ts) so the map can highlight them, and with
  // [] to clear the highlight (chat closed or cleared).
  onHighlightIds: (ids: string[]) => void;
  // Called when the user confirms building the route the model proposed
  // (see the "data-aiSearchRoute" transient part above).
  onShowRoute: (route: AiSearchRoutePayload) => void;
}

function extractMessageText(parts: { type: string; text?: string }[]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("");
}

export function AiSearchChat({
  open,
  onOpenChange,
  pos,
  onSelectPoiId,
  onHighlightIds,
  onShowRoute,
}: AiSearchChatProps) {
  const [input, setInput] = useState("");

  // The most recent route the model proposed (if any) — surfaced as a
  // "Rodyti maršrutą" button below the reply. Only one at a time: a new
  // question replaces it, whether or not the previous one was shown.
  const [pendingRoute, setPendingRoute] = useState<AiSearchRoutePayload | null>(
    null,
  );

  // Every id ever returned by an actual DB search this session (union
  // across turns, see onData below) — the response-synthesis model is
  // instructed to only mention ids from the list it's given, but a weaker
  // model doesn't reliably follow that: it has invented plausible-sounding
  // place names attached to real ids of unrelated POIs it was never given
  // (e.g. answering about Palanga with Kaunas fort ids, confidently wrong).
  // The prompt is not a security boundary — this set is: a "poi:<id>" link
  // only becomes clickable navigation if id is actually in it.
  const [knownPoiIds, setKnownPoiIds] = useState<Set<string>>(new Set());

  // Recreating the transport on every pos change doesn't itself send a
  // request — it only sets what gets attached to the NEXT sendMessage call,
  // so no debouncing needed.
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai-search",
        body: { pos },
      }),
    [pos],
  );

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport,
    // Transient "data-aiSearchResultIds" part (written in
    // streamSearchResponse, src/lib/aiSearchClient.ts) — the full match set,
    // not just the ids the model happened to mention in its reply.
    onData: (dataPart) => {
      if (dataPart.type === "data-aiSearchResultIds") {
        const ids = dataPart.data as string[];
        onHighlightIds(ids);
        setKnownPoiIds((prev) => new Set([...prev, ...ids]));
      }
      if (dataPart.type === "data-aiSearchRoute") {
        setPendingRoute(dataPart.data as AiSearchRoutePayload);
      }
    },
  });

  // Clear the map highlight once the chat is closed.
  useEffect(() => {
    if (!open) onHighlightIds([]);
  }, [open, onHighlightIds]);

  const handleShowRoute = () => {
    if (!pendingRoute) return;
    onShowRoute(pendingRoute);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Input sits at the bottom (see below), so a new message can grow out of
  // view above it — scroll the message list to its end whenever it changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-runs on every message/status change, though it only reads the ref
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

  // Desktop only: autofocus means you can start typing the moment the panel
  // opens without hunting for the input. Not on mobile — forcing the
  // on-screen keyboard open on panel-open (rather than on an explicit tap)
  // is intrusive, some browsers suppress it anyway, and this app has hit a
  // real Chrome viewport-resize glitch before when the keyboard covered a
  // bottom input — unresolved, tracked separately.
  useEffect(() => {
    if (open && isMobile === false) textareaRef.current?.focus();
  }, [open, isMobile]);

  // `poi:<id>` links (see buildSecondCallSystemPrompt in
  // src/app/api/ai-search/route.ts) are intercepted here and call
  // onSelectPoiId instead of navigating — the same camera-fly logic a
  // regular search result click uses (SearchFeature.tsx).
  const markdownComponents: Components = {
    a: ({ href, children }) => {
      if (href?.startsWith("poi:")) {
        const id = href.slice(4);
        // Not a real search result id — the model invented it (see
        // knownPoiIds above). Render as inert text, not a link: better an
        // unclickable mention than navigation to a wrong, unrelated place.
        if (!knownPoiIds.has(id)) {
          return <span>{children}</span>;
        }
        return (
          <button
            type="button"
            className="text-purple-600 underline hover:text-purple-800 cursor-pointer text-left"
            onClick={() => onSelectPoiId(id)}
          >
            {children}
          </button>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    // Tailwind's preflight strips <ol>/<ul> of list-style and padding by
    // default (normally restored by the @tailwindcss/typography plugin via
    // a "prose" class — not installed in this project, so it must be done
    // explicitly here) — without this, a numbered route reply rendered as
    // plain stacked lines with no visible "1./2./3." at all, indistinguishable
    // from each other once a long name wrapped to a second line.
    ol: ({ children }) => (
      <ol className="list-decimal list-outside pl-5 space-y-1 marker:font-semibold marker:text-purple-600">
        {children}
      </ol>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-outside pl-5 space-y-1">{children}</ul>
    ),
    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  };

  // react-markdown sanitizes link hrefs via defaultUrlTransform, which only
  // allows http/https/mailto/tel etc. — a "poi:" scheme is otherwise
  // silently turned into an empty string (XSS protection, not a bug). Let
  // "poi:" through unchanged so markdownComponents.a above can recognize
  // it; other schemes still go through normal sanitization.
  const markdownUrlTransform = (url: string) =>
    url.startsWith("poi:") ? url : defaultUrlTransform(url);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setPendingRoute(null);
    sendMessage({ text });
    setInput("");
  };

  const inputBlock = (
    <div className="p-4 border-t flex gap-2">
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Kas tave domina?"
        className="min-h-10 resize-none"
        rows={1}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={status === "submitted" || status === "streaming"}
      >
        <Send className="size-4" />
      </Button>
    </div>
  );

  const messagesBlock = (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
      {messages.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Paklauskite, pvz. „kur galiu suvalgyti cepelinų netoliese?“ arba
          „pasiūlyk piliakalnius aplinkui“.
        </p>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={
            message.role === "user"
              ? "self-end bg-purple-100 rounded-lg px-3 py-2 text-sm max-w-[85%]"
              : "self-start bg-gray-100 rounded-lg px-3 py-2 text-sm max-w-[90%]"
          }
        >
          <ReactMarkdown
            components={markdownComponents}
            urlTransform={markdownUrlTransform}
          >
            {extractMessageText(message.parts)}
          </ReactMarkdown>
        </div>
      ))}
      {pendingRoute && status !== "submitted" && status !== "streaming" && (
        <Button
          variant="outline"
          size="sm"
          className="self-start gap-2"
          onClick={handleShowRoute}
        >
          <Navigation className="size-4" />
          Rodyti maršrutą
        </Button>
      )}
      {(status === "submitted" || status === "streaming") && (
        <p className="text-sm text-muted-foreground self-start">Ieškoma...</p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive self-start">
          {error?.message || "Kilo klaida, pabandykite vėliau."}
        </p>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        // Like PoiDetails.tsx: without this, PoiDetails' Sheet opening/
        // closing looks like an "outside interaction" to this Sheet and
        // closes it too. With preventOutsideClose it stays open until the
        // user clicks X (SheetPrimitive.Close — a separate, explicit
        // mechanism, not outside-detection).
        preventOutsideClose
        side="right"
        showOverlay={false}
        className="flex flex-col"
      >
        <SheetHeader className="flex-row items-center justify-between pr-12">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple-500" />
            AI paieška
          </SheetTitle>
          {messages.length > 0 && (
            <Button
              size="icon"
              variant="ghost"
              title="Išvalyti pokalbį"
              onClick={() => {
                setMessages([]);
                onHighlightIds([]);
                setKnownPoiIds(new Set());
                setPendingRoute(null);
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </SheetHeader>

        {messagesBlock}
        {inputBlock}
      </SheetContent>
    </Sheet>
  );
}
