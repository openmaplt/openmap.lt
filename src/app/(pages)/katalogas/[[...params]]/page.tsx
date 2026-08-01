import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BASE_URL } from "@/config/config";
import { getProfileClasses } from "@/data/omProfileClasses";
import { getProfiles } from "@/data/omProfiles";
import { ClassesView } from "./_components/ClassesView";
import { ObjectsView } from "./_components/ObjectsView";
import { ProfilesView } from "./_components/ProfilesView";

interface PageProps {
  params: Promise<{ params?: string[] }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const routeParams = resolvedParams.params || [];
  const path = routeParams.map((segment) => encodeURIComponent(segment));
  const canonical = [`${BASE_URL}/katalogas`, ...path].join("/");

  const [profileName, className] = routeParams;

  let title = "Katalogas";
  let description =
    "Lankytinų vietų, turistinių objektų ir pramogų katalogas. Žemėlapio registrų indeksas.";

  if (profileName) {
    const profiles = await getProfiles();
    const activeProfile = profiles.find((p) => p.name === profileName);
    const profileTitle = activeProfile?.description || profileName;

    if (className) {
      const classes = await getProfileClasses(profileName);
      const activeClass = classes.find((c) => c.name === className);
      const classTitle = activeClass?.description || className;

      title = `${classTitle} - ${profileTitle}`;
      description = `${classTitle} (${profileTitle}) objektų sąrašas žemėlapio kataloge.`;
    } else {
      title = profileTitle;
      description = `${profileTitle} katalogas. Peržiūrėkite klases ir objektus žemėlapyje.`;
    }
  }

  return {
    title,
    description,
    alternates: { canonical },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const routeParams = resolvedParams.params || [];
  const level = routeParams.length;

  let view: ReactNode;
  if (level === 0) {
    view = <ProfilesView />;
  } else if (level === 1) {
    view = <ClassesView profileName={routeParams[0]} />;
  } else {
    view = (
      <ObjectsView
        profileName={routeParams[0]}
        className={routeParams[1] ?? ""}
      />
    );
  }

  return view;
}
