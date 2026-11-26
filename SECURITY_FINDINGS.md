# Security Findings

| ID | Severity | Area | Finding | Status |
|---|---|---|---|---|
| SEC-01 | Critical | Dependencies | `seroval` deserialization advisories reachable through TanStack SSR. | **Fixed for the critical ranges** via `bun audit fix` (seroval 1.8.2); a moderate transitive advisory remains in TanStack's pinned range. |
| SEC-02 | Critical | Dependencies | `shell-quote` command injection advisory. | **Fixed** via `bun audit fix`. |
| SEC-03 | High | Dependencies | Zod `<4.6.6` memory exhaustion when validating oversized constrained collections. | Direct Zod now 4.6.7; transitive Zod 3.25 in `@tanstack/router-generator` remains (build-time, not request input). |
| SEC-04 | High | Build tooling | Vite/launch-editor advisories (dev-server scope). | **Fixed** within semver via `bun audit fix`; 6 moderate/low remain. |
| SEC-05 | Medium | Secrets | No hardcoded Supabase service-role or OpenRouter key found in tracked source; anon key is public by design. Re-check every screen touched. | Monitoring |
| SEC-06 | Medium | HTML injection | AI recap Markdown is rendered with `dangerouslySetInnerHTML` after escaping in `markdown-lite.ts`; keep escaping tests. | Mitigated, test exists |
| SEC-07 | Low | Headers | CSP not set; only framework defaults. | Partially mitigated: added nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy and SW headers in `vercel.json`. CSP still pending. |

Rules: never print secret values; move hardcoded secrets to env references and log here.
