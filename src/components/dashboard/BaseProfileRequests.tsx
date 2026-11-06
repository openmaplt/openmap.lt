"use client";

import { useState } from "react";
import { setBaseProfileStatusAction } from "@/actions/customProfiles";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";

export type BaseProfileRequest = {
  id: string;
  slug: string;
  name: string;
  ownerName: string | null;
};

interface BaseProfileRequestsProps {
  initialRequests: BaseProfileRequest[];
}

// Admin queue: owners of public profiles asking for them to become base
// profiles (shown to every visitor in the profile switcher).
export function BaseProfileRequests({
  initialRequests,
}: BaseProfileRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [busyId, setBusyId] = useState<string | null>(null);

  const decide = async (
    request: BaseProfileRequest,
    status:
      | typeof PROFILE_BASE_STATUS.APPROVED
      | typeof PROFILE_BASE_STATUS.NONE,
  ) => {
    setBusyId(request.id);
    const result = await setBaseProfileStatusAction(request.id, status);
    setBusyId(null);
    if (!result.ok) {
      toast.error(
        result.error === "forbidden"
          ? "Tik administratorius gali tvirtinti profilius."
          : "Nepavyko išsaugoti sprendimo. Gal profilis jau pakeistas?",
      );
      return;
    }
    setRequests((prev) => prev.filter((item) => item.id !== request.id));
    toast.success(
      status === PROFILE_BASE_STATUS.APPROVED
        ? "Profilis patvirtintas."
        : "Prašymas atmestas.",
    );
  };

  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Laukiančių patvirtinimo profilių nėra.
      </p>
    );
  }

  return (
    <ul className="max-w-xl divide-y rounded-md border">
      {requests.map((request) => (
        <li
          key={request.id}
          className="flex flex-wrap items-center justify-between gap-2 p-3"
        >
          <div>
            <p className="text-sm font-medium">{request.name}</p>
            <p className="text-xs text-muted-foreground">
              <a
                href={`/m/${request.slug}`}
                className="underline-offset-4 hover:underline"
              >
                /m/{request.slug}
              </a>
              {request.ownerName ? ` · ${request.ownerName}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={busyId === request.id}
              onClick={() => decide(request, PROFILE_BASE_STATUS.APPROVED)}
            >
              Patvirtinti
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busyId === request.id}
              onClick={() => decide(request, PROFILE_BASE_STATUS.NONE)}
            >
              Atmesti
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
