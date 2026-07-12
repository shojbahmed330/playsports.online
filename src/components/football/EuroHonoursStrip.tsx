import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { titleCounts } from "@/lib/competition-history";

const NATION_FLAG: Record<string, string> = {
  Spain: "🇪🇸",
  Germany: "🇩🇪",
  "West Germany": "🇩🇪",
  Italy: "🇮🇹",
  France: "🇫🇷",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Greece: "🇬🇷",
  Denmark: "🇩🇰",
  Czechoslovakia: "🇨🇿",
  "Soviet Union": "🇷🇺",
};

/** Horizontal chip rail of titles-per-nation across all Euro editions. */
export function EuroHonoursStrip() {
  const counts = titleCounts("euro");
  if (!counts.length) return null;
  return (
    <section id="honours" className="mt-8 sm:mt-10 scroll-mt-24">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <Trophy className="size-4" /> Honours by nation
      </h3>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {counts.map((c) => (
            <Link
              key={c.team}
              to="/football/$comp/history"
              params={{ comp: "euro" }}
              className="snap-start shrink-0 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] hover:border-amber-400/40 hover:bg-amber-500/10 px-3.5 py-2 tap-target"
            >
              <span className="text-base leading-none" aria-hidden>
                {NATION_FLAG[c.team] ?? "🏳️"}
              </span>
              <span className="text-sm font-bold">{c.team}</span>
              <span className="rounded-full bg-amber-500/15 text-amber-200 px-2 py-0.5 text-[11px] font-bold tabular-nums">
                ×{c.titles}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
