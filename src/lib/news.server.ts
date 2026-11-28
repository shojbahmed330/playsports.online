// Server-only reader for AI-generated match recaps. Uses the publishable
// (anon) Supabase key, never the service role, so it is safe in SSR loaders.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { KeyMoment } from "./match-recaps.functions";
import { findAutoRecapForMatch, getAutoRecap, listAutoRecaps } from "./news-auto.server";
import { getLiveRecap, listLiveRecaps } from "./news-live.server";

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
  matchKey: string | null;
  matchPath?: string | null;
};

export type RecapLink = {
  slug: string;
  headline: string;
  summary: string;
  metaDescription: string | null;
  updatedAt: string;
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

async function listDbRecaps(limit = 30): Promise<NewsSummary[]> {
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

/** DB recaps first, then live recaps, then data-grounded fallback recaps. */
export async function listNewsRecaps(limit = 30): Promise<NewsSummary[]> {
  const [db, live] = await Promise.all([
    listDbRecaps(limit),
    Promise.race([
      listLiveRecaps(),
      new Promise<NewsArticle[]>((resolve) => setTimeout(() => resolve([]), 4_000)),
    ]).catch(() => [] as NewsArticle[]),
  ]);
  const seen = new Set<string>();
  const merged: NewsSummary[] = [];
  for (const article of [...db, ...live, ...listAutoRecaps()]) {
    if (seen.has(article.slug)) continue;
    seen.add(article.slug);
    merged.push(article);
  }
  return merged
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, Math.min(Math.max(limit, 1), 100));
}

async function getDbRecap(slug: string): Promise<NewsArticle | null> {
  const supabase = getClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("match_recaps")
      .select(`${SUMMARY_FIELDS},full_article,meta_description,key_moments,match_key`)
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
      matchKey: data.match_key,
    };
  } catch {
    return null;
  }
}

/** DB article first; fall back to the deterministic archive recap. */
export async function getNewsRecap(slug: string): Promise<NewsArticle | null> {
  return (await getDbRecap(slug)) ?? getAutoRecap(slug) ?? (await getLiveRecap(slug));
}
/** Compact recap lookup for match/highlight pages (no full article body). */
export async function getRecapLinkForMatch(
  sport: string,
  matchKey: string,
): Promise<RecapLink | null> {
  const auto = findAutoRecapForMatch(sport, matchKey);
  const fallback: RecapLink | null = auto
    ? {
        slug: auto.slug,
        headline: auto.headline,
        summary: auto.summary,
        metaDescription: auto.metaDescription,
        updatedAt: auto.updatedAt,
      }
    : null;
  const supabase = getClient();
  if (!supabase || !matchKey) return fallback;
  try {
    const { data, error } = await supabase
      .from("match_recaps")
      .select("slug,headline,summary,meta_description,updated_at")
      .eq("sport", sport)
      .eq("match_key", matchKey)
      .maybeSingle();
    if (error || !data) return fallback;
    return {
      slug: data.slug,
      headline: data.headline,
      summary: data.summary,
      metaDescription: data.meta_description,
      updatedAt: data.updated_at,
    };
  } catch {
    return fallback;
  }
}
