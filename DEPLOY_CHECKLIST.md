# Deploy checklist — playsports.online

**Date:** 2026-11-28
**Branch:** `professional-overhaul`
**Target:** Vercel project serving https://www.playsports.online

---

## 1. Verified current state

| Check | Result |
|---|---|
| Live host | `Server: Vercel`, `X-Vercel-Id` present |
| `npx vercel whoami` | **Logged out** |
| `VERCEL_TOKEN` | not set |
| `.vercel/project.json` | **missing** (project not linked) |
| `git remote` | `https://github.com/shojbahmed330/playsports.online.git` |
| `git push --dry-run` | **403** — authenticated as `shojibahmed24`, repo owned by `shojbahmed330` |
| `bun run typecheck` | 0 errors |
| `bun run test` | 31/31 passing |
| `bun run build` | pass; `[pwa] copied 2 file(s)` |
| Build output | `.output/public/sw.js` (1653 B), `manifest.webmanifest`, icons present |

**Conclusion:** the code is deployable; only credentials/ownership block it. No deploy was attempted.

---

## 2. Choose ONE unblock path

### A. Vercel login (recommended)

Run in `C:\dev\playsports.online`:

```powershell
npx vercel login
```

Approve in the browser, then tell me. I will run:

```powershell
npx vercel link        # select the existing playsports.online project
npx vercel deploy --prod
```

### B. One-time token

Create a Vercel token scoped to this project, then either export it in your shell or send it for one use.
It will be used for this deploy only and never written to a file.

```powershell
$env:VERCEL_TOKEN = "<token>"
npx vercel link --yes
npx vercel deploy --prod
```

### C. Git integration

Repo owner adds `shojibahmed24` as a collaborator on
`shojbahmed330/playsports.online`, then I push `professional-overhaul` and Vercel builds a preview
(production only if the branch is connected to Production).

---

## 3. Vercel project environment variables (names only — never commit values)

The live site already works, so these should exist on the project. Confirm in
**Project → Settings → Environment Variables**:

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | build | client Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build | client anon key (public by design) |
| `VITE_SUPABASE_PROJECT_ID` | build | project ref |
| `SUPABASE_URL` | server | SSR data reads |
| `SUPABASE_PUBLISHABLE_KEY` | server | SSR anon reads |
| `SUPABASE_PROJECT_ID` | server | project ref |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | privileged server fns — never exposed |
| `RAPIDAPI_KEY` | server only | live scores provider |
| `WEBHOOK_SECRET` | server only | subscribe/webhook verification |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | server only | analytics/admin integration |
| `INDEXNOW_KEY` | server only | serves `/<key>.txt` verification |
| `INDEXNOW_PING_SECRET` | server only | manual IndexNow ping endpoint |

`vercel.json` already sets: build `DEPLOY_TARGET=vercel bun run build`, output `.vercel/output`,
install `bun install`, and security headers for `/sw.js` and `/*`.

---

## 4. Deploy command (after A or B)

```powershell
npx vercel deploy --prod
```

Expected: a production URL, then promotion to `www.playsports.online`.

---

## 5. Post-deploy verification (must pass before calling it done)

| URL | Expect |
|---|---|
| `/sw.js` | 200, `JavaScript`, `Cache-Control: public, max-age=0, must-revalidate`, `Service-Worker-Allowed: /` |
| `/manifest.webmanifest` | 200, contains `"id": "/"` and `"shortcuts"` |
| `/robots.txt` | 200, sitemap reference present |
| `/sitemap.xml` | 200, XML |
| `/` | 200, one `aria-label="Switch sport"` header |
| `/search` | 200, one header, popular-search chips |
| `/guides` | 200, one header + one breadcrumb |
| `/players` | 200 |
| `/no-such-page` | **404**, branded page with "Search the site" |
| `/cricket` | 200, live data loads |
| `/mlb` `/nba` `/nhl` `/mls` | 200 |
| Response headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` |

Also check: service worker registers in a normal browser window (not dev, not iframe),
and DevTools → Application → Manifest shows the 4 shortcuts.

---

## 6. Rollback

Vercel keeps every deployment. If the new build regresses:
**Project → Deployments → previous deployment → Promote to Production**.

No database, migration, or secret changes are part of this deploy.

---

## 7. Security rules

- A token or password is used for this deploy only, never stored in the repo, notes, or chat history.
- `SUPABASE_SERVICE_ROLE_KEY`, `RAPIDAPI_KEY`, `WEBHOOK_SECRET`, `GOOGLE_SERVICE_ACCOUNT_JSON`,
  `INDEXNOW_KEY` and `INDEXNOW_PING_SECRET` must stay server-side.
- `VITE_*` values are public by design; do not put a service-role key behind a `VITE_` prefix.
