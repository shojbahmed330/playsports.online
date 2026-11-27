# GLB-09 — 404 / 500 error shell

**Files:** `src/routes/__root.tsx`, `src/routes/$key[.]txt.tsx`, `src/lib/error-page.ts`, `src/server.ts`

## Findings

- Unmatched URLs returned a **9-byte plain-text "Not Found"** with no branding. Root cause: the IndexNow key route `src/routes/$key[.]txt.tsx` generates an invalid param name (`key.txt`), so TanStack treats it as an unconstrained single-segment match. Every unknown single-segment path landed in its handler, which returned `new Response("Not Found", { status: 404 })`.
- The SSR 500 response had no cache or robots headers, so a transient error page could be cached or indexed.
- The static error page used a white card (`#fafafa`) while the app is dark, and its buttons were below 44 px.
- The React 404 had no search escape hatch and exposed the decorative "404" text to screen readers.

## Fix

- `$key[.]txt.tsx` now checks the request path: non-`.txt` requests return `renderNotFoundPage()` with `404`, `no-store` and `X-Robots-Tag: noindex, follow`. `.txt` requests keep the exact IndexNow key behaviour (key only when it matches `INDEXNOW_KEY`, otherwise 404).
- Added `renderNotFoundPage()` in `src/lib/error-page.ts`: dark branded shell, inline header nav, Go home + Search the site actions, 44 px links, `noindex, follow`.
- `renderErrorPage()` reuses the same dark base CSS; both 500 paths in `src/server.ts` send `no-store` + `X-Robots-Tag: noindex`.
- React 404 (`__root.tsx`) now has a real `h1`, a decorative `aria-hidden` "404", a Search action and popular-section links, all 44 px with focus rings.
- Verified: unknown single-segment URL → branded static 404 (404 status); unknown multi-segment URL → full-chrome React 404 (404 status); `robots.txt`, `ads.txt`, `sitemap.xml`, manifest still 200.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify.

## Verification

- `bun run typecheck` → 0.
- `bun run test` → 27/27.
- `bun run build` → pass.
- SSR: `/no-such-page` 404 branded; `/foo/bar/baz` 404 with chrome; public text assets unaffected.
