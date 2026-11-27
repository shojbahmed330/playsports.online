# Blockers

## BLK-SYS-01 — Route screens (resolved)

- **Screen IDs:** 0 route screens remain `BLOCKED`; all 150 route screens are DONE.
- **Global items:** GLB-01–GLB-10 are DONE (root layout, header, mobile nav, footer, breadcrumbs, search, player sheets, auth shell, error shell, PWA).
- **Status:** mission scope complete. Nothing in the route/global inventory is blocked.
- **Remaining work is owner/deploy-gated**, listed below.

## Individual technical blockers

- **BLK-HYDRATION-01 — `DateScrubber` locale/UTC mix (resolved 2026-11-28).** The scrubber built day keys from the active timezone but formatted labels with local getters, and rendered before the client knew the viewer timezone. It now renders a same-height placeholder until mount and formats `YYYY-MM-DD` keys with explicit `timeZone: "UTC"` formatters, so SSR and client agree. Evidence: `bun run typecheck` 0, tests 32/32, build pass, commit `97f6e2d`.
- `/news` remains empty because `match_recaps` has 0 rows; recap generation needs admin/OpenRouter input.
- **Premium pricing mismatch (owner decision).** `src/routes/premium.tsx` shows $3/mo + `mailto:` checkout, while the product rule is $5/mo via Google Play Billing. Not changed because it is a business decision.
- **Deployment-gated PWA verification.** `/sw.js` and the manifest are confirmed in `.output/public`, but production behaviour cannot be proven without deploying, which this mission forbids.
- **Remaining dependency advisories (6)** — require semver-major upgrades; out of scope by decision.
- **Home bundle ~745 KB** — route-level code splitting deferred; changing chunking risks breaking asset URLs and is not screen-scoped.
- **Route collision (known, logged).** `/tournaments/fifa-world-cup-2026/<slug>` is claimed by the stage route, so 2026 leaderboard slugs (e.g. `top-scorers`) resolve to the stage route and 404 there. No link or sitemap entry targets those URLs; 2022/2018/all-time leaderboards are unaffected. Fixing it means changing a URL shape, which the mission forbids.
