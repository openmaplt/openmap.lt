"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_REJECTION_REASON_LENGTH = 500;

interface PendingCommentControlsProps {
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

// Shared Tvirtinti/Atmesti UI for a single pending comment — used both by the
// flat moderation queue (/paskyra/komentarai/tvirtinimas) and inline in the
// POI panel's comment thread, so the two moderation entry points behave
// identically (same reason-for-rejection prompt in both places).
export function PendingCommentControls({
  onApprove,
  onReject,
}: PendingCommentControlsProps) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = async () => {
    setBusy(true);
    await onApprove();
    setBusy(false);
  };

  const handleReject = async () => {
    setBusy(true);
    await onReject(rejectReason.trim());
    setBusy(false);
    setRejecting(false);
    setRejectReason("");
  };

  if (rejecting) {
    return (
      <div className="space-y-2">
        <Textarea
          value={rejectReason}
          onChange={(event) =>
            setRejectReason(
              event.target.value.slice(0, MAX_REJECTION_REASON_LENGTH),
            )
          }
          maxLength={MAX_REJECTION_REASON_LENGTH}
          placeholder="Priežastis (neprivaloma)..."
          disabled={busy}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={busy}
            onClick={handleReject}
          >
            Patvirtinti atmetimą
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setRejecting(false);
              setRejectReason("");
            }}
          >
            Atšaukti
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button type="button" size="sm" disabled={busy} onClick={handleApprove}>
        Patvirtinti
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => setRejecting(true)}
      >
        Atmesti
      </Button>
    </div>
  );
}
