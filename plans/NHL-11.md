# NHL-11 — NHL standings

**Purpose:** NHL standings screen for the NHL module.

## Findings

- Query/loader failures had no shared retry or empty state.
- Links/controls under 44 px; several buttons lacked type/pressed states; decorative icons announced.
- Some surfaces used hardcoded white/gray instead of tokens; missing entities were indexable.

## Fix

- Shared error/empty/not-found states, 44 px links/controls/focus rings, ria-pressed toggles, hidden icons.
- 
oindex for missing entities; OG site name/Twitter meta; token surfaces; route error boundary where data loads.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (typecheck 0, tests pass, build pass, SSR checked).
