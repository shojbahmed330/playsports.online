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
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 sm:p-6"
    >
      <div aria-hidden="true" className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/10 blur-3xl" />
      <header className="relative mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
            <Trophy className="size-4 text-primary" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-micro uppercase text-primary">
              Golden Boot Race
            </h3>
            <p className="text-micro text-muted-foreground">Top scorers · World Cup 2026</p>
          </div>
        </div>
        <span className="text-micro uppercase text-muted-foreground">Updates · 60s</span>
      </header>

      {q.isLoading ? (
        <div className="flex items-center gap-2 py-6 text-caption text-muted-foreground" role="status">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Loading scorers…
        </div>
      ) : scorers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-caption text-muted-foreground">
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
                className="group relative overflow-hidden rounded-xl border border-border bg-muted/40 px-3 py-2.5 transition-colors animate-fade-in hover:border-primary/30 hover:bg-accent motion-reduce:animate-none"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Bar */}
                <div
                  aria-hidden="true"
                  className={`absolute inset-y-0 left-0 transition-all ${
                    isLead
                      ? "bg-gradient-to-r from-primary/30 via-primary/15 to-transparent"
                      : "bg-gradient-to-r from-primary/15 to-transparent"
                  }`}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center gap-3">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-lg text-micro font-extrabold tabular-nums ${
                      i === 0
                        ? "bg-gold text-gold-foreground"
                        : i === 1
                          ? "bg-muted-foreground text-background"
                          : i === 2
                            ? "bg-primary/80 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="shrink-0 text-xl leading-none" aria-hidden="true">{flagOf(s.team.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-caption font-semibold text-foreground">{s.name}</div>
                    <div className="truncate text-micro uppercase text-muted-foreground">
                      {s.team.name} · {s.team.code}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-extrabold tabular-nums text-primary">{s.goals}</div>
                    <div className="text-micro uppercase text-muted-foreground">Goals</div>
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
