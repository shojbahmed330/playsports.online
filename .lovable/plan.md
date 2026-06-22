# Plan — Pro-Grade Sports Hub & League Pages

Goal: Take the Home hub and the four league pages (MLB, NBA, NHL, MLS) from "functional" to "ESPN/Athletic-grade" — polished UI, motion, richer data, and clear countdowns to upcoming games.

---

## 1. Upcoming Event Times (the explicit ask)

Every scheduled game (`status === "pre"`) will show:
- **Local time** in the viewer's timezone (e.g. "Tue 7:05 PM" + "your time").
- **Countdown chip**: "Starts in 3h 42m" — live-ticking via a 1s interval, auto-hides at kickoff.
- **Date context**: "Today / Tomorrow / Sat Jun 27".
- **Broadcast** badge (TV network) — already in API, surface more prominently.
- For the Hub's "Today's Slate", group by **Live → Upcoming (next 12h) → Later today → Final**.

New component: `src/components/sports/Countdown.tsx` (pure presentational, uses `setInterval`).
Helper: `src/lib/time.ts` — `formatLocal`, `relativeDay`, `msUntil`.

---

## 2. Home Hub — Pro Redesign

Current hub is a static grid. Target: a magazine-style command center.

**New sections (top → bottom):**
1. **Live Ticker bar** (sticky, auto-scroll marquee) — every in-progress game across all sports, click to jump.
2. **Hero**: rotating featured game (biggest live game, or next marquee matchup) with team colors as gradient background, countdown if pre-game.
3. **Today's Slate** — tabbed by sport (All · ⚽ Football · ⚾ MLB · 🏀 NBA · 🏒 NHL · MLS), with FIFA 2026 fixtures included.
4. **Sport tiles** — 5 cards (Football, MLB, NBA, NHL, MLS) with live count badge, next game preview, and accent-colored hover glow.
5. **Top Stories rail** — aggregated news from all leagues, horizontally scrollable.
6. **Standings snapshot** — top-3 from each league's headline conference/division.

**Motion:**
- Framer-motion stagger on first paint.
- Score-flip animation when a score updates (compare prev/next via ref).
- Live pulse dot synced across the page (single CSS keyframe, no per-card timers).
- Hover lift + accent-color ring on cards.

---

## 3. League Page (MLB/NBA/NHL/MLS) — Pro Upgrade

Reuse `LeaguePage.tsx`, expand it to a tabbed workspace.

**Hero upgrades:**
- Big league wordmark + tagline, animated gradient background using league accent.
- Quick stats strip: "Today: 8 games · 2 live · Season Week 14".
- "Next big game" card with countdown if no games are live.

**Tabs (replace single scroll):**
1. **Scores** — current DateScrubber + GameCard grid. Add filter chips: All / Live / Upcoming / Final. Empty state offers "Jump to next game day" button.
2. **Standings** — current table, plus:
   - Sortable columns (W, L, PCT, GB, Streak).
   - Conference/Division toggle.
   - Playoff-line indicator (color-coded row separator, e.g. NBA top-6 = green, 7-10 = amber Play-In).
   - Tiny form guide (last 5 results as colored dots) per row.
3. **News** — current NewsRail expanded to full grid with hero article + thumbnails.
4. **Teams** — grid of all teams with logos → link to a team modal (roster snapshot from ESPN `/teams/{id}` endpoint).
5. **Schedule** — week view: 7-day strip with game counts per day, click drills into Scores tab.

**Game card upgrades:**
- Pre-game: countdown + broadcast + venue + line score placeholders.
- Live: animated score pulse + period/clock + last-play snippet (ESPN exposes for NBA/NHL/MLB).
- Final: winner highlighted, loser dimmed, "Recap" link if news article exists.
- Click → modal with box score (ESPN summary endpoint).

**Motion:**
- Tab switch slide-in.
- Score updates: number flip via framer's `AnimatePresence`.
- Skeleton loaders instead of spinner.

---

## 4. Global UX/Pro Polish

- **SportNav redesign**: sticky top bar, current sport highlighted with accent underline, "🔴 N live" pill aggregating across all sports.
- **Command palette (⌘K)**: jump to any league, team, or date (cmdk lib already in shadcn).
- **Dark/Light toggle** (currently dark-only).
- **Auto-refresh**: when any game on the page is live, poll scoreboard every 30s (React Query `refetchInterval`).
- **Offline / error states**: every fetch has a friendly retry card, not just red error text.
- **Toasts** for score updates of "favorited" teams (localStorage favorites list, ⭐ icon on team rows).
- **Loading skeletons** matching the final card shape.
- **Empty states** with illustrations and a CTA.
- **SEO**: per-league JSON-LD `SportsEvent` schema for today's games.
- **Accessibility**: proper aria-live on score updates, keyboard tab order, focus rings.
- **Mobile**: horizontal-scroll game rail on Hub, bottom-sheet for modals.

---

## 5. New / Modified Files (technical)

**New:**
- `src/components/sports/Countdown.tsx` — live countdown chip.
- `src/components/sports/LiveTicker.tsx` — marquee bar.
- `src/components/sports/FeaturedGame.tsx` — hero rotator.
- `src/components/sports/ScoreFlip.tsx` — animated number.
- `src/components/sports/FormGuide.tsx` — last-5 dots.
- `src/components/sports/TeamGrid.tsx` + `TeamModal.tsx`.
- `src/components/sports/CommandPalette.tsx`.
- `src/components/sports/Skeletons.tsx`.
- `src/lib/time.ts` — time helpers.
- `src/lib/favorites.ts` — localStorage favorites hook.
- ESPN: add `getTeams`, `getGameSummary`, `getTeamRoster` to `espn.functions.ts`.

**Modified:**
- `src/routes/index.tsx` — full hub redesign.
- `src/components/sports/LeaguePage.tsx` — tabbed layout.
- `src/components/sports/GameCard.tsx` — countdown, last-play, click-to-modal.
- `src/components/sports/StandingsTable.tsx` — sortable, playoff line, form guide.
- `src/components/sports/SportNav.tsx` — sticky + live pill + ⌘K trigger.

**Deps:** `framer-motion` (likely already in), `cmdk` (already via shadcn), `date-fns` for time formatting.

---

## 6. Risks / Scope Notes

- ESPN's "last play" and box score fields vary by sport; will gracefully degrade.
- Auto-refresh raises ESPN request volume — protected by existing 60s server cache.
- Light theme is a bigger lift (tokens audit) — flag as **optional**, can defer.
- Command palette is **nice-to-have** — flag as optional if scope feels heavy.

---

## 7. Out of Scope (this batch)

- FIFA `/football` page redesign (already styled — only Hub's football slate is touched).
- User accounts / cross-device favorites (localStorage only).
- Native push notifications.
- Historical season archives for MLB/NBA/NHL/MLS.

---

## Questions before I build

1. **Scope size**: do all 5 sections (Hub + 4 leagues + tabs + countdown + ticker + ⌘K + favorites) in one go, or land in 2 passes (Pass A = countdowns + Hub redesign + LeaguePage tabs; Pass B = ⌘K + favorites + team modals + light theme)?
2. **Light theme**: skip for now, or include?
3. **Auto-refresh interval** when live games exist: 30s (snappy, more ESPN calls) or 60s (safer)?
