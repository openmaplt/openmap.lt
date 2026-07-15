"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthProvider";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  login_error: "Prisijungti nepavyko. Bandykite dar kartą.",
  no_session: "Sesija baigėsi — prisijunkite iš naujo ir bandykite vėl.",
  already_linked_elsewhere: "Ši paskyra jau susieta su kitu openmap profiliu.",
};

export function OAuthResultToast() {
  const { user } = useAuth();

  // Reads the OAuth redirect's own one-time query params on mount only —
  // `user` is read for personalizing the message, not as a re-trigger dep.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("login_error")
      ? "login_error"
      : (params.get("link_error") ?? null);
    const loginSuccess = params.get("login_success");
    const linkSuccess = params.get("link_success");
    if (!errorCode && !loginSuccess && !linkSuccess) return;

    if (errorCode) {
      toast.error(OAUTH_ERROR_MESSAGES[errorCode] ?? "Įvyko klaida.");
    } else if (loginSuccess) {
      const displayName = user?.username ?? user?.name;
      toast.success(displayName ? `Sveiki, ${displayName}!` : "Prisijungėte.");
    } else if (linkSuccess) {
      toast.success("Paskyra susieta.");
    }

    params.delete("login_error");
    params.delete("link_error");
    params.delete("login_success");
    params.delete("link_success");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : ""),
    );
  }, []);

  return null;
}
