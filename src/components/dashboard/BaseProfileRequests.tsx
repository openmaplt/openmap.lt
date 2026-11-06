"use client";

import { useState } from "react";
import { setBaseProfileStatusAction } from "@/actions/customProfiles";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";
import { type AdminProfileRow, sortApprovedRows } from "./adminProfileRows";

interface BaseProfilesAdminProps {
  initialRequests: AdminProfileRow[];
  initialApproved: AdminProfileRow[];
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("lt-LT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

function ProfileInfo({ row }: { row: AdminProfileRow }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
        <span className="truncate">{row.name}</span>
        {row.changedSinceApproval && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
            Pakeista po patvirtinimo
          </span>
        )}
      </p>
      <p className="text-xs text-muted-foreground">
        <a
          href={`/m/${row.slug}`}
          className="underline-offset-4 hover:underline"
        >
          /m/{row.slug}
        </a>
      </p>
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
    </div>
  );
}

// Admin side of base profiles: approve or reject what owners propose, and take
// an approved one back. Approved profiles are not re-reviewed after each edit:
// the author looks after them, and an admin who sees one drift contacts the
// author and revokes it here. The author can then fix it and ask again.
export function BaseProfilesAdmin({
  initialRequests,
  initialApproved,
}: BaseProfilesAdminProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [approved, setApproved] = useState(() =>
    sortApprovedRows(initialApproved),
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  const decide = async (
    row: AdminProfileRow,
    status:
      | typeof PROFILE_BASE_STATUS.APPROVED
      | typeof PROFILE_BASE_STATUS.NONE,
    from: "requests" | "approved",
  ) => {
    setBusyId(row.id);
    const result = await setBaseProfileStatusAction(row.id, status);
    setBusyId(null);
    if (!result.ok) {
      toast.error(
        result.error === "forbidden"
          ? "Tik administratorius gali tvirtinti profilius."
          : "Nepavyko išsaugoti sprendimo. Gal profilis jau pakeistas?",
      );
      return;
    }
    // What the server just did, mirrored here: a profile that was approved or
    // re-approved is stamped "now" and no longer counts as changed.
    const stamped: AdminProfileRow = {
      ...row,
      approvedAt: new Date().toISOString(),
      changedSinceApproval: false,
    };
    if (from === "requests") {
      setRequests((prev) => prev.filter((item) => item.id !== row.id));
      if (status === PROFILE_BASE_STATUS.APPROVED) {
        setApproved((prev) => sortApprovedRows([...prev, stamped]));
      }
    } else if (status === PROFILE_BASE_STATUS.APPROVED) {
      setApproved((prev) =>
        sortApprovedRows(
          prev.map((item) => (item.id === row.id ? stamped : item)),
        ),
      );
    } else {
      setApproved((prev) => prev.filter((item) => item.id !== row.id));
    }
    setConfirmRevokeId(null);
    toast.success(
      from === "approved"
        ? status === PROFILE_BASE_STATUS.APPROVED
          ? "Pakeitimai patvirtinti."
          : "Bazinis statusas atšauktas."
        : status === PROFILE_BASE_STATUS.APPROVED
          ? "Profilis patvirtintas."
          : "Prašymas atmestas.",
    );
  };

  const changedCount = approved.filter(
    (row) => row.changedSinceApproval,
  ).length;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">
          Laukia patvirtinimo ({requests.length})
        </h2>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Laukiančių patvirtinimo profilių nėra.
          </p>
        ) : (
          <ul className="max-w-2xl divide-y rounded-md border">
            {requests.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3"
              >
                <ProfileInfo row={row} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busyId === row.id}
                    onClick={() =>
                      decide(row, PROFILE_BASE_STATUS.APPROVED, "requests")
                    }
                  >
                    Patvirtinti
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === row.id}
                    onClick={() =>
                      decide(row, PROFILE_BASE_STATUS.NONE, "requests")
                    }
                  >
                    Atmesti
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">
          Bazinių profilių sąrašas ({approved.length})
        </h2>
        {changedCount > 0 && (
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {changedCount} pakeisti po patvirtinimo
          </p>
        )}
        <p className="max-w-2xl text-sm text-muted-foreground">
          Patvirtinti profiliai nėra tikrinami po kiekvieno autoriaus pakeitimo.
          Pakeisti po patvirtinimo pažymėti raudonai ir rodomi pirmi:
          atidarykite ir jei viskas gerai, paspauskite „Patvirtinti pakeitimus“.
          Jei profilis nukrypo nuo to, kas buvo patvirtinta, susisiekite su
          autoriumi ir atšaukite bazinį statusą: ištaisęs jį autorius galės
          pasiūlyti iš naujo.
        </p>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Dar nėra patvirtintų profilių.
          </p>
        ) : (
          <ul className="max-w-2xl divide-y rounded-md border">
            {approved.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3"
              >
                <ProfileInfo row={row} />
                {confirmRevokeId === row.id ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busyId === row.id}
                      onClick={() =>
                        decide(row, PROFILE_BASE_STATUS.NONE, "approved")
                      }
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
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {row.changedSinceApproval && (
                      <Button
                        size="sm"
                        disabled={busyId === row.id}
                        onClick={() =>
                          decide(row, PROFILE_BASE_STATUS.APPROVED, "approved")
                        }
                      >
                        Patvirtinti pakeitimus
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmRevokeId(row.id)}
                    >
                      Atšaukti bazinį statusą
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
