# AUTH-01 — admin sign in

**Purpose:** password sign-in for archive administration.

## Findings

| # | Severity | Category | Finding | File |
|---|---|---|---|---|
| 1 | Medium | States | Session check shows the form before redirect; no inline error region (toast only). | `auth.tsx` |
| 2 | Medium | A11y | Decorative icons announced; back link/submit under 44 px without focus ring; busy state not announced. | page |
| 3 | Low | Tokens | One-off amber gradient and `rounded-lg` controls. | form |
| 4 | Low | SEO | No OG site name (page is noindex). | head |

## Fix

1. Session-check loading state and inline `role="alert"` error.
2. Hidden icons, 44 px controls, focus rings, announced busy label.
3. Primary token button and shared radius.
4. Add OG site name.

## Phase checklist

- [x] Phase 1: session-check state, inline error, busy state.
- [x] Phase 2: layout kept.
- [x] Phase 3: primary token button and shared radius.
- [x] Phase 4: error alert with `aria-describedby`; no-session redirect preserved.
- [x] Phase 5: hidden icons, 44 px controls, focus rings, announced busy label.
- [x] Phase 6: OG site name; noindex retained.
- [x] Phase 7: toast error replaced by inline error.
- [x] Phase 8: typecheck 0, tests 27/27, build pass; SSR /auth 200.
