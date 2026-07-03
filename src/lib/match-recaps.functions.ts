// AI-generated match recap articles for finished matches.
// SEO Phase 3 · Match Recaps.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type KeyMoment = { minute?: string; title: string; detail: string };
export type MatchRecap = {
  headline: string;
  summary: string;
  key_moments: KeyMoment[];
  full_article: string;
  meta_description: string;
};

const MODEL = "openai/gpt-oss-120b:free";

const MatchInput = z.object({
  sport: z.string().min(1).max(32),
  match_key: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  home_team: z.string().min(1).max(120),
  away_team: z.string().min(1).max(120),
  home_score: z.number().int().nullable().optional(),
  away_score: z.number().int().nullable().optional(),
  match_date: z.string().max(32).nullable().optional(),
  tournament: z.string().max(160).nullable().optional(),
  context: z.string().max(2000).optional(),
});
type MatchInputT = z.infer<typeof MatchInput>;

async function callAi(input: MatchInputT): Promise<MatchRecap> {
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

  const raw = await callOpenRouter({ system, user, jsonMode: true, model: MODEL, temperature: 0.7, maxTokens: 3000 });
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

async function upsertRecap(input: MatchInputT, recap: MatchRecap) {
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

async function assertAdmin(context: { supabase: { rpc: (...args: unknown[]) => Promise<{ data: unknown }> }; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

/** Admin: generate + upsert a single recap. Skips if cached unless force=true. */
export const generateMatchRecap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => MatchInput.extend({ force: z.boolean().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabase } = context;
    if (!data.force) {
      const { data: existing } = await supabase
        .from("match_recaps")
        .select("id")
        .eq("sport", data.sport)
        .eq("match_key", data.match_key)
        .maybeSingle();
      if (existing) return { skipped: true as const };
    }
    const recap = await callAi(data);
    await upsertRecap(data, recap);
    return { skipped: false as const, headline: recap.headline };
  });

const BatchInput = z.object({
  items: z.array(MatchInput).min(1).max(15),
  force: z.boolean().optional(),
});

/** Admin: batch generate recaps sequentially with gentle pacing. */
export const generateMatchRecapsBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BatchInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let generated = 0;
    let skipped = 0;
    const errors: Array<{ match_key: string; error: string }> = [];

    for (const item of data.items) {
      try {
        if (!data.force) {
          const { data: existing } = await supabaseAdmin
            .from("match_recaps")
            .select("id")
            .eq("sport", item.sport)
            .eq("match_key", item.match_key)
            .maybeSingle();
          if (existing) {
            skipped++;
            continue;
          }
        }
        const recap = await callAi(item);
        await upsertRecap(item, recap);
        generated++;
        await new Promise((r) => setTimeout(r, 3500));
      } catch (e) {
        errors.push({ match_key: item.match_key, error: e instanceof Error ? e.message : String(e) });
      }
    }
    return { generated, skipped, errors };
  });

/** Admin: coverage summary per sport. */
export const getMatchRecapCoverage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as never);
    const { supabase } = context;
    const { data, error } = await supabase.from("match_recaps").select("sport, updated_at");
    if (error) throw new Error(error.message);
    const bySport = new Map<string, { count: number; latest: string | null }>();
    for (const row of data ?? []) {
      const cur = bySport.get(row.sport) ?? { count: 0, latest: null };
      cur.count++;
      if (!cur.latest || row.updated_at > cur.latest) cur.latest = row.updated_at;
      bySport.set(row.sport, cur);
    }
    return Array.from(bySport.entries()).map(([sport, v]) => ({ sport, ...v }));
  });
