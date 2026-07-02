# Deploying to Vercel

This project is built with **TanStack Start** and is configured for **Vercel**
with your own Supabase project.

The switch is controlled by the `DEPLOY_TARGET=vercel` env var, which
`vercel.json` sets automatically for you.

---

## 1) Push the repo to GitHub / GitLab / Bitbucket

Standard git push. No special branch setup.

## 2) Import into Vercel

- Vercel Dashboard → **Add New… → Project** → import your repo.
- Framework Preset: **Other** (Vercel will read `vercel.json`).
- Build Command / Output Directory: leave as-is — `vercel.json` overrides them.
- Install Command: `bun install`.

## 3) Add Environment Variables

Vercel Dashboard → **Project → Settings → Environment Variables**.
Add every variable from `.env.example`, and tick **Production, Preview,
Development** for each one.

### Required — client (exposed to browser)
| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ref |

### Required — server (SSR + server functions)
| Name | Value |
|---|---|
| `SUPABASE_URL` | same as `VITE_SUPABASE_URL` |
| `SUPABASE_PUBLISHABLE_KEY` | same as `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `SUPABASE_PROJECT_ID` | same as `VITE_SUPABASE_PROJECT_ID` |
| `SUPABASE_SERVICE_ROLE_KEY` | **From Supabase Dashboard → Settings → API → service_role** |

### Optional — third-party integrations
| Name | Used by | Where to get it |
|---|---|---|
| `RAPIDAPI_KEY` | Sports data fetchers (`src/lib/*.functions.ts`) | rapidapi.com dashboard |
| `WEBHOOK_SECRET` | If you secure `/api/public/hooks/*` | any random 32+ char string |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is **server-only**. Never prefix it with
> `VITE_` and never log it. It bypasses Row Level Security.

## 4) Deploy

Click **Deploy**. Vercel will run:

```
bun install
DEPLOY_TARGET=vercel vite build
```

Nitro emits a `.vercel/output` folder that Vercel serves natively — SSR,
server functions (`createServerFn`), and server routes (`src/routes/api/*`)
all work as regular Vercel serverless functions.

## 5) Post-deploy checklist

- [ ] Homepage loads at `your-project.vercel.app`
- [ ] `/auth` login works (Google + email/password)
- [ ] A server function-backed page loads (e.g. `/football`, `/cricket`)
- [ ] Newsletter subscribe form works (`/`)
- [ ] Update Supabase **Auth → URL Configuration → Redirect URLs** to include
      `https://your-project.vercel.app/**`

---

## Local development against Vercel target

```bash
DEPLOY_TARGET=vercel bun run build
```

Regular `bun run dev` still uses the Cloudflare-flavoured dev server — that's
fine, TanStack Start's dev runtime is the same on both targets.

## Known limitations

- **OAuth providers** must be enabled in your Supabase dashboard, and
  `https://your-project.vercel.app/auth/callback` must be in the allowed
  redirect URLs.
- **Auto-generated Supabase integration files** read env vars, so they work on
  Vercel as long as the vars above are set.
- **Cron / scheduled jobs**: use **Vercel Cron** (add a `crons` block in
  `vercel.json`) or an external scheduler that POSTs to
  `https://your-project.vercel.app/api/public/hooks/weekly-digest`.
