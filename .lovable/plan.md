
# MLB Pro Page Plan

Upgrade `/mlb` from a generic LeaguePage into a dedicated, feature-rich MLB hub. Reuse the same architecture later for NBA/NHL/MLS by extracting shared pieces.

## New route layout

```text
src/routes/mlb.tsx              -> layout shell (Outlet + MLB sub-nav + hero)
src/routes/mlb.index.tsx        -> "Today" hub (live, upcoming, featured, news)
src/routes/mlb.scores.tsx       -> Date-scrubbed scoreboard (existing scores tab, expanded)
src/routes/mlb.standings.tsx    -> AL/NL divisions + wild card + streaks
src/routes/mlb.schedule.tsx     -> Week/month upcoming, team filter
src/routes/mlb.teams.tsx        -> All 30 teams grid (logo, record, last/next game)
src/routes/mlb.team.$id.tsx     -> Team profile: roster, schedule, last 10, leaders
src/routes/mlb.players.tsx      -> League stat leaders (AVG/HR/RBI/ERA/SO/SV) + search
src/routes/mlb.player.$id.tsx   -> Player profile: bio, season splits, career history
src/routes/mlb.history.tsx      -> World Series winners, MVPs, Cy Young, all-time records
src/routes/mlb.news.tsx         -> Full news feed (existing news tab, expanded)
```

A sticky MLB sub-nav (`MlbSubNav.tsx`) lives in the layout, mirroring `CricketSubNav` styling with MLB tokens (navy/red).

## Data layer (ESPN public API, free)

Extend `src/lib/espn.functions.ts` with MLB-specific server functions (cached, no module-level env reads):

- `getMlbSchedule({ start, end, teamId? })` — `/scoreboard?dates=YYYYMMDD-YYYYMMDD`
- `getMlbTeams()` — `/teams` (30 teams, logos, colors, venue)
- `getMlbTeam({ id })` — `/teams/$id` + `/teams/$id/schedule` + `/teams/$id/roster`
- `getMlbLeaders({ season, category })` — `/leaders?season=...` (batting/pitching)
- `getMlbAthlete({ id })` — `/athletes/$id` + stats endpoint
- `getMlbStandings({ season })` — already exists, add wild card grouping
- `getWorldSeriesHistory()` — bundled `src/data/mlb/world_series.json` (1903–2025, champ/runner-up/MVP) since ESPN's historical endpoint is unreliable

TTLs: live scoreboard 20s, standings 1h, rosters/leaders 6h, history static.

## Components

```text
src/components/mlb/MlbHero.tsx          -> hero with live ticker + featured game
src/components/mlb/MlbSubNav.tsx        -> sticky pill nav (Today/Scores/Standings/Teams/Players/History)
src/components/mlb/TeamCard.tsx         -> team grid tile
src/components/mlb/TeamProfile.tsx      -> roster table + schedule + last 10
src/components/mlb/LeaderBoard.tsx      -> top-10 by category, tabs for batting/pitching
src/components/mlb/PlayerProfile.tsx    -> bio header + career table + season splits
src/components/mlb/HistoryTimeline.tsx  -> WS champions vertical timeline
src/components/mlb/StreakBadge.tsx      -> W3/L2 chip for standings + team cards
```

Mobile-first: horizontal snap rails for team grids, sheet-based player profile on small screens, sticky sub-nav with overflow scroll.

## Design tokens

Add `src/styles/mlb-tokens.css`:
- `--mlb-navy`, `--mlb-red`, `--mlb-cream`, `--mlb-grass`
- gradient utility `--gradient-mlb` for hero
- ring/chip variants matching existing sport accent pattern

Imported once in `src/styles.css`.

## Auto-refresh & live

- Live ticker (reuse `LiveTicker.tsx`) on hub showing in-progress games inning/score.
- 20s `refetchInterval` on scoreboard and team-profile next-game while `status === "in"`.
- `ScoreFlip.tsx` animation on score changes (reuse existing).

## Open questions

1. History datasets — should I bundle World Series winners + MVPs only, or also Cy Young, Rookie of the Year, batting/HR/ERA all-time leaders? (Adds ~50KB JSON.)
2. Player profile depth — career stats per season (rich), or current season only (lighter, faster)?
3. Should the same expanded layout auto-apply to NBA/NHL/MLS after MLB ships, or keep those on the simpler current LeaguePage for now?
