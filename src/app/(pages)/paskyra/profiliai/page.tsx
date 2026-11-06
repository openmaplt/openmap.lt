import type { Metadata } from "next";
import { BaseProfileRequests } from "@/components/dashboard/BaseProfileRequests";
import { CustomProfilesManager } from "@/components/dashboard/CustomProfilesManager";
import { ProfileSelector } from "@/components/dashboard/ProfileSelector";
import { requireUser } from "@/lib/auth";
import {
  listRequestedProfiles,
  listUserProfiles,
  toProfileView,
} from "@/lib/userProfiles";
import { listSelectableProfiles } from "@/lib/viewerProfiles";

export const metadata: Metadata = {
  title: "Profiliai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra/profiliai");

  const [selectable, own, requested] = await Promise.all([
    listSelectableProfiles(user.id),
    listUserProfiles(user.id),
    user.isAdmin ? listRequestedProfiles() : Promise.resolve([]),
  ]);

  // A deleted profile can linger in the saved hidden list; drop it so the
  // enabled count below matches what is actually listed.
  const selectableIds = new Set(selectable.map((profile) => profile.id));
  const hiddenIds = user.settings.hiddenProfileIds.filter((id) =>
    selectableIds.has(id),
  );

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Profiliai</h1>
        <p className="text-sm text-muted-foreground">
          Pažymėkite, kuriuos žemėlapio profilius norite matyti profilių
          pasirinkimo valdiklyje. Atidarius tiesioginę nuorodą į išjungtą
          profilį, jis vis tiek bus parodytas.
        </p>
        <ProfileSelector
          profiles={selectable.map((profile) => ({
            id: profile.id,
            name: profile.mapStyles[0].name,
          }))}
          initialDisabledIds={hiddenIds}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Mano profiliai</h2>
        <p className="text-sm text-muted-foreground">
          Sukurkite savo žemėlapio profilį ir pakeiskite jo stilių redaktoriumi.
          Pasirinkite, kas jį gali atidaryti.
        </p>
        <CustomProfilesManager initialProfiles={own.map(toProfileView)} />
      </section>

      {user.isAdmin && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Siūlomi bazinių profilių sąrašui
          </h2>
          <BaseProfileRequests
            initialRequests={requested.map((profile) => ({
              id: profile.id,
              slug: profile.slug,
              name: profile.name,
              ownerName: profile.ownerName,
            }))}
          />
        </section>
      )}
    </div>
  );
}
