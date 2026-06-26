
-- Affiliate links manager
CREATE TABLE public.affiliate_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  network text NOT NULL CHECK (network IN ('amazon','fanatics','sportsbook','generic')),
  title text NOT NULL,
  description text,
  url text NOT NULL,
  image_url text,
  cta_label text NOT NULL DEFAULT 'Shop now',
  -- placement targeting
  placement text NOT NULL DEFAULT 'inline' CHECK (placement IN ('inline','sidebar','match_footer','player_footer','homepage')),
  sport text,           -- football, cricket, mlb, nba, nhl, mls, all
  team_slug text,       -- optional team match
  league_slug text,     -- optional league match
  geo_restrict text[],  -- ISO country codes; only show in these (NULL = global)
  priority int NOT NULL DEFAULT 50,
  active boolean NOT NULL DEFAULT true,
  click_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.affiliate_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliate_links TO authenticated;
GRANT ALL ON public.affiliate_links TO service_role;

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active affiliate links"
  ON public.affiliate_links FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins manage affiliate links"
  ON public.affiliate_links FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Sponsored slots
CREATE TABLE public.sponsored_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_type text NOT NULL CHECK (slot_type IN ('match','team','league','banner')),
  title text NOT NULL,
  sponsor_name text NOT NULL,
  sponsor_logo_url text,
  target_url text NOT NULL,
  image_url text,
  description text,
  -- targeting reference
  ref_id text,            -- match id / team slug / league slug
  sport text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  priority int NOT NULL DEFAULT 50,
  active boolean NOT NULL DEFAULT true,
  impressions int NOT NULL DEFAULT 0,
  clicks int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sponsored_slots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsored_slots TO authenticated;
GRANT ALL ON public.sponsored_slots TO service_role;

ALTER TABLE public.sponsored_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active sponsored slots"
  ON public.sponsored_slots FOR SELECT
  TO anon, authenticated
  USING (active = true AND (ends_at IS NULL OR ends_at > now()));

CREATE POLICY "Admins manage sponsored slots"
  ON public.sponsored_slots FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_affiliate_links_updated
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_sponsored_slots_updated
  BEFORE UPDATE ON public.sponsored_slots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed affiliate disclosure default into site_settings (if not already)
INSERT INTO public.site_settings (key, value)
VALUES ('affiliate_disclosure', '{"enabled":true,"text":"As an Amazon Associate and partner with Fanatics and licensed sportsbooks, we earn from qualifying purchases and signups. Bet responsibly. 21+ where applicable."}'::jsonb)
ON CONFLICT (key) DO NOTHING;
