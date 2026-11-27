# MLB-08 — MLB players/leaders

**Purpose:** league leaderboards, category filters and player search.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | High | States | Leader/search failures fell through to empty text; no retry. |
| 2 | Medium | A11y | Search/filter/season controls under 44 px and unlabelled; toggles lacked `type`/`aria-pressed`; emoji announced. |
| 3 | Low | Tokens | Hardcoded white/gray surfaces. |

## Fix

1. Shared error/empty states with retry for leaders and search.
2. Labels, 44 px controls, pressed states, hidden emoji, focus rings.
3. Token surfaces.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
