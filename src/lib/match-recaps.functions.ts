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
    const { buildRecapWithAi, saveRecap } = await import("./match-recaps.generate.server");
    const recap = await buildRecapWithAi(data);
    await saveRecap(data, recap);
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
    const { buildRecapWithAi, saveRecap } = await import("./match-recaps.generate.server");

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
        const recap = await buildRecapWithAi(item);
        await saveRecap(item, recap);
        generated++;
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
