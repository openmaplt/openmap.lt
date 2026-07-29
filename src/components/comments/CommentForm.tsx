"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createCommentAction } from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/AuthProvider";

const MAX_BODY_LENGTH = 2000;

interface CommentFormProps {
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
}

export function CommentForm({
  mapProfileId,
  objectRef,
  poiName,
}: CommentFormProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <p className="text-sm text-muted-foreground">
        Norėdami palikti komentarą,{" "}
        <Link
          href={`/prisijungimas?returnTo=${encodeURIComponent(pathname)}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          prisijunkite
        </Link>
        .
      </p>
    );
  }

  if (submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        Jūsų komentaras laukia patvirtinimo.
      </p>
    );
  }

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (trimmed.length === 0 || submitting) return;

    setSubmitting(true);
    setError(null);

    const result = await createCommentAction({
      mapProfileId,
      objectRef,
      poiName,
      body: trimmed,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(
        result.error === "rate_limited"
          ? "Per daug komentarų per trumpą laiką, pabandykite vėliau."
          : "Nepavyko pateikti komentaro. Pabandykite dar kartą.",
      );
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(event) =>
          setBody(event.target.value.slice(0, MAX_BODY_LENGTH))
        }
        maxLength={MAX_BODY_LENGTH}
        placeholder="Rašyti komentarą..."
        disabled={submitting}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        size="sm"
        disabled={submitting || body.trim().length === 0}
        onClick={handleSubmit}
      >
        Komentuoti
      </Button>
    </div>
  );
}
