# UTIL-03 — cookies

**Purpose:** cookie policy with a consent-preferences trigger.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Shared legal layout had no empty state and an unlabelled loader. |
| 2 | Low | A11y | Consent button under 44 px, hardcoded emerald, no focus ring; breadcrumb slash/pulse issues. |

## Fix

1. Shared empty/loading states in `LegalLayout`.
2. Primary-token 44 px consent button; breadcrumb/dot fixes.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
