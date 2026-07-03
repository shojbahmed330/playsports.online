import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: any) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

export const getSeoOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabase } = context;

    const { data: daily } = await supabase
      .from("seo_gsc_daily")
      .select("date, clicks, impressions, position")
      .eq("query", "")
      .order("date", { ascending: false })
      .limit(2000);

    // Aggregate per date across pages
    const byDate = new Map<string, { clicks: number; impressions: number; pos: number; n: number }>();
    for (const r of daily ?? []) {
      const d = r.date as string;
      const cur = byDate.get(d) ?? { clicks: 0, impressions: 0, pos: 0, n: 0 };
      cur.clicks += r.clicks; cur.impressions += r.impressions; cur.pos += Number(r.position); cur.n += 1;
      byDate.set(d, cur);
    }
    const trend = Array.from(byDate.entries())
      .map(([date, v]) => ({ date, clicks: v.clicks, impressions: v.impressions, position: v.n ? v.pos / v.n : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top pages last 28 days
    const cutoff = new Date(); cutoff.setUTCDate(cutoff.getUTCDate() - 28);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const { data: pages } = await supabase
      .from("seo_gsc_daily")
      .select("page, clicks, impressions, position")
      .eq("query", "")
      .gte("date", cutoffStr);
    const pageAgg = new Map<string, { clicks: number; impressions: number; pos: number; n: number }>();
    for (const r of pages ?? []) {
      const cur = pageAgg.get(r.page) ?? { clicks: 0, impressions: 0, pos: 0, n: 0 };
      cur.clicks += r.clicks; cur.impressions += r.impressions; cur.pos += Number(r.position); cur.n += 1;
      pageAgg.set(r.page, cur);
    }
    const topPages = Array.from(pageAgg.entries())
      .map(([page, v]) => ({ page, clicks: v.clicks, impressions: v.impressions, position: v.n ? v.pos / v.n : 0 }))
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 25);

    // Top queries
    const { data: queries } = await supabase
      .from("seo_gsc_daily")
      .select("query, clicks, impressions, position")
      .neq("query", "")
      .gte("date", cutoffStr);
    const qAgg = new Map<string, { clicks: number; impressions: number; pos: number; n: number }>();
    for (const r of queries ?? []) {
      const cur = qAgg.get(r.query) ?? { clicks: 0, impressions: 0, pos: 0, n: 0 };
      cur.clicks += r.clicks; cur.impressions += r.impressions; cur.pos += Number(r.position); cur.n += 1;
      qAgg.set(r.query, cur);
    }
    const topQueries = Array.from(qAgg.entries())
      .map(([query, v]) => ({ query, clicks: v.clicks, impressions: v.impressions, position: v.n ? v.pos / v.n : 0 }))
      .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
      .slice(0, 50);

    const { data: runs } = await supabase
      .from("seo_sync_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10);

    const totals = trend.reduce(
      (acc, r) => ({ clicks: acc.clicks + r.clicks, impressions: acc.impressions + r.impressions }),
      { clicks: 0, impressions: 0 },
    );
    return { trend, topPages, topQueries, runs: runs ?? [], totals };
  });

export const triggerSeoSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { days?: number }) => ({ days: Math.min(Math.max(Number(d?.days) || 7, 1), 28) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const res = await fetch("https://www.playsports.online/api/public/hooks/gsc-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: data.days }),
    });
    const j = await res.json().catch(() => ({}));
    return { ok: res.ok, ...j };
  });
