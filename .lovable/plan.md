# Plan: 2026 Everywhere + Live Football + Mobile Football Redesign

Three independent work streams. Each can ship on its own.

---

## 1. Propagate 2026 live data into Records, Compare, Countries

Today only the Scorers leaderboard merges live 2026 goals from Sofascore. Records, Compare and Country stats still read only the static 1930–2022 JSON, so a Messi 2026 goal never shows up there.

**Approach: one shared "merged goals" hook**

Create `src/lib/use-merged-goals.ts`:
- Wraps `getWc2026TopScorers` via TanStack Query (1h stale, shared cache key).
- Returns a `GoalRow[]` that combines `wc_goals.json` with synthetic 2026 rows (one row per goal scored, `year: 2026`, `pen` flag from Sofascore when available, `og: false`).
- Uses the same diacritic-insensitive name+country index already in `players.tsx` so a 2026 Messi merges into the historical Messi key — no duplicates.
- Exposes `{ goals, live2026Goals, isLoading, lastUpdated }`.

Then refactor:
- **`src/routes/players.tsx`** — replace the local `GOALS` constant in the scorers pipeline with the merged set; remove the inline 2026 merge block (now redundant). `countryStats` and `filteredCards` (cards stay static, Sofascore doesn't expose them reliably) use merged goals.
- **`src/components/players/RecordsPanel.tsx`** — accept `goals` via prop (or read the hook) so "Top single-tournament hauls", "Highest-scoring tournaments" and "Hat-trick heroes" include 2026. Add a small "Live" pill on any 2026 row.
- **`src/components/players/CompareView.tsx`** — same: read merged goals so per-tournament timelines and totals reflect 2026.
- **`src/components/players/PlayerProfileSheet.tsx`** — read merged goals; the per-year table will now have a 2026 row for active players with a green Live dot.
- Country stats: include 2026 goals in the country's `goals`, `tournaments` (adds 2026 if any goal), and re-pick top scorer.

**Curated records JSON stays untouched** (those are historical facts). Only the *derived* sections in `RecordsPanel` get the live merge.

---

## 2. Free live football streaming on the platform

**Reality check first:** There is no legal free API that returns playable World Cup video streams — FIFA+, FOX, Telemundo, BBC etc. are geo-locked and DRM-protected. Embedding pirate streams (Sportsurge, Buffstreams, etc.) gets the domain blocked by AdSense and risks DMCA. We will not do that.

**What we *can* do for free, legally:**

a. **Official broadcaster deep-links per match.** Build `src/lib/broadcasters.ts` mapping ISO country → list of official rightsholders for FIFA 2026 (FIFA+ where free, FOX/Telemundo US, BBC iPlayer UK, CBC Canada, SBS Australia, etc.). On each live/upcoming match card show a "Watch live" button that opens the correct broadcaster for the visitor's locale (detected via `navigator.language` + a country selector override stored in localStorage).

b. **FIFA+ embeds where available.** FIFA+ offers free live streams for many matches in supported regions. Embed via `<iframe src="https://www.fifa.com/fifaplus/...">` inside a new `LiveStreamPanel` component when an embeddable URL exists in our config.

c. **Live match center (always free).** For every live 2026 fixture, render a real-time match center using Sofascore data we already fetch:
   - Live score with `ScoreFlip` animation
   - Minute ticker + event timeline (goals, cards, subs) — add `getWc2026MatchEvents(matchId)` server fn
   - Lineups, possession bar, shots, xG when available
   - Auto-refresh every 20s while `status=live`

d. **Admin override.** Reuse the existing 2026 video admin to let you paste a YouTube live URL per match (e.g. official highlights livestream). When present, it embeds in the match modal above the broadcaster list.

New files:
- `src/lib/broadcasters.ts` — region → broadcaster table
- `src/lib/wc2026.functions.ts` — add `getWc2026MatchEvents`, `getWc2026Lineups`
- `src/components/wc/LiveMatchCenter.tsx` — score, timeline, stats
- `src/components/wc/WatchLiveButton.tsx` — locale-aware broadcaster dropdown
- `src/routes/football.match.$id.tsx` — dedicated match page wiring all of the above (SEO-friendly URL, shareable)

Modify:
- `src/components/wc/MatchCard.tsx` — when live, show pulsing LIVE pill + "Watch live" CTA → opens `LiveMatchCenter` in a sheet on mobile, modal on desktop.
- `src/components/wc/MatchModal.tsx` — mount `LiveMatchCenter` when match is live.

---

## 3. Mobile-only redesign for the football section

Desktop stays as-is. Target viewport: 360–430px.

**Design language:** colorful per-confederation accent gradients (CONMEBOL red, UEFA blue, CAF green, AFC orange, CONCACAF teal, OFC purple), Motion-driven entrances, haptic-feeling tap states, sticky context bars.

### 3.1 Football route header (`src/routes/football.tsx`)
- Replace year dropdown row with a **collapsing app-bar** (shrinks on scroll, shows tournament logo + year + LIVE pill).
- `YearStrip` becomes a sticky pill rail directly under the app-bar with snap-scroll and a glowing gold underline for active year; auto-scroll active into view on mount.
- Add a **stage tabs bar** (Group · R32 · R16 · QF · SF · Final) as horizontally scrollable chips with active gradient fill. Tapping scrolls to that section AND filters when zoomed in.

### 3.2 Group stage cards (`src/components/wc/GroupStage.tsx` mobile branch)
- One group per swipeable card (horizontal snap) instead of a long vertical list. Dots indicator at bottom.
- Each group: confederation-tinted header, team rows with flag, P/W/D/L/Pts in tabular-nums, qualification color bar on the left (green = through, yellow = playoff, red = out).
- Tap team row → mini sheet with their remaining fixtures + last 5 form dots.
- Subtle Motion stagger on mount (50ms per row).

### 3.3 Knockout rounds (R32, R16, QF, SF, Final)
- New `src/components/wc/KnockoutBracketMobile.tsx`:
  - Vertical bracket per round, each tie as a compact card with two teams stacked, score on right.
  - Aggregate/PSO badge, extra-time pill.
  - "Path to final" mode: tap a team → highlight their bracket line all the way through, dim everything else (Motion `layoutId` glow).
  - Live ties show pulsing border + minute.
  - Swipe left/right to jump between rounds; current round shown in a sticky top chip rail synced with scroll position.

### 3.4 Match cards (`src/components/wc/MatchCard.tsx` mobile branch)
- Bigger flags (40px), country code under flag.
- Score in a dedicated centered pill; if live, score pill pulses and shows minute.
- Status row: kickoff in viewer timezone (already in `src/lib/time.ts`) + countdown chip if upcoming.
- Bottom action row: Watch live · Highlights · Stats (icons + label), with 44px tap targets.
- Long-press → quick share sheet.

### 3.5 Live ticker for football
- Add a sticky bottom marquee on `/football` (mobile only) listing all live 2026 matches with score, mirroring the Hub's `LiveTicker`. Tap a chip → opens that match page.

### 3.6 Motion + polish
- Use Motion for React (`motion/react`) — already in stack — for: app-bar collapse, group card swipe physics, bracket highlight, score-flip emphasis (extend existing `ScoreFlip`).
- Reduced-motion: respect `prefers-reduced-motion` and fall back to opacity-only transitions.
- Skeletons: per-section shimmer using existing `Skeletons.tsx`.

### 3.7 Files touched / added
Added:
- `src/components/wc/MobileAppBar.tsx`
- `src/components/wc/StageTabs.tsx`
- `src/components/wc/GroupSwipeDeck.tsx`
- `src/components/wc/KnockoutBracketMobile.tsx`
- `src/components/wc/FootballLiveTicker.tsx`
- `src/styles/confederation-tokens.css` (CSS custom properties for the 6 gradients, imported from `styles.css`)

Modified:
- `src/routes/football.tsx` — mobile branch wires the new components, desktop unchanged.
- `src/components/wc/GroupStage.tsx`, `MatchCard.tsx`, `Wc2026View.tsx`, `YearStrip.tsx` — add mobile variants behind `useIsMobile()`.

---

## Suggested rollout order

1. Stream 1 (Records/Compare/Countries 2026 merge) — smallest, highest user-visible payoff.
2. Stream 3 (Mobile football redesign) — large but isolated to football section.
3. Stream 2 (Live streaming + match center) — depends on new Sofascore endpoints and broadcaster research; ship after.

## Open question

For Stream 2, do you want me to:
- **(A)** Ship all three sub-features (broadcaster deep-links + FIFA+ embeds where allowed + live match center with events/lineups), or
- **(B)** Start with just the live match center (always works, no geo issues) and add broadcaster links in a second pass?
