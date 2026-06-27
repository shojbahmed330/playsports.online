import { useQuery } from "@tanstack/react-query";
import {
  useAdSenseSettings,
  useAnalyticsSettings,
  useNewsletterSettings,
} from "@/lib/site-settings";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2, AlertCircle, Mail, DollarSign, Video, BarChart3,
  type LucideIcon,
} from "lucide-react";
import type { AdminSection } from "./AdminSidebar";

type Tone = "default" | "warn" | "info" | "good";

export function OverviewPanel({
  matchStats,
  onJump,
}: {
  matchStats: { total: number; withVideo: number; missing: number };
  onJump: (s: AdminSection) => void;
}) {
  const ad = useAdSenseSettings();
  const an = useAnalyticsSettings();
  const nl = useNewsletterSettings();

  const subs = useQuery({
    queryKey: ["admin", "subs_count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const adsOk = !!(ad.data?.enabled && ad.data?.client);
  const anOk  = !!(an.data?.enabled && an.data?.ga4_measurement_id);
  const nlOk  = !!nl.data?.enabled;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <header>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Quick health check across monetization, audience and content.
        </p>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Total matches"  value={matchStats.total}     Icon={Video}     tone="default" onClick={() => onJump("matches")} />
        <Kpi label="Missing video"  value={matchStats.missing}   Icon={Video}     tone="warn"    onClick={() => onJump("matches")} />
        <Kpi label="Subscribers"    value={subs.data ?? "—"}     Icon={Mail}      tone="info"    onClick={() => onJump("audience")} />
        <Kpi label="With video"     value={matchStats.withVideo} Icon={BarChart3} tone="good"    onClick={() => onJump("matches")} />
      </div>

      {/* Status row */}
      <section className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground px-1">
          Integration status
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Status
            label="Google AdSense"
            ok={adsOk}
            hint={adsOk ? `Client: ${ad.data?.client}` : "Not configured yet"}
            onJump={() => onJump("monetize")}
          />
          <Status
            label="Analytics (GA4)"
            ok={anOk}
            hint={anOk ? `ID: ${an.data?.ga4_measurement_id}` : "Add a GA4 Measurement ID"}
            onJump={() => onJump("monetize")}
          />
          <Status
            label="Newsletter"
            ok={nlOk}
            hint={nlOk ? `Mode: ${nl.data?.mode}` : "Currently disabled"}
            onJump={() => onJump("audience")}
          />
        </div>
      </section>

      {/* Quick actions */}
      <section className="rounded-2xl border border-border bg-card/40 p-4">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="size-4 text-gold" />
          <div className="text-sm font-semibold">Quick actions</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Quick label="Add affiliate link"    onClick={() => onJump("monetize")} />
          <Quick label="Seed 2026 highlights"  onClick={() => onJump("content")} />
          <Quick label="Add match video"       onClick={() => onJump("matches")} />
          <Quick label="Send a newsletter"     onClick={() => onJump("audience")} />
          <Quick label="Edit identity & legal" onClick={() => onJump("settings")} />
        </div>
      </section>
    </div>
  );
}

/* ---------- atoms ---------- */

function Kpi({
  label, value, Icon, tone, onClick,
}: {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  tone: Tone;
  onClick: () => void;
}) {
  const tones: Record<Tone, string> = {
    default: "bg-card border-border hover:border-foreground/30",
    warn:    "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/15",
    info:    "bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/15",
    good:    "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15",
  };
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-left transition ${tones[tone]}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest opacity-80">
        <Icon className="size-3" /> {label}
      </div>
      <div className="text-2xl sm:text-3xl font-extrabold tabular-nums mt-1">{value}</div>
    </button>
  );
}

function Status({
  label, ok, hint, onJump,
}: {
  label: string;
  ok: boolean;
  hint: string;
  onJump: () => void;
}) {
  return (
    <button
      onClick={onJump}
      className="rounded-2xl border border-border bg-card/40 p-3 text-left hover:bg-card transition"
    >
      <div className="flex items-center gap-2">
        {ok
          ? <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          : <AlertCircle  className="size-4 text-amber-400 shrink-0" />}
        <div className="text-sm font-semibold flex-1 truncate">{label}</div>
        <span className={`text-[9px] font-bold uppercase tracking-wider shrink-0 ${
          ok ? "text-emerald-400" : "text-amber-400"
        }`}>
          {ok ? "Configured" : "Action needed"}
        </span>
      </div>
      <div className="text-xs text-muted-foreground mt-1 truncate">{hint}</div>
    </button>
  );
}

function Quick({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:border-gray-700 transition"
    >
      {label}
    </button>
  );
}
