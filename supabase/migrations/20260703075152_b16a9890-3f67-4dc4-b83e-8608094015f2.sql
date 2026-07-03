
CREATE TABLE public.seo_gsc_daily (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  page TEXT NOT NULL,
  query TEXT NOT NULL DEFAULT '',
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(6,4) NOT NULL DEFAULT 0,
  position NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date, page, query)
);
CREATE INDEX seo_gsc_daily_date_idx ON public.seo_gsc_daily (date DESC);
CREATE INDEX seo_gsc_daily_page_idx ON public.seo_gsc_daily (page);
CREATE INDEX seo_gsc_daily_query_idx ON public.seo_gsc_daily (query);

GRANT SELECT ON public.seo_gsc_daily TO authenticated;
GRANT ALL ON public.seo_gsc_daily TO service_role;
ALTER TABLE public.seo_gsc_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read GSC data" ON public.seo_gsc_daily FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.seo_sync_runs (
  id BIGSERIAL PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  rows_written INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  date_range_start DATE,
  date_range_end DATE
);
GRANT SELECT ON public.seo_sync_runs TO authenticated;
GRANT ALL ON public.seo_sync_runs TO service_role;
ALTER TABLE public.seo_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read sync runs" ON public.seo_sync_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

SELECT cron.schedule(
  'gsc-daily-sync',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://www.playsports.online/api/public/hooks/gsc-sync',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvb2FteXRra3hleWZtbXFpcnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Njg3ODIsImV4cCI6MjA5ODA0NDc4Mn0.IsQed8_NbxsmsePjxGlDfQVAhPx0-wINzOXuIezpGDc"}'::jsonb,
    body := '{"days": 3}'::jsonb
  );
  $$
);
