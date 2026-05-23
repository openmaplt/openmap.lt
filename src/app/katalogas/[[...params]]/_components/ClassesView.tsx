import { notFound } from "next/navigation";
import { getProfileClasses } from "@/data/omProfileClasses";
import { getProfiles } from "@/data/omProfiles";
import { Breadcrumb } from "./Breadcrumb";
import { ClassesGrid } from "./ClassesGrid";

interface ClassesViewProps {
  profileName: string;
}

export async function ClassesView({ profileName }: ClassesViewProps) {
  const [profiles, classes] = await Promise.all([
    getProfiles(),
    getProfileClasses(profileName),
  ]);

  const activeProfile = profiles.find((p) => p.name === profileName);
  if (!activeProfile && classes.length === 0) notFound();

  const profileTitle = activeProfile?.description || profileName;

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Katalogas", href: "/katalogas" },
          { label: profileTitle },
        ]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {profileTitle}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Klasių sąrašas. Pasirinkite konkrečią klasę, kad pamatytumėte visus
          objektus.
        </p>
      </div>

      <ClassesGrid profileName={profileName} classes={classes} />
    </div>
  );
}
