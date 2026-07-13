import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { getCopaEditions, copaFlag } from "@/lib/copa-history";

/** Snap-rail of the most recent Copa finals with score + venue. */
export function CopaPastFinalsStrip() {
  const rows = getCopaEditions()
    .filter((e) => e.winner && e.winner !== "TBD")
    .sort((a, b) => b.year - a.year)
    .slice(0, 6);
  if (!rows.length) return null;

  return (
    <section id="finals" className="mt-8 sm:mt-10 scroll-mt-24">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Trophy className="size-4" /> Recent finals
      </h3>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {rows.map((e) => (
            <Link
              key={e.year}
              to="/football/$comp/history/$year"
              params={{ comp: "copa-america", year: String(e.year) }}
              className="snap-start shrink-0 w-[78vw] max-w-[320px] sm:w-[280px] rounded-2xl border border-white/10 bg-white/[0.04] hover:border-amber-400/40 hover:bg-amber-500/[0.06] transition p-3"
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-widest text-amber-300 font-bold">
                  Copa {e.year}
                </div>
                {e.host && (
                  <div className="text-[10px] text-muted-foreground truncate">host · {e.host}</div>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm font-bold">
                <span aria-hidden className="shrink-0">
                  {copaFlag(e.winner)}
                </span>
                <span className="truncate">{e.winner}</span>
                <span className="text-muted-foreground shrink-0">
                  {e.finalScore ?? "beat"}
                </span>
                <span className="truncate">{e.runnerUp}</span>
                <span aria-hidden className="shrink-0">
                  {copaFlag(e.runnerUp)}
                </span>
              </div>
              {e.finalVenue && (
                <div className="mt-1 text-[11px] text-muted-foreground truncate">
                  {e.finalVenue}
                </div>
              )}
              {(e.winningCaptain || e.winningCoach) && (
                <div className="mt-1 text-[11px] text-muted-foreground truncate">
                  {e.winningCaptain && <>© {e.winningCaptain}</>}
                  {e.winningCoach && <> · coach {e.winningCoach}</>}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
