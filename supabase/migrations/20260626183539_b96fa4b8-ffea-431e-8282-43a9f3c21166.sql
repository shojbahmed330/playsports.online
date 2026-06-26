
-- ============================================================
-- 1. Roles foundation
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own roles" ON public.user_roles;
CREATE POLICY "Users read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Auto-grant admin to the project owner on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'rajshahi.jibon@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Backfill in case the owner already signed up
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'rajshahi.jibon@gmail.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. site_settings (key/value JSON store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admins write site settings" ON public.site_settings;
CREATE POLICY "Admins write site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed defaults (idempotent)
INSERT INTO public.site_settings (key, value) VALUES
  ('adsense', '{"enabled":false,"client":"","slots":{},"auto_ads":false}'::jsonb),
  ('analytics', '{"enabled":false,"ga4_measurement_id":"","gtm_container_id":"","gsc_verification":""}'::jsonb),
  ('consent', '{"enabled":true,"banner_text":"We use cookies to keep AllSportsLive fast, measure traffic, and show relevant ads. You can change your choice anytime in the footer.","accept_label":"Accept all","reject_label":"Reject non-essential","manage_label":"Manage preferences"}'::jsonb),
  ('newsletter', '{"enabled":true,"mode":"native","beehiiv_pub_id":"","headline":"Daily Slate in Your Inbox","sub":"Tomorrow''s biggest games and last night''s scores — every morning at 8am ET."}'::jsonb),
  ('identity', '{"tagline":"Live scores, stats & the complete FIFA World Cup archive.","footer_text":"© AllSportsLive. Data via ESPN, Sofascore & official league feeds.","social":{"x":"","youtube":"","reddit":"","instagram":""}}'::jsonb),
  ('contact', '{"email":"hello@allsportslive.app","response_time":"We reply within 2 business days."}'::jsonb),
  ('legal_privacy', $j${"updated_at":"2026-06-26","body":"# Privacy Policy\n\n_Last updated: June 26, 2026_\n\nAllSportsLive (\"we\", \"us\") respects your privacy. This page explains what we collect and why.\n\n## What we collect\n- **Usage data** via Google Analytics 4 (pages viewed, device type, country) — only if you accept analytics cookies.\n- **Ad data** via Google AdSense (cookie ID, approximate location) — only if you accept advertising cookies. AdSense may also collect data per its own policy.\n- **Newsletter email** if you subscribe — used solely to deliver the newsletter.\n- **Contact form submissions** — name, email, message.\n\nWe do not require an account to browse and we do not sell personal data.\n\n## Your rights\n- **GDPR (EU/UK):** access, correction, deletion, portability, objection. Email us to exercise these rights.\n- **CCPA (California):** right to know, delete, opt out of \"sale or sharing\". Use the \"Cookie preferences\" link in the footer to opt out of advertising cookies.\n\n## Third parties\nGoogle (AdSense, Analytics), Beehiiv (newsletter), Supabase (database), Cloudflare (hosting). Each processes data per their own privacy policy.\n\n## Contact\nQuestions? Email the address on our /contact page."}$j$::jsonb),
  ('legal_terms', $j${"updated_at":"2026-06-26","body":"# Terms of Service\n\n_Last updated: June 26, 2026_\n\nBy using AllSportsLive you agree to these terms.\n\n## Use of the service\nAllSportsLive provides sports scores, statistics, and historical data for personal, non-commercial use. You may not scrape, redistribute, or resell our content without written permission.\n\n## Data accuracy\nScores and stats are aggregated from public sources (ESPN, Sofascore, official league APIs). We strive for accuracy but make no warranty. Always verify with official sources before acting on the information.\n\n## Affiliate links\nSome links on AllSportsLive are affiliate links — we may earn a commission at no extra cost to you. See our /disclaimer page.\n\n## Limitation of liability\nThe service is provided \"as is\". To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages.\n\n## Changes\nWe may update these terms; continued use after changes means you accept the updated terms."}$j$::jsonb),
  ('legal_cookies', $j${"updated_at":"2026-06-26","body":"# Cookie Policy\n\n_Last updated: June 26, 2026_\n\n## What are cookies?\nSmall text files stored on your device that help the site work, remember preferences, and measure traffic.\n\n## Categories we use\n- **Necessary** — required for basic site function (consent choice, theme). Always on.\n- **Analytics** — Google Analytics 4 (`_ga`, `_ga_*`). Anonymous traffic measurement.\n- **Advertising** — Google AdSense (`__gads`, `__gpi`). Personalized ads if accepted; non-personalized otherwise.\n- **Affiliate** — first-party redirect cookies to credit referral commissions.\n\n## Managing cookies\nUse the **Cookie preferences** link in the footer to change your choice anytime. You can also block cookies in your browser settings — the site will still work, but some features may be limited."}$j$::jsonb),
  ('legal_disclaimer', $j${"updated_at":"2026-06-26","body":"# Editorial & Affiliate Disclaimer\n\n_Last updated: June 26, 2026_\n\n## Editorial independence\nAllSportsLive is an independent sports data platform. We are not affiliated with the NFL, MLB, NBA, NHL, MLS, FIFA, ICC, BCCI, or any league or team.\n\n## Affiliate disclosure (FTC 16 CFR Part 255)\nSome links on this site — including links to streaming services, ticket marketplaces, merchandise stores, and sportsbooks — are affiliate links. If you click one and make a purchase or sign up, we may earn a commission at no additional cost to you. This helps keep AllSportsLive free.\n\n## Data sources\nScores and statistics are sourced from ESPN, Sofascore, ESPNcricinfo, and official league feeds. Historical archives include open datasets such as the FIFA World Cup video archive on Hugging Face.\n\n## Responsible gambling\nWhere we link to sportsbooks, those links are visible only in jurisdictions where sports betting is legal. If you or someone you know has a gambling problem, call **1-800-GAMBLER** (US) or visit ncpgambling.org."}$j$::jsonb),
  ('legal_about', $j${"updated_at":"2026-06-26","body":"# About AllSportsLive\n\nAllSportsLive is a one-stop hub for live scores, statistics, and historical archives across the sports that matter most to a global audience.\n\n## What we cover\n- **Football (Soccer)** — the complete FIFA World Cup archive from 1930 to 2026, with live fixtures, knockout predictions, and lineups.\n- **Cricket** — international tours, IPL, T20 leagues, player careers and records.\n- **MLB, NBA, NHL, MLS** — live games, standings, player profiles, season leaders.\n\n## Our mission\nFans deserve a fast, ad-light, mobile-first scoreboard that respects their time and their data. We aggregate the same public feeds the big networks use, then present them with no clickbait and no autoplay video.\n\n## How we''re funded\nAllSportsLive is free. We earn from display ads (Google AdSense) and affiliate commissions (streaming, tickets, merchandise). See our /disclaimer page for details.\n\n## Get in touch\nFeature requests, data corrections, partnership inquiries — use our /contact page."}$j$::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  body text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(name) BETWEEN 1 AND 100
    AND char_length(email) BETWEEN 3 AND 255
    AND char_length(body) BETWEEN 1 AND 4000
  );

DROP POLICY IF EXISTS "Admins read contact" ON public.contact_messages;
CREATE POLICY "Admins read contact" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete contact" ON public.contact_messages;
CREATE POLICY "Admins delete contact" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- 4. newsletter_subscribers
-- ============================================================
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  source text DEFAULT 'homepage',
  consent_marketing boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(email) BETWEEN 3 AND 255
  );

DROP POLICY IF EXISTS "Admins read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx
  ON public.newsletter_subscribers (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx
  ON public.contact_messages (created_at DESC);
