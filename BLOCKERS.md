# Blockers

## BLK-SYS-01 — Route screens (resolved)

- **Screen IDs:** 0 route screens remain `BLOCKED`; all 150 route screens are DONE.
- **Global items:** GLB-01–GLB-10 are DONE (root layout, header, mobile nav, footer, breadcrumbs, search, player sheets, auth shell, error shell, PWA).
- **Status:** mission scope complete. Nothing in the route/global inventory is blocked.
- **Remaining work is owner/deploy-gated**, listed below.

## Individual technical blockers

- **BLK-HYDRATION-01 — `DateScrubber` locale/UTC mix (resolved 2026-11-28).** The scrubber built day keys from the active timezone but formatted labels with local getters, and rendered before the client knew the viewer timezone. It now renders a same-height placeholder until mount and formats `YYYY-MM-DD` keys with explicit `timeZone: "UTC"` formatters, so SSR and client agree. Evidence: `bun run typecheck` 0, tests 34/34, build pass, commit `97f6e2d`.
- **BLK-ENCODING-01 — mojibake in production (resolved 2026-11-28).** A bulk class rewrite read UTF-8 source as a legacy Windows codepage and wrote back mojibake (em dashes, middots, emoji, BOMs) in 48 files. Source rebuilt from the pre-rewrite commit with a UTF-8-safe mapper, docs repaired, `tests/encoding.test.ts` added, and production redeployed. Verified: zero `â€`/`ðŸ`/`Γ` in the live HTML; dashboard, match card, subnav and player profile strings render correctly.
- **BLK-STATS-01 — career stats missing/slow (resolved 2026-11-28).** Statsguru was fetched without a per-request timeout, so one slow format could blank every format and block the page for ~9 s. The loader now returns the bio only; career stats load client-side with a skeleton, each request times out at 12 s, and successful tables persist in `sports_data_cache` for 7 days + memory 24 h. Verified with a JS-rendered browser: Test/ODI rows with values appear.
- **BLK-CANONICAL-01 — live player clean URL 404 (resolved 2026-11-28).** `kannaur-lokesh` now resolves via an explicit alias, and the canonical tag uses the clean URL when it resolves; otherwise it uses `?athlete=<id>`, which always works. Tom Latham/KL Rahul clean + parameterised URLs both return 200.
- **BLK-NEWS-01 — `/news` empty/old (resolved 2026-11-28).** `/news` now merges (1) DB/AI recaps, (2) current completed ESPN matches (`current-...`, 10 min cache), and (3) 20 archive recaps. It leads with current results and falls back through older content. The protected generator remains for optional AI recaps.
- **Premium pricing mismatch (owner decision).** `src/routes/premium.tsx` shows $3/mo + `mailto:` checkout, while the product rule is $5/mo via Google Play Billing. Visual/token pass shipped; billing is unchanged because it is a business decision.
- **PWA production verification (resolved 2026-11-28).** Production serves `/sw.js` with `Service-Worker-Allowed: /`; the manifest has `id` and 4 shortcuts; the 404 shell is branded.
- **GitHub push (resolved 2026-11-28).** Branch `professional-overhaul` is on `origin` (pushed with the `shojbahmed330` gh account, then the CLI was switched back).
- **Remaining dependency advisories (resolved 2026-11-28).** Replaced `@tanstack/zod-adapter` with a local zod 4 validator and pinned `zod`, `minimatch` and `glob` via package overrides (npm-compatible `$zod`). `bun audit` reports **0 vulnerabilities**; typecheck/tests/build pass.
- **Home bundle** — selective `manualChunks` now splits react (178 KB), radix (106 KB) and icons (32 KB) out of the entry. Entry is **~401 KB raw** (was ~587 KB); initial transfer is similar but cacheable and the entry is smaller.
- **BLK-HYDRATION-02 - Home/Cricket text hydration mismatch (resolved 2026-11-28).** Time/day labels now use `LocalTime`; count badges, zone strip, status bar and cricket slate are mount-gated; the unawaited cricket prefetch and the last `GameCard` `relativeDay`/`formatLocalTime` calls were fixed. Browser console on `/` and `/cricket` is now clean (0 uncaught errors).
- **Route collision (resolved 2026-11-28).** `/tournaments/fifa-world-cup-2026/<leaderboard>` is now served by the stage route: known boards render their leaderboard (or a useful empty state with all-time/2022 links) instead of 404ing.
