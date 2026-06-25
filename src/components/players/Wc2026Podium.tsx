import { useMemo } from "react";
import { Trophy, Flame } from "lucide-react";
import { flagOf } from "@/lib/flags";
import { useMergedGoals } from "@/lib/use-merged-goals";

/**
 * Live 2026 Golden Boot Race — animated podium for the top 3 active scorers,
 * with a flowing race rail for the next 4–10. Pure visual polish, fed by the
 * same merged-goals query used elsewhere on /players (no extra fetch).
 */
export function Wc2026Podium({
  onPick,
}: {
  onPick?: (name: string, country: string) => void;
}) {
  const { live2026Goals } = useMergedGoals();

  const ranked = useMemo(() => {
    const m = new Map<string, { name: string; country: string; goals: number }>();
    for (const g of live2026Goals) {
      const k = `${g.name}|${g.pteam}`;
      const ex = m.get(k);
      if (ex) ex.goals++;
      else m.set(k, { name: g.name, country: g.pteam, goals: 1 });
    }
    return Array.from(m.values()).sort((a, b) => b.goals - a.goals);
  }, [live2026Goals]);

  if (ranked.length === 0) return null;

  const top = ranked[0]!.goals;
  const podium = ranked.slice(0, 3);
  const chase = ranked.slice(3, 10);

  // Podium visual order: silver (left), gold (center), bronze (right).
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean) as typeof podium;
  const ranks = [2, 1, 3];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-transparent p-5">
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: "radial-gradient(60% 90% at 50% 0%, oklch(0.78 0.18 75 / 0.25), transparent 60%)" }} />
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="size-8 grid place-items-center rounded-full bg-amber-500/20 ring-1 ring-amber-400/40">
            <Trophy className="size-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Golden Boot 2026 — Live Race</h3>
            <div className="text-[10px] uppercase tracking-widest text-emerald-300 inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Updating live
            </div>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {ranked.length} scorers
        </span>
      </div>

      {/* Podium */}
      <div className="relative grid grid-cols-3 gap-2 sm:gap-4 items-end mb-4">
        {podiumOrder.map((p, i) => {
          const rank = ranks[i]!;
          const height = rank === 1 ? "h-28 sm:h-36" : rank === 2 ? "h-20 sm:h-28" : "h-16 sm:h-24";
          const tone =
            rank === 1
              ? "from-amber-400 to-yellow-500 shadow-[0_0_40px_-8px_rgba(245,158,11,0.7)]"
              : rank === 2
              ? "from-zinc-300 to-zinc-500"
              : "from-orange-600 to-amber-800";
          const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

          return (
            <button
              key={p.name + p.country}
              onClick={() => onPick?.(p.name, p.country)}
              className="group flex flex-col items-center text-center focus:outline-none"
            >
              <div className="text-2xl sm:text-3xl mb-1 animate-fade-in">{flagOf(p.country)}</div>
              <div className="text-[11px] sm:text-xs font-bold truncate max-w-full px-1 group-hover:text-amber-300 transition-colors">
                {p.name}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground truncate max-w-full">
                {p.country}
              </div>
              <div className={`mt-1.5 w-full rounded-t-lg bg-gradient-to-b ${tone} ${height} relative transition-transform group-hover:-translate-y-0.5`}>
                <div className="absolute inset-x-0 top-1.5 text-center">
                  <span className="text-xl sm:text-2xl">{medal}</span>
                </div>
                <div className="absolute inset-x-0 bottom-1 text-center text-black/90 font-extrabold tabular-nums text-lg sm:text-2xl">
                  {p.goals}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chase rail */}
      {chase.length > 0 && (
        <div className="space-y-1.5 pt-3 border-t border-white/5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-1">
            <Flame className="size-3 text-rose-400" /> Chasers
          </div>
          {chase.map((p, i) => {
            const pct = Math.max(8, Math.round((p.goals / top) * 100));
            return (
              <button
                key={p.name + p.country}
                onClick={() => onPick?.(p.name, p.country)}
                className="w-full group block text-left"
              >
                <div className="flex items-center gap-2 text-[11px] mb-0.5">
                  <span className="w-4 text-muted-foreground tabular-nums">{i + 4}</span>
                  <span className="text-base leading-none">{flagOf(p.country)}</span>
                  <span className="font-semibold truncate flex-1 group-hover:text-amber-300 transition-colors">
                    {p.name}
                  </span>
                  <span className="text-gold font-bold tabular-nums">{p.goals}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden ml-6">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
