import { Link } from "@tanstack/react-router";
import { Flame, ArrowRight, MapPin } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import type { SportGame } from "@/lib/espn.functions";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { Countdown } from "@/components/sports/Countdown";
import { formatLocalTime, relativeDay } from "@/lib/time";

type Tagged = { sport: SportConfig; game: SportGame };

/**
 * Compact, single-feature hero: picks the most important match right now.
 * Priority: WC2026 live → ESPN live → WC2026 upcoming → ESPN upcoming.
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
  // Prefer a LIVE WC2026 match
  if (wcFeatured && wcFeatured.status === "inprogress") {
    return <WcHero f={wcFeatured} live />;
  }
  // Then ESPN live (first one)
  const live = liveGames[0];
  if (live) return <EspnHero t={live} live />;
  // Then WC2026 upcoming
  if (wcFeatured) return <WcHero f={wcFeatured} live={false} />;
  // Then ESPN upcoming
  const next = upcomingGames[0];
  if (next) return <EspnHero t={next} live={false} />;
  // Empty state
  return <EmptyHero />;
}

function WcHero({ f, live }: { f: Wc2026Fixture; live: boolean }) {
  const startMs = f.startTs * 1000;
  const deepLink = f.id > 0;
  return (
    <section className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-br from-amber-950/60 via-gray-950 to-red-950/40">
      <div className="absolute inset-0 opacity-25 pointer-events-none" aria-hidden style={{
        background: "radial-gradient(60% 60% at 50% 0%, oklch(0.78 0.16 75 / 0.5), transparent 65%)",
      }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="sr-only">
          {live ? "Live" : "Up next"}: {f.home.name} vs {f.away.name} — FIFA World Cup 2026 {f.group ?? ""}
        </h1>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-amber-300">
            {live ? (
              <>
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Live</span>
              </>
            ) : (
              <span>Up next</span>
            )}
            <span className="text-amber-200/60">· {f.group}</span>
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-amber-200">FIFA WC 2026</span>
        </div>

        {deepLink ? (
          <Link
            to="/football/match/$id"
            params={{ id: String(f.id) }}
            className="block group -mx-2 px-2 rounded-xl hover:bg-white/[0.02] transition-colors"
            aria-label={`Open ${f.home.name} v ${f.away.name}`}
          >
            <HeroScoreBoard f={f} live={live} startMs={startMs} />
          </Link>
        ) : (
          <HeroScoreBoard f={f} live={live} startMs={startMs} />
        )}

        <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-[11px] sm:text-xs text-gray-400">
          <span className="inline-flex items-center gap-1.5 min-w-0 truncate">
            {f.venue && <><MapPin className="size-3 shrink-0" /> <span className="truncate">{f.venue}{f.city ? `, ${f.city}` : ""}</span></>}
          </span>
          <div className="flex items-center gap-2">
            {!live && f.status !== "finished" && (
              <span className="text-amber-200">{relativeDay(startMs)} · <Countdown ts={startMs} /></span>
            )}
            {deepLink ? (
              <Link
                to="/football/match/$id"
                params={{ id: String(f.id) }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 text-[11px] sm:text-xs font-bold transition-colors"
              >
                {live ? "Watch" : "Match centre"} <ArrowRight className="size-3" />
              </Link>
            ) : (
              <Link
                to="/football"
                search={{ year: 2026 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-gray-950 text-[11px] sm:text-xs font-bold transition-colors"
              >
                Details <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroScoreBoard({ f, live, startMs }: { f: Wc2026Fixture; live: boolean; startMs: number }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-3xl sm:text-5xl shrink-0">{flagOf(f.home.name)}</span>
        <span className="truncate text-sm sm:text-xl font-extrabold">{f.home.name}</span>
      </div>
      <div className="text-3xl sm:text-5xl font-black text-amber-300 tabular-nums whitespace-nowrap">
        {live || f.status === "finished" ? (
          <>{f.home.goals ?? 0} <span className="text-gray-600">:</span> {f.away.goals ?? 0}</>
        ) : (
          <span className="text-amber-400/80 text-base sm:text-lg">{formatLocalTime(startMs)}</span>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
        <span className="truncate text-sm sm:text-xl font-extrabold text-right">{f.away.name}</span>
        <span className="text-3xl sm:text-5xl shrink-0">{flagOf(f.away.name)}</span>
      </div>
    </div>
  );
}

function EspnHero({ t, live }: { t: Tagged; live: boolean }) {
  const { sport, game } = t;
  const startMs = game.startTs * 1000;
  return (
    <section className={`relative overflow-hidden border-b border-white/10 bg-gradient-to-br ${sport.bgGrad}`}>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="sr-only">
          {live ? "Live" : "Up next"}: {game.home.name} vs {game.away.name} — {sport.longName}
        </h1>
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold ${sport.accent}`}>
            {live ? (
              <>
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Live</span>
              </>
            ) : (
              <span>Up next</span>
            )}
          </span>
          <span className={`text-[10px] sm:text-xs font-bold ${sport.accent}`}>
            {sport.emoji} {sport.label}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {game.home.logo && (
              <img src={game.home.logo} alt="" width={48} height={48} loading="eager"
                className="size-10 sm:size-14 object-contain shrink-0" / decoding="async">
            )}
            <span className="truncate text-sm sm:text-xl font-extrabold">{game.home.name}</span>
          </div>
          <div className={`text-3xl sm:text-5xl font-black tabular-nums whitespace-nowrap ${sport.accent}`}>
            {live || game.status === "post" ? (
              <>{game.home.score ?? 0} <span className="text-gray-600">:</span> {game.away.score ?? 0}</>
            ) : (
              <span className="text-base sm:text-lg opacity-80">{formatLocalTime(startMs)}</span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-end">
            <span className="truncate text-sm sm:text-xl font-extrabold text-right">{game.away.name}</span>
            {game.away.logo && (
              <img src={game.away.logo} alt="" width={48} height={48} loading="eager"
                className="size-10 sm:size-14 object-contain shrink-0" / decoding="async">
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between flex-wrap gap-2 text-[11px] sm:text-xs text-gray-400">
          <span className="truncate">{game.statusDetail || sport.longName}</span>
          <div className="flex items-center gap-2">
            {!live && game.status === "pre" && <span>{relativeDay(startMs)} · <Countdown ts={startMs} /></span>}
            <Link
              to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${sport.chipBg} ring-1 ${sport.ring} ${sport.accent} text-[11px] sm:text-xs font-bold hover:scale-[1.03] transition-transform`}
            >
              {live ? "Watch" : "Details"} <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyHero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
        <Flame className="size-8 mx-auto text-gray-600 mb-3" />
        <h1 className="text-xl sm:text-2xl font-extrabold">PlaySports — Live Scores & Sports Hub</h1>
        <p className="text-sm text-gray-400 mt-1">No live matches right now — browse today's full slate below</p>

      </div>
    </section>
  );
}
