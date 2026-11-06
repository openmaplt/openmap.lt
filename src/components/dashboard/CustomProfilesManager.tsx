"use client";

import { useState } from "react";
import {
  createCustomProfileAction,
  deleteCustomProfileAction,
  regenerateShareKeyAction,
  renameCustomProfileAction,
  requestBaseProfileAction,
  setCustomProfileVisibilityAction,
  startProfileEditAction,
  withdrawBaseRequestAction,
} from "@/actions/customProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  MAX_PROFILES_PER_USER,
  PROFILE_NAME_MAX_LENGTH,
} from "@/config/custom-profiles";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";
import {
  PROFILE_VISIBILITY,
  type ProfileVisibility,
} from "@/domain/profileVisibility";
import type { CustomProfileView } from "@/lib/userProfiles";

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Per daug bandymų — pabandykite vėliau.",
  no_session: "Sesija pasibaigė — prisijunkite iš naujo.",
  not_found: "Profilis nerastas.",
  invalid_name: `Pavadinimas turi būti 1–${PROFILE_NAME_MAX_LENGTH} simbolių.`,
  limit_reached: `Galite turėti ne daugiau kaip ${MAX_PROFILES_PER_USER} profilių.`,
  invalid_visibility: "Neteisingas matomumas.",
  invalid_expiry: "Galiojimo data turi būti ateityje.",
  editor_unavailable: "Redaktorius kol kas neprieinamas.",
};

const VISIBILITY_LABELS: Record<ProfileVisibility, string> = {
  [PROFILE_VISIBILITY.PRIVATE]: "Privatus (tik aš)",
  [PROFILE_VISIBILITY.LINK]: "Pagal slaptą nuorodą",
  [PROFILE_VISIBILITY.PUBLIC]: "Viešas (kas turi adresą)",
};

const VISIBILITY_HINTS: Record<ProfileVisibility, string> = {
  [PROFILE_VISIBILITY.PRIVATE]: "Atidaryti gali tik jūs.",
  [PROFILE_VISIBILITY.LINK]:
    "Atidaryti gali tik tie, kam nusiuntėte nuorodą su slaptu raktu.",
  [PROFILE_VISIBILITY.PUBLIC]:
    "Atidaryti gali bet kas, žinantis adresą. Paieškos sistemos jo neindeksuos.",
};

const errorMessage = (error: string) =>
  ERROR_MESSAGES[error] ?? "Nepavyko atlikti veiksmo.";

// The address to send to someone. A `link` map is useless without its secret.
function shareUrl(profile: CustomProfileView): string {
  const url = new URL(`/m/${profile.slug}`, window.location.origin);
  if (profile.visibility === PROFILE_VISIBILITY.LINK && profile.shareKey) {
    url.searchParams.set("k", profile.shareKey);
  }
  return url.toString();
}

// `<input type="date">` works in local dates; a link stays valid through the
// end of the chosen day.
const toDateInput = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("sv-SE") : "";
const fromDateInput = (value: string) =>
  value ? new Date(`${value}T23:59:59`).toISOString() : null;

interface CustomProfilesManagerProps {
  initialProfiles: CustomProfileView[];
}

export function CustomProfilesManager({
  initialProfiles,
}: CustomProfilesManagerProps) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  // The profile an action is running for, so only its buttons are disabled.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const replaceProfile = (updated: CustomProfileView) =>
    setProfiles((prev) =>
      prev.map((profile) => (profile.id === updated.id ? updated : profile)),
    );

  // Runs an action that returns the updated profile and applies the result.
  const runAction = async (
    id: string,
    action: () => Promise<
      { ok: true; profile: CustomProfileView } | { ok: false; error: string }
    >,
    successMessage?: string,
  ) => {
    setBusyId(id);
    const result = await action();
    setBusyId(null);
    if (!result.ok) {
      toast.error(errorMessage(result.error));
      return false;
    }
    replaceProfile(result.profile);
    if (successMessage) toast.success(successMessage);
    return true;
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsCreating(true);
    const result = await createCustomProfileAction(newName);
    setIsCreating(false);
    if (!result.ok) {
      toast.error(errorMessage(result.error));
      return;
    }
    setProfiles((prev) => [...prev, result.profile]);
    setNewName("");
    toast.success("Profilis sukurtas.");
  };

  const handleRename = async (profile: CustomProfileView) => {
    const ok = await runAction(
      profile.id,
      () => renameCustomProfileAction(profile.id, renameValue),
      "Pavadinimas pakeistas.",
    );
    if (ok) setRenamingId(null);
  };

  const handleDelete = async (profile: CustomProfileView) => {
    setBusyId(profile.id);
    const result = await deleteCustomProfileAction(profile.id);
    setBusyId(null);
    if (!result.ok) {
      toast.error(errorMessage(result.error));
      return;
    }
    setProfiles((prev) => prev.filter((item) => item.id !== profile.id));
    setDeletingId(null);
    toast.success("Profilis ištrintas.");
  };

  const handleEdit = async (profile: CustomProfileView) => {
    setBusyId(profile.id);
    const result = await startProfileEditAction(profile.id);
    if (!result.ok) {
      setBusyId(null);
      toast.error(errorMessage(result.error));
      return;
    }
    window.location.assign(result.url);
  };

  const handleCopy = async (profile: CustomProfileView) => {
    try {
      await navigator.clipboard.writeText(shareUrl(profile));
      toast.success("Nuoroda nukopijuota.");
    } catch {
      toast.error("Nepavyko nukopijuoti nuorodos.");
    }
  };

  const atLimit = profiles.length >= MAX_PROFILES_PER_USER;

  return (
    <div className="space-y-4">
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

      {profiles.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Dar neturite savo profilių. Sukurtas profilis pradedamas nuo
          topografinio žemėlapio stiliaus, kurį galėsite pakeisti redaktoriumi.
        </p>
      )}

      <ul className="space-y-3">
        {profiles.map((profile) => {
          const busy = busyId === profile.id;
          const isPublic = profile.visibility === PROFILE_VISIBILITY.PUBLIC;
          const isLink = profile.visibility === PROFILE_VISIBILITY.LINK;
          return (
            <li
              key={profile.id}
              className="max-w-xl space-y-3 rounded-md border p-4"
            >
              {renamingId === profile.id ? (
                <div className="flex gap-2">
                  <Input
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    maxLength={PROFILE_NAME_MAX_LENGTH}
                    aria-label="Naujas pavadinimas"
                  />
                  <Button
                    size="sm"
                    disabled={busy || renameValue.trim() === ""}
                    onClick={() => handleRename(profile)}
                  >
                    Išsaugoti
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRenamingId(null)}
                  >
                    Atšaukti
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <a
                      href={`/m/${profile.slug}`}
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      /m/{profile.slug}
                    </a>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRenamingId(profile.id);
                      setRenameValue(profile.name);
                    }}
                  >
                    Pervadinti
                  </Button>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor={`visibility-${profile.id}`} className="text-sm">
                  Matomumas
                </Label>
                <Select
                  value={profile.visibility}
                  disabled={busy}
                  onValueChange={(value) =>
                    runAction(profile.id, () =>
                      setCustomProfileVisibilityAction(
                        profile.id,
                        value as ProfileVisibility,
                        null,
                      ),
                    )
                  }
                >
                  <SelectTrigger id={`visibility-${profile.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(VISIBILITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {VISIBILITY_HINTS[profile.visibility]}
                </p>
              </div>

              {isLink && (
                <div className="space-y-1.5">
                  <Label htmlFor={`expires-${profile.id}`} className="text-sm">
                    Nuoroda galioja iki (nebūtina)
                  </Label>
                  <Input
                    id={`expires-${profile.id}`}
                    type="date"
                    className="max-w-48"
                    disabled={busy}
                    min={new Date().toLocaleDateString("sv-SE")}
                    value={toDateInput(profile.expiresAt)}
                    onChange={(event) =>
                      runAction(profile.id, () =>
                        setCustomProfileVisibilityAction(
                          profile.id,
                          PROFILE_VISIBILITY.LINK,
                          fromDateInput(event.target.value),
                        ),
                      )
                    }
                  />
                </div>
              )}

              {profile.baseStatus !== PROFILE_BASE_STATUS.NONE && (
                <p className="text-xs">
                  {profile.baseStatus === PROFILE_BASE_STATUS.APPROVED
                    ? "Šis profilis yra bazinis: jį mato visi lankytojai."
                    : "Laukia administratoriaus patvirtinimo kaip bazinis profilis."}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => handleEdit(profile)}
                >
                  Keisti
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/m/${profile.slug}`}>Atidaryti</a>
                </Button>
                {(isPublic || isLink) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(profile)}
                  >
                    Kopijuoti nuorodą
                  </Button>
                )}
                {isLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        profile.id,
                        () => regenerateShareKeyAction(profile.id),
                        "Sukurta nauja nuoroda. Senos nebeveikia.",
                      )
                    }
                  >
                    Nauja nuoroda
                  </Button>
                )}
                {isPublic &&
                  profile.baseStatus === PROFILE_BASE_STATUS.NONE && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        runAction(
                          profile.id,
                          () => requestBaseProfileAction(profile.id),
                          "Prašymas išsiųstas administratoriams.",
                        )
                      }
                    >
                      Siūlyti kaip bazinį
                    </Button>
                  )}
                {profile.baseStatus === PROFILE_BASE_STATUS.REQUESTED && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() =>
                      runAction(
                        profile.id,
                        () => withdrawBaseRequestAction(profile.id),
                        "Prašymas atšauktas.",
                      )
                    }
                  >
                    Atšaukti prašymą
                  </Button>
                )}
                {deletingId === profile.id ? (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => handleDelete(profile)}
                    >
                      Taip, ištrinti
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingId(null)}
                    >
                      Ne
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => setDeletingId(profile.id)}
                  >
                    Ištrinti
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
