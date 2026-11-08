"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { shareUrl } from "./customProfileUi";

interface ProfileAddressProps {
  slug: string;
  // False while an admin has the profile hidden: the address then only works
  // for the author, so there is nothing to hand out.
  shareable: boolean;
}

// The profile's address under its title, with buttons to preview the map and
// copy the address. Profiles are
// public, so this is all "sharing" needs; the line below says so plainly.
export function ProfileAddress({ slug, shareable }: ProfileAddressProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl({ slug }));
      toast.success("Nuoroda nukopijuota.");
    } catch {
      toast.error("Nepavyko nukopijuoti nuorodos.");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <code className="text-sm text-muted-foreground">/m/{slug}</code>
        {/* Also for a hidden profile: its author can still open it. */}
        <Button size="sm" variant="outline" asChild>
          <a href={`/m/${slug}`} target="_blank" rel="noopener noreferrer">
            Peržiūrėti žemėlapį
          </a>
        </Button>
        {shareable && (
          <Button size="sm" variant="outline" onClick={handleCopy}>
            Kopijuoti nuorodą
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {shareable
          ? "Profilis viešas: jį gali atidaryti kiekvienas, žinantis adresą. Paieškos sistemos jo neindeksuoja, kol administratorius nepatvirtina jo kaip bazinio."
          : "Profilis paslėptas: adresas kitiems neveikia."}
      </p>
    </div>
  );
}
