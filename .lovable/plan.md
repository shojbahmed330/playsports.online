
# Home Page Audit & Upgrade Plan

## What's already on `/` (working)
- `SportNav` + `LiveTicker` marquee
- Static text hero ("One Sports Hub. Every Game.")
- Sport tiles grid (FIFA + MLB/NBA/NHL/MLS)
- "Live right now" tagged grid
- `FootballSlate` (WC 2026 featured + buckets)
- `CricketSlate`
- One in-content AdSlot
- "Upcoming today" + "Recent finals"
- Plain footer

## Gaps & weaknesses (why it feels unfinished)
1. **Hero is flat** — no live data, no imagery, no motion. Just a gradient + heading.
2. **No personalization / no "Continue watching"** — user can't jump back to a league/match they were on.
3. **No trending / top stories rail** — `NewsRail` exists in codebase but isn't used on home.
4. **No top scorers / records teaser** — `/players` data is rich but invisible from home.
5. **No standings snapshot** — `StandingsTable` never shown; user must dive into each league.
6. **No "Watch live" CTA** — `WatchLivePanel` (FIFA YouTube embed) hidden inside football page only.
7. **No countdown to next marquee event** — `Countdown` exists, only used inside small tiles.
8. **Cricket + Football slates look identical** — no visual hierarchy between sports.
9. **Sport tiles don't preview scores** — just emoji + tagline. Wasted real estate.
10. **Mobile**: hero text scales, but tiles are 2-col and dense; no horizontal snap rails for live games.
11. **No theme/identity** — generic dark + amber. No signature motion, no brand mark, no hero artwork.
12. **Footer is one line** — no sitemap, no social, no "data sources" expansion.
13. **No empty/offline states** with personality — just gray "No matches" boxes.
14. **No skeleton shimmer** on the FootballSlate / CricketSlate (only on upcoming grid).
15. **AdSlot placement** — only one mid-page; missing footer/leaderboard slot the AdSense system supports.

## Upgrade plan

### A. Hero redesign (signature moment)
- Full-bleed animated hero: layered gradient + subtle SVG stadium silhouette + grain.
- Live stat strip inside hero: `🔴 X live · Y today · Z leagues` with animated counters.
- Rotating "spotlight card" (3s auto-rotate, Framer Motion `AnimatePresence`): cycles between the single most important live game across all sports → next big WC 2026 fixture → top scorer of the week.
- Primary CTA: **Watch live** (opens FIFA stream drawer) + secondary **Browse archive**.
- Countdown chip to next marquee fixture.

### B. New "Pulse" strip (above the fold, below hero)
- Horizontal snap-scroll rail of every live game across all sports, with `ScoreFlip` animated scores.
- Sticky on mobile when scrolling past hero.

### C. Sport tiles → "Sport cards 2.0"
- Each tile shows: league logo, live count badge, next game teams + countdown, today's headline score.
- Hover: gradient sweep + arrow slide (Framer Motion).
- Colorful per-sport accent borders using tokens already in `sports-config.ts`.

### D. Sections to add
1. **Top Stories** — wire existing `NewsRail` with MLB/NBA/NHL/MLS/Soccer headlines (ESPN news API already used in `/mlb/news`).
2. **Standings snapshot** — 2-col: AL/NL East leaders + Eastern/Western Conf leaders + WC 2026 group leaders. "See full standings →".
3. **Records & Stars** — pull from `wc_records.json` + merged 2026 goals: "Golden Boot race", "All-time top scorers", clickable to `/players`.
4. **Watch Live drawer** — global button bottom-right; opens `WatchLivePanel` (FIFA YouTube) as a sheet.
5. **Cricket / Football side-by-side** on desktop (2-col grid) instead of stacked, with distinct color tokens (amber for football, emerald for cricket).

### E. Visual / motion system
- Add `framer-motion` page-enter stagger for sections.
- Section headers get a 1px gradient underline + emoji chip.
- Consistent card hover: `-translate-y-0.5` + colored shadow matching sport accent.
- Add `noise.svg` overlay (low opacity) for depth on hero.
- Skeleton shimmer (`animate-pulse` gradient) for every async section.
- Live dots: replace `animate-pulse` with a custom ping+pulse double ring.

### F. Mobile polish
- Hero: tighter spacing, single-line stat strip with auto-shrink.
- Pulse strip + Football fixtures + Cricket fixtures → horizontal snap rails (`snap-x snap-mandatory`).
- Floating "Live" pill bottom of viewport when any game is in-progress, taps to scroll to Pulse strip.
- Tile grid: 2 cols mobile, ensure `min-w-0` + truncation on team names.

### G. Footer upgrade
- 3-column: Sitemap (sports + admin + auth), Data sources, Social/legal.
- Add `AdSlot slot="footer"` already supported by AdSense system.
- "Last updated" timestamp from latest live query.

### H. SEO / metadata polish
- Add `og:image` (generated hero collage).
- JSON-LD `SportsEvent` for the spotlight fixture.
- Canonical tag.

## Tech notes
- New components: `HeroSpotlight.tsx`, `PulseStrip.tsx`, `SportCard.tsx` (replaces `SportTile`), `TopStoriesRail.tsx`, `StandingsSnapshot.tsx`, `RecordsTeaser.tsx`, `WatchLiveFab.tsx`, `SiteFooter.tsx`.
- Reuse existing: `NewsRail`, `WatchLivePanel`, `ScoreFlip`, `Countdown`, `StandingsTable`, `wc_records.json`, `use-merged-goals.ts`.
- Add `framer-motion` (already present per project context — verify).
- No backend changes; all data via existing server functions with their current TTLs.

## Rollout order (incremental, each is independently shippable)
1. Hero + Pulse strip + animated counters
2. Sport cards 2.0 with live preview
3. Top Stories + Standings snapshot
4. Records & Stars teaser
5. Watch Live floating drawer
6. Footer + AdSlot footer + SEO polish
7. Mobile snap rails + floating live pill
