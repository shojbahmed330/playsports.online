# Migrating to Your Own Supabase (`vagqeperdsumxwukwbes`)

The project now reads Supabase URL/key from `VITE_SUPABASE_*` env vars — no
hardcoded Lovable Cloud references remain in application code. Follow these
steps once to have your own Supabase serve everything.

## 1. Install the schema in your Supabase

Open **Supabase Dashboard → SQL Editor → New query**, paste the contents of
`supabase/exports/full_setup.sql`, and click **Run**.

This creates: `affiliate_links`, `contact_messages`, `digest_runs`,
`memberships`, `newsletter_subscribers`, `site_settings`, `sponsored_slots`,
`user_roles`, the `app_role` enum, helper functions (`has_role`,
`handle_new_user_role`, `touch_updated_at`), RLS, policies, and GRANTs.

Your existing `wc_*` tables (World Cup archive) already live in this project
and stay untouched.

## 2. Grant yourself admin

The signup trigger auto-promotes `rajshahi.jibon@gmail.com` to admin. If you
sign up with a different email, run once in SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your@email.com'
ON CONFLICT DO NOTHING;
```

## 3. Regenerate TypeScript types from YOUR project

The auto-generated `src/integrations/supabase/types.ts` currently reflects
the old Lovable Cloud schema. Regenerate from your Supabase so `wc_*` tables
become natively typed and you can delete `src/lib/supabase.ts`'s bridging:

```bash
npx supabase login
npx supabase gen types typescript --project-id vagqeperdsumxwukwbes \
  > src/integrations/supabase/types.ts
```

## 4. Set env vars

### Local (`.env`)
Already updated to point to `vagqeperdsumxwukwbes`. Fill in
`SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Project Settings → API.

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
