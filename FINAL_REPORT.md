# Final Report — professional overhaul (session 1)

**Date:** 2026-11-27
**Branch:** `professional-overhaul` (local only — **not pushed, not deployed**)
**Scope:** playsports.online, 150 route-level screens + 10 global/overlay items.

## 1. Completion

| Status | Count |
|---|---|
| DONE (full per-screen plan + phases 1–8 + verification) | **6** |
| BLOCKED (resource: per-screen budget exhausted) | **144** |
| Global/overlay items | 5 marked BLOCKED; PWA item addressed |
| Total route screens | **150** |

**DONE screens:** HOME-01, CRK-04 (Cricket hub), CRK-19 (Cricket scores), CRK-13 (Cricket match), CRK-21 (Cricket series hub), CRK-24 (Cricket teams).

This is **not** a completed 150-screen overhaul. The remaining screens have the shared foundation applied, but they have not received their own audit, redesign or Phase 8 verification.

## 2. Baseline → current

| Check | Before | After |
|---|---|---|
| `bun run build` | PASS | **PASS** |
| `bun run test` | 24/24 | **27/27** |
| `bun run typecheck` | 59 errors | **0 errors** |
| `bun run lint` | 84,235 problems | ~9,194 (mainly pre-existing formatting/any/hooks outside touched files) |
| `bun audit` | 66 vulnerabilities (3 critical, 38 high, 19 moderate, 6 low) | **6** (1 high, 5 moderate) |
| Production `/sw.js` | 404 | Fixed in build output (`.output/public/sw.js`); deploy not run by rule |
| Hydration spot checks | Home/Cricket mismatches | 0 on Home, Cricket hub, scores, series, match, teams, standings |

## 3. Top fixes

### Foundation (global)
1. **Typecheck 59 → 0.** Unknown error values go through `errorMessage()`; search params cast to their schema types; invalid `Link` targets replaced with typed dynamic routes; root error component accepts `unknown`.
2. **PWA deploy fixed.** `scripts/postbuild-pwa.mjs` copies `sw.js` + `workbox-*.js` into Nitro output; `bun run build` runs it. Verified in `.output/public`.
3. **Dependency risk reduced.** `bun audit fix` removed all critical advisories (66 → 6). Remaining: transitive Zod 3 in TanStack generator, Satori moderate, Seroval moderate in TanStack's pinned range.
4. **Security headers.** `vercel.json` adds nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy and service-worker cache headers.
5. **Clean search URLs.** Replaced TanStack's JSON-encoding serialiser: `?leagueId=8043` instead of `?leagueId=%228043%22`; old quoted URLs still parse.
6. **Shared states.** `EmptyState`, `ErrorState`, `LoadingState`, `SectionHeader`, `InlineSpinner` in `src/components/ui/state.tsx`.
7. **Reducer-motion support** on live pulses in Home/Cricket components.
8. **Lint noise reduced** with Prettier `endOfLine: auto`; no repo-wide whitespace rewrite.

### Home (HOME-01)
- SSR awaits hero feeds (`ensureQueryData`), so the hero/ticker/counts are in the HTML.
- Feed failure shows a retry.
- Status bar counts render in SSR; live dot is hydration-safe.
- Section header shared; reduced motion.

### Cricket
- **CRK-04:** SSR slate, error retry, shared empty state, 44 px links, reduced motion.
- **CRK-19:** SSR live tab, error retry, dead series-link guard, hydration-safe local “today”, 44 px filters/date buttons.
- **CRK-13:** canonical keeps non-default `leagueId`; friendly error/not-found; live score `aria-live`; `validateSearch` fixed.
- **CRK-21:** curated series SSR; error/retry; polling only when live; bilateral tours hydration-safe.
- **CRK-24:** team cards now open team profiles (series fallback); SSR team lists; full/partial error states; labelled search; 44 px chips.

## 4. Issues by category (found and addressed in the 6 screens)

| Category | Found | Fixed | Remaining in these screens |
|---|---|---|---|
| UI/UX | Duplicate section markup, hardcoded empty boxes, inconsistent CTA sizes | Shared SectionHeader/EmptyState, 44 px targets | Deeper visual pass on filters/cards |
| Bugs | Dead series links, team cards pointing to series, missing leagueId canonical, quoted search URLs, infinite polling | All fixed | — |
| Data | “Today” timezone mismatch; team link 404 risk | Mount-gated today; profile-exists fallback | ESPN feed only returns 9 teams in this environment |
| Perf | Client-only scores/series/teams, unconditional 60 s polling, heavy bilateral SSR risk | SSR where safe; polling gated; heavy feed kept client-side | Home 745 KB chunk; no route-level splitting yet |
| Security | 66 dependency vulns | 6 remaining | CSP still not set |
| A11y | Small chips/links, unlabelled search, motion | 44 px, labels, reduced motion | Full keyboard audit per screen pending |
| SEO | Dropped leagueId canonical, missing SSR content | Fixed on 6 screens | 144 screens not audited |
| Code | Unknown errors, any-types, hooks violation, stale effects | Typecheck 0, hooks rule fixed | Repo-wide `any`/hook warnings remain |

## 5. BREAKING-RISK decisions to review

1. **Search serialiser** (`src/router.tsx`): plain scalar values, JSON arrays/objects still parsed. Old quoted URLs remain valid. A search schema expecting a number must use `z.coerce` (IPL year already does).
2. **PWA build command**: `package.json build` now runs `scripts/postbuild-pwa.mjs`, and `vercel.json` runs `bun run build`. No deploy was performed, so the Vercel path is not yet production-verified.
3. **No route URLs, DB schema, API contracts or analytics names were changed.**

## 6. Remaining risks

- **144 screens** have not been individually audited or redesigned. Shared fixes help, but do not substitute for per-screen work.
- Home still ships a **745 KB** index chunk; route-level code splitting was deferred because React.lazy + SSR can introduce new hydration mismatches.
- **6 dependency advisories** remain; no major upgrades were taken.
- **Repo-wide ESLint** still fails on pre-existing formatting/any/hooks issues outside touched files.
- **`/news` is empty** (0 `match_recaps` rows); the RSS and related-link surfaces are ready.
- **PWA** fix is build-output-verified only; production deploy is forbidden by the mission.
- Auth, Admin, static/legal pages and all US sports screens are unaudited.

## 7. Recommended next order

1. CRK-23 team detail, CRK-16 rankings, CRK-15/14 players, CRK-18/17 records, CRK-06–12 IPL.
2. FB-22 Football hub, FB-05 competition overview, then FB-01–21 league screens.
3. NEWS-01/02, LIVE, SRCH, AUTH, ADMIN, UTIL pages.
4. MLB/NBA/NHL/MLS (archive tier), then the final cross-screen consistency + Lighthouse pass.
5. Deploy the PWA fix and verify `/sw.js` once the owner allows a deployment.

## 8. Artifacts

`PROJECT_NOTES.md`, `HEALTH_BASELINE.md`, `SCREEN_INVENTORY.md`, `DESIGN_SYSTEM.md`, `PROGRESS.md`, `DECISIONS.md`, `BLOCKERS.md`, `SECURITY_FINDINGS.md`, `CHANGELOG.md`, `plans/*.md`, `FINAL_REPORT.md`.

**No remote push, deploy or publish was performed. No production data, database, migration, secret or `.env` file was modified.**
