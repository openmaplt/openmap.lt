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
- `src/app/api/` — API route handlers (currently only `comments`); most logic goes through server actions instead of new API routes
- `src/actions/` — Next.js server actions (`auth`, `comments`, `accountLinking`) — prefer this over adding a new API route for mutations
- `src/components/` — UI; subfolders: `ui/` (shadcn primitives), `route/` (navigation/routing), `comments/`, `gallery/`, `dashboard/`, `account/`, `auth/`, `controls/` (map controls)
- `src/lib/` — server-only logic: `auth.ts` (sessions), `db.ts` (pg pool), `permissions.ts` (roles/permissions), `oauth/` (google, osm), `stvk/` (protected-area API integration), `comments.ts`, `rateLimit.ts`, `geo.ts` / `polyline.ts` / `routeUtils.ts` (routing)
- `src/data/` — static POI/profile definitions (`omProfiles`, `poiInfo`, `poiList`, `protectedPhotos`, `search`)
- `src/config/` — map config (`config.ts`), navigation, per-profile filters
- `src/hooks/` — `use-*` hooks for routing, map sync, search, etc.
- `sql/` — DDL files as DOCUMENTATION of the current schema (roles, auth, comments); applied manually, NOT an auto-migration system
- `docker/db/` — only the local `docker-compose` PostgreSQL seed, an OLD/incomplete schema — never treat as the schema source of truth (see below)

## Critical things you won't get from reading the code alone

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

## Working rules (for every agent)

1. **Before every commit**: run `npm run format`, then `npm run lint`, fix any issues — ONLY THEN `git add`/`git commit`.
2. **Never commit on your own initiative.** Only when the user explicitly asks for it, at that moment — an earlier "commit" request does not carry forward to later changes in the same session.
3. **UI/frontend changes**: verify by actually rendering the app and taking screenshots (e.g. Playwright), not just lint/typecheck. This project has many floating/overlapping elements over the map that only break visibly once actually rendered.
4. **Language**: the app's UI text and communication with the (Lithuanian-speaking) maintainer should be in Lithuanian. Code/identifiers/commit messages can be in English or Lithuanian (existing practice is mixed).

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint` — Biome check --fix
- `npm run format` — Biome format --write
- `docker-compose up -d` — local PostgreSQL+PostGIS for dev only (seed is stale, see above)
- Deploy: `git tag vX.Y.Z && git push origin vX.Y.Z` → GitHub Actions (see `docs/DEPLOYMENT.md`)

## Environment variables

See `.env.example`. Key ones: `DATABASE_URL` (real DB via tunnel during dev), `OSM_CLIENT_ID`/`OSM_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `STVK_API_URL`.
