// Server-only helpers for reading cached AI FAQs during SSR (loaders).
// Uses the publishable/anon key — never the service role.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { FaqItem } from "./ai-faqs.functions";

let cached: ReturnType<typeof createClient<Database>> | null = null;
function getPublicClient() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  return cached;
}

export async function readCachedFaqs(entity_type: string, entity_slug: string): Promise<FaqItem[] | null> {
  const client = getPublicClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("ai_faqs")
      .select("faqs")
      .eq("entity_type", entity_type)
      .eq("entity_slug", entity_slug)
      .maybeSingle();
    if (error || !data) return null;
    const faqs = data.faqs as unknown;
    if (!Array.isArray(faqs)) return null;
    return faqs as FaqItem[];
  } catch {
    return null;
  }
}
