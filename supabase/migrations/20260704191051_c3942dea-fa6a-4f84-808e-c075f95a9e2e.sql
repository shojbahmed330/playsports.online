
-- Lock down SELECT on match_predictions to own + admin
DROP POLICY IF EXISTS "predictions readable by authenticated" ON public.match_predictions;
CREATE POLICY "predictions readable by owner or admin"
  ON public.match_predictions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Lock down SELECT on public_profiles to own + admin
DROP POLICY IF EXISTS "handles readable by authenticated" ON public.public_profiles;
CREATE POLICY "handles readable by owner or admin"
  ON public.public_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Lock down SELECT on match_comments to own + admin (public view via RPC)
DROP POLICY IF EXISTS "comments visible to authenticated when not hidden" ON public.match_comments;
CREATE POLICY "comments readable by owner or admin"
  ON public.match_comments FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Public leaderboard RPC: returns handles only, plus is_mine flag
CREATE OR REPLACE FUNCTION public.get_match_predictions_leaderboard(p_sport text, p_match_id bigint)
RETURNS TABLE (
  id uuid,
  home_score int,
  away_score int,
  points int,
  settled boolean,
  handle text,
  is_mine boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mp.id, mp.home_score, mp.away_score, mp.points, mp.settled,
         pp.handle,
         (auth.uid() = mp.user_id) AS is_mine
  FROM public.match_predictions mp
  LEFT JOIN public.public_profiles pp ON pp.user_id = mp.user_id
  WHERE mp.sport = p_sport AND mp.match_id = p_match_id
  ORDER BY mp.points DESC
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION public.get_match_predictions_leaderboard(text, bigint) TO anon, authenticated;

-- Public comments RPC: returns handles only, plus is_mine flag
CREATE OR REPLACE FUNCTION public.get_match_comments(p_sport text, p_match_id bigint)
RETURNS TABLE (
  id uuid,
  body text,
  created_at timestamptz,
  handle text,
  is_mine boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mc.id, mc.body, mc.created_at,
         pp.handle,
         (auth.uid() = mc.user_id) AS is_mine
  FROM public.match_comments mc
  LEFT JOIN public.public_profiles pp ON pp.user_id = mc.user_id
  WHERE mc.sport = p_sport AND mc.match_id = p_match_id AND mc.hidden = false
  ORDER BY mc.created_at DESC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.get_match_comments(text, bigint) TO anon, authenticated;
