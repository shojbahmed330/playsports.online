import { Link } from "@tanstack/react-router";
import type { CricketMatch } from "@/lib/cricket.functions";

/**
 * LivePulseStrip — auto-scrolling marquee of currently live matches.
 * Duplicates content for seamless loop. Pauses on hover.
 */
export function LivePulseStrip({ matches }: { matches: CricketMatch[] }) {
  const live = matches.filter((m) => m.status === "in");
  if (live.length === 0) return null;

  // duplicate for seamless scroll
  const items = [...live, ...live];

  return (
    <div className="relative border-y border-red-500/20 bg-gradient-to-r from-red-950/40 via-rose-950/30 to-amber-950/30 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div className="flex items-center gap-3 py-2.5">
        <div className="shrink-0 pl-3 sm:pl-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-red-200">
          <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
          Live now
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-2 sm:gap-3 animate-[ticker_50s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap will-change-transform">
            {items.map((m, idx) => (
              <PulseItem key={`${m.id}-${idx}`} match={m} />
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function PulseItem({ match }: { match: CricketMatch }) {
  const home = match.home;
  const away = match.away;
  return (
    <Link
      to="/cricket/match/$id"
      params={{ id: match.id }}
      search={{ leagueId: match.leagueId }}
      className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 ring-1 ring-red-500/20 hover:ring-red-400/40 transition-all text-xs"
    >
      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-300/80">{match.leagueAbbr || match.leagueName?.slice(0, 4) || "—"}</span>
      <span className="font-semibold text-white">{home.abbr || home.shortName?.slice(0, 3)}</span>
      <span className="font-mono text-emerald-200/90">{home.scoreSummary || (home.totalRuns ? String(home.totalRuns) : "—")}</span>
      <span className="text-gray-500">vs</span>
      <span className="font-semibold text-white">{away.abbr || away.shortName?.slice(0, 3)}</span>
      <span className="font-mono text-emerald-200/90">{away.scoreSummary || (away.totalRuns ? String(away.totalRuns) : "—")}</span>
      <span className="text-[10px] text-red-300/90">· {match.shortDetail || "live"}</span>
    </Link>
  );
}
