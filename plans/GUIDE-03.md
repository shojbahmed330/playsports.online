# GUIDE-03 — Highlight video

**Purpose:** Highlight video screen.

## Findings

- Loader/query failures had no shared retry or empty state; some missing entities were indexable.
- Breadcrumb separators were announced; links/controls were under 44 px; decorative icons were announced.
- Raw ISO dates or hardcoded white/gray surfaces appeared on detail pages.

## Fix

- Shared error/empty/not-found states and route error boundaries.
- Labelled breadcrumbs, hidden separators, 44 px links/controls, focus rings, hidden icons.
- UTC date formatting, 
oindex for missing entities, OG site name/Twitter meta, token surfaces.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (typecheck 0, tests pass, build pass, SSR checked).
