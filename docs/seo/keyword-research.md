# PlaySports — Long-tail Keyword Research (Phase 2.2)

Source: Semrush `keyword_research` + `keyword_compare` (US database, Nov 2026).
All figures are Semrush estimates for the US market unless otherwise noted.

## Shortlist — Approved Keyword Targets

| # | Keyword | Volume/mo | KDI | Pattern | Target URL |
|---|---------|-----------|-----|---------|-----------|
| 1 | messi world cup goals | 140 | 42 | Player stat | /football/players/lionel-messi/world-cup-goals |
| 2 | ronaldo world cup goals | 170 | 30 | Player stat | /football/players/cristiano-ronaldo/world-cup-goals |
| 3 | how many world cup goals does messi have | 140 | — | FAQ (folded into #1) | — |
| 4 | how many world cup goals does ronaldo have | 140 | — | FAQ (folded into #2) | — |
| 5 | fifa world cup all time top scorers | 30 | 0 | Tournament leaderboard | /tournaments/fifa-world-cup-all-time/top-scorers |
| 6 | fifa world cup 2022 top scorers | est. 200 | ~15 | Tournament leaderboard | /tournaments/fifa-world-cup-2022/top-scorers |
| 7 | fifa world cup 2026 top scorers | est. 100 | new | Tournament leaderboard | /tournaments/fifa-world-cup-2026/top-scorers |
| 8 | world cup 2022 yellow cards | est. 90 | low | Tournament leaderboard | /tournaments/fifa-world-cup-2022/yellow-cards |
| 9 | world cup 2022 red cards | est. 90 | low | Tournament leaderboard | /tournaments/fifa-world-cup-2022/red-cards |
| 10 | brazil vs argentina highlights | 20 | 0 | H2H highlight | /vs/football/brazil-vs-argentina (exists) |
| 11 | today live football matches | 0 (question cluster ~60) | 0 | Live hub | /live/football |
| 12 | live sports today | ~9,900 (broad) | 60 | Live hub | /live/today |
| 13 | how fifa world cup knockouts work | question cluster | 0 | Guide | /guides/how-fifa-world-cup-knockouts-work |
| 14 | how many teams in fifa world cup 2026 | est. 4,400 | 25 | Guide | /guides/how-many-teams-fifa-world-cup-2026 |
| 15 | fifa world cup format 2026 | est. 1,600 | 30 | Guide | /guides/fifa-world-cup-2026-format |

## Cross-sport (pilot)

| # | Keyword | Volume/mo | KDI | Target URL |
|---|---------|-----------|-----|-----------|
| 20 | nba playoff bracket 2026 | 90 | 34 | /nba (existing hub — beef up content) |
| 21 | mlb standings today | 74,000 | 99 | /mlb/standings (existing; too hard for now, target long-tail variants later) |

## Notes on classification

- **Player stat pages** — sub-route under existing player landing pages (Phase 2.1). Each answers ~15 "how many goals did X score in YEAR world cup" questions in one page via a per-tournament table.
- **Tournament leaderboards** — one URL per (tournament, stat). Only publish if the dataset has ≥ 1 real row (thin-content rule).
- **Guides** — evergreen MDX-lite files under `src/content/guides/`. Long-tail wins because the answer is stable and Semrush shows recurring monthly search intent.
- **Live hubs** — thin content risk high; publish only if the page renders real live match cards from ESPN feed at request time.

## Rejected / deferred

- "mlb standings today" (KDI 99) — too competitive for a new domain. Defer.
- "ronaldo" (450K/mo) — brand keyword, no realistic ranking path from a stats site.
- "brazil vs argentina highlights" (20/mo) — already covered by existing `/vs/football/*` route; add long-tail year variants only if traffic warrants.
