# NEWS-02 — news index

**Purpose:** list of generated match recaps with RSS entry point.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Loader failure has no route error boundary; empty state is an ad-hoc dashed box. | `news.index.tsx` |
| 2 | Low | A11y | Header/date/arrow icons are announced; RSS and empty-state links are under 44 px without focus rings; cards lack focus rings. | page |
| 3 | Low | SEO | No OG site name. | head |

## Fix

1. Shared error boundary and empty state with actions.
2. Hide decorative icons, 44 px controls, focus rings.
3. Add OG site name.

## Phase checklist

- [x] Phase 1: shared error boundary.
- [x] Phase 2: layout kept.
- [x] Phase 3: tokens kept.
- [x] Phase 4: shared empty state with actions.
- [x] Phase 5: decorative icons hidden; 44 px RSS/actions; focus rings on cards and links.
- [x] Phase 6: OG site name.
- [x] Phase 7: no dead code.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR /news 200 (empty), /news/rss.xml 200.
