import { Link } from "@tanstack/react-router";
import type { Competition } from "@/lib/competitions";
import { championsTimeline, titleCounts } from "@/lib/competition-history";
import { Trophy } from "lucide-react";

/**
 * Champions strip: horizontal timeline of the most recent champions plus
 * a title-count summary. Links each edition into `/history/$year`.
 */
export function ChampionsTimelineWidget({ comp }: { comp: Competition }) {
  const timeline = championsTimeline(comp.slug);
  const counts = titleCounts(comp.slug).slice(0, 5);
  if (timeline.length === 0) return null;
  const recent = timeline.slice(-8).reverse();

  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Trophy className="size-4" /> Champions
      </h3>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        {counts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {counts.map((c) => (
              <span
                key={c.team}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs"
              >
                <span className="font-semibold">{c.team}</span>
                <span className="tabular-nums text-muted-foreground">×{c.titles}</span>
              </span>
            ))}
          </div>
        )}
        <div className="edge-fade-x -mx-4 sm:mx-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
            {recent.map((r) => (
              <Link
                key={r.year}
                to="/football/$comp/history/$year"
                params={{ comp: comp.slug, year: String(r.year) }}
                className="snap-start shrink-0 rounded-xl border border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07] px-3 py-2 min-w-[120px] text-left"
              >
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {r.year}
                </div>
                <div className="text-sm font-bold truncate">{r.winner}</div>
                {r.finalScore && (
                  <div className="text-[11px] text-muted-foreground">{r.finalScore}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
