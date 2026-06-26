
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS last_sent_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_unsub_token_idx
  ON public.newsletter_subscribers(unsubscribe_token);

CREATE TABLE IF NOT EXISTS public.digest_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  html text NOT NULL,
  story_count int NOT NULL DEFAULT 0,
  recipient_count int NOT NULL DEFAULT 0,
  sent_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

GRANT SELECT ON public.digest_runs TO authenticated;
GRANT ALL ON public.digest_runs TO service_role;

ALTER TABLE public.digest_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view digest runs" ON public.digest_runs;
CREATE POLICY "Admins view digest runs" ON public.digest_runs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS digest_runs_created_at_idx ON public.digest_runs(created_at DESC);
