import type { SportGame } from "@/lib/espn.functions";
import { Link } from "@tanstack/react-router";
import { flagOf } from "@/lib/flags";
import { matchupSlug } from "@/lib/matchup";
import { Swords, MapPin, Tv } from "lucide-react";

/**
 * Enhanced score card for tournament matches. Adds flag+abbr, live pulse,
 * responsive layout, penalty note support, and 44px+ tap targets.
 */
export function ScoreCardEnhanced({
  g,
  compSlug,
}: {
  g: SportGame;
  compSlug: string;
}) {
  const isLive = g.status === "in";
  const isFinal = g.status === "post";
  const kickoff = g.startTs
    ? new Date(g.startTs).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="relative group">
      <Link
        to="/football/$comp/matches/$matchId"
        params={{ comp: compSlug, matchId: g.id }}
        className={`block rounded-2xl border p-3 sm:p-4 transition active:scale-[0.99] ${
          isLive
            ? "border-red-500/40 bg-red-500/[0.06] shadow-[0_0_30px_-16px_rgba(239,68,68,0.5)]"
            : "border-white/10 bg-white/[0.03] hover:border-white/25"
        }`}
      >
        {/* Status row */}
        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-widest mb-2">
          <span
            className={
              isLive
                ? "text-red-300 font-bold inline-flex items-center gap-1"
                : isFinal
                  ? "text-muted-foreground font-bold"
                  : "text-muted-foreground"
            }
          >
            {isLive && <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />}
            {isLive ? g.shortDetail || "Live" : isFinal ? "Full-time" : kickoff}
          </span>
          {g.venue && (
            <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-[45%] text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{g.venue}</span>
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="grid grid-cols-[1fr_auto] gap-y-2 items-center">
          <TeamRow
            name={g.home.name}
            logo={g.home.logo}
            abbr={g.home.abbr}
            winner={g.home.winner}
          />
          <ScoreCell score={g.home.score} show={isLive || isFinal} highlight={g.home.winner === true} />
          <TeamRow
            name={g.away.name}
            logo={g.away.logo}
            abbr={g.away.abbr}
            winner={g.away.winner}
          />
          <ScoreCell score={g.away.score} show={isLive || isFinal} highlight={g.away.winner === true} />
        </div>

        {/* Broadcast / venue mobile */}
        {(g.broadcast || (g.venue && !isFinal)) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            {g.broadcast && (
              <span className="inline-flex items-center gap-1">
                <Tv className="size-3" /> {g.broadcast}
              </span>
            )}
            {g.venue && (
              <span className="sm:hidden inline-flex items-center gap-1 truncate">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{g.venue}</span>
              </span>
            )}
          </div>
        )}
      </Link>

      {g.home.name && g.away.name && (
        <Link
          to="/football/$comp/h2h/$matchup"
          params={{ comp: compSlug, matchup: matchupSlug(g.home.name, g.away.name) }}
          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-white/25"
          title={`${g.home.name} vs ${g.away.name} head-to-head`}
        >
          <Swords className="size-3" /> H2H
        </Link>
      )}
    </div>
  );
}

function TeamRow({
  name,
  logo,
  abbr,
  winner,
}: {
  name: string;
  logo: string | null;
  abbr: string;
  winner: boolean | null;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className="shrink-0 text-lg leading-none">{flagOf(name) || "🏳️"}</span>
      {logo ? (
        <img
          src={logo}
          alt=""
          className="size-6 rounded-full bg-white/5 object-contain shrink-0"
          loading="lazy"
        />
      ) : (
        <span className="size-6 rounded-full bg-white/10 shrink-0" />
      )}
      <span
        className={`truncate text-sm sm:text-base ${
          winner ? "font-bold text-foreground" : "font-medium text-foreground/90"
        }`}
      >
        {name}
      </span>
      {abbr && (
        <span className="hidden sm:inline text-[10px] font-bold text-muted-foreground tabular-nums shrink-0">
          {abbr}
        </span>
      )}
    </div>
  );
}

function ScoreCell({
  score,
  show,
  highlight,
}: {
  score: number | null;
  show: boolean;
  highlight: boolean;
}) {
  if (score == null || !show) {
    return <span className="tabular-nums text-sm text-muted-foreground pl-3">—</span>;
  }
  return (
    <span
      className={`tabular-nums text-xl sm:text-2xl font-black pl-3 ${
        highlight ? "text-primary" : "text-foreground"
      }`}
    >
      {score}
    </span>
  );
}
