import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomProfileSettings } from "@/components/dashboard/CustomProfileSettings";
import { ProfileAddress } from "@/components/dashboard/ProfileAddress";
import { ProfilePreview } from "@/components/dashboard/ProfilePreview";
import { PROFILE_MODERATION } from "@/domain/profileModeration";
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
      <Link
        href="/paskyra/mano-profiliai"
        className="inline-block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        ← Visi mano profiliai
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {profile.name}
        </h1>
        <ProfileAddress
          slug={profile.slug}
          shareable={profile.moderationStatus === PROFILE_MODERATION.VISIBLE}
        />
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
