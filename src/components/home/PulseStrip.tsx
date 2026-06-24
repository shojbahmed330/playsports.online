import { Link } from "@tanstack/react-router";
import type { SportGame } from "@/lib/espn.functions";
import type { SportConfig } from "@/lib/sports-config";
import { ScoreFlip } from "@/components/sports/ScoreFlip";

type Tagged = { sport: SportConfig; game: SportGame };

export function PulseStrip({ items }: { items: Tagged[] }) {
  if (items.length === 0) return null;
  return (
    <section className="border-b border-border bg-gradient-to-r from-red-950/30 via-gray-950 to-orange-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-red-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/70" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            Pulse · {items.length} live
          </div>
          <span className="text-[10px] text-gray-500">auto-refreshing</span>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-4 px-4 pb-1">
          {items.map(({ sport, game }) => (
            <Link
              key={`${sport.slug}-${game.id}`}
              to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
              className={`snap-start shrink-0 w-[260px] sm:w-[280px] rounded-xl bg-gray-900/80 ring-1 ${sport.ring} hover:ring-2 transition-all p-3 hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] uppercase tracking-wider font-bold ${sport.accent}`}>
                  {sport.emoji} {sport.label}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-300">
                  <span className="size-1 rounded-full bg-red-500 animate-pulse" />
                  {game.shortDetail || "LIVE"}
                </span>
              </div>
              <Row team={game.away} />
              <Row team={game.home} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ team }: { team: SportGame["home"] }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {team.logo ? (
        <img src={team.logo} alt="" className="size-5 shrink-0 object-contain" />
      ) : (
        <span className="size-5 shrink-0 rounded bg-gray-800" />
      )}
      <span className="flex-1 truncate text-sm font-semibold">{team.shortName || team.name}</span>
      <span className="text-base font-black text-amber-400 tabular-nums">
        <ScoreFlip value={team.score} />
      </span>
    </div>
  );
}
