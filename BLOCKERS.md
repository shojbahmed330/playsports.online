# Blockers

## BLK-SYS-01 — Route screens (resolved)

- **Screen IDs:** 0 route screens remain `BLOCKED`; all 150 route screens are DONE.
- **Global items:** GLB-01–GLB-10 are DONE (root layout, header, mobile nav, footer, breadcrumbs, search, player sheets, auth shell, error shell, PWA).
- **Status:** mission scope complete. Nothing in the route/global inventory is blocked.
- **Remaining work is owner/deploy-gated**, listed below.

## Individual technical blockers

- **BLK-HYDRATION-01 — `DateScrubber` locale/UTC mix (resolved 2026-11-28).** The scrubber built day keys from the active timezone but formatted labels with local getters, and rendered before the client knew the viewer timezone. It now renders a same-height placeholder until mount and formats `YYYY-MM-DD` keys with explicit `timeZone: "UTC"` formatters, so SSR and client agree. Evidence: `bun run typecheck` 0, tests 34/34, build pass, commit `97f6e2d`.
- **BLK-ENCODING-01 — mojibake in production (resolved 2026-11-28).** A bulk class rewrite read UTF-8 source as a legacy Windows codepage and wrote back mojibake (em dashes, middots, emoji, BOMs) in 48 files. Source rebuilt from the pre-rewrite commit with a UTF-8-safe mapper, docs repaired, `tests/encoding.test.ts` added, and production redeployed. Verified: zero `â€`/`ðŸ`/`Γ` in the live HTML; dashboard, match card, subnav and player profile strings render correctly.
- `/news` remains empty because `match_recaps` has 0 rows; recap generation needs admin/OpenRouter input.
- **Premium pricing mismatch (owner decision).** `src/routes/premium.tsx` shows $3/mo + `mailto:` checkout, while the product rule is $5/mo via Google Play Billing. Visual/token pass shipped; billing is unchanged because it is a business decision.
- **PWA production verification (resolved 2026-11-28).** Production serves `/sw.js` with `Service-Worker-Allowed: /`; the manifest has `id` and 4 shortcuts; the 404 shell is branded.
- **GitHub push permission (owner action).** Local git is authenticated as `shojibahmed24`, which gets 403 on `shojbahmed330/playsports.online`. The branch is committed locally and deployed; pushing needs credentials for the repo owner.
- **Remaining dependency advisories (6)** — require semver-major upgrades; out of scope by decision.
- **Home bundle ~745 KB** — route-level code splitting deferred; changing chunking risks breaking asset URLs and is not screen-scoped.
- **Route collision (known, logged).** `/tournaments/fifa-world-cup-2026/<slug>` is claimed by the stage route, so 2026 leaderboard slugs (e.g. `top-scorers`) resolve to the stage route and 404 there. No link or sitemap entry targets those URLs; 2022/2018/all-time leaderboards are unaffected. Fixing it means changing a URL shape, which the mission forbids.
