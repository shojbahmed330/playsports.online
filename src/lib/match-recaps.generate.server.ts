// Server-only AI recap generation + persistence.
// Kept out of the client-reachable server-fn module so the prompt and the
// service-role client never enter the browser bundle.
import type { KeyMoment, MatchRecap } from "./match-recaps.functions";

export type RecapInput = {
  sport: string;
  match_key: string;
  slug: string;
  home_team: string;
  away_team: string;
  home_score?: number | null;
  away_score?: number | null;
  match_date?: string | null;
  tournament?: string | null;
  context?: string;
};

const MODEL = "google/gemma-4-31b-it:free";

export async function buildRecapWithAi(input: RecapInput): Promise<MatchRecap> {
  const { callOpenRouter, extractJson } = await import("./openrouter.server");

  const scoreLine =
    input.home_score != null && input.away_score != null
      ? `${input.home_score}-${input.away_score}`
      : "final score not on record";

  const system = `You are a senior sports journalist writing SEO-optimised match recap articles for PlaySports.
Return ONLY strict JSON with this exact shape:
{
  "headline": "string (60-90 chars, includes both team names + score, no clickbait)",
  "meta_description": "string (140-160 chars, natural, includes result)",
  "summary": "string (2-3 sentences, ~350 chars, opens the article)",
  "key_moments": [{"minute":"12'","title":"...","detail":"..."}, ...] (3-6 items; omit "minute" if unknown),
  "full_article": "string (700-1100 words, Markdown, H2 subheadings: 'Match Overview', 'Key Moments', 'Turning Point', 'Player Impact', 'What It Means')"
}
Rules:
- Base the article ONLY on the facts provided. Do NOT fabricate scorers, minutes, cards, xG, or attendance figures.
- Prefer descriptive prose. When specific stats are unknown, write generally ("a first-half opener", "a late second-half strike") instead of inventing numbers.
- Neutral, respectful tone. No betting talk.
- No H1 (the page renders its own H1).
- Do NOT wrap the JSON in Markdown code fences.`;

  const user = `Sport: ${input.sport}
Match: ${input.home_team} vs ${input.away_team}
Score: ${scoreLine}
Date: ${input.match_date ?? "unknown"}
Tournament: ${input.tournament ?? "unknown"}
${input.context ? `Extra context (only use if factual):\n${input.context}` : ""}

Write the recap now. Return JSON only.`;

  const raw = await callOpenRouter({
    system,
    user,
    jsonMode: true,
    model: MODEL,
    temperature: 0.7,
    maxTokens: 3000,
  });
  const parsed = extractJson(raw) as Record<string, unknown>;

  const headline = String(parsed.headline ?? "").trim();
  const summary = String(parsed.summary ?? "").trim();
  const full_article = String(parsed.full_article ?? "").trim();
  const meta_description = String(parsed.meta_description ?? "").trim();
  const km = Array.isArray(parsed.key_moments) ? parsed.key_moments : [];
  const key_moments: KeyMoment[] = [];
  for (const item of km) {
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const title = String(o.title ?? "").trim();
      const detail = String(o.detail ?? "").trim();
      const minute = o.minute != null ? String(o.minute).trim() : undefined;
      if (title && detail) key_moments.push({ title, detail, ...(minute ? { minute } : {}) });
    }
  }

  if (headline.length < 20 || summary.length < 60 || full_article.length < 400) {
    throw new Error("AI recap too short — retry");
  }
  return { headline, summary, full_article, meta_description, key_moments: key_moments.slice(0, 6) };
}

export async function saveRecap(input: RecapInput, recap: MatchRecap) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("match_recaps").upsert(
    {
      sport: input.sport,
      match_key: input.match_key,
      slug: input.slug,
      home_team: input.home_team,
      away_team: input.away_team,
      home_score: input.home_score ?? null,
      away_score: input.away_score ?? null,
      match_date: input.match_date ?? null,
      tournament: input.tournament ?? null,
      headline: recap.headline,
      summary: recap.summary,
      key_moments: recap.key_moments,
      full_article: recap.full_article,
      meta_description: recap.meta_description,
      model: MODEL,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sport,match_key" },
  );
  if (error) throw new Error(error.message);
}
