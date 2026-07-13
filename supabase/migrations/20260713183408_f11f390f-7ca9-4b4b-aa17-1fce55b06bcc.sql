-- Universal sports data cache: stores ESPN (and future provider) responses
-- with TTL + archival for historical preservation.

CREATE TABLE public.sports_data_cache (
  cache_key text PRIMARY KEY,
  sport text NOT NULL,
  category text NOT NULL,
  payload jsonb NOT NULL,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'espn',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sports_data_cache_sport_category_idx
  ON public.sports_data_cache (sport, category);
CREATE INDEX sports_data_cache_expires_at_idx
  ON public.sports_data_cache (expires_at)
  WHERE is_archived = false;
CREATE INDEX sports_data_cache_archived_idx
  ON public.sports_data_cache (is_archived);

-- Public read (all sports data is public), service_role writes via cron/server fns
GRANT SELECT ON public.sports_data_cache TO anon, authenticated;
GRANT ALL ON public.sports_data_cache TO service_role;

ALTER TABLE public.sports_data_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sports cache"
  ON public.sports_data_cache
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role manages sports cache"
  ON public.sports_data_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- updated_at trigger (reuses existing touch_updated_at function)
CREATE TRIGGER sports_data_cache_touch_updated_at
  BEFORE UPDATE ON public.sports_data_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

-- Helper function: archive rows for a given sport+season key prefix
CREATE OR REPLACE FUNCTION public.archive_sports_cache(_key_prefix text)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH updated AS (
    UPDATE public.sports_data_cache
       SET is_archived = true,
           expires_at = 'infinity'::timestamptz
     WHERE cache_key LIKE _key_prefix || '%'
       AND is_archived = false
     RETURNING 1
  )
  SELECT COUNT(*)::int FROM updated;
$$;

GRANT EXECUTE ON FUNCTION public.archive_sports_cache(text) TO service_role;