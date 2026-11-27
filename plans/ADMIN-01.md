# ADMIN-01 — admin console

**Purpose:** role-gated control room for overview, SEO, monetisation, audience, content seeding, settings and the match video library.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | High | States | Match query failure has no retry; empty/loading states are ad-hoc; no route error boundary. | `admin.tsx` |
| 2 | Medium | A11y | Icon-only controls are 36 px; several buttons lack `type`/focus rings; search/select inputs are unlabelled; filter has no pressed state. | page |
| 3 | Medium | Tokens | Remaining `gray-*` controls in the header, sign-in gate and video rows. | page |
| 4 | Low | A11y | Loading spinners and decorative icons are announced; flag emoji in match rows are announced. | page |
| 5 | Low | SEO | No OG site name (page is noindex). | head |

## Fix

1. Route error boundary, query retry, shared loading/empty/error states.
2. 44 px buttons/icon buttons, `type`, focus rings, labels and `aria-pressed`.
3. Replace remaining `gray-*` with tokens.
4. Hide decorative icons/flags, announce loading.
5. Add OG site name.

## Phase checklist

- [x] Phase 1: route error boundary and announced auth check.
- [x] Phase 2: layout kept.
- [x] Phase 3: remaining `gray-*` controls replaced with tokens.
- [x] Phase 4: query retry, shared loading/empty/error states.
- [x] Phase 5: labels, `aria-pressed`, 44 px controls, focus rings, hidden icons/flags.
- [x] Phase 6: OG site name; noindex retained.
- [x] Phase 7: match-row inputs labelled; no dead code.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR /admin 200.
