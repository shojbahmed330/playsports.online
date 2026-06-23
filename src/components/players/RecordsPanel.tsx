import { useMemo } from "react";
import { Sparkles, Trophy, Zap, Crown } from "lucide-react";
import records from "@/data/wc_records.json";
import { flagOf } from "@/lib/flags";
import { useMergedGoals } from "@/lib/use-merged-goals";

export function RecordsPanel() {
  const { goals: GOALS } = useMergedGoals();
  const derived = useMemo(() => {
    // Most goals in a single year per player (across our dataset)
    const m = new Map<string, { name: string; country: string; year: number; goals: number }>();
    for (const g of GOALS) {
      if (g.og) continue;
      const k = `${g.name}|${g.pteam}|${g.year}`;
      const ex = m.get(k);
      if (ex) ex.goals++;
      else m.set(k, { name: g.name, country: g.pteam, year: g.year, goals: 1 });
    }
    const arr = Array.from(m.values()).sort((a, b) => b.goals - a.goals);

    // Most prolific tournaments (most goals scored total in a single tournament)
    const yearTotals = new Map<number, number>();
    for (const g of GOALS) {
      if (g.og) continue;
      yearTotals.set(g.year, (yearTotals.get(g.year) ?? 0) + 1);
    }
    const topYears = Array.from(yearTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Hat-trick heroes
    const hatTrick = arr.filter((x) => x.goals >= 3).slice(0, 8);

    return { topSingleYear: arr.slice(0, 8), topYears, hatTrick };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-5 text-gold" />
          <h2 className="text-lg font-bold">Iconic World Cup Records</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {records.curated.map((r) => (
            <div
              key={r.title}
              className="rounded-xl bg-background border border-border p-4 hover:border-gold/40 transition-colors"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                {r.title}
              </div>
              <div className="text-base font-extrabold text-gold leading-tight">
                {r.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {r.context}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="size-4 text-gold" />
            <h3 className="font-bold">Top single-tournament hauls (in dataset)</h3>
          </div>
          <ol className="divide-y divide-border">
            {derived.topSingleYear.map((p, i) => (
              <li key={i} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-6 text-muted-foreground font-semibold tabular-nums">
                  {i + 1}
                </span>
                <span className="text-base">{flagOf(p.country)}</span>
                <span className="flex-1 truncate font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{p.year}</span>
                <span className="text-gold font-bold tabular-nums w-8 text-right">
                  {p.goals}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="size-4 text-gold" />
            <h3 className="font-bold">Highest-scoring tournaments</h3>
          </div>
          <ol className="divide-y divide-border">
            {derived.topYears.map(([y, n], i) => (
              <li key={y} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-6 text-muted-foreground font-semibold tabular-nums">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium tabular-nums">{y} World Cup</span>
                <span className="text-gold font-bold tabular-nums">{n} goals</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="size-4 text-gold" />
          <h3 className="font-bold">Hat-trick heroes</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {derived.hatTrick.map((p, i) => (
            <div
              key={i}
              className="rounded-lg bg-background border border-border p-3 text-center"
            >
              <div className="text-2xl">{flagOf(p.country)}</div>
              <div className="text-sm font-semibold truncate mt-1">{p.name}</div>
              <div className="text-[11px] text-muted-foreground">{p.year}</div>
              <div className="text-gold font-bold tabular-nums">{p.goals} ⚽</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
