# Health Baseline — 2026-11-27

Branch: `professional-overhaul` (created from `main` at `cd39a1b`).

## Commands

| Check | Command | Result |
|---|---|---|
| Install | `bun install` | dependencies present; lockfile clean |
| Build | `bun run build` | **PASS** |
| Tests | `bun run test` | **PASS** — 5 files, 24 tests |
| Typecheck | `bun run typecheck` | **FAIL** — 59 `error TS` lines |
| Lint | `bun run lint` | **FAIL** — 84,235 problems (84,190 errors, 45 warnings) |
| Audit | `bun audit` | **FAIL** — 66 vulnerabilities (3 critical, 38 high, 19 moderate, 6 low) |

## Build output

- `.output/public/assets`: 402 JS files, **3,621 KB total JS**; largest `index-*.js` **745 KB**, `wc_2026_cards-*.js` **589 KB**, `wc_group_matches-*.js` **178 KB**, `football.index-*.js` **119 KB**, `admin-*.js` **112 KB**.
- CSS: **404 KB** total (`styles-*.css` 414,176 bytes on disk).
- Build warnings: deprecated `createServerFn().inputValidator()` across ~50 server functions; route param warnings for `$key.txt` and `og/$type/$slug.svg`; no type errors block the build because Vite does not run `tsc`.

## Typecheck errors (59)

Dominant classes:
- `error` inferred as `unknown` in `notFoundComponent`/error components across ~20 routes (e.g. `cricket.series.$id.tsx`, `cricket.teams.$slug.tsx`, `football.matches.$slug.tsx`, `team.$sport.$slug.tsx`).
- Missing properties on `{}` in cricket series/scores grouping (`.fmt`, `.group`).
- `Link` `to` strings not in the generated route union in `football.match.$id.tsx` (`/football/world-cup`, `/live/football`).
- Remaining legacy route/type mismatches; see `HEALTH_BASELINE` run log in the session workspace.

## Lint errors

- ~83,663 are `Delete ␍` (CRLF vs Prettier LF) across the repo, caused by Windows checkout; not code defects.
- ~527 real style/type issues remain once CRLF is normalised. Full log: session temp `overhaul/lint.log`.

## Dependency audit — critical

1. **seroval ≤1.5.2 / ≤1.6.0** — `fromJSON()` promise resolver type confusion / thenable assimilation (2 critical advisories).
2. **shell-quote 1.8.4–1.10.x** — command injection via comment token.

High-severity includes Zod `<4.6.6` memory exhaustion, Vite/launch-editor advisories, and others. No production database or secret values were touched.

## Runtime baseline

- Dev server starts in ~8–10 s.
- Known console issues:
  - `/sw.js` returns **404** in production although `dist/sw.js` is built; PWA registration logs one failed-script error.
  - No hydration errors after the SSR query integration on Home, `/cricket`, `/football`, `/news`, standings and team pages (spot-checked).
  - React Query data is dehydrated/hydrated via `setupRouterSsrQueryIntegration`.
- `/news` and the news RSS are empty because `match_recaps` has 0 rows.

## Data / caching / auth / errors

- ESPN free APIs fetched through `src/lib/*.functions.ts` with in-memory TTL caches and Supabase cache tables.
- Polling: live match pages refetch every 10–30 s; scoreboards 20–60 s.
- Supabase anon key for public reads; service role only in server files; admin routes gated by `has_role`.
- Global error middleware `src/start.ts` renders a branded 500 page; route-level `notFoundComponent`/`errorComponent` varies in quality.

## Foundation results (after Step 3 work)

- **Typecheck: PASS (0 errors)** — down from 59. Unknown error values now go through `src/lib/error-message.ts`; search params cast to their schema types; invalid `Link` targets replaced with typed dynamic routes; root `ErrorComponent` accepts `unknown`.
- **Build: PASS** and now copies `sw.js` + `workbox-*.js` into `.output/public` via `scripts/postbuild-pwa.mjs`.
- **Audit:** 66 → **6 vulnerabilities** (1 high, 5 moderate) after `bun audit fix`. Remaining: transitive Zod 3 in TanStack generator (build-time), Satori moderate (needs 0.33.5), Seroval moderate (TanStack transitive). No major upgrades taken.
- **Lint:** Prettier `endOfLine: auto` removes ~75k CRLF false positives; repo-wide lint still fails on pre-existing formatting/any/hook warnings outside touched files. Touched files are formatted; remaining findings are recorded per screen.
- **Security headers:** `vercel.json` adds `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and service-worker cache headers.
- **Shared states:** `src/components/ui/state.tsx` adds `EmptyState`, `ErrorState`, `LoadingState`, `SectionHeader`, `InlineSpinner`.

## First fixes (foundation scope)

1. Make typecheck/lint usable in touched areas; fix the 59 type errors where low risk.
2. Fix the production PWA `sw.js` output path.
3. Update vulnerable direct dependencies within semver ranges (`bun audit fix`), review breaking changes.
4. Remove CRLF noise so lint can run meaningfully (`.gitattributes` + Prettier `endOfLine: auto` or repo normalisation).
5. Shared UI state components (EmptyState/ErrorState/Skeleton) and header/footer/nav consistency.
6. PWA and security headers review.
