GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_gsc_daily TO authenticated;
GRANT ALL ON public.seo_gsc_daily TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_sync_runs TO authenticated;
GRANT ALL ON public.seo_sync_runs TO service_role;
NOTIFY pgrst, 'reload schema';