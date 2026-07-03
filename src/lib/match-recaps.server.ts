// Server-only helpers for reading cached match recaps during SSR (loaders).
// Uses the publishable/anon key — never the service role.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { KeyMoment } from "./match-recaps.functions";

export type CachedRecap = {
  headline: string;
  summary: string;
  full_article: string;
  meta_description: string | null;
  key_moments: KeyMoment[];
  updated_at: string;
};

let cached: ReturnType<typeof createClient<Database>> | null = null;
function getClient() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  return cached;
}

export async function readMatchRecap(sport: string, match_key: string): Promise<CachedRecap | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const { data, error } = await client
      .from("match_recaps")
      .select("headline, summary, full_article, meta_description, key_moments, updated_at")
      .eq("sport", sport)
      .eq("match_key", match_key)
      .maybeSingle();
    if (error || !data) return null;
    const km = Array.isArray(data.key_moments) ? (data.key_moments as unknown as KeyMoment[]) : [];
    return {
      headline: data.headline,
      summary: data.summary,
      full_article: data.full_article,
      meta_description: data.meta_description,
      key_moments: km,
      updated_at: data.updated_at,
    };
  } catch {
    return null;
  }
}

export async function listRecappedSlugs(sport: string): Promise<Array<{ slug: string; updated_at: string }>> {
  const client = getClient();
  if (!client) return [];
  try {
    const { data } = await client
      .from("match_recaps")
      .select("slug, updated_at")
      .eq("sport", sport);
    return (data ?? []).map((r) => ({ slug: r.slug, updated_at: r.updated_at }));
  } catch {
    return [];
  }
}
