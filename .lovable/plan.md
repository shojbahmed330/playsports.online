## Goal
Transform the FIFA World Cup Archive into a multi-sport platform (ESPN-style) with live scoreboards, standings, and top scorers for **MLB, NBA, NHL, and MLS**, alongside the existing FIFA World Cup section.

## Data source
**ESPN's public hidden API** (`site.api.espn.com`) — same source ESPN.com itself uses.
- ✅ No API key required
- ✅ Works on Cloudflare Workers (pure HTTPS fetch, no Node dependencies)
- ✅ Returns scores, standings, schedules, team logos, player stats
- ✅ Used by `sportsdataverse` under the hood — we'll call it directly instead of installing a Node-only wrapper

Endpoints used:
```text
/apis/site/v2/sports/baseball/mlb/scoreboard      → MLB games
/apis/site/v2/sports/basketball/nba/scoreboard    → NBA games
/apis/site/v2/sports/hockey/nhl/scoreboard        → NHL games
/apis/site/v2/sports/soccer/usa.1/scoreboard      → MLS games
/apis/site/v2/sports/{path}/standings             → League tables
/apis/site/v2/sports/{path}/news                  → Headlines
```

## New site structure

```text
/                       → Sports hub (cards for each sport + featured live games)
/football               → FIFA World Cup Archive (existing site, moved here)
/football/players       → Existing players page
/mlb                    → MLB scoreboard, standings, news
/nba                    → NBA scoreboard, standings, news
/nhl                    → NHL scoreboard, standings, news
/mls                    → MLS scoreboard, standings, news
```

Top nav becomes: **Football · MLB · NBA · NHL · MLS** with an ESPN-style sport switcher.

## Build steps

1. **Sports data service** — `src/lib/espn.functions.ts`
   - Server functions: `getScoreboard(sport, date?)`, `getStandings(sport, season?)`, `getNews(sport)`
   - In-memory cache, 5-min TTL for scoreboards (live), 1-hour for standings
   - Typed adapters returning clean DTOs (no raw ESPN shapes leaked to client)

2. **Shared UI primitives** — `src/components/sports/`
   - `SportHero` — branded hero per sport (color + icon)
   - `GameCard` — score/status/teams/logos (works for any sport)
   - `StandingsTable` — generic table (conference/division aware)
   - `LiveBadge`, `DateScrubber` — date picker for scoreboards
   - `NewsRail` — horizontal news cards from ESPN feed

3. **One reusable league page** — `src/components/sports/LeaguePage.tsx`
   - Takes `sport` config and renders: hero → date scrubber → games grid → standings → news
   - Per-sport route file is a thin 5-line wrapper passing the sport key

4. **Sport configs** — `src/lib/sports-config.ts`
   - Per-sport brand color, icon, label, ESPN path, season settings

5. **New homepage** — `src/routes/index.tsx`
   - ESPN-style hub: today's live games across all sports + sport selector cards
   - Featured: FIFA World Cup 2026 callout (links to /football)

6. **Move existing FIFA site** to `/football` (current `index.tsx` content moves to `src/routes/football.tsx`)

## Design language
- Keep the existing dark theme + amber accent for FIFA
- Each sport gets a signature accent color (MLB navy, NBA orange, NHL ice-blue, MLS green-red gradient)
- Reuse the existing `MatchCard` / card-grid aesthetic so the whole platform feels cohesive
- ESPN-style sticky top nav with sport switcher

## Out of scope (for now)
- NFL (regular season runs late; can add after launch if you want)
- Game-by-game play-by-play modals (huge data, can add later per sport)
- User accounts / favorites
- Mobile-only score ticker (can add)

## Risks & notes
- ESPN's API is undocumented but extremely stable (powers ESPN.com itself). If a sport endpoint breaks, the affected page shows a friendly error; other sports keep working.
- Caching keeps total outbound requests low (~12-20 req/hour per warm worker, regardless of traffic).
- No new secrets needed.
- The existing FIFA 2026 SofaScore integration stays as-is.

## Confirm before I build
1. **Routing OK?** Move FIFA archive from `/` to `/football` and make `/` the new multi-sport hub?
2. **All 4 sports in this batch?** Or start with one (say NBA) to validate the design first?
3. **Live data only**, or also historical (e.g. past NBA Finals, World Series winners list)? Historical is a much bigger lift — ESPN's API is mostly current-season focused.
