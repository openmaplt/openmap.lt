import type { Metadata } from "next";
import Link from "next/link";
import { ProfileSelector } from "@/components/dashboard/ProfileSelector";
import { requireUser } from "@/lib/auth";
import { listSelectableProfiles } from "@/lib/viewerProfiles";

export const metadata: Metadata = {
  title: "Rodomi profiliai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra/profiliai");
  const selectable = await listSelectableProfiles(user.id);

  // A deleted profile can linger in the saved hidden list; drop it so the
  // enabled count matches what is actually listed.
  const selectableIds = new Set(selectable.map((profile) => profile.id));
  const hiddenIds = user.settings.hiddenProfileIds.filter((id) =>
    selectableIds.has(id),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Rodomi profiliai
      </h1>
      <p className="text-sm text-muted-foreground">
        Pažymėkite, kuriuos žemėlapio profilius norite matyti profilių
        pasirinkimo valdiklyje. Atidarius tiesioginę nuorodą į išjungtą profilį,
        jis vis tiek bus parodytas.
      </p>
      <p className="text-sm text-muted-foreground">
        Savo profilius kuriate ir tvarkote skiltyje{" "}
        <Link
          href="/paskyra/mano-profiliai"
          className="underline underline-offset-4"
        >
          Mano profiliai
        </Link>
        .
      </p>
      <ProfileSelector
        profiles={selectable.map((profile) => ({
          id: profile.id,
          name: profile.mapStyles[0].name,
        }))}
        initialDisabledIds={hiddenIds}
      />
    </div>
  );
}
