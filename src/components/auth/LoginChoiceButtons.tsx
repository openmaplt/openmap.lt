import { MapPin } from "lucide-react";
import { PROVIDERS } from "@/lib/oauth/providers";
import type { OAuthIntent } from "@/lib/oauth/state";

interface LoginChoiceButtonsProps {
  returnTo: string;
  intent?: OAuthIntent;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.27 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function OsmIcon() {
  return (
    <div className="flex size-5 items-center justify-center rounded-full bg-[#7ebc6f]">
      <MapPin className="size-3.5 text-white" fill="white" />
    </div>
  );
}

export function LoginChoiceButtons({
  returnTo,
  intent = "login",
}: LoginChoiceButtonsProps) {
  const query = `intent=${intent}&returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <div className="flex flex-col gap-3">
      <a
        href={`/api/auth/${PROVIDERS.OSM}/login?${query}`}
        className="flex items-center gap-3 rounded-lg border border-input px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
      >
        <OsmIcon />
        Tęsti su OpenStreetMap
      </a>
      <a
        href={`/api/auth/${PROVIDERS.GOOGLE}/login?${query}`}
        className="flex items-center gap-3 rounded-lg border border-input px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
      >
        <GoogleIcon />
        Tęsti su Google
      </a>
    </div>
  );
}
