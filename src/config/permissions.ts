// Plain data, no "server-only" — this is the single source of truth for
// permission slugs, used both by server code (src/lib/permissions.ts, which
// re-exports these) and client components that need the slug without pulling
// in DB access (e.g. config/dashboardNav.ts, DashboardSidebar).

export const PERMISSIONS = {
  COMMENTS_MODERATE: "comments.moderate",
  PHOTOS_MODERATE: "photos.moderate",
  PLACES_DESCRIPTION_EDIT: "places.description.edit",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
