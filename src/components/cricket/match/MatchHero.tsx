import { Link } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { ArrowLeft, MapPin, Tv, Trophy, Share2 } from "lucide-react";
import type { CricketMatch } from "@/lib/cricket.functions";
import { formatLocalTime, relativeDay } from "@/lib/time";
import { displayScore, type ScoreDisplay } from "@/lib/cricket-score-display";
import { ScoreFlip } from "@/components/sports/ScoreFlip";

export function MatchHero({ match }: { match: CricketMatch }) {
  const isLive = match.status === "in";
  const isFinal = match.status === "post";
  const homeScore = displayScore(match, "home");
  const awayScore = displayScore(match, "away");

  return (
    <section className="relative overflow-hidden border-b border-border cricket-hero">
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        aria-hidden
        style={{ background: "radial-gradient(60% 70% at 50% 0%, rgba(251,191,36,0.35), transparent 65%)" }}
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Link to="/cricket" className="inline-flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white mb-3">
          <ArrowLeft className="size-3.5" /> All cricket
        </Link>

        {/* meta row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold min-w-0">
            <Link
              to="/cricket/series/$id"
              params={{ id: match.leagueId }}
              className="text-amber-300 hover:underline truncate"
            >
              {match.leagueName || match.leagueAbbr}
            </Link>
            {match.format && (
              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide bg-white/15 text-white">
                {match.format.toUpperCase()}
              </span>
            )}
            {match.description && (
              <span className="text-emerald-100/70 normal-case font-medium tracking-normal truncate">
                · {match.description}
              </span>
            )}
          </div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-red-300 text-xs font-bold shrink-0">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse cricket-live-ring" /> LIVE · {match.statusDetail}
            </span>
          ) : isFinal ? (
            <span className="text-xs font-bold text-amber-300 inline-flex items-center gap-1 shrink-0">
              <Trophy className="size-3.5" /> Result
            </span>
          ) : (
            <span className="text-xs font-bold text-emerald-200 shrink-0">
              {relativeDay(match.startTs)} · {formatLocalTime(match.startTs)}
            </span>
          )}
        </div>

        {/* team score rows */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <TeamScoreRow t={match.home} score={homeScore} won={match.home.winner === true} />
          <TeamScoreRow t={match.away} score={awayScore} won={match.away.winner === true} />
        </div>

        {/* Result banner */}
        {match.dataIncomplete ? (
          <div className="mt-4 inline-block px-3 py-1.5 rounded-md bg-amber-500/15 ring-1 ring-amber-500/30 text-amber-200 text-xs font-semibold">
            Score data unavailable — refreshing shortly.
          </div>
        ) : (match.result?.marginText || match.note) ? (
          <div className="mt-4 inline-block px-3 py-1.5 rounded-md bg-emerald-500/15 ring-1 ring-emerald-500/30 text-emerald-200 text-xs font-semibold">
            {match.result?.marginText || match.note}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-emerald-100/70">
          {match.venue && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3" /> {match.venue}{match.city ? `, ${match.city}` : ""}
            </span>
          )}
          {match.broadcast && (
            <span className="inline-flex items-center gap-1">
              <Tv className="size-3" /> {match.broadcast}
            </span>
          )}
          <ShareButton />
        </div>
      </div>
    </section>
  );
}

function TeamScoreRow({
  t,
  score,
  won,
}: {
  t: CricketMatch["home"];
  score: ScoreDisplay;
  won: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl p-3 sm:p-4 ring-1 ${
        won ? "bg-emerald-500/15 ring-emerald-400/40" : "bg-black/30 ring-white/10"
      }`}
    >
      <TeamCrest src={t.logo} abbr={t.abbr} name={t.name} className="size-11 sm:size-12 shrink-0" />
      <div className="min-w-0">
        <div className="text-sm sm:text-base font-extrabold text-white truncate">{t.name}</div>
        {score.kind === "innings" && score.multi ? (
          <div className="text-[11px] text-emerald-100/70 tabular-nums truncate">{score.multi}</div>
        ) : t.scoreSummary ? (
          <div className="text-[11px] text-emerald-100/60 truncate">{t.scoreSummary}</div>
        ) : null}
      </div>
      <div className="shrink-0 text-right text-white min-w-[70px]">
        {score.kind === "innings" ? (
          <>
            <div className="text-[28px] sm:text-4xl font-black tabular-nums leading-none">
              <ScoreFlip value={score.runs} />
              {!score.allOut && (
                <span className="text-lg sm:text-2xl text-emerald-200/80 font-bold">/{score.wickets}</span>
              )}
              {score.declared && <span className="text-sm text-amber-300 ml-0.5">d</span>}
            </div>
            <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] tabular-nums text-emerald-100/70">
              {score.allOut && (
                <span className="uppercase tracking-wider text-amber-300 font-bold">all out</span>
              )}
              {score.overs != null && score.overs > 0 && <span>{score.overs} ov</span>}
            </div>
          </>
        ) : score.kind === "yet-to-bat" ? (
          <div className="text-xs uppercase tracking-wider font-bold text-emerald-100/70">Yet to bat</div>
        ) : score.kind === "did-not-bat" ? (
          <div className="text-xs uppercase tracking-wider font-bold text-emerald-100/70">DNB</div>
        ) : (
          <div className="text-2xl text-emerald-100/40">—</div>
        )}
      </div>
    </div>
  );
}

function ShareButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof navigator === "undefined") return;
        const url = window.location.href;
        if (navigator.share) {
          navigator.share({ url }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(url).catch(() => {});
        }
      }}
      className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white"
    >
      <Share2 className="size-3" /> Share
    </button>
  );
}
