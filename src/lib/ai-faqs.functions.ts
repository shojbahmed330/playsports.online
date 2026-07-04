import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FaqItem = { q: string; a: string };

const EntityInput = z.object({
  entity_type: z.string().min(1).max(64),
  entity_slug: z.string().min(1).max(200),
  entity_name: z.string().min(1).max(200),
  sport: z.string().min(1).max(64),
  context: z.string().max(2000).optional(),
  force: z.boolean().optional(),
});

const PROMPT_VERSION = 2;
const MODEL = "openai/gpt-oss-120b:free";

async function callLovableAi(entityName: string, sport: string, context: string): Promise<FaqItem[]> {
  const { callOpenRouter, extractJson } = await import("./openrouter.server");

  const system = `You are an SEO expert writing FAQ sections for a sports website called PlaySports.
Generate exactly 6 unique, natural-language, high-search-intent FAQ items about the given entity.
Rules:
- Questions must sound like real Google searches (long-tail, specific).
- Answers: 1-3 sentences each, factual, no speculation, no invented stats.
- Do NOT fabricate specific numeric records or years you are unsure of.
- Focus on evergreen knowledge (history, achievements, style, notable facts).
- Vary question types: history, records, "who is", "how many", comparison, cultural.
- Return ONLY strict JSON: {"faqs":[{"q":"...","a":"..."}]}
- Do NOT wrap the JSON in Markdown code fences.`;

  const user = `Entity: ${entityName}
Sport: ${sport}
${context ? `Known context (use only what's true):\n${context}` : ""}

Generate 6 FAQ items now. Return JSON only.`;

  const raw = await callOpenRouter({ system, user, jsonMode: true, model: MODEL, temperature: 0.6 });
  const parsed = extractJson(raw) as { faqs?: unknown };
  if (!Array.isArray(parsed.faqs)) throw new Error("AI returned invalid FAQ shape");

  const faqs: FaqItem[] = [];
  for (const item of parsed.faqs) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as FaqItem).q === "string" &&
      typeof (item as FaqItem).a === "string"
    ) {
      const q = (item as FaqItem).q.trim();
      const a = (item as FaqItem).a.trim();
      if (q.length >= 5 && a.length >= 10 && q.length <= 240 && a.length <= 900) {
        faqs.push({ q, a });
      }
    }
  }
  if (faqs.length < 3) throw new Error("AI returned too few valid FAQs");
  return faqs.slice(0, 6);
}

/** Admin only: generate + upsert AI FAQs for one entity. Skips if fresh row exists unless force=true. */
export const generateAiFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EntityInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    if (!data.force) {
      const { data: existing } = await supabase
        .from("ai_faqs")
        .select("id, prompt_version")
        .eq("entity_type", data.entity_type)
        .eq("entity_slug", data.entity_slug)
        .maybeSingle();
      if (existing && existing.prompt_version === PROMPT_VERSION) {
        return { skipped: true, reason: "already-cached" as const };
      }
    }

    const faqs = await callLovableAi(data.entity_name, data.sport, data.context ?? "");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("ai_faqs")
      .upsert(
        {
          entity_type: data.entity_type,
          entity_slug: data.entity_slug,
          entity_name: data.entity_name,
          faqs,
          model: MODEL,
          prompt_version: PROMPT_VERSION,
          generated_at: new Date().toISOString(),
        },
        { onConflict: "entity_type,entity_slug" },
      );
    if (error) throw new Error(error.message);

    return { skipped: false, count: faqs.length, faqs };
  });

const BatchInput = z.object({
  entity_type: z.string().min(1),
  sport: z.string().min(1),
  items: z
    .array(
      z.object({
        entity_slug: z.string().min(1),
        entity_name: z.string().min(1),
        context: z.string().max(2000).optional(),
      }),
    )
    .min(1)
    .max(25),
  force: z.boolean().optional(),
});

/** Admin only: batch generate for up to 25 entities. Sequential to respect rate limits. */
export const generateAiFaqsBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => BatchInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let generated = 0;
    let skipped = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const item of data.items) {
      try {
        if (!data.force) {
          const { data: existing } = await supabaseAdmin
            .from("ai_faqs")
            .select("id, prompt_version")
            .eq("entity_type", data.entity_type)
            .eq("entity_slug", item.entity_slug)
            .maybeSingle();
          if (existing && existing.prompt_version === PROMPT_VERSION) {
            skipped++;
            continue;
          }
        }

        const faqs = await callLovableAi(item.entity_name, data.sport, item.context ?? "");
        const { error } = await supabaseAdmin.from("ai_faqs").upsert(
          {
            entity_type: data.entity_type,
            entity_slug: item.entity_slug,
            entity_name: item.entity_name,
            faqs,
            model: MODEL,
            prompt_version: PROMPT_VERSION,
            generated_at: new Date().toISOString(),
          },
          { onConflict: "entity_type,entity_slug" },
        );
        if (error) throw new Error(error.message);
        generated++;
      } catch (e) {
        errors.push({ slug: item.entity_slug, error: e instanceof Error ? e.message : String(e) });
      }
    }

    return { generated, skipped, errors };
  });

/** Admin only: coverage stats per entity_type. */
export const getAiFaqCoverage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const { data, error } = await supabase.from("ai_faqs").select("entity_type, entity_slug, generated_at");
    if (error) throw new Error(error.message);

    const byType = new Map<string, { count: number; latest: string | null }>();
    for (const row of data ?? []) {
      const cur = byType.get(row.entity_type) ?? { count: 0, latest: null };
      cur.count++;
      if (!cur.latest || row.generated_at > cur.latest) cur.latest = row.generated_at;
      byType.set(row.entity_type, cur);
    }
    return Array.from(byType.entries()).map(([entity_type, v]) => ({ entity_type, ...v }));
  });
