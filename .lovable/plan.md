# /football Page Pro Upgrade Plan

Audit-driven plan to make `/football` stylish, animated, colorful, professional, and fully mobile-friendly. Below: what already exists, gaps found, and an 8-phase build plan.

---

## Current state (what's there)

- `/football` route: header + hero (Trophy + year title) + `YearStrip` + tabs (Groups / Knockout) + bracket/groups view + `MatchModal`.
- 2026 view: `Wc2026GroupsView` + `Wc2026KnockoutView` (live ESPN data, 20s refresh).
- Mobile: accordion bracket, mobile match cards, snap-scroll year strip.
- Highlights: YouTube video URLs merged from `wc2026_highlights.json` + DB.
- Watch Live: only on home page (floating FAB), not on `/football`.

## Gaps & "not fully implemented" findings

1. **No live ticker / live match center** on `/football` itself — `LiveMatchCenter.tsx` and `MobileLiveTicker.tsx` exist but aren't mounted here.
2. **No "Watch Live" CTA** on the football page (only on `/`).
3. **Hero is static** — same trophy + title regardless of whether matches are live, today, or finished. No live count, no "Next kickoff in 2h 14m" countdown.
4. **No Top Scorers / Golden Boot panel** on 2026 view (data exists via `getWc2026TopScorers`, unused on this route).
5. **No standings snapshot** outside the group tab (no "qualified / eliminated" badges in groups either).
6. **No filters** — can't filter knockout by team, can't search "show me all Argentina matches".
7. **No Today's Matches / Live strip** above the tabs — user has to scroll the bracket to find what's on now.
8. **History years feel flat** — `YearStrip` shows years but no champion flag/badge preview per year; no "winner reel".
9. **Mobile knockout** is plain accordions — no bracket visualization, no swipeable round deck (`MobileBracket.tsx` exists but isn't used here for historical years).
10. **No sticky sub-nav** on mobile — once you scroll past tabs they're gone; have to scroll back up to switch Groups/Knockout.
11. **Header nav** is duplicated across every sport route and not animated; no active-state polish.
12. **Empty/loading states** are generic skeletons — no branded shimmer, no helpful CTAs.
13. **No share / deep-link** per match (modal opens but URL doesn't reflect it for sharing).
14. **No SEO per year** — `head()` is static "2026"; old years should get year-specific title/description.
15. **AdSlot placement** is single in-content — could add footer slot + between groups/knockout transition.

---

## 8-Phase Build Plan

### Phase 1 — Live-Aware Hero
- Detect live/today/upcoming from 2026 fixtures, swap hero copy.
- Add stat pills: `● LIVE 2`, `Today 6`, `Goals today 14`, `Next kickoff in 2h 14m`.
- Primary CTA: "Watch Live" (opens `WatchLivePanel`) + secondary "Jump to live match".
- Animated gradient backdrop (gold → red → blue), grid overlay, subtle shimmer on the trophy.

### Phase 2 — Football Live Ticker
- Mount `LiveTicker` (football-only) directly under the hero on desktop.
- Mount `MobileLiveTicker` as a sticky top strip on mobile (under header).
- Auto-scroll marquee of live + next-3 upcoming matches with `ScoreFlip` animations.

### Phase 3 — Sticky Sub-nav (mobile-friendly)
- After hero scrolls past, pin a compact bar: `[2026 ▾] [Groups] [Knockout] [Scorers] [History]`.
- Snap-scroll on mobile; segmented control on desktop.
- Active tab has gold underline + scale-in animation.

### Phase 4 — Top Scorers + Standings Snapshot (2026)
- New "Golden Boot Race" panel: top-10 scorers with country flag, goals, club, animated bars.
- "Qualified / Eliminated" badges injected into group cards.
- Use existing `getWc2026TopScorers`; add `<Wc2026ScorersPanel />`.

### Phase 5 — Filters & Search
- Filter chip row: `All | Live | Today | My Teams`, plus team autocomplete.
- "My Teams" persists to localStorage; star icon on each match card.
- URL-synced via `?team=ARG&filter=live`.

### Phase 6 — Year Strip 2.0 + Historical Polish
- Each year tile: champion country flag emoji + small trophy badge + hover preview (final score).
- Use `MobileBracket` for historical knockout on mobile (swipeable round deck).
- Per-year `head()` metadata for SEO (title/desc with champion + host).

### Phase 7 — Match Modal Upgrade + Share Links
- URL sync: `/football/match/:id` deep link (route already exists, wire it).
- Share button (Web Share API + copy fallback).
- Embed highlight thumbnail with play-glow animation.

### Phase 8 — Polish, Footer, Ads
- Replace generic skeletons with branded football pitch shimmer.
- Animated empty states (bouncing ball SVG + CTA "Browse 1930–2022").
- Add `SiteFooter` (reuse from home) + second AdSlot before footer.
- Per-card micro-interactions: hover lift, score flip, gradient border on live.

---

## Technical notes

- New components: `FootballHero.tsx`, `FootballLiveTicker.tsx`, `FootballStickyNav.tsx`, `Wc2026ScorersPanel.tsx`, `YearTile.tsx` (with champion), `FootballSkeleton.tsx`.
- New helpers: `src/lib/football-live.ts` (derive live/today/next from fixtures), reuse `src/lib/time.ts` for countdowns.
- Reuse: `LiveMatchCenter`, `MobileLiveTicker`, `MobileBracket`, `WatchLivePanel`, `ScoreFlip`, `AdSlot`.
- Tokens: extend `src/styles/confederation-tokens.css` with `--football-live`, `--football-gold-grad`.
- All animations via existing Tailwind keyframes (`fade-in`, `scale-in`) + a few new gradient pulses.
- Mobile-first: every component tested at 360px; snap-scroll rails, sticky sub-nav, swipe gestures.

---

## Suggested order

Ship in 2 batches:
- **Batch A (high impact, low risk):** Phases 1, 2, 3, 4 — hero, ticker, sticky nav, scorers panel.
- **Batch B (depth + polish):** Phases 5, 6, 7, 8 — filters, year strip 2.0, match deep-links, skeletons + footer.

Reply with **"Start Batch A"** (or pick specific phases) and I'll implement.
