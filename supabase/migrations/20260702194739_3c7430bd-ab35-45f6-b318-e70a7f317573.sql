
-- Restrict match_predictions SELECT to authenticated users only
DROP POLICY IF EXISTS "predictions readable by all" ON public.match_predictions;
CREATE POLICY "predictions readable by authenticated"
  ON public.match_predictions FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.match_predictions FROM anon;

-- Restrict match_comments SELECT to authenticated users only
DROP POLICY IF EXISTS "comments visible when not hidden" ON public.match_comments;
CREATE POLICY "comments visible to authenticated when not hidden"
  ON public.match_comments FOR SELECT
  TO authenticated
  USING ((hidden = false) OR (auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));
REVOKE SELECT ON public.match_comments FROM anon;

-- Restrict public_profiles SELECT to authenticated users so raw user_id is not exposed to anon
DROP POLICY IF EXISTS "handles are public" ON public.public_profiles;
CREATE POLICY "handles readable by authenticated"
  ON public.public_profiles FOR SELECT
  TO authenticated
  USING (true);
REVOKE SELECT ON public.public_profiles FROM anon;
