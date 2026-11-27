# NEWS-01 — news article

**Purpose:** full match recap with key moments, generated prose, match link and related recaps.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | No route error boundary; not-found uses a bespoke block instead of the shared state. | `news.$slug.tsx` |
| 2 | Medium | Data | Reading time is hard-coded to “4 min read”. | header |
| 3 | Low | A11y | Icons are announced; match/back/related links are under 44 px without focus rings; hero image has no alternative text. | page |
| 4 | Low | SEO | No OG site name. | head |
| 5 | Low | Tokens | `bg-white/5` badge rather than a token. | header |

## Fix

1. Shared error/not-found states.
2. Compute reading time from the article body.
3. Hide decorative icons, 44 px links, focus rings, headline alt text.
4. Add OG site name.
5. Use `bg-muted`.

## Phase checklist

- [x] Phase 1: shared error/not-found states.
- [x] Phase 2: layout kept.
- [x] Phase 3: `bg-white/5` badge replaced with `bg-muted`.
- [x] Phase 4: not-found action.
- [x] Phase 5: hidden icons; 44 px links; focus rings; headline alt text.
- [x] Phase 6: computed reading time; OG site name.
- [x] Phase 7: no dead code.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR bad slug 404.
