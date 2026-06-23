## Cricket Section — Full Build Plan

Cricket ke ekta full first-class sport hisebe add korbo, exactly football er level e — live score, fixtures, tournament hub, player stats, squad/country profile, records. ESPN Cricinfo er public `site.api` + `core.api` endpoints use korbo (free, no key, Cloudflare Worker safe — same pattern jeta MLB/NBA/NHL/MLS e use korechi).

---

### 1. Data Layer

**`src/lib/cricket.functions.ts`** — notun server functions file (`createServerFn`, 20–60s TTL in-memory cache, just like `espn.functions.ts`):

- `getCricketScoreboard({ date? })` — sob format (Test, ODI, T20I, T20 league) er live + today's matches. Returns `CricketMatch[]` with innings score, overs, status (live/upcoming/stumps/result), venue, broadcast.
- `getCricketSeries({ year? })` — running + upcoming series/tournaments list.
- `getSeriesDetail({ seriesId })` — fixtures, points table, squads, top performers per series.
- `getMatchDetail({ matchId })` — full scorecard (batting/bowling per innings), commentary highlights, playing XI, toss, partnership.
- `getCricketRankings({ format })` — ICC team rankings + top batsmen/bowlers/all-rounders (Test/ODI/T20I).
- `getPlayerProfile({ playerId })` — career stats per format, debut, current team.
- `getTeamProfile({ teamId })` — squad, recent form, upcoming fixtures, H2H summary.
- `getMultiCricketToday()` — homepage slate helper (live + next 5 upcoming across formats).

ESPN endpoints we'll wrap (all under `https://site.api.espn.com/apis/site/v2/sports/cricket/...` and `https://hs-consumer-api.espncricinfo.com/v1/...`):
- `/scoreboard?lang=en&league=8048` (and other league IDs: 8039 IPL, 13266 BBL, 22791 PSL, 23174 T20 WC, etc.)
- `/standings`, `/teams/{id}`, `/teams/{id}/roster`
- Cricinfo HS consumer API for richer scorecard + commentary

A `src/lib/cricket-leagues.ts` const file will register the league IDs we surface (Int'l Test/ODI/T20I, IPL, BBL, PSL, CPL, The Hundred, T20 WC, ODI WC, Champions Trophy, Asia Cup, WPL).

### 2. Routes (file-based)

```
src/routes/cricket.tsx                 -> /cricket (layout, <Outlet/>)
src/routes/cricket.index.tsx           -> /cricket (Live + Upcoming + Recent slate, format tabs)
src/routes/cricket.series.$id.tsx      -> tournament hub (fixtures, table, squads, stats)
src/routes/cricket.match.$id.tsx       -> live match center (scorecard, commentary, lineups)
src/routes/cricket.players.tsx         -> all-time records, rankings, top scorers/wickets
src/routes/cricket.team.$id.tsx        -> country/franchise: squad, ranking, H2H, form
```

Each route: TanStack Query `ensureQueryData` + `useSuspenseQuery`, 20s `refetchInterval` for live data, distinct `head()` SEO metadata, `errorComponent` + `notFoundComponent`.

### 3. Components (`src/components/cricket/`)

- `CricketMatchCard.tsx` — innings score with ScoreFlip-style pulse animation, overs, run rate, status pill (LIVE pulsing, Stumps, Result), team flags, win-probability bar for live.
- `LiveScorecard.tsx` — current batsmen (strike/non-strike with •), current bowler, partnership, last 6 balls visualization (●1●4●W animated chips).
- `FullScorecard.tsx` — innings-wise batting & bowling tables, fall of wickets, extras.
- `PointsTable.tsx` — series standings with NRR, qualification colors.
- `BracketKnockout.tsx` — knockout bracket for WC/IPL playoffs.
- `SquadGrid.tsx` — playing XI / full squad with role chips (BAT/BOWL/AR/WK), captain & wicket-keeper badges.
- `CricketRankingsTable.tsx` — ICC rankings with movement arrows.
- `RecordsPanel.tsx` — all-time most runs/wickets/centuries, WC-specific records, format filters.
- `CricketSlate.tsx` — home page hero slate (mirrors `FootballSlate`).
- `Mobile*` variants — `MobileSeriesDeck.tsx` (swipeable series cards), `MobileLiveScorecard.tsx` (collapsible, stacked), `MobileScoreTicker.tsx` (marquee like `MobileLiveTicker`).
- `CricketSubNav.tsx` — sticky nav: Live · Series · Players · Records · Rankings (mirrors `PlayerSubNav`).

### 4. Hub Integration

- `src/components/sports/SportNav.tsx` — add Cricket pill with unique animated gradient (deep green → gold, `--gradient-cricket`).
- `src/routes/index.tsx` — add `<CricketSlate />` below the football slate; ticker also surfaces live cricket innings.
- `src/lib/sports-config.ts` — register cricket league.

### 5. Design / Animation

- New tokens in `src/styles/cricket-tokens.css`:
  - `--gradient-cricket` (pitch-green → sunset-amber)
  - `--cricket-live-pulse` keyframe (slow red glow on live score)
  - `--ball-pop` keyframe for last-6-balls chips entering
  - Format chips: Test=cream, ODI=blue, T20I=magenta, IPL=gold, BBL=teal, etc.
- Motion: framer-motion for card entry stagger, animated number tween on score change (reuse `ScoreFlip` pattern with overs).
- Mobile-first: horizontal snap deck for series carousel, bottom-sheet match details, collapsible scorecards, sticky live ticker top bar on `/cricket`.
- Typography: same display/body pair already used site-wide — no new fonts.

### 6. Live Updates

- Live endpoints: `refetchInterval: 20_000`, `refetchOnWindowFocus: true`.
- Detailed scorecard route: 15s interval while `status === "in"`, paused when tab hidden.
- Visual live indicator: pulsing red dot + "LIVE" badge in confederation-token style.

### 7. Watch Live (optional, AdSense-safe)

Same approach as football `WatchLivePanel`: a "Watch Live" button per international/IPL match that opens a dialog with the official broadcaster's free YouTube highlight stream where available (Star Sports, Willow, FanCode, ICC YouTube). No pirate IPTV. Regional broadcaster deep-links via existing `src/lib/geo.ts` + a new `src/lib/cricket-broadcasters.ts`.

### 8. SEO

- `/cricket` → title "Live Cricket Scores, Fixtures & Stats", unique meta.
- Series & match pages get dynamic `head()` from loader data (team names, score, venue) + og:image when team logos available.

### 9. Phasing

Phase 1 (this build):
1. Data layer (`cricket.functions.ts`, leagues const).
2. `/cricket` index — live + upcoming + recent slate with format tabs.
3. Match center route with full scorecard + commentary.
4. Series hub route with fixtures + points table + bracket.
5. Players route — rankings + all-time records.
6. Team route — squad + form + H2H.
7. Hub integration (SportNav pill, home slate, ticker).
8. Mobile components + design tokens + animations.

Phase 2 (later, separate request): Watch-live broadcaster panel, deep historical records (year filters), player compare (mirror football compare view), admin overrides for highlight videos.

### 10. Risks / Notes

- ESPN Cricinfo public endpoints are unofficial and occasionally rate-limit / change shape. Mitigation: short TTL cache, defensive mapping (always `?? null`), per-league try/catch like `getMultiSportToday` so one failure doesn't break the slate.
- Some leagues (BBL off-season, etc.) return empty — UI shows "No matches today" state, never errors.
- Cricinfo HS API has CORS restrictions for browsers but works fine from Worker server functions — all calls go through `createServerFn`.

---

**Deliverable on approval:** Phase 1 implemented end-to-end with everything above wired, mobile + desktop polished, live-refreshing, and integrated into the existing multi-sport hub.