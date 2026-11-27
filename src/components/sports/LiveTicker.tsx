import { Link } from "@tanstack/react-router";
import type { SportGame } from "@/lib/espn.functions";
import type { SportConfig } from "@/lib/sports-config";

type Item = { sport: SportConfig; game: SportGame };

/**
 * Sticky marquee bar of live games across every sport.
 * The second half is a visual clone for a seamless loop: it is hidden from
 * screen readers and removed from the tab order so nothing is announced or
 * focused twice.
 */
export function LiveTicker({ items }: { items: Item[] }) {
  if (items.length === 0) return null;
  // Only duplicate for a seamless marquee when there is enough content to
  // scroll. With 1–3 live games, duplicating just looks like repeated rows.
  const shouldLoop = items.length >= 4;
  const loop = shouldLoop ? [...items, ...items] : items;
  return (
    <div
      role="region"
      aria-label="Live scores ticker"
      className="relative overflow-hidden border-y border-live/20 bg-gradient-to-r from-live/10 via-background to-live/10"
    >
      <div className="flex items-center">
        <div className="z-10 flex shrink-0 items-center gap-1.5 bg-live px-3 py-2 text-micro font-extrabold uppercase text-live-foreground">
          <span className="size-1.5 rounded-full bg-live-foreground animate-pulse motion-reduce:animate-none" aria-hidden="true" />
          Live
        </div>
        <div
          className="ticker-track flex items-center gap-6 whitespace-nowrap py-1 pl-4"
          style={shouldLoop ? undefined : { animation: "none" }}
        >
          {loop.map(({ sport, game }, i) => {
            const clone = i >= items.length;
            return (
              <Link
                key={`${game.id}-${i}`}
                to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
                aria-hidden={clone || undefined}
                tabIndex={clone ? -1 : undefined}
                className={`group inline-flex min-h-11 items-center gap-2 text-caption focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${clone ? "motion-reduce:hidden" : ""}`}
              >
                <span className={`text-micro font-bold uppercase ${sport.accent}`}>
                  <span aria-hidden="true">{sport.emoji}</span> {sport.label}
                </span>
                <span className="text-muted-foreground">{game.away.abbr || game.away.shortName}</span>
                <span className="font-bold tabular-nums text-foreground">{game.away.score ?? 0}</span>
                <span className="text-muted-foreground" aria-hidden="true">·</span>
                <span className="font-bold tabular-nums text-foreground">{game.home.score ?? 0}</span>
                <span className="text-muted-foreground">{game.home.abbr || game.home.shortName}</span>
                <span className="ml-1 text-micro text-live">{game.shortDetail}</span>
                <span className="text-border" aria-hidden="true">|</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
