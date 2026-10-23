import type { Metadata } from "next";
import { ProfileSelector } from "@/components/dashboard/ProfileSelector";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profiliai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra/profiliai");

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Profiliai</h1>
      <p className="text-sm text-muted-foreground">
        Pažymėkite, kuriuos žemėlapio profilius norite matyti profilių
        pasirinkimo valdiklyje. Atidarius tiesioginę nuorodą į išjungtą profilį,
        jis vis tiek bus parodytas.
      </p>
      <ProfileSelector initialDisabledIds={user.settings.hiddenProfileIds} />
    </div>
  );
}
