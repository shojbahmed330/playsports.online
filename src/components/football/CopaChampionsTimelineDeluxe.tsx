import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { championsTimeline } from "@/lib/competition-history";
import { getCopaEditions, copaFlag } from "@/lib/copa-history";

/** Horizontal spine timeline of every Copa América champion. */
export function CopaChampionsTimelineDeluxe() {
  const timeline = championsTimeline("copa-america");
  const editionsById = new Map(getCopaEditions().map((e) => [e.year, e]));
  const [openYear, setOpenYear] = useState<number | null>(null);

  return (
    <section className="mt-10 scroll-mt-32" id="champions-timeline">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
          Champions timeline
        </h2>
        <span className="text-[11px] text-muted-foreground">
          {timeline.length} editions
        </span>
      </div>

      <div className="edge-fade-x -mx-4 sm:mx-0">
        <div className="relative overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[38px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <ol className="relative flex gap-4 sm:gap-6 pb-4 pt-1">
            {timeline.map((c) => {
              const edition = editionsById.get(c.year);
              const active = openYear === c.year;
              return (
                <li key={c.year} className="snap-start shrink-0 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setOpenYear((v) => (v === c.year ? null : c.year))}
                    aria-expanded={active}
                    className={`tap-target relative grid place-items-center size-[52px] rounded-full text-xl transition ring-1 ${
                      active
                        ? "bg-amber-500/30 ring-amber-300/60 shadow-lg shadow-amber-500/20"
                        : "bg-white/[0.05] ring-white/10 hover:bg-white/[0.1]"
                    }`}
                    aria-label={`${c.year} · ${c.winner}`}
                  >
                    <span aria-hidden>{copaFlag(c.winner)}</span>
                  </button>
                  <div className="mt-2 text-center">
                    <div className="text-xs font-black tabular-nums">{c.year}</div>
                    <div className="text-[10px] text-muted-foreground w-[76px] truncate">{c.winner}</div>
                  </div>
                  {active && edition && (
                    <div className="absolute z-20 mt-[132px] w-[240px] rounded-2xl border border-white/15 bg-gray-950/95 backdrop-blur p-3 shadow-2xl text-left">
                      <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                        Copa {edition.year} · {edition.host}
                      </div>
                      <div className="mt-1 text-sm font-bold">
                        {edition.winner}{" "}
                        <span className="text-muted-foreground font-medium">
                          {edition.finalScore ?? ""} {edition.runnerUp ?? ""}
                        </span>
                      </div>
                      {edition.finalVenue && (
                        <div className="text-[11px] text-muted-foreground mt-0.5">{edition.finalVenue}</div>
                      )}
                      {edition.topScorer && (
                        <div className="text-[11px] text-muted-foreground mt-1">
                          Top: <span className="text-foreground font-semibold">{edition.topScorer.name}</span> · {edition.topScorer.goals}g
                        </div>
                      )}
                      <Link
                        to="/football/$comp/history/$year"
                        params={{ comp: "copa-america", year: String(edition.year) }}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-200 hover:text-amber-100"
                      >
                        Full recap <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
