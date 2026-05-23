import { notFound } from "next/navigation";
import { getProfileClasses } from "@/data/omProfileClasses";
import { getProfileClassObjects } from "@/data/omProfileClassObjects";
import { getProfiles } from "@/data/omProfiles";
import { Breadcrumb } from "./Breadcrumb";
import { ObjectsList } from "./ObjectsList";

interface ObjectsViewProps {
  profileName: string;
  className: string;
}

export async function ObjectsView({
  profileName,
  className,
}: ObjectsViewProps) {
  const [profiles, classes, objects] = await Promise.all([
    getProfiles(),
    getProfileClasses(profileName),
    getProfileClassObjects(profileName, className),
  ]);

  const activeProfile = profiles.find((p) => p.name === profileName);
  const activeClass = classes.find((c) => c.name === className);

  if (!activeProfile && !activeClass && objects.length === 0) notFound();

  const profileTitle = activeProfile?.description || profileName;
  const classTitle = activeClass?.description || className;

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Profiliai", href: "/lankytinos-vietos" },
          { label: profileTitle, href: `/lankytinos-vietos/${profileName}` },
          { label: classTitle },
        ]}
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight">{classTitle}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Objektų sąrašas. Spustelėkite peržiūros mygtuką, norėdami atverti
          žemėlapį ties objektu.
        </p>
      </div>

      <ObjectsList objects={objects} />
    </div>
  );
}
