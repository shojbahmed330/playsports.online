import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SITE = "https://www.playsports.online/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

async function fetchDim(dimensions: string[], startDate: string, endDate: string) {
  const url = `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const rows: any[] = [];
  let startRow = 0;
  const rowLimit = 5000;
  while (true) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": process.env.GOOGLE_SEARCH_CONSOLE_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, startRow, dataState: "final" }),
    });
    if (!res.ok) throw new Error(`GSC ${dimensions.join(",")} ${res.status}: ${await res.text()}`);
    const j: any = await res.json();
    const batch = j?.rows ?? [];
    rows.push(...batch);
    if (batch.length < rowLimit) break;
    startRow += rowLimit;
    if (startRow > 25000) break;
  }
  return rows;
}

export const Route = createFileRoute("/api/public/hooks/gsc-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const admin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        let body: any = {};
        try { body = await request.json(); } catch {}
        const days = Math.min(Math.max(Number(body?.days) || 3, 1), 28);

        const end = new Date();
        end.setUTCDate(end.getUTCDate() - 2); // GSC data has ~2 day lag
        const start = new Date(end);
        start.setUTCDate(end.getUTCDate() - (days - 1));
        const startDate = start.toISOString().slice(0, 10);
        const endDate = end.toISOString().slice(0, 10);

        const { data: run } = await admin
          .from("seo_sync_runs")
          .insert({ status: "running", date_range_start: startDate, date_range_end: endDate })
          .select("id")
          .single();
        const runId = run?.id;

        try {
          // Two pulls: (date,page) and (date,page,query) for query-level insight
          const pageRows = await fetchDim(["date", "page"], startDate, endDate);
          const queryRows = await fetchDim(["date", "page", "query"], startDate, endDate);

          const upserts: any[] = [];
          for (const r of pageRows) {
            const [date, page] = r.keys;
            upserts.push({
              date, page, query: "",
              clicks: r.clicks ?? 0,
              impressions: r.impressions ?? 0,
              ctr: r.ctr ?? 0,
              position: r.position ?? 0,
            });
          }
          for (const r of queryRows) {
            const [date, page, query] = r.keys;
            if (!query) continue;
            upserts.push({
              date, page, query,
              clicks: r.clicks ?? 0,
              impressions: r.impressions ?? 0,
              ctr: r.ctr ?? 0,
              position: r.position ?? 0,
            });
          }

          // chunked upsert
          let written = 0;
          for (let i = 0; i < upserts.length; i += 500) {
            const chunk = upserts.slice(i, i + 500);
            const { error } = await admin
              .from("seo_gsc_daily")
              .upsert(chunk, { onConflict: "date,page,query" });
            if (error) throw error;
            written += chunk.length;
          }

          await admin.from("seo_sync_runs").update({
            status: "success",
            finished_at: new Date().toISOString(),
            rows_written: written,
          }).eq("id", runId);

          return Response.json({ ok: true, rows_written: written, startDate, endDate });
        } catch (e: any) {
          await admin.from("seo_sync_runs").update({
            status: "error",
            finished_at: new Date().toISOString(),
            error: String(e?.message ?? e).slice(0, 500),
          }).eq("id", runId);
          return Response.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
        }
      },
    },
  },
});
