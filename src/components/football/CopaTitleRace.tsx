import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { titleCounts } from "@/lib/competition-history";
import { copaFlag } from "@/lib/copa-history";

/** Animated horizontal bar chart of Copa title counts. */
export function CopaTitleRace() {
  const counts = titleCounts("copa-america");
  if (!counts.length) return null;
  const max = counts[0].titles;

  return (
    <section className="mt-8 scroll-mt-32" id="title-race">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
          <Trophy className="size-4 text-amber-300" /> Title race
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {counts.length} champions since 1916
        </span>
      </div>
      <ul className="space-y-2">
        {counts.map((c, i) => {
          const pct = Math.max(6, Math.round((c.titles / max) * 100));
          const highlight = i < 5;
          const leader = i === 0;
          return (
            <li
              key={c.team}
              className={`rounded-2xl border p-3 ${leader ? "border-amber-400/40 bg-amber-500/[0.06] ring-1 ring-amber-400/30" : "border-white/10 bg-white/[0.03]"}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span aria-hidden className="text-lg shrink-0">{copaFlag(c.team)}</span>
                <span className="font-bold text-sm sm:text-base truncate min-w-0 flex-1">{c.team}</span>
                <span className="shrink-0 rounded-full bg-amber-500/15 text-amber-200 px-2 py-0.5 text-[11px] font-bold tabular-nums">
                  ×{c.titles}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-[width] duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {highlight && c.years.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.years.slice(-12).map((y) => (
                    <Link
                      key={y}
                      to="/football/$comp/history/$year"
                      params={{ comp: "copa-america", year: String(y) }}
                      className="tap-target inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-white/20"
                    >
                      {y}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
