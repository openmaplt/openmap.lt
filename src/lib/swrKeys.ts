// Central place for SWR cache keys that more than one component needs to
// agree on by name (as opposed to a hook-local key built from its own
// arguments, e.g. use-search.ts's ["search", query, ...]). Keep adding keys
// here as more cross-component mutate() cases show up.

// /komentarai dashboard: MyComments and ModerationQueue each own a list, but
// approving/rejecting/deleting a comment can affect both — these keys let
// either component push an update into the other's cache via the global
// `mutate` from "swr", without a round trip back to the server (no matching
// fetcher/endpoint is needed since neither list is ever revalidated over the
// network, only mutated locally after a Server Action confirms the change).
export const OWN_COMMENTS_KEY = "comments:own";
export const PENDING_COMMENTS_KEY = "comments:pending";
// Separate from PENDING_COMMENTS_KEY because that list is capped at 100 rows
// (listPendingComments()) — this key tracks the true total pending count
// (countPendingComments()) for the sidebar badge / dashboard stat card, kept
// in sync by the same approve/reject/delete call sites that mutate the list.
export const PENDING_COUNT_KEY = "comments:pendingCount";
