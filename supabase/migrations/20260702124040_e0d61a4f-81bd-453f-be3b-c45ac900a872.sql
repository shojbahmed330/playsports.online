
-- wc_tournaments
CREATE TABLE public.wc_tournaments (
  year INTEGER PRIMARY KEY,
  host_country TEXT,
  champion TEXT,
  runner_up TEXT,
  third_place TEXT,
  fourth_place TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wc_tournaments TO anon, authenticated;
GRANT ALL ON public.wc_tournaments TO service_role;
ALTER TABLE public.wc_tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_tournaments public read" ON public.wc_tournaments FOR SELECT USING (true);
CREATE POLICY "wc_tournaments admin write" ON public.wc_tournaments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER wc_tournaments_touch BEFORE UPDATE ON public.wc_tournaments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- wc_matches
CREATE TABLE public.wc_matches (
  id BIGSERIAL PRIMARY KEY,
  tournament_year INTEGER NOT NULL REFERENCES public.wc_tournaments(year) ON DELETE CASCADE,
  round TEXT NOT NULL,
  match_number INTEGER,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_score INTEGER,
  away_score INTEGER,
  home_score_pen INTEGER,
  away_score_pen INTEGER,
  match_date TIMESTAMPTZ,
  stadium TEXT,
  city TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX wc_matches_year_idx ON public.wc_matches(tournament_year);
CREATE INDEX wc_matches_date_idx ON public.wc_matches(match_date);
GRANT SELECT ON public.wc_matches TO anon, authenticated;
GRANT ALL ON public.wc_matches TO service_role;
ALTER TABLE public.wc_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_matches public read" ON public.wc_matches FOR SELECT USING (true);
CREATE POLICY "wc_matches admin write" ON public.wc_matches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER wc_matches_touch BEFORE UPDATE ON public.wc_matches
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- wc_groups
CREATE TABLE public.wc_groups (
  id BIGSERIAL PRIMARY KEY,
  tournament_year INTEGER NOT NULL REFERENCES public.wc_tournaments(year) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  team TEXT NOT NULL,
  position INTEGER,
  played INTEGER,
  won INTEGER,
  drawn INTEGER,
  lost INTEGER,
  goals_for INTEGER,
  goals_against INTEGER,
  points INTEGER,
  qualified BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_year, group_name, team)
);
CREATE INDEX wc_groups_year_idx ON public.wc_groups(tournament_year);
GRANT SELECT ON public.wc_groups TO anon, authenticated;
GRANT ALL ON public.wc_groups TO service_role;
ALTER TABLE public.wc_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wc_groups public read" ON public.wc_groups FOR SELECT USING (true);
CREATE POLICY "wc_groups admin write" ON public.wc_groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER wc_groups_touch BEFORE UPDATE ON public.wc_groups
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
