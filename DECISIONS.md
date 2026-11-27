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
