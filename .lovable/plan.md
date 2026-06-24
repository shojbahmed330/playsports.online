## 1) Fix admin "Save link" failure (FK error)

**Root cause:** `wc_matches.tournament_year` has FK → `wc_tournaments(year)`. When admin saves a 2026 video link, code inserts a `wc_matches` row with `tournament_year: 2026`, but there's no `wc_tournaments` row for 2026 yet → FK violation.

**Fix (migration):**
- Insert a `wc_tournaments` row for `year = 2026` (host: "USA / Canada / Mexico", format details).
- Backfill any other missing tournament years that admin might target.

No frontend changes needed for the save itself — once the parent row exists, the existing insert works.

## 2) Auto-pull 2026 highlights from Robi Axiata YouTube channel

**Approach:** YouTube Data API v3 (free quota, 10k units/day). Need a `YOUTUBE_API_KEY` secret.

- Add server function `src/lib/yt-highlights.functions.ts`
  - `listRobiAxiataHighlights()` → fetches recent uploads from channel `@robi_axiata` via `channels.list?forHandle=@robi_axiata` then `playlistItems.list` on uploads playlist (cache 30 min).
  - `autoMatch2026Highlights()` (admin-only, `requireSupabaseAuth` + admin role) → for each video title, fuzzy-match team pair (using same normalization as `wc-2026-videos.ts`), upsert `wc_matches` row with `video_url=https://youtu.be/{id}`, `tournament_year=2026`.
- Admin panel: new card "Auto-import 2026 highlights from Robi Axiata"
  - "Preview matches" button → shows table of detected video↔match pairs with checkboxes.
  - "Import selected" button → bulk upsert.
  - Status badges (already saved / new / no-match).
- Runs on demand from admin. (Optional cron later via `/api/public/cron/refresh-highlights` — not in this pass unless you want it.)

**Need from you:** Provide the YouTube Data API v3 key (I'll prompt via `add_secret`).

## 3) `/cricket` — real recent data, not demo

**Root cause:** the 4 curated league IDs (8048 IPL, 8039 ICC WC, 8044 BBL, 8043 Sheffield Shield) only return matches when those specific tournaments are in season. Right now they all show stale/empty seasons → looks like demo.

**Fix:**
- Switch the hub default feed to ESPN's **global live cricket scoreboard** endpoint that's always populated, in this priority:
  1. `site.api.espn.com/apis/site/v2/sports/cricket/scoreboard` (all live series — when available)
  2. Fan out across an expanded league registry (add: 8047 PSL, 8068 SA20, 27987 ILT20, 28017 MLC, 8045 CPL, 23174 The Hundred, 8053 Bangladesh Premier League, 8059 WPL, plus international tour series IDs).
- Add a "Today / Live / Upcoming / Recent" tab strip on `/cricket` driven by status buckets.
- Year/season selector per league so a user can browse past editions.

## 4) `/cricket` history pages (Players, Countries, IPL, World Cup, BBL, etc.)

ESPN's public site API doesn't expose deep historical records. Best free path = **Cricinfo Stats Guru–style static datasets bundled with the app**, refreshed periodically.

Plan:
- Add `src/data/cricket/` with JSON datasets (curated, sized like the football WC ones):
  - `players_career.json` — top batters/bowlers/all-rounders (career runs, wickets, avg, SR, 100s, 50s).
  - `team_records.json` — per-country: matches/wins/losses by format, biggest wins, highest totals.
  - `tournaments/ipl.json`, `tournaments/world_cup_odi.json`, `tournaments/world_cup_t20.json`, `tournaments/bbl.json` — season-by-season winners, runners-up, top scorer (Orange Cap), top wicket-taker (Purple Cap), finals scorecard summary.
- New routes:
  - `/cricket/records` — leaderboards (Most runs, Most wickets, Highest individual score, Best bowling, Most 100s) with format filters.
  - `/cricket/players` — list + filter (country, role, format) + click into `/cricket/players/$slug` profile.
  - `/cricket/teams` — country grid + `/cricket/teams/$code` profile (format breakdown, recent form from ESPN, all-time records from JSON).
  - `/cricket/history/$tournament` — season cards for IPL / WC ODI / WC T20 / BBL (champion, MVP, top scorer, top wicket-taker, final summary, expandable scorecard).
- Sub-nav `CricketSubNav.tsx` (Live · Series · Records · Players · Teams · History) — mirrors football's `PlayerSubNav`.

> Datasets are static (manually curated initial release ~2010→present for marquee tournaments). Auto-refresh later if you want.

## 5) `/cricket` UI overhaul (pro + mobile-first)

- New `CricketHero` with animated pitch gradient, live ticker of in-play matches (mobile-swipeable).
- `CricketSubNav` — sticky pill nav, horizontal scroll-snap on mobile (no left/right scroll feel — wraps + snap like the SportNav redesign).
- `CricketMatchCard` v2 — bigger team blocks, run-rate, required rate, last-6-balls dots, "LIVE" pulse, tap to expand mini-scorecard inline on mobile.
- `MobileScorecard` sheet — bottom drawer with tabs (Summary / Batting / Bowling / Commentary), swipe between innings.
- Format chips with confederation-style colored tokens.
- Skeleton loaders, empty states with "browse past seasons" CTAs.
- Cricket-specific tokens extended in `src/styles/cricket-tokens.css` (per-league accent gradients reused on hub).

## Files (high level)

**New**
- `src/lib/yt-highlights.functions.ts`
- `src/components/admin/Wc2026HighlightsCard.tsx`
- `src/data/cricket/players_career.json`, `team_records.json`, `tournaments/*.json`
- `src/routes/cricket.records.tsx`, `cricket.players.tsx`, `cricket.players.$slug.tsx`, `cricket.teams.tsx`, `cricket.teams.$code.tsx`, `cricket.history.$tournament.tsx`
- `src/components/cricket/CricketSubNav.tsx`, `CricketHero.tsx`, `MobileScorecard.tsx`, `LeaderboardTable.tsx`
- Migration: insert `wc_tournaments` 2026 row

**Updated**
- `src/lib/cricket-leagues.ts` (expanded registry)
- `src/lib/cricket.functions.ts` (global scoreboard fallback, season selector)
- `src/routes/cricket.index.tsx` (tabs, hero, sub-nav)
- `src/components/cricket/CricketMatchCard.tsx` (v2)
- `src/routes/admin.tsx` (mount highlights card)

## Questions before I build

1. **YouTube API key** — do you already have a Google Cloud `YOUTUBE_API_KEY`, or should I prompt to create one when build starts?
2. **Auto-import scope** — should imported videos always overwrite an existing `video_url`, or only fill when empty? (Default I'll use: only fill when empty, with an "Overwrite" toggle in the card.)
3. **Cricket history depth** — initial dataset coverage: IPL (2008→2025), ODI WC (1975→2023), T20 WC (2007→2024), BBL (2011→2025). OK, or want more leagues (PSL, CPL, The Hundred, SA20) in pass 1?
