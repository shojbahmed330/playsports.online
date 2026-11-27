# UTIL-01 — about

**Purpose:** static/DB-backed about page using `LegalLayout`.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Medium | States | Shared legal layout renders nothing when no body exists; loading spinner unlabelled. |
| 2 | Low | A11y | Breadcrumb slash read out, Home link under 44 px, permanent pulse dot. |
| 3 | Low | SEO | Meta complete (no change). |

## Fix

1. Shared empty state for missing content; announced loading.
2. Labelled breadcrumb, hidden slash, 44 px Home link, static dot.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify (SSR 200).
