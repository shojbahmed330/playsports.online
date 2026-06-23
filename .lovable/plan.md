
# Plan — Pro-grade `/players` redesign

Goal: turn `/players` from a static list of leaderboards into a professional, mobile-friendly, fully filterable player intelligence hub that blends historical World Cup data (1930–2022) with live 2026 data, with shareable URLs and clean UX on every screen size.

## 1. Hero + page chrome

- New compact hero with animated gradient ribbon, KPI strip: total players, total goals tracked, tournaments covered, live 2026 goals counter (animated number).
- Sticky sub-nav (tabs): **Overview · Top Scorers · Discipline · Countries · Rankings · Compare · Records**. On mobile it becomes a horizontal snap-scroll pill bar; on desktop a centered segmented bar. Active tab reflected in `?tab=` URL param.
- Breadcrumb (Home / Players / <tab>) + share button (copies current URL with all filters encoded).

## 2. Filter system (the biggest upgrade)

Replace the 3 selects + position row with a single sticky **FilterBar** card. All filter state is URL-synced via TanStack `validateSearch` so any view is shareable/bookmarkable.

Filters:
- **Search** (debounced, fuzzy by name; matches diacritics — "mbappe" finds "Mbappé").
- **Tournament year**: multi-select chip strip (All / 2026 / 2022 / 2018 / … / 1930). Tap to toggle multiple.
- **Country**: command-palette style combobox (shadcn `Command`) with flag + name; supports multi-select; "Top 10 only" quick toggle.
- **Confederation**: UEFA / CONMEBOL / CONCACAF / CAF / AFC / OFC pills (derived from a small `confederation.ts` lookup).
- **Position**: GK / DEF / MID / FWD pills (existing, restyled).
- **Era**: Pre-WWII / Classic (50s–70s) / Modern (80s–2000s) / Current (2010+) — quick presets that set year multi-select.
- **Goal type** (only affects scorers tab): Open play / Penalty / Own goal toggle group.
- **Stage** (when data is available from `wc_goals.json` if a `stage` field exists, otherwise hidden): Group / R16 / QF / SF / Final.
- **Min goals / Min matches**: slider (1–15) to prune the leaderboard.
- **Sort**: Goals, Goals per tournament, Tournaments played, Name A–Z, Most recent.
- Active filter chips row underneath, each removable (`×`), plus "Reset all" link.
- Filter count badge on a mobile "Filters" button that opens a `Sheet` from the bottom — mobile users don't see the desktop bar by default.

## 3. Tabs / content sections

### 3a. Overview
- KPI cards (animated counters) — Top scorer of all time, Most decorated nation, Most cards, Live 2026 leader.
- "Goal trend" sparkline by tournament (uses existing `recharts`-style component or a simple SVG).
- Top 5 scorers mini-card, Top 5 nations mini-card — each click jumps to its own tab with filters applied.

### 3b. Top Scorers (current section, upgraded)
- Same table but with: rank delta arrow (vs all-time), goals/tournament column, penalty %, flag, position badge, "2026 LIVE" pill on players with current-tournament goals.
- Row click → player profile drawer (see §4).
- Virtualized list when >100 rows (basic windowing) for mobile smoothness.
- Toggle "Show per-tournament breakdown" expands a small bar chart inline.

### 3c. Discipline
- Existing yellow/red tables, plus a third table "Cards per match" rate.
- Filter chips inherit from FilterBar.

### 3d. Countries
- Existing country grid, plus: search-within-grid, sort dropdown (Tournaments / Goals / Players / Win rate if available), and a "Compare countries" button that opens a side-by-side view.

### 3e. Rankings (existing live FIFA section, restyled)
- Two columns become tabs on mobile.
- Add "Movement" arrows (up/down vs previous ranking snapshot if cached; otherwise hidden).

### 3f. Compare (new)
- Pick up to 4 players via combobox. Shows side-by-side stat cards: goals, tournaments, penalty %, cards, years active, mini sparkline per tournament. Mobile = vertical stack.

### 3g. Records (new)
- Curated "World Cup records" panel: most goals in single tournament, fastest goal, oldest/youngest scorer, hat-tricks, etc. Some derived from `wc_goals.json` aggregations, some from a small static `records.ts`.

## 4. Player profile drawer

Replace current modal with a shadcn `Sheet` (right-side on desktop, bottom on mobile):
- Header: flag, name, country, position, years active.
- Stats grid: total goals, penalties, OGs against (if tracked), tournaments, avg goals/tournament.
- Per-tournament timeline (year cards with goals + cards).
- "Goals scored against" mini list.
- Live 2026 section if player has current goals.
- Share button copies a deep link `/players?player=<id>`.

## 5. Mobile-first details

- Filter bar collapses into a bottom `Sheet` with sectioned content; main page shows just a "Filters (3)" button + active chips.
- Tables convert to stacked cards under `sm` breakpoint (rank + name + flag + big goals number on the right).
- Sticky sub-nav uses `overflow-x-auto snap-x` with safe-area padding.
- Tap targets ≥ 44px; large numbers use `tabular-nums`.
- All sections use the existing semantic tokens — no hardcoded colors. Keep the gold accent.

## 6. URL state & shareability

`validateSearch` with `zodValidator` + `fallback`:
```
tab, q, years[], countries[], confeds[], pos, era, goalType, stage, minGoals, sort, player
```
Search middlewares: `stripSearchParams(defaults)` so clean URLs don't carry default values; `retainSearchParams(["tab"])` across nav.

## 7. Performance & polish

- Move heavy aggregations (top scorers, country stats) into `useMemo` keyed on filter signature — already done; extend for new filters.
- Lazy-load Compare and Records tabs with `React.lazy` to keep initial bundle small.
- Animated counters via small CSS/transform; respect `prefers-reduced-motion`.
- Skeletons for the live 2026 scorers + live rankings queries.
- SEO: dynamic `head()` per tab — title/description reflect active tab.

## 8. File plan

**New:**
- `src/components/players/FilterBar.tsx` — desktop filter bar.
- `src/components/players/FilterSheet.tsx` — mobile bottom sheet wrapper around `FilterBar`.
- `src/components/players/PlayerSubNav.tsx` — sticky tabs.
- `src/components/players/PlayerProfileSheet.tsx` — profile drawer.
- `src/components/players/CompareView.tsx`
- `src/components/players/RecordsPanel.tsx`
- `src/components/players/OverviewKpis.tsx`
- `src/components/players/ScorerCardMobile.tsx`
- `src/lib/players-filters.ts` — types, defaults, URL schema, normalizer, fuzzy matcher.
- `src/lib/confederations.ts` — country → confederation lookup.
- `src/data/wc_records.json` — curated records.

**Modified:**
- `src/routes/players.tsx` — slim to layout + tab routing + data wiring; move sections into components.

## 9. Out of scope (this pass)

- Player photos / external player API enrichment.
- Historical "minute of goal" data (not in JSON today).
- Authenticated favorites / following players.
- Server-side pagination (dataset is small enough for client memo).

## 10. Open question

Single big PR, or split into two passes (Pass A: FilterBar + sub-nav + URL state + mobile cards; Pass B: Compare, Records, Profile drawer)? I'd recommend **one PR** since the parts share the new filter state shape.
