# AGENTS.md — openmap.lt

Single source of truth for AI agents (Claude Code, Gemini CLI, GitHub Copilot, etc.) working on this project. Read this file before starting any task — it should answer most questions about architecture and conventions so you don't need to re-explore the codebase every time.

**Human-facing docs are in `README.md` (setup instructions) and `docs/DEPLOYMENT.md` — both in Lithuanian, matching the app's UI language. This file is agent-facing and stays in English.**

## Keep this file current (mandatory)

After implementing any feature or non-trivial change, update this file if it changed something documented here: new directories/modules, new conventions, a new gotcha you hit, a changed architectural decision. The next agent to pick up work here should not have to rediscover what you just learned. Keep additions concise — this is a working reference, not a changelog; update existing sections in place rather than appending a running history.

## What this is

openmap.lt — an open-source map application for Lithuania (Next.js). What's actually implemented today:

- interactive map (MapLibre GL) with several "profiles": bike trails, rivers, protected areas (STVK), bars/places ("places")
- route planning and turn-by-turn navigation (turf.js, polylines, step-by-step UI)
- user login via Google / OpenStreetMap OAuth2, sessions, account linking across providers
- comments with moderation (admin/moderator roles via a permissions table)
- user account/dashboard (`/paskyra`)
- photo gallery (carousel + fullscreen lightbox)
- POI data from PostgreSQL+PostGIS and the STVK API (protected-area photos/search)

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Radix UI / shadcn ("new-york" style, see `components.json`) · MapLibre GL + react-map-gl · PostgreSQL 16 + PostGIS (via `pg`, no ORM) · Biome (lint + format) · Node >=24.

## Architecture — where to find things

- `src/app/[[...slug]]/` — the main map page (catch-all route); profiles render based on the slug
- `src/app/(pages)/` — static/account pages: `paskyra` (account/dashboard), `prisijungimas` (login), `kontaktai` (contact), `prisidekite` (contribute), `bendra-informacija` / `technine-informacija` (general/technical info), `zemelapio-duomenys` (map data)
- `src/app/api/` — API route handlers (`comments`, `ai-search`); most logic goes through server actions instead of new API routes — `ai-search` is a deliberate exception (streaming, see below), not a precedent for defaulting to route handlers
- `src/actions/` — Next.js server actions (`auth`, `comments`, `accountLinking`) — prefer this over adding a new API route for mutations
- `src/components/` — UI; subfolders: `ui/` (shadcn primitives), `route/` (navigation/routing), `comments/`, `gallery/`, `dashboard/`, `account/`, `auth/`, `controls/` (map controls)
- `src/lib/` — server-only logic: `auth.ts` (sessions), `db.ts` (pg pool), `permissions.ts` (roles/permissions), `oauth/` (google, osm), `stvk/` (protected-area API integration), `comments.ts`, `rateLimit.ts`, `geo.ts` / `polyline.ts` / `routeUtils.ts` (routing)
- `src/data/` — static POI/profile definitions (`omProfiles`, `poiInfo`, `poiList`, `protectedPhotos`, `search`)
- `src/config/` — genuinely configurable catalogs: adding/editing an entry is normal feature work, no DB migration (map profiles, `PLACES_FILTERS` place types/icons, AI-search tag filters, navigation)
- `src/domain/` — fixed value sets mirroring a Postgres `enum` (`commentStatus.ts`, `photoStatus.ts`, `collectionStatus.ts`): a `const X = {...} as const` + derived union type, changing a value requires a DB migration, so it does NOT belong in `config/`. Never `"server-only"` — both server (`lib/`) and client components need the same constants for comparisons/labels/styling; a `"server-only"` file that needs one imports it from here rather than redeclaring it (redeclaring inside a `"server-only"` file was a real bug: `CommentForm.tsx` etc. fell back to bare `"approved"`/`"pending"` string literals because they couldn't import the value from `lib/comments.ts`).
- `src/hooks/` — `use-*` hooks for routing, map sync, search, etc.
- `sql/` — DDL files as DOCUMENTATION of the current schema (roles, auth, comments, `ai_search` function); applied manually, NOT an auto-migration system
- `docker/db/` — only the local `docker-compose` PostgreSQL seed, an OLD/incomplete schema — never treat as the schema source of truth (see below)

## Critical things you won't get from reading the code alone

### maplibre-gl is pinned below v6 — don't bump without re-testing thoroughly

`maplibre-gl` is intentionally kept at `^5.24.0`. Bumping to v6 needs an explicit `setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString())` call before any `<Map>` renders (v6 no longer auto-configures its worker under a bundler) — without it the map silently never fires `load` (style/sprite fetch fine, zero console errors, just a blank canvas forever). Even with that fix applied, as of Next.js 16.3.0 + Turbopack the vector tile sources still never finish loading (`sourcedata` fires with `isSourceLoaded: false` and then just stops — confirmed reproducible in a clean browser tab, not a stale-tab/WebGL-context artifact). This lines up with an open upstream report of Turbopack's dev server mismanaging MapLibre's worker protocol ([vercel/next.js#86495](https://github.com/vercel/next.js/issues/86495)), but the failure here reproduced in a production `next build` + standalone server too, so it isn't purely a dev-only issue. Re-attempt the v6 upgrade only with a fresh visual test (new browser tab, not a reused one — dozens of reloads in one tab can exhaust Chrome's per-tab WebGL context limit and produce a false "blank map" that looks identical but is unrelated).

### DB schema source of truth

`docker/db/*.sql` is STALE and does NOT match the real schema. The real dev/prod PostgreSQL (schemas: `openmap`, `places`, `patrulis`, `address`, `public` + PostGIS/tiger) is reachable through a tunnel — connection string `DATABASE_URL` from `.env`/`.env.local`. Before designing any schema change, connect to the real DB (`psql "$DATABASE_URL"`) and check the current state. Apply DDL changes manually (`psql "$DATABASE_URL" -f sql/....sql`), not via `docker-entrypoint-initdb.d`. Keep reference DDL files in `sql/`, not `docker/db/`.

### Radix Dialog inside a DropdownMenu

When a `DropdownMenuItem` needs to open a `Dialog` (e.g. the anonymous-user "Prisijungti" / login item in the map menu), the `Dialog` and its `open` state MUST live in a component rendered as a SIBLING after `</DropdownMenu>`, not as a child inside `DropdownMenuContent`. `DropdownMenuContent` fully unmounts its children when the menu closes — if the Dialog's state lives inside that subtree, it's destroyed along with it (no plain `setTimeout` trick can save it, since the component holding the state no longer exists). Working example: `src/components/MapMenu.tsx` — the login `Dialog` renders as a sibling after `</DropdownMenu>`, and the item that opens it defers with `setTimeout(() => setLoginDialogOpen(true), 0)` to dodge the close/focus-teardown race. `src/components/account/AccountMenu.tsx` (the logged-in state, in `Header.tsx`) has no Dialog at all — it only links to `/paskyra` and logs out — so it isn't an example of this pattern.

### CSP is strict

`next.config.ts` sets a strict Content-Security-Policy (no `unsafe-eval` in production). New third-party integrations (scripts, iframes, fetches to a new domain) need CSP updates (`connect-src`, `script-src`, etc.), or they'll silently break in production only, not in dev.

### Authentication

Sessions are stored in the DB (`openmap.sessions`, cookie `om_session`), not JWTs. OAuth providers: Google and OpenStreetMap (`src/lib/oauth/`). Roles/permissions via `permissions.ts` (`ROLES.ADMIN`/`ROLES.MODERATOR`, `PERMISSIONS.COMMENTS_MODERATE`) — admin always has every permission without a separate grant.

### Moderation email digest

`src/lib/mailer.ts` (nodemailer SMTP wrapper) + `src/lib/moderationDigest.ts` (queries pending comments/photos + admin/moderator recipients, builds the email) send **one daily digest** email to admins/moderators listing everything currently pending, instead of a notification per comment/photo — avoids flooding moderators when someone uploads many photos at once. Scheduled in-process via `src/instrumentation.ts` (Next.js's server-boot hook — no external cron needed since the app runs as a long-lived Docker container, not serverless) checking hourly against `MODERATION_DIGEST_HOUR` (default 8, Lithuanian local time — the Docker image sets `TZ=Europe/Vilnius` specifically for this). If `SMTP_HOST` isn't set, `sendMail` no-ops with a `console.warn` — mail failures/missing config must never break the comment/photo submission itself. New SMTP env vars need to be added in three places to actually reach production: `docker-compose.prod.yml` (`environment:`), `.github/workflows/deploy.yml` (the `.env` generation step), and `docs/DEPLOYMENT.md`'s secrets list.

### AI chat search (Gemini) — admin-only, why a Route Handler, and the SQL-injection decision

`src/app/api/ai-search/route.ts` powers an admin-only AI chat Sheet (trigger button in `SearchBox.tsx`, gated on `useAuth().user?.isAdmin`) that turns a free-text query into place results. It is a **Route Handler, not a server action**, specifically because the response streams token-by-token — Next.js server actions are single-roundtrip only and dispatch one at a time per client (see `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`). This is the one deliberate exception to "prefer server actions"; don't generalize from it.

The core design decision (discussed at length, not accidental): the LLM **never produces SQL**. It only returns a Zod-validated JSON plan (`src/lib/aiSearchSchema.ts`: `groups[].{types, tagFilters, keywords}`), which is then re-validated server-side (`sanitizePlan`) against a fixed whitelist (`src/config/ai-search-catalog.ts`) *before* being passed to `places.ai_search` (`sql/ai_search.sql`). `types` reuses the existing `places.get_where_condition` letter-code catalog (`src/config/places-filters.ts`) unchanged; `tagFilters` is a small, manually-curated list of exact `attr` key/value pairs confirmed against real DB counts (e.g. `shop=bakery`, `real_ale=yes`) — extend it only after re-confirming against the live DB, never let the model invent a new key/value. `keywords` are free-text synonyms the model generates, matched via parameterized `tsvector`/trigram/`ILIKE`, never string-concatenated as raw SQL syntax. The second LLM call (response synthesis) is given the exact id→name list of DB results and told to reference only those via `[label](poi:<id>)` markdown links — it must never invent an id. The client's markdown renderer (`AiSearchChat.tsx`) intercepts `poi:` links and calls the same `setSelectedFeature`/camera-fly mechanism `SearchFeature.tsx` already uses for normal search results (via `getPoiInfo`, not `usePoiEnrichment`, since a chat result only carries an id, no pre-existing feature geometry to fall back on).

Two version-specific gotchas hit during implementation, worth knowing before touching this code again: (1) `@ai-sdk/google`'s bare `google`/`createGoogleGenerativeAI()` reads `GOOGLE_GENERATIVE_AI_API_KEY` from env by default — this repo's key is named `GEMINI_API_KEY`, so `createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY })` must be called explicitly, or it silently breaks in production. (2) `generateObject` (used for the first LLM call) is marked `@deprecated` in `ai@7` in favor of `generateText({ output: Output.object({ schema }) })` — still fully functional in the installed version, kept for simplicity; re-check if bumping the `ai` package majors. `messages` from `useChat` are `UIMessage[]` and must go through `convertToModelMessages()` before reaching `streamText`/`generateObject`.

### "Kolekcionavimas" (collecting) — multi-step feature, `enrichFeature` id gotcha

A multi-step feature living under `/paskyra/kolekcionavimas` and `src/components/collections/`: users mark POI type-letter-codes they're interested in (`openmap.user_collections`, `src/config/collection-filters.ts`), then mark individual POIs as visited/not-interesting (`openmap.poi_collection_status`, no `map_profile_id` column — deliberately scoped to `places` only, same reasoning as `user_collections`; extend only if another profile actually needs it). Both tables key on `user_id` alone or `(user_id, object_ref)` — no surrogate `serial id`, since each row is a naturally-keyed single fact, not a growable list.

**Gotcha hit while wiring `PoiCollectionStatus.tsx` to a POI's type code:** `places.poi_info` (DB) already computes the single-letter `PLACES_FILTERS` code as a sibling field `filter` (e.g. `'r'` for a pub) — folded into the client feature as `properties.FILTER_CODE` by `src/data/poiInfo.ts`, the same way `properties.TYPE` is already folded from `data.type`. This works fine on first paint (SSR `initialPoiData`), but **`src/hooks/use-poi-enrichment.ts`'s `enrichFeature` re-enrichment silently no-ops for a real fraction of tile-sourced feature objects**, because it read the POI id only from `feature.properties?.id` — some code paths (e.g. `PoiInteraction.tsx`'s "select by URL poiId" effect, which re-selects from `queryRenderedFeatures` once tiles finish loading, overwriting the initial SSR-enriched feature) hand it a `Feature` whose id lives only at the top-level `feature.id` (MapLibre's tile feature id), not inside `properties`. When that guard fails, `enrichFeature` returns the raw tile feature as-is — vector tiles happen to bake in `TYPE` and all OSM tags already (so most of the panel still renders fine, masking the bug), but never `filter`/`FILTER_CODE` (a `poi_info`-only field), so anything relying on it silently vanishes moments after the initial paint. Fixed by widening the extraction to `feature.properties?.id ?? feature.id`. If you add another `poi_info`-only field and it "works once then disappears," this is almost certainly why — check whether the consuming component re-reads `selectedFeature` after tile load rather than trusting the first render.

## Working rules (for every agent)

1. **Before every commit**: run `npm run format`, then `npm run lint`, fix any issues — ONLY THEN `git add`/`git commit`.
2. **Never commit on your own initiative.** Only when the user explicitly asks for it, at that moment — an earlier "commit" request does not carry forward to later changes in the same session.
3. **UI/frontend changes**: verify by actually rendering the app and taking screenshots (e.g. Playwright), not just lint/typecheck. This project has many floating/overlapping elements over the map that only break visibly once actually rendered.
4. **Language**: the app's UI text and communication with the (Lithuanian-speaking) maintainer should be in Lithuanian. **Code comments and identifiers should be English** — the maintainer wants the codebase forkable/readable by non-Lithuanian speakers (existing older comments are mixed; don't feel obligated to retrofix them, but write new comments in English). LLM prompt strings and other Lithuanian *application content* (not comments) stay Lithuanian, since that's the app's UI language, not code documentation. Commit messages can be in English or Lithuanian.

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint` — Biome check --fix
- `npm run format` — Biome format --write
- `docker-compose up -d` — local PostgreSQL+PostGIS for dev only (seed is stale, see above)
- Deploy: `git tag vX.Y.Z && git push origin vX.Y.Z` → GitHub Actions (see `docs/DEPLOYMENT.md`)

## Environment variables

See `.env.example`. Key ones: `DATABASE_URL` (real DB via tunnel during dev), `OSM_CLIENT_ID`/`OSM_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `STVK_API_URL`, `GEMINI_API_KEY` (AI chat search, see below).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
