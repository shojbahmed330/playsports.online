import { useMemo } from "react";
import { Sparkles, Trophy, Zap, Crown, Flame, Target } from "lucide-react";
import records from "@/data/wc_records.json";
import { flagOf } from "@/lib/flags";
import { useMergedGoals } from "@/lib/use-merged-goals";

const TOURNAMENT_TOTALS = (records as { tournamentTotals?: { year: number; goals: number; matches: number; note?: string }[] }).tournamentTotals ?? [];
const CURATED_2026 = (records as { curated2026?: { title: string; value: string; context: string }[] }).curated2026 ?? [];

export function RecordsPanel() {
  const { goals: GOALS } = useMergedGoals();

  const derived = useMemo(() => {
    // Per-player, per-year goal totals
    const m = new Map<string, { name: string; country: string; year: number; goals: number }>();
    for (const g of GOALS) {
      if (g.og) continue;
      const k = `${g.name}|${g.pteam}|${g.year}`;
      const ex = m.get(k);
      if (ex) ex.goals++;
      else m.set(k, { name: g.name, country: g.pteam, year: g.year, goals: 1 });
    }
    const arr = Array.from(m.values()).sort((a, b) => b.goals - a.goals);

    const topSingleYear = arr.slice(0, 10);
    const hatTrick = arr.filter((x) => x.goals >= 3).slice(0, 8);
    const goldenBoot2026 = arr.filter((x) => x.year === 2026).slice(0, 10);

    // Prefer deterministic tournamentTotals from records.json for the
    // "Highest-scoring tournaments" list — dataset-derived counts under-count
    // when we don't seed every single goal.
    const totals = [...TOURNAMENT_TOTALS].sort((a, b) => b.goals - a.goals).slice(0, 6);

    return { topSingleYear, hatTrick, goldenBoot2026, totals };
  }, [GOALS]);

  return (
    <div className="space-y-6">
      {/* WC 2026 highlights — rendered first */}
      <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-card/70 to-card/40 p-5">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Flame className="size-5 text-gold" />
            <h2 className="text-lg font-bold">World Cup 2026 — Live Records</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live · Updated Jul 12, 2026
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CURATED_2026.map((r) => (
            <div
              key={r.title}
              className="rounded-xl bg-background/80 border border-border p-4 hover:border-gold/60 transition-colors"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{r.title}</div>
              <div className="text-base font-extrabold text-gold leading-tight">{r.value}</div>
              <div className="text-xs text-muted-foreground mt-1.5">{r.context}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All-time iconic records */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-5 text-gold" />
          <h2 className="text-lg font-bold">Iconic World Cup Records (All-Time)</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {records.curated.map((r) => (
            <div
              key={r.title}
              className="rounded-xl bg-background border border-border p-4 hover:border-gold/40 transition-colors"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{r.title}</div>
              <div className="text-base font-extrabold text-gold leading-tight">{r.value}</div>
              <div className="text-xs text-muted-foreground mt-1.5">{r.context}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Golden Boot race + Highest-scoring tournaments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="size-4 text-gold" />
            <h3 className="font-bold">2026 Golden Boot race</h3>
            <span className="ml-auto inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          {derived.goldenBoot2026.length === 0 ? (
            <div className="text-xs text-muted-foreground py-4">
              No goals seeded yet. Check back once the tournament kicks off.
            </div>
          ) : (
            <ol className="divide-y divide-border">
              {derived.goldenBoot2026.map((p, i) => (
                <li key={i} className="flex items-center gap-3 py-2 text-sm">
                  <span className="w-6 text-muted-foreground font-semibold tabular-nums">{i + 1}</span>
                  <span className="text-base">{flagOf(p.country)}</span>
                  <span className="flex-1 truncate font-medium">{p.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{p.country}</span>
                  <span className="text-gold font-bold tabular-nums w-8 text-right">{p.goals}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="size-4 text-gold" />
            <h3 className="font-bold">Highest-scoring tournaments</h3>
          </div>
          <ol className="divide-y divide-border">
            {derived.totals.map((t, i) => (
              <li key={t.year} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-6 text-muted-foreground font-semibold tabular-nums">{i + 1}</span>
                <span className="flex-1 font-medium tabular-nums flex items-center gap-2">
                  {t.year} World Cup
                  {t.year === 2026 && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">{t.matches} matches</span>
                <span className="text-gold font-bold tabular-nums w-16 text-right">{t.goals} goals</span>
              </li>
            ))}
          </ol>
          <p className="text-[10px] text-muted-foreground mt-3">
            Totals do not include shoot-out goals. 2026 figure updates as the tournament progresses.
          </p>
        </div>
      </div>

      {/* Top single-tournament hauls */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-4 text-gold" />
          <h3 className="font-bold">Top single-tournament hauls (all-time)</h3>
        </div>
        <ol className="divide-y divide-border">
          {derived.topSingleYear.map((p, i) => (
            <li key={i} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-6 text-muted-foreground font-semibold tabular-nums">{i + 1}</span>
              <span className="text-base">{flagOf(p.country)}</span>
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1">
                {p.year}
                {p.year === 2026 && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                )}
              </span>
              <span className="text-gold font-bold tabular-nums w-8 text-right">{p.goals}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Hat-trick heroes */}
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
              <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                {p.year}
                {p.year === 2026 && <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </div>
              <div className="text-gold font-bold tabular-nums">{p.goals} ⚽</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
