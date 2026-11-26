# Project Notes — playsports.online

## Stack (auto-detected)

| Area | Choice |
|---|---|
| Language | TypeScript 5.8, React 19.2 |
| Framework | TanStack Start 1.168.60 (SSR) + TanStack Router 1.170.41 (file-based routes) |
| Build | Vite 8 + Nitro 3 (Vercel preset via `DEPLOY_TARGET=vercel`) |
| Styling | Tailwind CSS 4, CSS tokens in `src/styles.css`, Radix primitives, lucide icons |
| State/data | TanStack React Query 5.108 + server functions (`createServerFn`) |
| Backend | Supabase (cache tables, auth, service-role in server only); public sports data from ESPN free APIs |
| PWA | `vite-plugin-pwa` (generateSW, `/sw.js`) |
| Tests | Vitest 5 (`tests/*.test.ts`) |
| Package manager | Bun 1.4.5 (`bun.lock`) |
| Deployment | Vercel (`.vercel/output`), Cloudflare preset available |
| Fonts | Inter + Sora via Fontsource |

## Commands

| Command | Purpose |
|---|---|
| `bun install` | install dependencies |
| `bun run dev` | local dev server (Vite) |
| `bun run build` | production build |
| `bun run test` | Vitest suite |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | ESLint (currently fails on repo-wide CRLF/prettier noise) |
| `bun run audit:sitemap` | live sitemap/canonical audit |
| `bun run audit:static` | static-route audit |

## Architecture

- `src/routes/*.tsx` — 165 route files (150 page screens + layouts + API/verification). File names map to URLs; `$param` segments are dynamic, `.index` is a parent index, `_` escapes a parent layout.
- `src/components/` — feature components grouped by sport (`cricket/`, `football/`, `wc/`, `nba/`, etc.), shared UI (`ui/`), navigation (`nav/`), SEO (`seo/`).
- `src/lib/*.functions.ts` — TanStack server functions; `*.server.ts` — server-only readers/utilites.
- `src/data/` — local registries (competitions, World Cup history, cricket catalogue, records).
- `src/integrations/supabase/` — browser client, server admin client, auth middleware/attacher.
- `src/styles.css` + `src/styles/*.css` — global tokens and per-sport accent tokens; dark "stadium night" theme.
- Public data: ESPN scoreboard/standings/teams/players/news/summary endpoints; Supabase cache with TTLs; cricket catalogue generated locally.
- SEO: per-route `head()` with title/description/canonical/OG, JSON-LD helpers in `src/lib/seo/jsonld.ts`, sitemap index/parts in `src/routes/sitemap[.]xml.ts`, robots in `public/robots.txt`.
- Auth: Supabase email/password on `/auth`, session attached via `attachSupabaseAuth`; admin gated by `has_role` RPC.
- Global shell: `src/routes/__root.tsx` → `SiteHeader`/`SportNav`, `MobileTabBar`, `SiteFooter`, skip link, toasts.

## Known constraints

- No paid services or new third-party accounts.
- Do not change public route URLs, DB schema, API contracts or analytics names without a `DECISIONS.md` BREAKING-RISK entry.
- The repo has a large pre-existing typecheck error set and a repo-wide CRLF/prettier lint failure; the overhaul fixes touched files and records the rest.
