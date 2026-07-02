import { Activity } from "lucide-react";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

// Lightweight momentum proxy from live minute + score progression.
// (Real xG isn't in the free ESPN feed; we render a shot/goal placeholder bar.)
export function MomentumChart({ fx }: { fx: Wc2026Fixture }) {
  if (fx.status !== "inprogress" && fx.status !== "finished") return null;
  const total = (fx.home.goals ?? 0) + (fx.away.goals ?? 0);
  if (total === 0 && fx.status === "finished") return null;
  const homePct = total > 0 ? Math.round(((fx.home.goals ?? 0) / total) * 100) : 50;
  const awayPct = 100 - homePct;

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="size-4 text-rose-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-rose-200">Momentum</h2>
        {fx.minute && <span className="ml-auto text-[10px] text-gray-500 tabular-nums">{fx.minute}'</span>}
      </div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-bold text-emerald-300 truncate">{fx.home.code || fx.home.name}</span>
        <span className="font-bold text-sky-300 truncate">{fx.away.code || fx.away.name}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex bg-black/40 ring-1 ring-white/10">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${homePct}%` }} />
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500" style={{ width: `${awayPct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 tabular-nums">
        <span>{homePct}%</span>
        <span>share of goals</span>
        <span>{awayPct}%</span>
      </div>
    </section>
  );
}
