// Server-only reader for AI-generated match recaps. Uses the publishable
// (anon) Supabase key, never the service role, so it is safe in SSR loaders.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { KeyMoment } from "./match-recaps.functions";

export type NewsSummary = {
  slug: string;
  headline: string;
  summary: string;
  sport: string;
  tournament: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string | null;
  updatedAt: string;
  heroImage: string | null;
};

export type NewsArticle = NewsSummary & {
  fullArticle: string;
  metaDescription: string | null;
  keyMoments: KeyMoment[];
};

let client: ReturnType<typeof createClient<Database>> | null = null;

function getClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
  return client;
}

const SUMMARY_FIELDS =
  "slug,headline,summary,sport,tournament,home_team,away_team,home_score,away_score,match_date,updated_at,hero_image_url";

function toSummary(row: {
  slug: string;
  headline: string;
  summary: string;
  sport: string;
  tournament: string | null;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string | null;
  updated_at: string;
  hero_image_url: string | null;
}): NewsSummary {
  return {
    slug: row.slug,
    headline: row.headline,
    summary: row.summary,
    sport: row.sport,
    tournament: row.tournament,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeScore: row.home_score,
    awayScore: row.away_score,
    matchDate: row.match_date,
    updatedAt: row.updated_at,
    heroImage: row.hero_image_url,
  };
}

export async function listNewsRecaps(limit = 30): Promise<NewsSummary[]> {
  const supabase = getClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("match_recaps")
      .select(SUMMARY_FIELDS)
      .order("updated_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));
    if (error || !data) return [];
    return data.map(toSummary);
  } catch {
    return [];
  }
}

export async function getNewsRecap(slug: string): Promise<NewsArticle | null> {
  const supabase = getClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("match_recaps")
      .select(`${SUMMARY_FIELDS},full_article,meta_description,key_moments`)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    const keyMoments = Array.isArray(data.key_moments)
      ? (data.key_moments as unknown as KeyMoment[])
      : [];
    return {
      ...toSummary(data),
      fullArticle: data.full_article,
      metaDescription: data.meta_description,
      keyMoments,
    };
  } catch {
    return null;
  }
}
