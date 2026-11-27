# CRK-01 — cricket highlight detail

**Purpose:** one classic match page with embedded highlights, recap link, team links and related matches.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Error/not-found are bare text without navigation or retry. | `cricket.highlights.$slug.tsx` |
| 2 | Medium | Cleanup | `itemList` is imported only to be suppressed with `void itemList`. | imports |
| 3 | Low | Privacy | YouTube embed uses the tracking domain instead of `youtube-nocookie.com`. | embed |
| 4 | Low | A11y | Main lacks `main-content`; CTA/related links are under 44 px; focus rings missing; breadcrumb slashes are read. | layout |
| 5 | Low | Copy | Raw ISO dates are shown to users. | body |
| 6 | Low | SEO | No `og:site_name`/Twitter meta. | head |

## Keep

- SSR loader, not-found throw, video/FAQ/breadcrumb JSON-LD.
- YouTube embed or fallback, recap card, team profiles, related highlights.

## Fix

1. Shared error/not-found states with sport nav and retry.
2. Remove the unused import/suppression.
3. Privacy-enhanced embed domain.
4. `main-content` id, 44 px links, focus rings, hidden separators.
5. Human-readable dates.
6. Add OG site name + Twitter meta.

## Test plan

- Typecheck, tests, build.
- SSR highlight page 200 with title, embed and related links.
- Unknown slug returns the shared not-found state.
- Team links resolve.

## Phase checklist

- [x] Phase 1: shared retryable error and not-found states with sport nav.
- [x] Phase 2: layout kept.
- [x] Phase 3: existing tokens kept.
- [x] Phase 4: empty/error paths handled.
- [x] Phase 5: `main-content` id, 44 px links, focus rings, hidden breadcrumb separators.
- [x] Phase 6: OG site name/Twitter meta; privacy-enhanced YouTube embed; human-readable dates.
- [x] Phase 7: removed unused `itemList` + `void` suppression.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR highlight 200 with nocookie embed, unknown slug 404 with shared state.
