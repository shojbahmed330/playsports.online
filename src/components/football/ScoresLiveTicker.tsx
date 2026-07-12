import type { SportGame } from "@/lib/espn.functions";
import { flagOf } from "@/lib/flags";
import { Link } from "@tanstack/react-router";

/**
 * Horizontal live ticker rail — only rendered when there are matches
 * currently in-progress. Uses country flags for immediate readability.
 */
export function ScoresLiveTicker({
  games,
  compSlug,
}: {
  games: SportGame[];
  compSlug: string;
}) {
  if (games.length === 0) return null;
  return (
    <div className="-mx-4 sm:mx-0 mb-4 border-y border-red-500/30 bg-red-500/[0.06]">
      <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-300">
          <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
          Live
        </span>
        {games.map((g) => (
          <Link
            key={g.id}
            to="/football/$comp/matches/$matchId"
            params={{ comp: compSlug, matchId: g.id }}
            className="snap-start shrink-0 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-background/60 px-3 py-1 text-xs whitespace-nowrap hover:border-red-400/60 transition"
          >
            <span className="text-[10px] font-bold text-red-300 tabular-nums">
              {g.shortDetail || "LIVE"}
            </span>
            <span className="text-sm">{flagOf(g.home.name)}</span>
            <span className="font-bold tabular-nums">
              {g.home.score ?? 0}–{g.away.score ?? 0}
            </span>
            <span className="text-sm">{flagOf(g.away.name)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
