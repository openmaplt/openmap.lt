import { getProfiles } from "@/data/omProfiles";
import { ProfilesGrid } from "./ProfilesGrid";

export async function ProfilesView() {
  const profiles = await getProfiles();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Katalogas</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Sveiki atvykę į atvirą žemėlapio objektų katalogą. Čia galite naršyti
          visus žemėlapyje sužymėtus objektus, suskirstytus pagal specializuotus
          profilius bei kategorijas.
        </p>
      </div>
      <ProfilesGrid profiles={profiles} />
    </div>
  );
}
