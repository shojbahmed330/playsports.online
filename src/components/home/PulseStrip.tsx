import { Link } from "@tanstack/react-router";
import type { SportGame } from "@/lib/espn.functions";
import type { SportConfig } from "@/lib/sports-config";
import { ScoreFlip } from "@/components/sports/ScoreFlip";

type Tagged = { sport: SportConfig; game: SportGame };

export function PulseStrip({ items }: { items: Tagged[] }) {
  if (items.length === 0) return null;
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-micro uppercase text-live">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-live/70 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-live" />
            </span>
            Pulse · {items.length} live
          </div>
          <span className="text-micro text-muted-foreground">auto-refreshing</span>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] sm:overflow-visible sm:px-0">
          {items.map(({ sport, game }) => (
            <Link
              key={`${sport.slug}-${game.id}`}
              to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
              className={`w-[260px] shrink-0 snap-start rounded-xl bg-card p-3 ring-1 transition-all hover:-translate-y-0.5 hover:ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto ${sport.ring}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`text-micro uppercase ${sport.accent}`}>
                  <span aria-hidden="true">{sport.emoji}</span> {sport.label}
                </span>
                <span className="inline-flex items-center gap-1 text-micro font-bold text-live">
                  <span className="size-1 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" />
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
    <div className="flex min-h-8 items-center gap-2">
      {team.logo ? (
        <img
          loading="lazy"
          decoding="async"
          src={team.logo}
          alt=""
          className="size-5 shrink-0 object-contain"
        />
      ) : (
        <span className="size-5 shrink-0 rounded bg-muted" aria-hidden="true" />
      )}
      <span className="flex-1 truncate text-caption font-semibold text-foreground">
        {team.shortName || team.name}
      </span>
      <span className="text-body font-black tabular-nums text-primary">
        <ScoreFlip value={team.score} />
      </span>
    </div>
  );
}
