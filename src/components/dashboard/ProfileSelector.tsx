"use client";

import { useState } from "react";
import { saveDisabledProfilesAction } from "@/actions/userProfiles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { MAP_PROFILES } from "@/config/map-profiles";
import { useAuth } from "@/providers/AuthProvider";

interface ProfileSelectorProps {
  initialDisabledIds: string[];
}

const SAVE_ERROR_MESSAGES = {
  rate_limited: "Per daug bandymų — pabandykite vėliau.",
  all_disabled: "Bent vienas profilis turi likti įjungtas.",
  invalid_profiles: "Nepavyko išsaugoti pasirinkimo.",
  no_session: "Nepavyko išsaugoti pasirinkimo.",
} as const;

export function ProfileSelector({ initialDisabledIds }: ProfileSelectorProps) {
  const { refresh } = useAuth();
  const [disabled, setDisabled] = useState<Set<string>>(
    () => new Set(initialDisabledIds),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const toggleProfile = (id: string) => {
    setDisabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setIsDirty(true);
  };

  const enabledCount = MAP_PROFILES.length - disabled.size;
  const allEnabled = enabledCount === MAP_PROFILES.length;
  const noneEnabled = enabledCount === 0;

  const toggleAll = () => {
    setDisabled(
      allEnabled
        ? new Set(MAP_PROFILES.map((profile) => profile.id))
        : new Set(),
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ids = Array.from(disabled);
    const result = await saveDisabledProfilesAction(ids);
    setIsSaving(false);

    if (!result.ok) {
      toast.error(SAVE_ERROR_MESSAGES[result.error]);
      return;
    }

    // Pulls the new settings into the client session so the map's profile
    // switcher reflects them without a reload.
    await refresh();
    setIsDirty(false);
    toast.success("Pasirinkimas išsaugotas.");
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md divide-y max-w-md">
        <div className="flex items-center gap-3 p-3 bg-muted/30">
          <Checkbox
            id="profile-all"
            checked={allEnabled ? true : noneEnabled ? false : "indeterminate"}
            onCheckedChange={toggleAll}
          />
          <Label
            htmlFor="profile-all"
            className="cursor-pointer text-sm font-medium"
          >
            Visi profiliai
          </Label>
          <span className="text-xs opacity-70 ml-auto">
            {enabledCount}/{MAP_PROFILES.length}
          </span>
        </div>
        {MAP_PROFILES.map((profile) => (
          <div key={profile.id} className="flex items-center gap-3 p-3">
            <Checkbox
              id={`profile-${profile.id}`}
              checked={!disabled.has(profile.id)}
              onCheckedChange={() => toggleProfile(profile.id)}
            />
            <Label
              htmlFor={`profile-${profile.id}`}
              className="cursor-pointer text-sm"
            >
              {profile.mapStyles[0].name}
            </Label>
          </div>
        ))}
      </div>

      {noneEnabled && (
        <p className="text-sm text-destructive">
          Bent vienas profilis turi likti įjungtas.
        </p>
      )}

      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving || !isDirty || noneEnabled}
      >
        {isSaving ? "Išsaugoma..." : "Išsaugoti"}
      </Button>
    </div>
  );
}
