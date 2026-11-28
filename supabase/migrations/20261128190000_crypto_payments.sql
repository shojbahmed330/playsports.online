-- Crypto premium payments (USDT BEP20) with manual admin verification.
-- One row per submitted transaction; admin approval extends memberships.

CREATE TABLE IF NOT EXISTS public.crypto_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_months INTEGER NOT NULL CHECK (plan_months BETWEEN 1 AND 60),
  amount_usdt NUMERIC(12, 2) NOT NULL CHECK (amount_usdt > 0),
  network TEXT NOT NULL DEFAULT 'BEP20' CHECK (network = 'BEP20'),
  wallet_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  user_note TEXT,
  admin_note TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  membership_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crypto_payments_tx_hash_unique UNIQUE (tx_hash),
  CONSTRAINT crypto_payments_wallet_format
    CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT crypto_payments_tx_format
    CHECK (tx_hash ~ '^0x[a-f0-9]{64}$')
);

CREATE INDEX IF NOT EXISTS idx_crypto_payments_user
  ON public.crypto_payments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status
  ON public.crypto_payments (status, created_at DESC);

ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own crypto payments" ON public.crypto_payments;
CREATE POLICY "Users read own crypto payments"
  ON public.crypto_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own crypto payments" ON public.crypto_payments;
CREATE POLICY "Users insert own crypto payments"
  ON public.crypto_payments FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
  );

DROP POLICY IF EXISTS "Admins read crypto payments" ON public.crypto_payments;
CREATE POLICY "Admins read crypto payments"
  ON public.crypto_payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update crypto payments" ON public.crypto_payments;
CREATE POLICY "Admins update crypto payments"
  ON public.crypto_payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE ON public.crypto_payments TO authenticated;
GRANT ALL ON public.crypto_payments TO service_role;

DROP TRIGGER IF EXISTS trg_crypto_payments_updated ON public.crypto_payments;
CREATE TRIGGER trg_crypto_payments_updated
  BEFORE UPDATE ON public.crypto_payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Admin config (public read is required to show the deposit address).
INSERT INTO public.site_settings (key, value)
VALUES (
  'crypto_payments',
  '{"enabled":false,"wallet":"","monthlyUsd":3,"network":"BEP20"}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
