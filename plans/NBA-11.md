# NBA-11 — NBA standings

**Purpose:** East/West conference standings and division breakdowns.

## Findings

- Query/loader failures had no shared retry or empty state.
- Links/controls under 44 px; several buttons lacked type/pressed states; decorative icons announced.
- Some surfaces used hardcoded white/gray instead of tokens; missing entities were indexable.

## Fix

- error/empty states with retry, announced loading.
- Route error boundary where the page loads data.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (typecheck 0, tests pass, build pass, SSR checked).
