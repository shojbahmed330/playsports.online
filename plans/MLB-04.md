# MLB-04 — MLB hub

**Purpose:** today's MLB games, division leaders, league leaders and headlines.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | High | States | Scoreboard failure falls through to “no games”; standings/leaders/news failures leave blank sections. |
| 2 | Low | A11y | Section links under 44 px; icons/pulse dot announced; hardcoded white/gray text. |
| 3 | Low | SEO | Layout had no canonical/OG URL/site name/Twitter meta. |

## Fix

1. Scoreboard error state with retry; shared empty state.
2. 44 px links/focus rings, hidden icons, token text; layout meta completed.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
