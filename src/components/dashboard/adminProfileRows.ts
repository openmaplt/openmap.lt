// Rows of the admin base-profile lists. Plain data and helpers (no "use
// client"), so the server page can build and sort them and the client list can
// reuse the same sorting after an in-place update.

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
  // The profile changed after that approval: needs another look.
  changedSinceApproval: boolean;
};

export const hasChangedSinceApproval = (
  updatedAt: Date | string,
  approvedAt: Date | string | null,
) => approvedAt !== null && new Date(updatedAt) > new Date(approvedAt);

// Changed ones first, so the few that need a look are at the top of a long
// list; then alphabetical.
export const sortApprovedRows = (rows: AdminProfileRow[]) =>
  [...rows].sort(
    (a, b) =>
      Number(b.changedSinceApproval) - Number(a.changedSinceApproval) ||
      a.name.localeCompare(b.name, "lt"),
  );
