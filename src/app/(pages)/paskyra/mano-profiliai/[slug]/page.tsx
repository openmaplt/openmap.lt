import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomProfileSettings } from "@/components/dashboard/CustomProfileSettings";
import { requireUser } from "@/lib/auth";
import { getOwnedProfileBySlug, toProfileView } from "@/lib/userProfiles";

export const metadata: Metadata = {
  title: "Profilio nustatymai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: PageProps<"/paskyra/mano-profiliai/[slug]">) {
  const { slug } = await params;
  const user = await requireUser(`/paskyra/mano-profiliai/${slug}`);
  const profile = await getOwnedProfileBySlug(user.id, slug);
  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {profile.name}
        </h1>
        <p className="text-sm text-muted-foreground">/m/{profile.slug}</p>
      </div>
      {/* Keyed by id so state never carries over between two profiles. */}
      <CustomProfileSettings
        key={profile.id}
        initialProfile={toProfileView(profile)}
      />
    </div>
  );
}
