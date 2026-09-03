// Range for a POI's 1-5 star rating (openmap.poi_ratings.rating check
// constraint, sql/ratings.sql) — shared so the star widget (client) and the
// server action's validation agree on the same bounds without duplicating
// literals. Never "server-only": client components need it too.
export const POI_RATING_MIN = 1;
export const POI_RATING_MAX = 5;
