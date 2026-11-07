import {
  PROFILE_BASE_STATUS,
  type ProfileBaseStatus,
} from "@/domain/profileBaseStatus";
import {
  PROFILE_MODERATION,
  type ProfileModeration,
} from "@/domain/profileModeration";

// Rows of the admin profile list. Plain data and helpers (no "use client"), so
// the server page can build and sort them and the client list can reuse the
// same helpers after an in-place update.

export type AdminProfileRow = {
  id: string;
  slug: string;
  name: string;
  ownerName: string | null;
  ownerEmail: string | null;
  // Last content change (style or name), ISO.
  updatedAt: string;
  // When an admin last approved it (or its changes), ISO; null if not approved.
  approvedAt: string | null;
  baseStatus: ProfileBaseStatus;
  moderationStatus: ProfileModeration;
  // Why it was hidden; shown to the author too.
  moderationNote: string | null;
  // The profile changed after that approval: needs another look.
  changedSinceApproval: boolean;
};

export const hasChangedSinceApproval = (
  updatedAt: Date | string,
  approvedAt: Date | string | null,
) => approvedAt !== null && new Date(updatedAt) > new Date(approvedAt);

export const ADMIN_FILTERS = ["all", "attention", "base", "hidden"] as const;
export type AdminFilter = (typeof ADMIN_FILTERS)[number];

export const parseAdminFilter = (value: string | undefined): AdminFilter =>
  ADMIN_FILTERS.find((filter) => filter === value) ?? "all";

// Something an admin has to decide or look at: a base proposal, an author
// asking for another look, or a base profile changed since it was approved.
export const needsAttention = (row: AdminProfileRow) =>
  row.baseStatus === PROFILE_BASE_STATUS.REQUESTED ||
  row.moderationStatus === PROFILE_MODERATION.REVIEW_REQUESTED ||
  row.changedSinceApproval;

export const isHidden = (row: AdminProfileRow) =>
  row.moderationStatus !== PROFILE_MODERATION.VISIBLE;

export function matchesFilter(row: AdminProfileRow, filter: AdminFilter) {
  switch (filter) {
    case "attention":
      return needsAttention(row);
    case "base":
      return row.baseStatus === PROFILE_BASE_STATUS.APPROVED;
    case "hidden":
      return isHidden(row);
    default:
      return true;
  }
}

export function matchesSearch(row: AdminProfileRow, search: string) {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [row.name, row.slug, row.ownerName, row.ownerEmail].some((value) =>
    value?.toLowerCase().includes(needle),
  );
}

// Rows that need a look first, so the few that matter are at the top of a long
// list; then alphabetical.
export const sortRows = (rows: AdminProfileRow[]) =>
  [...rows].sort(
    (a, b) =>
      Number(needsAttention(b)) - Number(needsAttention(a)) ||
      a.name.localeCompare(b.name, "lt"),
  );
