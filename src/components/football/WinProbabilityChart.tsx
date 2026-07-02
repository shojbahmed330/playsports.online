import { LineChart } from "lucide-react";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

// Lightweight win-probability proxy from live minute + score.
// This is not xG-based (ESPN free feed omits shots); it's a monotonic model
// that shifts sharply on goals and drifts as time runs out.
function probFor(minute: number, goalDiff: number): { home: number; draw: number; away: number } {
  const m = Math.max(0, Math.min(120, minute));
  // Time factor: 0 at kickoff, 1 at full-time — collapses the draw share.
  const t = m / 95;
  const drawBase = 0.35 * (1 - t);
  // Score factor: each goal ≈ 25% swing, saturating with tanh.
  const swing = Math.tanh(goalDiff * 0.65 * (0.5 + t));
  const home = Math.max(0.02, (1 - drawBase) * (0.5 + swing / 2));
  const away = Math.max(0.02, (1 - drawBase) * (0.5 - swing / 2));
  const draw = Math.max(0.01, 1 - home - away);
  const total = home + draw + away;
  return { home: home / total, draw: draw / total, away: away / total };
}

export function WinProbabilityChart({ fx }: { fx: Wc2026Fixture }) {
  if (fx.status === "notstarted") return null;
  const minute = fx.minute ?? (fx.status === "finished" ? 90 : 0);
  const diff = (fx.home.goals ?? 0) - (fx.away.goals ?? 0);
  const p = probFor(minute, diff);
  const pct = (n: number) => Math.round(n * 100);

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <LineChart className="size-4 text-amber-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Win Probability</h2>
        <span className="ml-auto text-[10px] text-gray-500 tabular-nums">
          {fx.status === "finished" ? "Final" : `${minute}'`}
        </span>
      </div>

      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
        <span className="text-emerald-300">{fx.home.code || fx.home.name} · {pct(p.home)}%</span>
        <span className="text-gray-400">Draw · {pct(p.draw)}%</span>
        <span className="text-sky-300">{fx.away.code || fx.away.name} · {pct(p.away)}%</span>
      </div>

      <div className="h-3 rounded-full overflow-hidden flex bg-black/40 ring-1 ring-white/10">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500" style={{ width: `${pct(p.home)}%` }} />
        <div className="bg-gray-600/70 transition-all duration-500" style={{ width: `${pct(p.draw)}%` }} />
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500" style={{ width: `${pct(p.away)}%` }} />
      </div>

      <p className="mt-2 text-[10px] text-gray-500 leading-snug">
        Estimated from live scoreline and remaining minutes. Not a betting projection.
      </p>
    </section>
  );
}
