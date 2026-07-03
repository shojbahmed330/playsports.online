import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSeoOverview, triggerSeoSync } from "@/lib/seo-analytics.functions";
import { RefreshCw, TrendingUp, Search, FileText, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

function fmt(n: number) { return n.toLocaleString(); }
function fmtPos(n: number) { return n ? n.toFixed(1) : "—"; }

export function SeoAnalyticsPanel() {
  const fetchOverview = useServerFn(getSeoOverview);
  const fetchSync = useServerFn(triggerSeoSync);
  const qc = useQueryClient();
  const [days, setDays] = useState(7);

  const { data, isLoading, error } = useQuery({
    queryKey: ["seo-overview"],
    queryFn: () => fetchOverview({}),
  });

  const sync = useMutation({
    mutationFn: (d: number) => fetchSync({ data: { days: d } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seo-overview"] }),
  });

  const trend = data?.trend ?? [];
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  const clicksDelta = last && prev ? last.clicks - prev.clicks : 0;
  const imprDelta = last && prev ? last.impressions - prev.impressions : 0;
  const maxImpr = Math.max(1, ...trend.map((t) => t.impressions));

  return (
    <div className="space-y-6">
      {/* Header + controls */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="size-5 text-gold" /> Google Search Console
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Real search performance for playsports.online — updated daily at 6 AM UTC.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-2 rounded-lg bg-background border border-border text-xs font-semibold"
            >
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={28}>Last 28 days</option>
            </select>
            <button
              onClick={() => sync.mutate(days)}
              disabled={sync.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold/15 ring-1 ring-gold/40 text-gold text-xs font-bold hover:bg-gold/25 disabled:opacity-60"
            >
              <RefreshCw className={`size-3.5 ${sync.isPending ? "animate-spin" : ""}`} />
              Sync now
            </button>
          </div>
        </div>
        {sync.data && (
          <div className={`mt-3 text-xs ${sync.data.ok ? "text-emerald-400" : "text-red-400"}`}>
            {sync.data.ok ? `Synced ${sync.data.rows_written ?? 0} rows` : `Error: ${sync.data.error ?? "unknown"}`}
          </div>
        )}
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading analytics…</div>}
      {error && <div className="text-sm text-red-400">Error: {String((error as any)?.message ?? error)}</div>}

      {!isLoading && data && trend.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
          <Clock className="size-8 text-muted-foreground mx-auto mb-3" />
          <div className="font-semibold">No data yet</div>
          <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
            Google Search Console typically starts reporting data 24–72 hours after site verification.
            Click <b>Sync now</b> once traffic starts, or wait for tomorrow's automatic sync.
          </p>
        </div>
      )}

      {trend.length > 0 && (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPI label="Total Clicks" value={fmt(data!.totals.clicks)} delta={clicksDelta} />
            <KPI label="Impressions" value={fmt(data!.totals.impressions)} delta={imprDelta} />
            <KPI label="Avg Position" value={fmtPos(last?.position ?? 0)} />
            <KPI label="Pages Ranked" value={fmt(data!.topPages.length)} />
          </div>

          {/* Trend bars */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-bold mb-3">Impressions trend</div>
            <div className="flex items-end gap-1 h-32">
              {trend.slice(-28).map((r) => (
                <div key={r.date} className="flex-1 group relative">
                  <div
                    className="bg-gradient-to-t from-gold to-amber-500 rounded-sm hover:brightness-125 transition"
                    style={{ height: `${(r.impressions / maxImpr) * 100}%`, minHeight: "2px" }}
                    title={`${r.date}: ${fmt(r.impressions)} impr, ${fmt(r.clicks)} clicks`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>{trend.slice(-28)[0]?.date}</span>
              <span>{trend[trend.length - 1]?.date}</span>
            </div>
          </div>

          {/* Top pages + queries */}
          <div className="grid lg:grid-cols-2 gap-4">
            <TopTable
              title="Top Pages (28d)"
              icon={<FileText className="size-4 text-gold" />}
              rows={data!.topPages.slice(0, 15).map((p) => ({
                label: p.page.replace("https://www.playsports.online", "") || "/",
                clicks: p.clicks,
                impressions: p.impressions,
                position: p.position,
                href: p.page,
              }))}
              linkable
            />
            <TopTable
              title="Top Queries (28d)"
              icon={<Search className="size-4 text-gold" />}
              rows={data!.topQueries.slice(0, 15).map((q) => ({
                label: q.query,
                clicks: q.clicks,
                impressions: q.impressions,
                position: q.position,
              }))}
            />
          </div>
        </>
      )}

      {/* Sync log */}
      {data && data.runs.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-sm font-bold mb-3">Sync history</div>
          <div className="space-y-1.5">
            {data.runs.map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 text-xs">
                {r.status === "success" ? (
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                ) : r.status === "error" ? (
                  <XCircle className="size-3.5 text-red-400" />
                ) : (
                  <Clock className="size-3.5 text-muted-foreground animate-pulse" />
                )}
                <span className="text-muted-foreground">
                  {new Date(r.started_at).toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  {r.date_range_start} → {r.date_range_end}
                </span>
                <span className="ml-auto font-semibold">
                  {r.status === "success" ? `${fmt(r.rows_written)} rows` : r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, delta }: { label: string; value: string; delta?: number }) {
  const up = (delta ?? 0) > 0;
  const down = (delta ?? 0) < 0;
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-xl font-extrabold mt-1">{value}</div>
      {typeof delta === "number" && (
        <div className={`text-[10px] mt-1 ${up ? "text-emerald-400" : down ? "text-red-400" : "text-muted-foreground"}`}>
          {up ? "▲" : down ? "▼" : "•"} {Math.abs(delta)} d/d
        </div>
      )}
    </div>
  );
}

function TopTable({
  title, icon, rows, linkable,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { label: string; clicks: number; impressions: number; position: number; href?: string }[];
  linkable?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-sm font-bold mb-3 flex items-center gap-2">{icon} {title}</div>
      <div className="space-y-1">
        <div className="grid grid-cols-[1fr_60px_60px_50px] text-[10px] uppercase tracking-widest text-muted-foreground pb-1 border-b border-border">
          <span>Item</span>
          <span className="text-right">Clicks</span>
          <span className="text-right">Impr</span>
          <span className="text-right">Pos</span>
        </div>
        {rows.length === 0 && <div className="py-4 text-xs text-muted-foreground text-center">No data</div>}
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_60px_60px_50px] text-xs py-1.5 border-b border-border/40 items-center">
            <span className="truncate pr-2">
              {linkable && r.href ? (
                <a href={r.href} target="_blank" rel="noopener" className="hover:text-gold inline-flex items-center gap-1">
                  {r.label} <ExternalLink className="size-3 opacity-50" />
                </a>
              ) : r.label}
            </span>
            <span className="text-right font-semibold">{fmt(r.clicks)}</span>
            <span className="text-right text-muted-foreground">{fmt(r.impressions)}</span>
            <span className="text-right text-muted-foreground">{fmtPos(r.position)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
