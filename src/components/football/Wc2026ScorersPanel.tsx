import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Loader2 } from "lucide-react";
import { getWc2026TopScorers } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";

export function Wc2026ScorersPanel() {
  const fn = useServerFn(getWc2026TopScorers);
  const q = useQuery({
    queryKey: ["wc2026", "scorers"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const scorers = q.data?.scorers ?? [];
  const max = Math.max(1, ...scorers.map((s) => s.goals));

  return (
    <section
      id="scorers"
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-gray-950 to-rose-950/30 p-5 sm:p-6"
    >
      <div aria-hidden className="absolute -top-12 -right-12 size-40 rounded-full bg-amber-500/10 blur-3xl" />
      <header className="relative mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-amber-500/20 ring-1 ring-amber-400/30">
            <Trophy className="size-4 text-amber-300" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.18em] text-amber-300">
              Golden Boot Race
            </h3>
            <p className="text-[11px] text-muted-foreground">Top scorers · World Cup 2026</p>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Updates · 60s</span>
      </header>

      {q.isLoading ? (
        <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading scorers…
        </div>
      ) : scorers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-xs text-muted-foreground">
          No goals scored yet — check back once matches begin.
        </div>
      ) : (
        <ol className="relative space-y-2">
          {scorers.slice(0, 10).map((s, i) => {
            const pct = Math.round((s.goals / max) * 100);
            const isLead = i === 0;
            return (
              <li
                key={s.playerId}
                className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 px-3 py-2.5 transition-all hover:bg-white/[0.08] hover:border-amber-400/30 animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Bar */}
                <div
                  aria-hidden
                  className={`absolute inset-y-0 left-0 transition-all ${
                    isLead
                      ? "bg-gradient-to-r from-amber-500/30 via-amber-400/15 to-transparent"
                      : "bg-gradient-to-r from-amber-500/15 to-transparent"
                  }`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center gap-3">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-extrabold tabular-nums ${
                      i === 0
                        ? "bg-amber-400 text-black"
                        : i === 1
                        ? "bg-zinc-300 text-black"
                        : i === 2
                        ? "bg-amber-700 text-white"
                        : "bg-white/10 text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xl leading-none shrink-0">{flagOf(s.team.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">{s.name}</div>
                    <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                      {s.team.name} · {s.team.code}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-extrabold tabular-nums text-amber-300">{s.goals}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Goals</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
