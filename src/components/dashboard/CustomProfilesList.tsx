"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCustomProfileAction } from "@/actions/customProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  MAX_PROFILES_PER_USER,
  PROFILE_NAME_MAX_LENGTH,
} from "@/config/custom-profiles";
import type { CustomProfileView } from "@/lib/userProfiles";
import { errorMessage, profilePath, statusBadge } from "./customProfileUi";

interface CustomProfilesListProps {
  profiles: CustomProfileView[];
}

// "Mano profiliai": every profile the user owns, plus creating a new one.
// Anything beyond a glance (visibility, sharing, editing the style, ...) lives
// on the profile's own page, so this list stays small however many settings a
// profile grows.
export function CustomProfilesList({ profiles }: CustomProfilesListProps) {
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const atLimit = profiles.length >= MAX_PROFILES_PER_USER;

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    const result = await createCustomProfileAction(newName);
    if (!result.ok) {
      setIsCreating(false);
      toast.error(errorMessage(result.error));
      return;
    }
    toast.success("Profilis sukurtas.");
    // The next thing anyone does with a new profile is set it up.
    router.push(profilePath(result.profile));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex max-w-md items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-profile-name" className="text-sm">
            Naujas profilis ({profiles.length}/{MAX_PROFILES_PER_USER})
          </Label>
          <Input
            id="new-profile-name"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Profilio pavadinimas"
            maxLength={PROFILE_NAME_MAX_LENGTH}
            disabled={atLimit}
          />
        </div>
        <Button
          type="submit"
          disabled={isCreating || atLimit || newName.trim() === ""}
        >
          {isCreating ? "Kuriama..." : "Sukurti"}
        </Button>
      </form>

      {profiles.length === 0 ? (
        <p className="max-w-xl text-sm text-muted-foreground">
          Dar neturite savo profilių. Sukurtas profilis pradedamas nuo
          topografinio žemėlapio stiliaus, kurį galėsite pakeisti redaktoriumi.
        </p>
      ) : (
        <ul className="max-w-xl divide-y rounded-md border">
          {profiles.map((profile) => {
            const badge = statusBadge(profile);
            return (
              <li
                key={profile.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">
                    <Link
                      href={profilePath(profile)}
                      className="underline-offset-4 hover:underline"
                    >
                      {profile.name}
                    </Link>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    /m/{profile.slug}
                  </p>
                  {badge && (
                    <span
                      className={
                        badge.tone === "alert"
                          ? "inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300"
                          : "inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                      }
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`/m/${profile.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Peržiūrėti
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={profilePath(profile)}>Tvarkyti</Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
