import type { Metadata } from "next";
import { CustomProfilesList } from "@/components/dashboard/CustomProfilesList";
import { requireUser } from "@/lib/auth";
import { listUserProfiles, toProfileView } from "@/lib/userProfiles";

export const metadata: Metadata = {
  title: "Mano profiliai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra/mano-profiliai");
  const profiles = await listUserProfiles(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Mano profiliai</h1>
      <p className="max-w-xl text-sm text-muted-foreground">
        Sukurkite savo žemėlapio profilį, pakeiskite jo stilių redaktoriumi ir
        pasirinkite, kas jį gali atidaryti.
      </p>
      <CustomProfilesList profiles={profiles.map(toProfileView)} />
    </div>
  );
}
