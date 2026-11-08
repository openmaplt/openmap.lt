"use client";

import { useState } from "react";
import {
  hideProfileAction,
  publishProfileAction,
  setBaseProfileStatusAction,
} from "@/actions/customProfiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { MODERATION_NOTE_MAX_LENGTH } from "@/config/custom-profiles";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";
import { PROFILE_MODERATION } from "@/domain/profileModeration";
import {
  ADMIN_FILTERS,
  type AdminFilter,
  type AdminProfileRow,
  isHidden,
  matchesFilter,
  matchesSearch,
  sortRows,
} from "./adminProfileRows";
import { errorMessage } from "./customProfileUi";

const FILTER_LABELS: Record<AdminFilter, string> = {
  all: "Visi",
  attention: "Reikia dėmesio",
  base: "Baziniai",
  hidden: "Paslėpti",
};

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("lt-LT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const ALERT_BADGE =
  "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300";
const INFO_BADGE =
  "rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground";

function RowInfo({ row }: { row: AdminProfileRow }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <span className="truncate">{row.name}</span>
        {row.moderationStatus === PROFILE_MODERATION.REVIEW_REQUESTED && (
          <span className={ALERT_BADGE}>Autorius prašo peržiūros</span>
        )}
        {row.moderationStatus === PROFILE_MODERATION.HIDDEN && (
          <span className={ALERT_BADGE}>Paslėptas</span>
        )}
        {row.changedSinceApproval && (
          <span className={ALERT_BADGE}>Pakeista po patvirtinimo</span>
        )}
        {row.baseStatus === PROFILE_BASE_STATUS.APPROVED && (
          <span className={INFO_BADGE}>Bazinis</span>
        )}
        {row.baseStatus === PROFILE_BASE_STATUS.REQUESTED && (
          <span className={INFO_BADGE}>Siūlomas kaip bazinis</span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">/m/{row.slug}</p>
      <p className="text-xs text-muted-foreground">
        {row.approvedAt && (
          <>
            Patvirtinta {formatDateTime(row.approvedAt)}
            {" · "}
          </>
        )}
        <span
          data-changed={row.changedSinceApproval}
          className={
            row.changedSinceApproval
              ? "font-semibold text-red-600 dark:text-red-400"
              : undefined
          }
        >
          Pakeista {formatDateTime(row.updatedAt)}
        </span>
      </p>
      <p className="break-all text-xs text-muted-foreground">
        {row.ownerName ?? "Nežinomas autorius"}
        {" · "}
        {row.ownerEmail ?? "el. paštas nežinomas"}
      </p>
      {row.moderationNote && (
        <p className="whitespace-pre-wrap text-xs">
          <span className="font-medium">Komentaras autoriui: </span>
          {row.moderationNote}
        </p>
      )}
    </div>
  );
}

interface ProfilesAdminProps {
  initialRows: AdminProfileRow[];
  initialFilter: AdminFilter;
}

// Admin side of user-created profiles: every profile with its owner, filters,
// and what an admin can do with each. Profiles are public by default and base
// profiles are not re-reviewed after each edit: the author maintains them, and
// an admin who sees one drift (it is flagged red) either approves the changes
// or hides it with a comment, which the author sees and can fix and resubmit.
export function ProfilesAdmin({
  initialRows,
  initialFilter,
}: ProfilesAdminProps) {
  const [rows, setRows] = useState(initialRows);
  const [filter, setFilter] = useState<AdminFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [hidingId, setHidingId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  const patchRow = (id: string, changes: Partial<AdminProfileRow>) =>
    setRows((prev) =>
      sortRows(
        prev.map((row) => (row.id === id ? { ...row, ...changes } : row)),
      ),
    );

  const counts = Object.fromEntries(
    ADMIN_FILTERS.map((name) => [
      name,
      rows.filter((row) => matchesFilter(row, name)).length,
    ]),
  ) as Record<AdminFilter, number>;

  const visibleRows = rows.filter(
    (row) => matchesFilter(row, filter) && matchesSearch(row, search),
  );

  // Runs a server action for a row; `onOk` mirrors what the server just did.
  const run = async (
    row: AdminProfileRow,
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
    onOk: () => void,
    message: string,
  ) => {
    setBusyId(row.id);
    const result = await action();
    setBusyId(null);
    if (!result.ok) {
      toast.error(errorMessage(result.error));
      return;
    }
    onOk();
    setConfirmRevokeId(null);
    setHidingId(null);
    toast.success(message);
  };

  const approve = (row: AdminProfileRow, message: string) =>
    run(
      row,
      () => setBaseProfileStatusAction(row.id, PROFILE_BASE_STATUS.APPROVED),
      () =>
        patchRow(row.id, {
          baseStatus: PROFILE_BASE_STATUS.APPROVED,
          approvedAt: new Date().toISOString(),
          changedSinceApproval: false,
        }),
      message,
    );

  const revoke = (row: AdminProfileRow, message: string) =>
    run(
      row,
      () => setBaseProfileStatusAction(row.id, PROFILE_BASE_STATUS.NONE),
      () =>
        patchRow(row.id, {
          baseStatus: PROFILE_BASE_STATUS.NONE,
          approvedAt: null,
          changedSinceApproval: false,
        }),
      message,
    );

  const hide = (row: AdminProfileRow) =>
    run(
      row,
      () => hideProfileAction(row.id, note),
      () =>
        patchRow(row.id, {
          moderationStatus: PROFILE_MODERATION.HIDDEN,
          moderationNote: note.trim(),
          baseStatus: PROFILE_BASE_STATUS.NONE,
          approvedAt: null,
          changedSinceApproval: false,
        }),
      "Profilis paslėptas, autorius matys komentarą.",
    );

  const publish = (row: AdminProfileRow) =>
    run(
      row,
      () => publishProfileAction(row.id),
      () =>
        patchRow(row.id, {
          moderationStatus: PROFILE_MODERATION.VISIBLE,
          moderationNote: null,
        }),
      "Profilis vėl viešas.",
    );

  const startHiding = (row: AdminProfileRow) => {
    setHidingId(row.id);
    setNote(row.moderationNote ?? "");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {ADMIN_FILTERS.map((name) => (
          <Button
            key={name}
            size="sm"
            variant={filter === name ? "default" : "outline"}
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
          >
            {FILTER_LABELS[name]} ({counts[name]})
          </Button>
        ))}
        <Input
          aria-label="Ieškoti profilių"
          placeholder="Ieškoti pagal pavadinimą ar autorių"
          className="max-w-72"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {visibleRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {rows.length === 0
            ? "Dar nėra naudotojų profilių."
            : "Pagal pasirinktą filtrą profilių nėra."}
        </p>
      ) : (
        <ul className="max-w-3xl divide-y rounded-md border">
          {visibleRows.map((row) => {
            const busy = busyId === row.id;
            const hidden = isHidden(row);
            const requested = row.baseStatus === PROFILE_BASE_STATUS.REQUESTED;
            const approved = row.baseStatus === PROFILE_BASE_STATUS.APPROVED;
            return (
              <li key={row.id} className="space-y-3 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <RowInfo row={row} />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`/m/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Peržiūrėti žemėlapį
                      </a>
                    </Button>
                    {hidden && (
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => publish(row)}
                      >
                        Publikuoti
                      </Button>
                    )}
                    {!hidden && requested && (
                      <>
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() =>
                            approve(row, "Profilis patvirtintas kaip bazinis.")
                          }
                        >
                          Patvirtinti
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() => revoke(row, "Prašymas atmestas.")}
                        >
                          Atmesti
                        </Button>
                      </>
                    )}
                    {!hidden && approved && row.changedSinceApproval && (
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => approve(row, "Pakeitimai patvirtinti.")}
                      >
                        Patvirtinti pakeitimus
                      </Button>
                    )}
                    {!hidden && !approved && !requested && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() =>
                          approve(row, "Profilis patvirtintas kaip bazinis.")
                        }
                      >
                        Padaryti baziniu
                      </Button>
                    )}
                    {!hidden && approved && confirmRevokeId !== row.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmRevokeId(row.id)}
                      >
                        Atšaukti bazinį statusą
                      </Button>
                    )}
                    {hidingId !== row.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startHiding(row)}
                      >
                        {hidden ? "Pakeisti komentarą" : "Paslėpti"}
                      </Button>
                    )}
                  </div>
                </div>

                {confirmRevokeId === row.id && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm">
                      Atšaukti bazinį statusą? Profilis liks viešas.
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => revoke(row, "Bazinis statusas atšauktas.")}
                    >
                      Taip, atšaukti
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmRevokeId(null)}
                    >
                      Ne
                    </Button>
                  </div>
                )}

                {hidingId === row.id && (
                  <div className="space-y-2">
                    <Label htmlFor={`hide-note-${row.id}`} className="text-sm">
                      Komentaras autoriui: ką reikia pataisyti
                    </Label>
                    <Textarea
                      id={`hide-note-${row.id}`}
                      value={note}
                      maxLength={MODERATION_NOTE_MAX_LENGTH}
                      onChange={(event) => setNote(event.target.value)}
                      placeholder="Pvz.: pataisykite piktogramas ir gatvių stilių"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy || note.trim().length < 3}
                        onClick={() => hide(row)}
                      >
                        {hidden ? "Išsaugoti komentarą" : "Paslėpti profilį"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setHidingId(null)}
                      >
                        Atšaukti
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Autorius matys šį komentarą savo profilių skiltyje.
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
