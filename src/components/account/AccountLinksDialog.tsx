"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { unlinkAction } from "@/actions/accountLinking";
import { startLoginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROVIDER_LIST, PROVIDERS, type Provider } from "@/lib/oauth/providers";
import { useAuth } from "@/providers/AuthProvider";

const PROVIDER_LABELS: Record<Provider, string> = {
  [PROVIDERS.OSM]: "OpenStreetMap",
  [PROVIDERS.GOOGLE]: "Google",
};

const UNLINK_ERROR_MESSAGES: Record<string, string> = {
  last_remaining_method:
    "Negalima atjungti — tai paskutinis likęs prisijungimo būdas.",
  rate_limited: "Per daug bandymų, pabandykite vėliau.",
};

interface AccountLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountLinksDialog({
  open,
  onOpenChange,
}: AccountLinksDialogProps) {
  const { linkedProviders, refresh } = useAuth();
  const pathname = usePathname();
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  async function handleUnlink(provider: Provider) {
    setPendingProvider(provider);
    setError(null);
    try {
      const result = await unlinkAction(provider);
      if (!result.ok) {
        setError(UNLINK_ERROR_MESSAGES[result.error] ?? "Įvyko klaida.");
        return;
      }
      await refresh();
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tvarkyti prisijungimus</DialogTitle>
          <DialogDescription>
            Prijunkite kelis prisijungimo būdus prie tos pačios paskyros.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {PROVIDER_LIST.map((provider) => {
            const linked = linkedProviders.find((p) => p.provider === provider);
            return (
              <div
                key={provider}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="text-sm font-medium">
                    {PROVIDER_LABELS[provider]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {linked ? (linked.label ?? "Prijungta") : "Neprijungta"}
                  </div>
                </div>
                {linked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pendingProvider === provider}
                    onClick={() => handleUnlink(provider)}
                  >
                    Atjungti
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startLoginAction(provider, "link", pathname)}
                  >
                    Prijungti
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
