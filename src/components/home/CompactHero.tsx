import { Link } from "@tanstack/react-router";
import { Flame, ArrowRight, MapPin } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import type { SportGame } from "@/lib/espn.functions";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { Countdown } from "@/components/sports/Countdown";
import { LocalTime } from "@/components/ui/local-time";

type Tagged = { sport: SportConfig; game: SportGame };

/**
 * Compact, single-feature hero: picks the most important match right now.
 * Priority: live ESPN match → live World Cup match → upcoming ESPN → upcoming World Cup.
 * The site is now-first: never lead with an empty/archived tournament.
 */
export function CompactHero({
  liveGames,
  upcomingGames,
  wcFeatured,
}: {
  liveGames: Tagged[];
  upcomingGames: Tagged[];
  wcFeatured: Wc2026Fixture | null;
}) {
  const live = liveGames[0];
  if (live) return <EspnHero t={live} live />;
  if (wcFeatured && wcFeatured.status === "inprogress") {
    return <WcHero f={wcFeatured} live />;
  }
  const next = upcomingGames[0];
  if (next) return <EspnHero t={next} live={false} />;
  if (wcFeatured && wcFeatured.status === "notstarted") {
    return <WcHero f={wcFeatured} live={false} />;
  }
  return <EmptyHero />;
}

function WcHero({ f, live }: { f: Wc2026Fixture; live: boolean }) {
  const startMs = f.startTs * 1000;
  const deepLink = f.id > 0;
  return (
    <section className="relative overflow-hidden border-b border-border bg-[image:var(--gradient-hero)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, var(--primary), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="sr-only">
          {live ? "Live" : "Up next"}: {f.home.name} vs {f.away.name} — FIFA World Cup 2026{" "}
          {f.group ?? ""}
        </h1>
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-micro uppercase text-primary">
            {live ? (
              <>
                <span className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none" />
                <span>Live</span>
              </>
            ) : (
              <span>Up next</span>
            )}
            <span className="text-muted-foreground">· {f.group}</span>
          </span>
          <span className="text-micro font-bold uppercase text-muted-foreground">
            FIFA WC 2026
          </span>
        </div>

        {deepLink ? (
          <Link
            to="/football/match/$id"
            params={{ id: String(f.id) }}
            className="group -mx-2 block rounded-xl px-2 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Open ${f.home.name} v ${f.away.name}`}
          >
            <HeroScoreBoard f={f} live={live} startMs={startMs} />
          </Link>
        ) : (
          <HeroScoreBoard f={f} live={live} startMs={startMs} />
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
            {f.venue && (
              <>
                <MapPin className="size-3 shrink-0" aria-hidden="true" />{" "}
                <span className="truncate">
                  {f.venue}
                  {f.city ? `, ${f.city}` : ""}
                </span>
              </>
            )}
          </span>
          <div className="flex items-center gap-2">
            {!live && f.status !== "finished" && (
              <span className="text-foreground">
                <LocalTime ts={startMs} mode="day" /> · <Countdown ts={startMs} />
              </span>
            )}
            {deepLink ? (
              <Link
                to="/football/match/$id"
                params={{ id: String(f.id) }}
                className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-caption font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Match centre <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            ) : (
              <Link
                to="/football"
                search={{ year: 2026 }}
                className="inline-flex min-h-11 items-center gap-1 rounded-full bg-primary px-4 text-caption font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Details <ArrowRight className="size-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroScoreBoard({
  f,
  live,
  startMs,
}: {
  f: Wc2026Fixture;
  live: boolean;
  startMs: number;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="shrink-0 text-3xl sm:text-5xl" aria-hidden="true">
          {flagOf(f.home.name)}
        </span>
        <span className="truncate text-sm font-extrabold text-foreground sm:text-xl">
          {f.home.name}
        </span>
      </div>
      <div className="whitespace-nowrap text-3xl font-black tabular-nums text-primary sm:text-5xl">
        {live || f.status === "finished" ? (
          <>
            {f.home.goals ?? 0}{" "}
            <span className="text-muted-foreground">:</span> {f.away.goals ?? 0}
          </>
        ) : (
          <span className="text-base text-primary/80 sm:text-lg">
            <LocalTime ts={startMs} />
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
        <span className="truncate text-right text-sm font-extrabold text-foreground sm:text-xl">
          {f.away.name}
        </span>
        <span className="shrink-0 text-3xl sm:text-5xl" aria-hidden="true">
          {flagOf(f.away.name)}
        </span>
      </div>
    </div>
  );
}

function EspnHero({ t, live }: { t: Tagged; live: boolean }) {
  const { sport, game } = t;
  const startMs = game.startTs * 1000;
  return (
    <section
      className={`relative overflow-hidden border-b border-border bg-gradient-to-br ${sport.bgGrad}`}
    >
      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="sr-only">
          {live ? "Live" : "Up next"}: {game.home.name} vs {game.away.name} — {sport.longName}
        </h1>
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-micro uppercase ${sport.accent}`}
          >
            {live ? (
              <>
                <span className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none" />
                <span>Live</span>
              </>
            ) : (
              <span>Up next</span>
            )}
          </span>
          <span className={`text-micro font-bold uppercase ${sport.accent}`}>
            {sport.emoji} {sport.label}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {game.home.logo && (
              <img
                src={game.home.logo}
                alt=""
                width={48}
                height={48}
                loading="eager"
                className="size-10 shrink-0 object-contain sm:size-14"
                decoding="async"
              />
            )}
            <span className="truncate text-sm font-extrabold text-foreground sm:text-xl">
              {game.home.name}
            </span>
          </div>
          <div
            className={`whitespace-nowrap text-3xl font-black tabular-nums ${sport.accent} sm:text-5xl`}
          >
            {live || game.status === "post" ? (
              <>
                {game.home.score ?? 0}{" "}
                <span className="text-muted-foreground">:</span>{" "}
                {game.away.score ?? 0}
              </>
            ) : (
              <span className="text-base opacity-80 sm:text-lg">
                <LocalTime ts={startMs} />
              </span>
            )}
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
            <span className="truncate text-right text-sm font-extrabold text-foreground sm:text-xl">
              {game.away.name}
            </span>
            {game.away.logo && (
              <img
                src={game.away.logo}
                alt=""
                width={48}
                height={48}
                loading="eager"
                className="size-10 shrink-0 object-contain sm:size-14"
                decoding="async"
              />
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-caption text-muted-foreground">
          <span className="truncate">{game.statusDetail || sport.longName}</span>
          <div className="flex items-center gap-2">
            {!live && game.status === "pre" && (
              <span>
                <LocalTime ts={startMs} mode="day" /> · <Countdown ts={startMs} />
              </span>
            )}
            <Link
              to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
              className={`inline-flex min-h-11 items-center gap-1 rounded-full px-4 text-caption font-bold ${sport.chipBg} ring-1 ${sport.ring} ${sport.accent} transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              {live ? "Live centre" : "Details"}{" "}
              <ArrowRight className="size-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[image:var(--gradient-hero)]">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6 sm:py-12">
        <Flame className="mx-auto mb-3 size-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-h1 text-foreground">Live Cricket &amp; Football Scores</h1>
        <p className="mt-1 text-body text-muted-foreground">
          No live matches right now — today&apos;s fixtures are below.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/cricket"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--color-accent-cricket)]/15 px-4 text-caption font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30 transition-colors hover:bg-[var(--color-accent-cricket)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Cricket scores <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
          <Link
            to="/football"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--color-accent-football)]/15 px-4 text-caption font-bold text-[var(--color-accent-football)] ring-1 ring-[var(--color-accent-football)]/30 transition-colors hover:bg-[var(--color-accent-football)]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Football scores <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
