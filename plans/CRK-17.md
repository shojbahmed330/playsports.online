# CRK-17 — Cricket record category

**Purpose:** show one all-time record leaderboard with FAQs and links to the players and other records.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | SEO / links | Player URLs in the ItemList schema and row links use a naive lowercase/hyphen slug; names with apostrophes/accents can 404. | `cricket.records.$category.tsx` |
| 2 | Medium | States | Error/not-found are bare sentences. | route |
| 3 | Medium | SEO | No OG image/Twitter card. | head |
| 4 | Medium | A11y | Related-record chips are ~34 px; row links lack clear focus styling. | body |
| 5 | Low | Data trust | No snapshot date. | header |
| 6 | Low | States | Empty rows render an empty list. | body |

## Keep

- SSR loader, 404 for unknown category.
- ItemList + BreadcrumbList + FAQPage JSON-LD.
- Ranked list, FAQs, other-record links.

## Fix

1. Use `slugify`; link only when a profile exists, otherwise plain text.
2. Branded ErrorState/EmptyState.
3. OG image + Twitter tags.
4. 44 px related chips.
5. Snapshot date + empty leaderboard state.

## Test plan

- Typecheck, tests, build.
- SSR category 200 with all rows and FAQ.
- ItemList player paths resolve (or are omitted for unknown profiles).
- Unknown category shows branded not-found.
- No console errors (browser tool unavailable; SSR checked).

## Phase checklist

- [x] Phase 1: `slugify` + profile-exists check; search fallback for unknown players; branded states.
- [x] Phase 2: list layout preserved with wrapping.
- [x] Phase 3: token labels.
- [x] Phase 4: empty leaderboard + error/not-found states.
- [x] Phase 5: 44 px related chips and player links.
- [x] Phase 6: OG/Twitter tags + snapshot date; ItemList paths now valid.
- [x] Phase 7: removed naive slug code.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR category 200 with snapshot/OG and player links.
