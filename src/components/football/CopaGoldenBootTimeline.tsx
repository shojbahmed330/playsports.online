import { Link } from "@tanstack/react-router";
import { Goal } from "lucide-react";
import { getCopaEditions } from "@/lib/copa-history";

/** Horizontal timeline of top scorer per Copa edition, newest first. */
export function CopaGoldenBootTimeline() {
  const rows = getCopaEditions()
    .filter((e) => e.topScorer && e.winner !== "TBD")
    .sort((a, b) => b.year - a.year);
  if (!rows.length) return null;

  return (
    <section id="golden-boot" className="mt-8 sm:mt-10 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Goal className="size-4" /> Top scorer by edition
        </h3>
        <Link
          to="/football/$comp/history"
          params={{ comp: "copa-america" }}
          className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
        >
          Full archive →
        </Link>
      </div>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {rows.map((r) => (
            <Link
              key={r.year}
              to="/football/$comp/history/$year"
              params={{ comp: "copa-america", year: String(r.year) }}
              className="snap-start shrink-0 w-[180px] rounded-2xl border border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07] p-3"
            >
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Copa {r.year}
              </div>
              <div className="mt-1 text-sm font-bold leading-tight line-clamp-2">
                {r.topScorer!.name}
              </div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-200 px-2 py-0.5 text-[11px] font-bold tabular-nums">
                {r.topScorer!.goals} goals
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
