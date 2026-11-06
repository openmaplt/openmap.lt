import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomProfileSettings } from "@/components/dashboard/CustomProfileSettings";
import { ProfilePreview } from "@/components/dashboard/ProfilePreview";
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
      {/* Below xl the preview sits on top (collapsed on phones); from xl up it
          is a sticky column next to the settings. */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        <div className="xl:sticky xl:top-6 xl:col-start-2 xl:row-start-1">
          <ProfilePreview
            slug={profile.slug}
            styleVersion={profile.updatedAt.getTime()}
          />
        </div>
        {/* Keyed by id so state never carries over between two profiles. */}
        <div className="xl:col-start-1 xl:row-start-1">
          <CustomProfileSettings
            key={profile.id}
            initialProfile={toProfileView(profile)}
          />
        </div>
      </div>
    </div>
  );
}
