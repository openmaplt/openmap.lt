"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePoiDescription } from "@/hooks/use-poi-description";

// Tailwind's preflight strips default paragraph/list spacing and link
// styling (normally restored by the @tailwindcss/typography "prose" class —
// not installed in this project, see AiSearchChat.tsx's markdownComponents
// for the same workaround) — spelled out explicitly here since this field is
// meant for multi-paragraph text with links, unlike PoiContent.tsx's bare
// <ReactMarkdown> for the single-line OSM `description` tag.
const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 text-foreground">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-5 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-5 space-y-1">{children}</ol>
  ),
};

export function PoiDescription() {
  const { isEligible, isLoading, body, canEdit, save } = usePoiDescription();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!isEligible || isLoading) return null;
  if (!body && !canEdit) return null;

  const startEditing = () => {
    setDraft(body);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await save(draft);
    setIsSaving(false);
    if (result.ok) {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="px-4 py-3 border-t border-border space-y-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Aprašymas markdown formatu…"
          rows={5}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            disabled={isSaving}
          >
            Atšaukti
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            Išsaugoti
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-border">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm flex-1 min-w-0">
          {body ? (
            <ReactMarkdown components={markdownComponents}>
              {body}
            </ReactMarkdown>
          ) : (
            <span className="text-sm text-muted-foreground">
              Aprašymo dar nėra.
            </span>
          )}
        </div>
        {canEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={startEditing}
            aria-label="Redaguoti aprašymą"
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
