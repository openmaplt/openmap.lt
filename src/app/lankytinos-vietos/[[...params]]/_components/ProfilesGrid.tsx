import { AlertCircle, ChevronRight, FolderOpen } from "lucide-react";
import type { Profile } from "@/data/omProfiles";

interface ProfilesGridProps {
  profiles: Profile[];
}

export function ProfilesGrid({ profiles }: ProfilesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {profiles.length > 0 ? (
        profiles.map((profile) => (
          <div
            key={profile.name}
            className="bg-card border rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FolderOpen className="size-6" />
                </span>
                <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border">
                  {profile.count} vietovės
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {profile.description}
              </h2>
            </div>

            <a
              href={`/lankytinos-vietos/${profile.name}`}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-600/90 px-4 py-3 rounded-lg shadow-sm hover:shadow transition-all w-full md:w-fit"
            >
              <span>Atverti kategorijas</span>
              <ChevronRight className="size-3.5" />
            </a>
          </div>
        ))
      ) : (
        <div className="col-span-2 p-12 bg-muted/20 border rounded-2xl text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <AlertCircle className="size-8 text-muted-foreground/60" />
          <span>
            Nepavyko įkelti katalogų profilių. Patikrinkite duomenų bazės ryšį.
          </span>
        </div>
      )}
    </div>
  );
}
