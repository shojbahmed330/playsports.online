# Blockers

## BLK-SYS-01 — Route screens (resolved)

- **Screen IDs:** 0 route screens remain `BLOCKED`; all 150 route screens are DONE.
- **Global items:** GLB-01–GLB-10 are DONE (root layout, header, mobile nav, footer, breadcrumbs, search, player sheets, auth shell, error shell, PWA).
- **Status:** mission scope complete. Nothing in the route/global inventory is blocked.
- **Remaining work is owner/deploy-gated**, listed below.

## Individual technical blockers

- **BLK-HYDRATION-01 — `DateScrubber` locale/UTC mix (resolved 2026-11-28).** The scrubber built day keys from the active timezone but formatted labels with local getters, and rendered before the client knew the viewer timezone. It now renders a same-height placeholder until mount and formats `YYYY-MM-DD` keys with explicit `timeZone: "UTC"` formatters, so SSR and client agree. Evidence: `bun run typecheck` 0, tests 34/34, build pass, commit `97f6e2d`.
- **BLK-ENCODING-01 — mojibake in production (resolved 2026-11-28).** A bulk class rewrite read UTF-8 source as a legacy Windows codepage and wrote back mojibake (em dashes, middots, emoji, BOMs) in 48 files. Source rebuilt from the pre-rewrite commit with a UTF-8-safe mapper, docs repaired, `tests/encoding.test.ts` added, and production redeployed. Verified: zero `â€`/`ðŸ`/`Γ` in the live HTML; dashboard, match card, subnav and player profile strings render correctly.
- **BLK-NEWS-01 — `/news` empty (resolved 2026-11-28).** `match_recaps` had 0 rows, so `/news` now merges 20 deterministic, data-grounded archive recaps (8 football + 12 cricket) and lets DB/AI rows override them. A protected generator (`/api/public/news-generate`, header `x-news-secret`, env `NEWS_ADMIN_SECRET`) can add AI recaps later; the free OpenRouter tier returned 429 during seeding, so AI content is optional, not required. Verified: `/news` and `/news/spain-vs-netherlands-2014-06-13` 200, 20 cards, `sitemap-news.xml` 20 URLs, RSS populated.
- **Premium pricing mismatch (owner decision).** `src/routes/premium.tsx` shows $3/mo + `mailto:` checkout, while the product rule is $5/mo via Google Play Billing. Visual/token pass shipped; billing is unchanged because it is a business decision.
- **PWA production verification (resolved 2026-11-28).** Production serves `/sw.js` with `Service-Worker-Allowed: /`; the manifest has `id` and 4 shortcuts; the 404 shell is branded.
- **GitHub push (resolved 2026-11-28).** Branch `professional-overhaul` is on `origin` (pushed with the `shojbahmed330` gh account, then the CLI was switched back).
- **Remaining dependency advisories (3)** — zod 3 on the TanStack build-time path (high DoS advisory; runtime schemas are tiny and fixed) and glob/minimatch in dev tooling. `satori` was unused and removed; seroval was fixed by `bun audit fix`.
- **Home bundle** — entry chunk is ~587 KB raw (Vercel compresses it). A vendor `manualChunks` experiment regressed it to ~2.2 MB and was reverted; deeper below-the-fold lazy loading is deferred.
- **Route collision (resolved 2026-11-28).** `/tournaments/fifa-world-cup-2026/<leaderboard>` is now served by the stage route: known boards render their leaderboard (or a useful empty state with all-time/2022 links) instead of 404ing.
