"use client";

import { useEffect } from "react";
import { toast } from "@/components/ui/toast";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  login_error: "Prisijungti nepavyko. Bandykite dar kartą.",
  no_session: "Sesija baigėsi — prisijunkite iš naujo ir bandykite vėl.",
  already_linked_elsewhere: "Ši paskyra jau susieta su kitu openmap profiliu.",
};

export function OAuthErrorToast() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("login_error")
      ? "login_error"
      : (params.get("link_error") ?? null);
    if (!errorCode) return;

    toast.error(OAUTH_ERROR_MESSAGES[errorCode] ?? "Įvyko klaida.");
    params.delete("login_error");
    params.delete("link_error");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (query ? `?${query}` : ""),
    );
  }, []);

  return null;
}
