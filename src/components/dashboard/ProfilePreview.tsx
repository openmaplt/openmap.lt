"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";

// maplibre-gl only loads when a preview is actually shown.
const ProfilePreviewMap = dynamic(() => import("./ProfilePreviewMap"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-muted" />,
});

interface ProfilePreviewProps {
  slug: string;
  // `updated_at` of the style, in ms: changes whenever the style is saved.
  styleVersion: number;
}

// Live preview of a custom profile's map on its settings page. On a wide screen
// it is always shown; on a phone it stays collapsed until asked for, so the
// settings are not pushed down by a map and the page does not pay for WebGL
// unless the map is wanted.
export function ProfilePreview({ slug, styleVersion }: ProfilePreviewProps) {
  const isMobile = useIsMobile();
  const [opened, setOpened] = useState(false);
  // Bumped to make the map fetch the style again (see below).
  const [refreshKey, setRefreshKey] = useState(0);

  const show = isMobile === false || opened;

  // The style is edited elsewhere (the Maputnik editor, possibly in another
  // tab). Coming back to this tab re-fetches it, so edits, new data sources
  // included, show up without a manual reload. The map keeps its camera.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setRefreshKey((key) => key + 1);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  // `v` busts the browser cache when the page loads after a save, `r` after a
  // refresh here; the API ignores both.
  const styleUrl = `/api/profile-styles/${slug}?v=${styleVersion}&r=${refreshKey}`;

  return (
    <section
      aria-label="Žemėlapio peržiūra"
      className="space-y-2 rounded-md border p-3"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Žemėlapio peržiūra</h2>
        {show && (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRefreshKey((key) => key + 1)}
            >
              Atnaujinti
            </Button>
            {isMobile && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setOpened(false)}
              >
                Slėpti
              </Button>
            )}
          </div>
        )}
      </div>

      {show ? (
        <div className="h-80 overflow-hidden rounded-md border xl:h-[34rem]">
          <ProfilePreviewMap styleUrl={styleUrl} />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Pamatykite, kaip atrodo jūsų žemėlapis su dabartiniu stiliumi.
          </p>
          <Button variant="outline" onClick={() => setOpened(true)}>
            Rodyti žemėlapį
          </Button>
        </div>
      )}
    </section>
  );
}
