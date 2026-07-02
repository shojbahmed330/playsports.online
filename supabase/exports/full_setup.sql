-- =====================================================================
-- AllSportsLive — full backend schema for self-hosted Supabase
-- Run this ONCE on your own Supabase project (vagqeperdsumxwukwbes)
-- via: Supabase Dashboard → SQL Editor → New query → Paste → Run
--
-- What it creates:
--   • Tables: affiliate_links, contact_messages, digest_runs,
--            memberships, newsletter_subscribers, site_settings,
--            sponsored_slots, user_roles
--   • Enum: app_role (admin | moderator | user)
--   • Functions: has_role, handle_new_user_role, touch_updated_at
--   • Row Level Security + policies + GRANTs
--
-- After running: set the admin email inside handle_new_user_role() if
-- you want a different email to auto-become admin on signup.
-- =====================================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- CREATE SCHEMA public; (skipped: already exists)
--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin',
    'moderator',
    'user');
  END IF;
END $mig$;


--
-- Name: handle_new_user_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_new_user_role() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: affiliate_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.affiliate_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    network text NOT NULL,
    title text NOT NULL,
    description text,
    url text NOT NULL,
    image_url text,
    cta_label text DEFAULT 'Shop now'::text NOT NULL,
    placement text DEFAULT 'inline'::text NOT NULL,
    sport text,
    team_slug text,
    league_slug text,
    geo_restrict text[],
    priority integer DEFAULT 50 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    click_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT affiliate_links_network_check CHECK ((network = ANY (ARRAY['amazon'::text, 'fanatics'::text, 'sportsbook'::text, 'generic'::text]))),
    CONSTRAINT affiliate_links_placement_check CHECK ((placement = ANY (ARRAY['inline'::text, 'sidebar'::text, 'match_footer'::text, 'player_footer'::text, 'homepage'::text])))
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text,
    body text NOT NULL,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: digest_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.digest_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject text NOT NULL,
    html text NOT NULL,
    story_count integer DEFAULT 0 NOT NULL,
    recipient_count integer DEFAULT 0 NOT NULL,
    sent_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone
);


--
-- Name: memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.memberships (
    user_id uuid NOT NULL,
    tier text DEFAULT 'free'::text NOT NULL,
    premium_until timestamp with time zone,
    granted_by uuid,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    source text DEFAULT 'homepage'::text,
    consent_marketing boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    unsubscribe_token uuid DEFAULT gen_random_uuid() NOT NULL,
    last_sent_at timestamp with time zone
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.site_settings (
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sponsored_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.sponsored_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slot_type text NOT NULL,
    title text NOT NULL,
    sponsor_name text NOT NULL,
    sponsor_logo_url text,
    target_url text NOT NULL,
    image_url text,
    description text,
    ref_id text,
    sport text,
    starts_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    priority integer DEFAULT 50 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sponsored_slots_slot_type_check CHECK ((slot_type = ANY (ARRAY['match'::text, 'team'::text, 'league'::text, 'banner'::text])))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: affiliate_links affiliate_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_links_pkey') THEN
    ALTER TABLE ONLY public.affiliate_links
    ADD CONSTRAINT affiliate_links_pkey PRIMARY KEY (id);
  END IF;
END $mig$;


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_pkey') THEN
    ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);
  END IF;
END $mig$;


--
-- Name: digest_runs digest_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'digest_runs_pkey') THEN
    ALTER TABLE ONLY public.digest_runs
    ADD CONSTRAINT digest_runs_pkey PRIMARY KEY (id);
  END IF;
END $mig$;


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_pkey') THEN
    ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (user_id);
  END IF;
END $mig$;


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_subscribers_email_key') THEN
    ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);
  END IF;
END $mig$;


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_subscribers_pkey') THEN
    ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);
  END IF;
END $mig$;


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_pkey') THEN
    ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (key);
  END IF;
END $mig$;


--
-- Name: sponsored_slots sponsored_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sponsored_slots_pkey') THEN
    ALTER TABLE ONLY public.sponsored_slots
    ADD CONSTRAINT sponsored_slots_pkey PRIMARY KEY (id);
  END IF;
END $mig$;


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_pkey') THEN
    ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
  END IF;
END $mig$;


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key') THEN
    ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END $mig$;


--
-- Name: contact_messages_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages USING btree (created_at DESC);


--
-- Name: digest_runs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS digest_runs_created_at_idx ON public.digest_runs USING btree (created_at DESC);


--
-- Name: newsletter_subscribers_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx ON public.newsletter_subscribers USING btree (created_at DESC);


--
-- Name: newsletter_subscribers_unsub_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_unsub_token_idx ON public.newsletter_subscribers USING btree (unsubscribe_token);


--
-- Name: memberships memberships_touch; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS memberships_touch ON public.memberships;
CREATE TRIGGER memberships_touch BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: affiliate_links trg_affiliate_links_updated; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trg_affiliate_links_updated ON public.affiliate_links;
CREATE TRIGGER trg_affiliate_links_updated BEFORE UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: sponsored_slots trg_sponsored_slots_updated; Type: TRIGGER; Schema: public; Owner: -
--

DROP TRIGGER IF EXISTS trg_sponsored_slots_updated ON public.sponsored_slots;
CREATE TRIGGER trg_sponsored_slots_updated BEFORE UPDATE ON public.sponsored_slots FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- Name: memberships memberships_granted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_granted_by_fkey') THEN
    ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id);
  END IF;
END $mig$;


--
-- Name: memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_user_id_fkey') THEN
    ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $mig$;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey') THEN
    ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $mig$;


--
-- Name: contact_messages Admins delete contact; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins delete contact" ON public.contact_messages;
CREATE POLICY "Admins delete contact" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins delete subscribers; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins delete subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: affiliate_links Admins manage affiliate links; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins manage affiliate links" ON public.affiliate_links;
CREATE POLICY "Admins manage affiliate links" ON public.affiliate_links TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: memberships Admins manage memberships; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins manage memberships" ON public.memberships;
CREATE POLICY "Admins manage memberships" ON public.memberships TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sponsored_slots Admins manage sponsored slots; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins manage sponsored slots" ON public.sponsored_slots;
CREATE POLICY "Admins manage sponsored slots" ON public.sponsored_slots TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admins read contact; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins read contact" ON public.contact_messages;
CREATE POLICY "Admins read contact" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins read subscribers; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins read subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: digest_runs Admins view digest runs; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins view digest runs" ON public.digest_runs;
CREATE POLICY "Admins view digest runs" ON public.digest_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_settings Admins write site settings; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Admins write site settings" ON public.site_settings;
CREATE POLICY "Admins write site settings" ON public.site_settings TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Anyone can submit contact; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact" ON public.contact_messages FOR INSERT TO authenticated, anon WITH CHECK ((((char_length(name) >= 1) AND (char_length(name) <= 100)) AND ((char_length(email) >= 3) AND (char_length(email) <= 255)) AND ((char_length(body) >= 1) AND (char_length(body) <= 4000))));


--
-- Name: newsletter_subscribers Anyone can subscribe; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO authenticated, anon WITH CHECK (((char_length(email) >= 3) AND (char_length(email) <= 255)));


--
-- Name: site_settings Public read site settings; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read site settings" ON public.site_settings FOR SELECT TO authenticated, anon USING (true);


--
-- Name: affiliate_links Public reads active affiliate links; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Public reads active affiliate links" ON public.affiliate_links;
CREATE POLICY "Public reads active affiliate links" ON public.affiliate_links FOR SELECT TO authenticated, anon USING ((active = true));


--
-- Name: sponsored_slots Public reads active sponsored slots; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Public reads active sponsored slots" ON public.sponsored_slots;
CREATE POLICY "Public reads active sponsored slots" ON public.sponsored_slots FOR SELECT TO authenticated, anon USING (((active = true) AND ((ends_at IS NULL) OR (ends_at > now()))));


--
-- Name: memberships Users read own membership; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Users read own membership" ON public.memberships;
CREATE POLICY "Users read own membership" ON public.memberships FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users read their own roles; Type: POLICY; Schema: public; Owner: -
--

DROP POLICY IF EXISTS "Users read their own roles" ON public.user_roles;
CREATE POLICY "Users read their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: affiliate_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: digest_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.digest_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: sponsored_slots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sponsored_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
