-- Revoke default public execute on the new SECURITY DEFINER function.
-- Only service_role (server/cron) should call it.
REVOKE EXECUTE ON FUNCTION public.archive_sports_cache(text) FROM public, anon, authenticated;