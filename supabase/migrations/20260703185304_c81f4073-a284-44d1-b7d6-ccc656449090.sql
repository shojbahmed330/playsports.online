CREATE TABLE public.match_recaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sport TEXT NOT NULL,
  match_key TEXT NOT NULL,
  slug TEXT NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  match_date DATE,
  tournament TEXT,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_moments JSONB NOT NULL DEFAULT '[]'::jsonb,
  full_article TEXT NOT NULL,
  meta_description TEXT,
  hero_image_url TEXT,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (sport, match_key)
);

CREATE INDEX idx_match_recaps_sport_date ON public.match_recaps(sport, match_date DESC);
CREATE INDEX idx_match_recaps_slug ON public.match_recaps(slug);

GRANT SELECT ON public.match_recaps TO anon;
GRANT SELECT ON public.match_recaps TO authenticated;
GRANT ALL ON public.match_recaps TO service_role;

ALTER TABLE public.match_recaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read match recaps"
  ON public.match_recaps FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage match recaps"
  ON public.match_recaps FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_match_recaps_updated_at
  BEFORE UPDATE ON public.match_recaps
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();