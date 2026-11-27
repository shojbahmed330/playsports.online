# MLB-14 — legacy MLB team id

**Purpose:** map legacy ESPN ids to canonical team slugs; unknown ids fall back to the shared team view.

## Findings

| # | Severity | Category | Finding |
|---|---|---|---|
| 1 | Low | SEO | Unknown-id fallback is intentionally `noindex` and title says “Redirecting”. |
| 2 | Low | States | Known ids redirect; fallback delegates loading/error states to `MlbTeamView`. |

## Fix

No code change required: verified 307 for a known id and shared team view for unknown ids.

## Phases

- [x] 1 states (delegated) · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error (delegated) · [x] 5 a11y (delegated) · [x] 6 SEO (noindex) · [x] 7 cleanup · [x] 8 verify (SSR 307/200).
