
CREATE TABLE public.ai_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_slug TEXT NOT NULL,
  entity_name TEXT,
  faqs JSONB NOT NULL,
  model TEXT,
  prompt_version INT NOT NULL DEFAULT 1,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_slug)
);

CREATE INDEX ai_faqs_lookup_idx ON public.ai_faqs (entity_type, entity_slug);

GRANT SELECT ON public.ai_faqs TO anon;
GRANT SELECT ON public.ai_faqs TO authenticated;
GRANT ALL ON public.ai_faqs TO service_role;

ALTER TABLE public.ai_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read AI FAQs"
  ON public.ai_faqs FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage AI FAQs"
  ON public.ai_faqs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_ai_faqs_updated_at
  BEFORE UPDATE ON public.ai_faqs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
