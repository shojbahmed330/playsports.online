
-- Predictions: one per user per match
CREATE TABLE public.match_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id BIGINT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'football',
  home_score SMALLINT NOT NULL CHECK (home_score >= 0 AND home_score <= 30),
  away_score SMALLINT NOT NULL CHECK (away_score >= 0 AND away_score <= 30),
  points INT NOT NULL DEFAULT 0,
  settled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id, sport)
);
GRANT SELECT ON public.match_predictions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_predictions TO authenticated;
GRANT ALL ON public.match_predictions TO service_role;
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "predictions readable by all"
  ON public.match_predictions FOR SELECT
  USING (true);
CREATE POLICY "users insert own predictions"
  ON public.match_predictions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own predictions"
  ON public.match_predictions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own predictions"
  ON public.match_predictions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE TRIGGER match_predictions_touch
  BEFORE UPDATE ON public.match_predictions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX match_predictions_match_idx ON public.match_predictions (sport, match_id);
CREATE INDEX match_predictions_user_idx ON public.match_predictions (user_id);

-- Public display handle (nickname) for showing on leaderboards/comments without exposing email
CREATE TABLE public.public_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE CHECK (char_length(handle) BETWEEN 2 AND 24),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.public_profiles TO authenticated;
GRANT ALL ON public.public_profiles TO service_role;
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "handles are public" ON public.public_profiles FOR SELECT USING (true);
CREATE POLICY "users insert own handle" ON public.public_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own handle" ON public.public_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER public_profiles_touch
  BEFORE UPDATE ON public.public_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Comments per match
CREATE TABLE public.match_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id BIGINT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'football',
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.match_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.match_comments TO authenticated;
GRANT ALL ON public.match_comments TO service_role;
ALTER TABLE public.match_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments visible when not hidden"
  ON public.match_comments FOR SELECT
  USING (hidden = false OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own comments"
  ON public.match_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own comments"
  ON public.match_comments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own or admin"
  ON public.match_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER match_comments_touch
  BEFORE UPDATE ON public.match_comments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX match_comments_match_idx ON public.match_comments (sport, match_id, created_at DESC);
