import type { Metadata } from "next";
import type { ReactNode } from "react";
import HelpLayout from "@/components/HelpLayout";
import { BASE_URL } from "@/config/config";
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

  return {
    title: "Lankytinos vietos - Openmap.lt",
    description:
      "Lankytinų vietų, turistinių objektų ir pramogų katalogas. Žemėlapio registrų indeksas.",
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

  return <HelpLayout>{view}</HelpLayout>;
}
