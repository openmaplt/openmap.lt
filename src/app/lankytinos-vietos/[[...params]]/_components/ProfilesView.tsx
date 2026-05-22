import { getProfiles } from "@/data/omProfiles";
import { ProfilesGrid } from "./ProfilesGrid";

export async function ProfilesView() {
  const profiles = await getProfiles();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Profiliai</h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Sveiki atvykę į atvirą žemėlapio registrų katalogą. Čia galite naršyti
          visas žemėlapyje sužymėtas vietas, suskirstytas pagal specializuotus
          profilius bei kategorijas.
        </p>
      </div>
      <ProfilesGrid profiles={profiles} />
    </div>
  );
}
