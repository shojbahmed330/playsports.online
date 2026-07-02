# Migrating to Your Own Supabase (`vagqeperdsumxwukwbes`)

The project is configured for your own Supabase project (`vagqeperdsumxwukwbes`)
when deployed outside Lovable. Follow these steps once so Vercel and local
development use the same database.

## 1. Install the schema in your Supabase

Open **Supabase Dashboard → SQL Editor → New query**, paste the contents of
`supabase/exports/full_setup.sql`, and click **Run**.

This creates all app tables, including `wc_tournaments`, `wc_matches`, and
`wc_groups`, plus the `app_role` enum, helper functions (`has_role`,
`handle_new_user_role`, `touch_updated_at`), auth trigger, RLS, policies,
indexes, foreign keys, and GRANTs.

## 2. Grant yourself admin

The signup trigger auto-promotes `rajshahi.jibon@gmail.com` to admin. If you
sign up with a different email, run once in SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;
```

## 3. Regenerate TypeScript types from YOUR project

Regenerate from your own Supabase whenever schema changes:

```bash
npx supabase login
npx supabase gen types typescript --project-id vagqeperdsumxwukwbes \
  > src/integrations/supabase/types.ts
```

## 4. Set env vars

### Local (`.env`)
Lovable may overwrite its preview `.env`, so do not treat that file as the
source of truth. For local/Vercel development, copy `.env.example` into your
own environment and fill `SUPABASE_SERVICE_ROLE_KEY` manually.

### Vercel
Paste every variable from `.env.example` into **Vercel → Project → Settings →
Environment Variables** (Production + Preview + Development).

`SUPABASE_SERVICE_ROLE_KEY` MUST be pasted manually — it is never checked in.

## 5. Enable auth providers you use

In Supabase Dashboard → **Authentication → Providers**:
- Email/password: enable, disable "Confirm email" only if you want instant
  signup.
- Google: enable and add OAuth credentials.

Update **Authentication → URL Configuration → Site URL** and **Redirect URLs**
to include your Vercel production and preview domains.

## 6. Deploy

```bash
git push       # Vercel auto-builds
```

Or run locally with `bun dev` — the app now talks to your own Supabase end
to end.
