# Decisions

One line each. BREAKING-RISK entries need review before merge.

| # | Decision | Reason | Risk |
|---|---|---|---|
| 1 | Work only on `professional-overhaul`; no remote push or deploy. | Mission safety rules override the earlier push workflow. | none |
| 2 | Keep the existing TanStack Start + Vite + Supabase + Tailwind stack. | Extending is lower risk than a rebuild and preserves SEO. | none |
| 3 | Count 150 route-level screens; overlays are separate global items. | One dynamic route template shares layout/behaviour across instances. | none |
| 4 | Accept existing CRLF via Prettier `endOfLine: "auto"` instead of a repo-wide whitespace rewrite. | Removes ~75k false lint errors without a 1,000-file diff; touched files are formatted normally. | none |
| 5 | Prefer `bun audit fix` within semver for vulnerabilities; no major upgrades without a dedicated check. | Mission forbids risky dependency changes; build must stay green. | none |
| 6 | Preserve existing route URLs and public API contracts. | SEO/sitemap stability; any change needs a BREAKING-RISK entry. | none |
| 7 | Dark theme only for now. | It is the existing design; tokens remain light-ready. | none |
| 8 | Replace TanStack's default search serialiser with plain scalar values, while still parsing JSON-quoted/array values. | Default produced `?leagueId=%228043%22`; plain URLs are shareable and match canonical. Old quoted URLs still parse. | Low: a schema expecting a number must use `z.coerce` (IPL year already does). |
| 9 | Render `SportNav` once from `src/routes/football.tsx` and remove per-page copies. | Every football child route was missing the header; one layout copy prevents duplicates and keeps navigation on programmatic pages. | Low: competition shell no longer renders its own header; URLs/contracts unchanged. |
| 10 | Keep a single `id="main-content"` on the root wrapper and remove page-level duplicates. | Duplicate IDs invalidate the skip link; root wrapper is always present. | Low: page-level `<main>` elements keep their semantics but no longer own the skip target. |
| 11 | Correct stale 2026 future-tense copy to past tense after the tournament window. | Today is Nov 2026; “will be played” was factually wrong. | None; venue/result facts unchanged. |
| 12 | Keep the fixtures page date-scan approach (up to 181 scoreboard requests for tournaments) for now; only fix error handling. | Changing the ESPN request strategy needs API verification and a dedicated perf pass; URLs/contracts must stay stable. | Medium: request volume/perf remains a known follow-up. |
| 13 | Mount `SportNav` once in `__root.tsx` for routes whose section layout does not already own it, and render the shared breadcrumb only when the route has no page-specific trail. | Closes the "page with no desktop nav" gap without double headers or duplicate breadcrumbs on section layouts. | Low: the exclusion list is path-based; a new section route must be added to the list or it will render two headers. |
| 14 | Fix the 404 catch-all inside the existing IndexNow route instead of adding a splat route. | `$key[.]txt.tsx` generates an invalid param name (`key.txt`), so it already matched every single-segment unknown URL and returned plain-text "Not Found". Adding `$.tsx` could never win the match (verified with `router.matchRoutes`: `/no-such-page` → `/$key.txt`). The route now returns the branded 404 for non-`.txt` requests. | Low: the handler is the de-facto catch-all for single-segment paths, so its 404 markup must stay healthy; multi-segment paths use the React 404. |
| 15 | Leave the `/tournaments/fifa-world-cup-2026/$stage` vs `/tournaments/$tournament/$leaderboard` collision in place. | Fixing it requires changing a public URL shape, which the mission forbids; no link, sitemap entry or keyword target points at 2026 leaderboard URLs. | Medium: direct visits to `/tournaments/fifa-world-cup-2026/top-scorers` (and yellow/red cards) return 404. Logged in BLOCKERS.md. |
