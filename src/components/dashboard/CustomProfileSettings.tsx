"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import {
  deleteCustomProfileAction,
  renameCustomProfileAction,
  requestBaseProfileAction,
  requestReviewAction,
  startProfileEditAction,
  withdrawBaseRequestAction,
} from "@/actions/customProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { PROFILE_NAME_MAX_LENGTH } from "@/config/custom-profiles";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";
import { PROFILE_MODERATION } from "@/domain/profileModeration";
import type { CustomProfileView } from "@/lib/userProfiles";
import { errorMessage, shareUrl } from "./customProfileUi";

// One block of the profile page. New settings (data sources, map center,
// enabled features, ...) are added as further sections.
function Section({
  title,
  description,
  danger,
  children,
}: {
  title: string;
  description?: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`space-y-3 rounded-md border p-4 ${danger ? "border-destructive/40" : ""}`}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

interface CustomProfileSettingsProps {
  initialProfile: CustomProfileView;
}

export function CustomProfileSettings({
  initialProfile,
}: CustomProfileSettingsProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [name, setName] = useState(initialProfile.name);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isVisible = profile.moderationStatus === PROFILE_MODERATION.VISIBLE;
  const isHidden = profile.moderationStatus === PROFILE_MODERATION.HIDDEN;
  const reviewRequested =
    profile.moderationStatus === PROFILE_MODERATION.REVIEW_REQUESTED;

  // Runs an action that returns the updated profile and applies the result.
  const runAction = async (
    action: () => Promise<
      { ok: true; profile: CustomProfileView } | { ok: false; error: string }
    >,
    successMessage?: string,
  ) => {
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      toast.error(errorMessage(result.error));
      return false;
    }
    setProfile(result.profile);
    setName(result.profile.name);
    if (successMessage) toast.success(successMessage);
    return true;
  };

  const handleEdit = async () => {
    setBusy(true);
    const result = await startProfileEditAction(profile.id);
    if (!result.ok) {
      setBusy(false);
      toast.error(errorMessage(result.error));
      return;
    }
    window.location.assign(result.url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(profile));
      toast.success("Nuoroda nukopijuota.");
    } catch {
      toast.error("Nepavyko nukopijuoti nuorodos.");
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    const result = await deleteCustomProfileAction(profile.id);
    if (!result.ok) {
      setBusy(false);
      toast.error(errorMessage(result.error));
      return;
    }
    toast.success("Profilis ištrintas.");
    router.push("/paskyra/mano-profiliai");
  };

  return (
    <div className="max-w-2xl space-y-4">
      {!isVisible && (
        <div
          role="alert"
          className="space-y-3 rounded-md border border-red-300 bg-red-50 p-4 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          <p className="font-semibold">
            Šį profilį paslėpė administratorius, kitiems jis nematomas.
          </p>
          {profile.moderationNote && (
            <p className="whitespace-pre-wrap text-sm">
              <span className="font-medium">
                Administratoriaus komentaras:{" "}
              </span>
              {profile.moderationNote}
            </p>
          )}
          {isHidden && (
            <>
              <p className="text-sm">
                Galite jį atidaryti ir redaguoti kaip įprasta. Kai pataisysite,
                pasiūlykite jį peržiūrai.
              </p>
              <Button
                disabled={busy}
                onClick={() =>
                  runAction(
                    () => requestReviewAction(profile.id),
                    "Išsiųsta administratoriui peržiūrai.",
                  )
                }
              >
                Pataisiau, siūlyti peržiūrai
              </Button>
            </>
          )}
          {reviewRequested && (
            <p className="text-sm">
              Laukia administratoriaus peržiūros. Kol jis nepaskelbs profilio iš
              naujo, kitiems jis lieka nematomas.
            </p>
          )}
        </div>
      )}

      <Section title="Pavadinimas">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            runAction(
              () => renameCustomProfileAction(profile.id, name),
              "Pavadinimas pakeistas.",
            );
          }}
        >
          <Input
            aria-label="Profilio pavadinimas"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={PROFILE_NAME_MAX_LENGTH}
          />
          <Button
            type="submit"
            disabled={busy || name.trim() === "" || name === profile.name}
          >
            Išsaugoti
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          Adresas <code>/m/{profile.slug}</code> nesikeičia, kad išsiųstos
          nuorodos nenustotų veikti.
        </p>
      </Section>

      <Section
        title="Stilius"
        description="Žemėlapio išvaizdą keičiate Maputnik redaktoriumi. Išsaugoti pakeitimai žemėlapyje atsiranda iškart."
      >
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={handleEdit}>
            Keisti stilių
          </Button>
          <Button variant="outline" asChild>
            <a href={`/m/${profile.slug}`}>Atidaryti žemėlapyje</a>
          </Button>
        </div>
      </Section>

      <Section
        title="Dalijimasis"
        description={
          isVisible
            ? "Žemėlapį gali atidaryti kiekvienas, žinantis adresą. Paieškos sistemos jo neindeksuoja, kol administratorius nepatvirtina jo kaip bazinio."
            : "Kol profilis paslėptas, adresas kitiems neveikia."
        }
      >
        {isVisible && (
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-muted px-2 py-1 text-sm">
              /m/{profile.slug}
            </code>
            <Button variant="outline" onClick={handleCopy}>
              Kopijuoti nuorodą
            </Button>
          </div>
        )}
      </Section>

      <Section
        title="Bazinis profilis"
        description="Administratoriai gali patvirtinti profilį, ir jį pamatys visi lankytojai profilių pasirinkimo valdiklyje."
      >
        {profile.baseStatus === PROFILE_BASE_STATUS.APPROVED && (
          <p className="text-sm">
            Šis profilis yra bazinis: jį mato visi lankytojai.
          </p>
        )}
        {profile.baseStatus === PROFILE_BASE_STATUS.REQUESTED && (
          <>
            <p className="text-sm">
              Laukia administratoriaus patvirtinimo kaip bazinis profilis.
            </p>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                runAction(
                  () => withdrawBaseRequestAction(profile.id),
                  "Prašymas atšauktas.",
                )
              }
            >
              Atšaukti prašymą
            </Button>
          </>
        )}
        {profile.baseStatus === PROFILE_BASE_STATUS.NONE &&
          (isVisible ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                runAction(
                  () => requestBaseProfileAction(profile.id),
                  "Prašymas išsiųstas administratoriams.",
                )
              }
            >
              Siūlyti kaip bazinį
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              Paslėpto profilio pasiūlyti kaip bazinio negalima.
            </p>
          ))}
      </Section>

      <Section
        title="Ištrinti profilį"
        description="Profilis ir jo stilius bus pašalinti negrįžtamai. Išsiųstos nuorodos nustos veikti."
        danger
      >
        {confirmingDelete ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="destructive"
              disabled={busy}
              onClick={handleDelete}
            >
              Taip, ištrinti
            </Button>
            <Button
              variant="outline"
              onClick={() => setConfirmingDelete(false)}
            >
              Atšaukti
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmingDelete(true)}>
            Ištrinti profilį
          </Button>
        )}
      </Section>

      <Button variant="link" asChild className="px-0">
        <Link href="/paskyra/mano-profiliai">← Visi mano profiliai</Link>
      </Button>
    </div>
  );
}
