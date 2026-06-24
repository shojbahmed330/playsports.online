# /football Batch B — Filters, Year Strip 2.0, Deep Links, Polish

Ships Phases 5–8 from `.lovable/plan.md`. Builds on Batch A (hero, ticker, sticky sub-nav, scorers panel) without changing any of it.

## Phase 5 — Filters & Search (2026)
- New `src/lib/football-filters.ts`: URL-synced state (`?team=ARG&filter=live|today|all|my`) using TanStack search params + Zod with `fallback()`.
- New `src/components/football/FootballFilterBar.tsx`: chip row `All | Live | Today | My Teams` + team autocomplete (fuzzy over fixture teams).
- "My Teams" persisted to `localStorage` (`fb:my-teams`); star toggle on each match card via a small `StarTeamButton`.
- Wire filter into `Wc2026GroupsView` and `Wc2026KnockoutView` (filter visible matches; empty state if no matches).

## Phase 6 — Year Strip 2.0 + Historical Polish
- Extend `src/data/wc_records.json` lookup (or add `src/data/wc_champions.ts`) with `{year, championCode, hostCode, finalScore}` for 1930–2022.
- New `src/components/wc/YearTile.tsx`: champion flag emoji + trophy badge + hover preview tooltip ("🇦🇷 ARG 3–3 FRA · pen 4–2").
- Update `YearStrip.tsx` to render `YearTile` (preserves snap-scroll + sizes).
- Historical knockout on mobile: reuse `MobileBracket` for non-2026 years.
- Per-year SEO: `head()` returns dynamic title/description using champion + host (`2018 World Cup — France crowned in Russia`).

## Phase 7 — Match Modal + Share Links
- Route `src/routes/football.match.$id.tsx` already exists — wire it: opening a match pushes `/football/match/:id`; closing pops back.
- Use `useNavigate` with `from: "/football"` and preserve `?team/filter` search params.
- Add `ShareButton` (Web Share API + clipboard fallback) inside `MatchModal`.
- Highlight thumbnail: if a YouTube URL exists, render `img.youtube.com/vi/<id>/hqdefault.jpg` with a play-glow ring before the iframe loads.

## Phase 8 — Polish, Footer, Ads
- New `src/components/football/FootballSkeleton.tsx`: pitch-stripe shimmer (alternating green bands) for groups + bracket loading states.
- Animated empty state: bouncing-ball SVG + CTA "Browse 1930–2022" linking to year strip.
- Mount `SiteFooter` (already used on home) at the bottom of `/football`.
- Second `AdSlot` placement between scorers panel and footer (id `football-mid`).
- Micro-interactions: gradient border on live cards, hover lift on tiles — Tailwind utilities only, no new keyframes.

## Files touched / created
**New:** `src/lib/football-filters.ts`, `src/components/football/FootballFilterBar.tsx`, `src/components/football/StarTeamButton.tsx`, `src/components/football/FootballSkeleton.tsx`, `src/components/football/ShareButton.tsx`, `src/components/wc/YearTile.tsx`, `src/data/wc_champions.ts`.
**Edited:** `src/routes/football.tsx` (search schema, filter wiring, footer, ad, dynamic head, deep-link nav), `src/components/wc/Wc2026View.tsx` (filter + star + skeleton), `src/components/wc/YearStrip.tsx` (use YearTile), `src/components/wc/MatchModal.tsx` (share button, thumb), `src/routes/football.match.$id.tsx` (sync with parent route).

## Out of scope
- No backend/schema changes.
- No changes to Batch A components.
- No new third-party packages.

Reply **"Approved"** to ship Batch B end-to-end.
