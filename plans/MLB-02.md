# MLB-02 — MLB game centre

**Purpose:** live/final MLB game with linescore, boxscore, plays, win probability and info.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | High | States | Missing/errored games used bespoke empty text; no route error boundary; no noindex for missing games. |
| 2 | Medium | A11y | Back link and tabs under 44 px; tabs lacked `type`/`aria-pressed`; pulse dot announced. |
| 3 | Low | Tokens | Hardcoded white/gray surfaces in probable/leader cards. |

## Fix

1. Shared error/empty states, retry, noindex, route boundary.
2. 44 px controls, `aria-pressed`, hidden icons/pulse.
3. Token surfaces.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
