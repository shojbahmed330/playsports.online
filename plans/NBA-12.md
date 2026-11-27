# NBA-12 — NBA team history

**Purpose:** Franchise Finals championships and losses.

## Findings

- Query/loader failures had no shared retry or empty state.
- Links/controls under 44 px; several buttons lacked type/pressed states; decorative icons announced.
- Some surfaces used hardcoded white/gray instead of tokens; missing entities were indexable.

## Fix

- shared error/not-found/empty states, 44 px links/focus rings, token surfaces, OG/Twitter meta.
- Route error boundary where the page loads data.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (typecheck 0, tests pass, build pass, SSR checked).
