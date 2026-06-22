import type { SportGame } from "@/lib/espn.functions";
import type { SportConfig } from "@/lib/sports-config";

type Item = { sport: SportConfig; game: SportGame };

/**
 * Sticky marquee bar of live games across every sport.
 * Uses a CSS keyframe (defined in styles.css) and duplicates content so
 * the loop appears seamless. Pauses on hover.
 */
export function LiveTicker({ items }: { items: Item[] }) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-red-500/20 bg-gradient-to-r from-red-950/40 via-gray-950 to-red-950/40">
      <div className="flex items-center">
        <div className="shrink-0 z-10 px-3 py-1.5 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-white animate-pulse" /> Live
        </div>
        <div className="ticker-track flex items-center gap-6 py-1.5 pl-4 whitespace-nowrap">
          {loop.map(({ sport, game }, i) => (
            <a
              key={`${game.id}-${i}`}
              href={`/${sport.slug}`}
              className="group inline-flex items-center gap-2 text-xs"
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${sport.accent}`}>
                {sport.emoji} {sport.label}
              </span>
              <span className="text-gray-400">{game.away.abbr || game.away.shortName}</span>
              <span className="font-bold text-white tabular-nums">{game.away.score ?? 0}</span>
              <span className="text-gray-600">·</span>
              <span className="font-bold text-white tabular-nums">{game.home.score ?? 0}</span>
              <span className="text-gray-400">{game.home.abbr || game.home.shortName}</span>
              <span className="text-[10px] text-red-300 ml-1">{game.shortDetail}</span>
              <span className="text-gray-800">|</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
