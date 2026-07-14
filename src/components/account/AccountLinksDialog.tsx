"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const returnTo = encodeURIComponent(pathname);
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlink(provider: Provider) {
    setPendingProvider(provider);
    setError(null);
    try {
      const res = await fetch("/api/auth/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(UNLINK_ERROR_MESSAGES[data.error] ?? "Įvyko klaida.");
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
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`/api/auth/${provider}/login?intent=link&returnTo=${returnTo}`}
                    >
                      Prijungti
                    </a>
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
