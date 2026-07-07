CREATE TABLE IF NOT EXISTS public.seo_sync_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  rows_written INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  date_range_start DATE,
  date_range_end DATE
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_sync_runs TO authenticated;
GRANT ALL ON public.seo_sync_runs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.seo_sync_runs_id_seq TO authenticated, service_role;

ALTER TABLE public.seo_sync_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'seo_sync_runs'
      AND policyname = 'Admins can read SEO sync runs'
  ) THEN
    CREATE POLICY "Admins can read SEO sync runs"
      ON public.seo_sync_runs
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.seo_gsc_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  page TEXT NOT NULL,
  query TEXT NOT NULL DEFAULT '',
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC NOT NULL DEFAULT 0,
  position NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT seo_gsc_daily_date_page_query_key UNIQUE (date, page, query)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_gsc_daily TO authenticated;
GRANT ALL ON public.seo_gsc_daily TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.seo_gsc_daily_id_seq TO authenticated, service_role;

ALTER TABLE public.seo_gsc_daily ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'seo_gsc_daily'
      AND policyname = 'Admins can read SEO GSC daily data'
  ) THEN
    CREATE POLICY "Admins can read SEO GSC daily data"
      ON public.seo_gsc_daily
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';