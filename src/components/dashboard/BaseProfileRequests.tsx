"use client";

import { useState } from "react";
import { setBaseProfileStatusAction } from "@/actions/customProfiles";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";

export type AdminProfileRow = {
  id: string;
  slug: string;
  name: string;
  ownerName: string | null;
  ownerEmail: string | null;
  // `updated_at` of the style (ISO), to notice a base profile that changed.
  updatedAt: string;
};

interface BaseProfilesAdminProps {
  initialRequests: AdminProfileRow[];
  initialApproved: AdminProfileRow[];
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("lt-LT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

function ProfileInfo({ row }: { row: AdminProfileRow }) {
  return (
    <div className="min-w-0 space-y-0.5">
      <p className="truncate text-sm font-medium">{row.name}</p>
      <p className="text-xs text-muted-foreground">
        <a
          href={`/m/${row.slug}`}
          className="underline-offset-4 hover:underline"
        >
          /m/{row.slug}
        </a>
        {" · "}stilius pakeistas {formatDate(row.updatedAt)}
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
  const [approved, setApproved] = useState(initialApproved);
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
    if (from === "requests") {
      setRequests((prev) => prev.filter((item) => item.id !== row.id));
      if (status === PROFILE_BASE_STATUS.APPROVED) {
        setApproved((prev) => [...prev, row]);
      }
    } else {
      setApproved((prev) => prev.filter((item) => item.id !== row.id));
    }
    setConfirmRevokeId(null);
    toast.success(
      from === "approved"
        ? "Bazinis statusas atšauktas."
        : status === PROFILE_BASE_STATUS.APPROVED
          ? "Profilis patvirtintas."
          : "Prašymas atmestas.",
    );
  };

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
        <p className="max-w-2xl text-sm text-muted-foreground">
          Patvirtinti profiliai nėra tikrinami po kiekvieno autoriaus pakeitimo.
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmRevokeId(row.id)}
                  >
                    Atšaukti bazinį statusą
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
