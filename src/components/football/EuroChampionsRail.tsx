import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { euroChampionNations } from "@/lib/euro-teams";

/** Horizontal snap-rail: every Euro-winning nation, most titles first. */
export function EuroChampionsRail() {
  const rows = euroChampionNations();
  if (!rows.length) return null;
  return (
    <section id="champions" className="mt-8 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
          <Trophy className="size-4 text-amber-300" /> Champion nations
        </h2>
        <Link
          to="/football/$comp/records/$category"
          params={{ comp: "euro", category: "most-titles" }}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Full title table →
        </Link>
      </div>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <ul className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {rows.map((c) => (
            <li key={c.team} className="snap-start shrink-0 w-[180px]">
              <Link
                to="/football/$comp/history/$year"
                params={{ comp: "euro", year: String(c.years[c.years.length - 1]) }}
                className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-300/40 hover:bg-amber-500/[0.06] transition p-3"
              >
                <div className="text-2xl leading-none" aria-hidden>{c.flag}</div>
                <div className="mt-2 text-sm font-bold truncate">{c.team}</div>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-200 px-2 py-0.5 text-[11px] font-bold">
                  ×{c.titles} title{c.titles === 1 ? "" : "s"}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground tabular-nums truncate">
                  {c.years.join(", ")}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
