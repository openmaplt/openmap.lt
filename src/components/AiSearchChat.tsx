"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Sparkles, Trash2 } from "lucide-react";
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

interface AiSearchChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pos: [number, number];
  onSelectPoiId: (id: string) => void;
  // Called with the full AI search result id set (see streamSearchResponse
  // in src/lib/aiSearchClient.ts) so the map can highlight them, and with
  // [] to clear the highlight (chat closed or cleared).
  onHighlightIds: (ids: string[]) => void;
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
}: AiSearchChatProps) {
  const [input, setInput] = useState("");

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
    },
  });

  // Clear the map highlight once the chat is closed.
  useEffect(() => {
    if (!open) onHighlightIds([]);
  }, [open, onHighlightIds]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // The input now sits at the top (see below), so new messages grow
  // downward, out of view, unless we scroll to them ourselves.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally re-runs on every message/status change, though it only reads the ref
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status]);

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
    sendMessage({ text });
    setInput("");
  };

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
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </SheetHeader>

        <div className="p-4 border-b flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Klauskite apie vietas..."
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
                  : "self-start bg-gray-100 rounded-lg px-3 py-2 text-sm max-w-[90%] prose prose-sm"
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
          {(status === "submitted" || status === "streaming") && (
            <p className="text-sm text-muted-foreground self-start">
              Ieškoma...
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-destructive self-start">
              {error?.message || "Kilo klaida, pabandykite vėliau."}
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
