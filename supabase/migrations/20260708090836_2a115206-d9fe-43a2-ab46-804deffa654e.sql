REVOKE INSERT, UPDATE, DELETE ON public.wc_tournaments FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON public.wc_matches FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON public.wc_groups FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON public.site_settings FROM PUBLIC, anon;

GRANT SELECT ON public.wc_tournaments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wc_tournaments TO authenticated;
GRANT ALL ON public.wc_tournaments TO service_role;

GRANT SELECT ON public.wc_matches TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wc_matches TO authenticated;
GRANT ALL ON public.wc_matches TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.wc_matches_id_seq TO authenticated, service_role;
REVOKE USAGE, SELECT ON SEQUENCE public.wc_matches_id_seq FROM PUBLIC, anon;

GRANT SELECT ON public.wc_groups TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wc_groups TO authenticated;
GRANT ALL ON public.wc_groups TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.wc_groups_id_seq TO authenticated, service_role;
REVOKE USAGE, SELECT ON SEQUENCE public.wc_groups_id_seq FROM PUBLIC, anon;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;