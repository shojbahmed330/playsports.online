import { Link } from "@tanstack/react-router";
import { TeamCrest } from "./TeamCrest";
import { MapPin, Tv, Trophy } from "lucide-react";
import type { CricketMatch } from "@/lib/cricket.functions";
import { ScoreFlip } from "@/components/sports/ScoreFlip";
import { Countdown } from "@/components/sports/Countdown";
import { formatLocalTime, relativeDay } from "@/lib/time";
import { displayScore, scoreLine, type ScoreDisplay } from "@/lib/cricket-score-display";

function formatChipClass(fmt: string): string {
  const f = fmt?.toUpperCase() || "";
  if (f.includes("T20")) return "fmt-t20";
  if (f === "ODI" || f.includes("ONE")) return "fmt-odi";
  if (f === "TEST") return "fmt-test";
  if (f === "T10") return "fmt-t10";
  return "fmt-fc";
}

export function CricketMatchCard({
  match,
  leagueSlug,
}: {
  match: CricketMatch;
  leagueSlug?: string;
}) {
  // A feed item without an event id cannot open a match page. Hide it rather
  // than emit `/cricket/match/`, which the router resolves to `/cricket`.
  if (!match.id) return null;

  const isLive = match.status === "in";
  const isFinal = match.status === "post";
  const isPre = match.status === "pre";
  const winnerHome = match.home.winner === true;
  const winnerAway = match.away.winner === true;
  const fmtClass = formatChipClass(match.format);
  const homeScore = displayScore(match, "home");
  const awayScore = displayScore(match, "away");

  return (
    <Link
      to="/cricket/match/$id"
      params={{ id: match.id }}
      search={{ leagueId: match.leagueId }}
      className={`group relative block rounded-xl border bg-background overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        isLive
          ? "border-[var(--color-live)]/40 shadow-[var(--cricket-live-glow)]"
          : "border-border hover:border-[var(--color-accent-cricket)]/40"
      }`}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 text-[10px] uppercase tracking-wider border-b border-border bg-background">
        <div className="flex items-center gap-2 min-w-0">
          {match.format && (
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide ${fmtClass}`}
            >
              {match.format.toUpperCase()}
            </span>
          )}
          {isLive ? (
            <span className="flex items-center gap-1.5 text-[var(--color-live)] font-bold truncate">
              <span className="size-1.5 rounded-full bg-[var(--color-live)] animate-pulse motion-reduce:animate-none cricket-live-ring" />
              <span className="truncate">Live · {match.statusDetail || "In progress"}</span>
            </span>
          ) : isFinal ? (
            <span className="text-foreground font-semibold truncate">
              {match.shortDetail || "Result"}
            </span>
          ) : (
            <span className="text-foreground font-semibold flex items-center gap-1.5 truncate">
              <span className="text-[var(--color-gold)]">{relativeDay(match.startTs)}</span>
              <span className="text-muted-foreground">·</span>
              <span>{formatLocalTime(match.startTs)}</span>
            </span>
          )}
        </div>
        {isPre ? (
          <Countdown ts={match.startTs} />
        ) : match.broadcast ? (
          <span
            className="text-muted-foreground truncate inline-flex items-center gap-1"
            title={match.broadcast}
          >
            <Tv className="size-3" /> {match.broadcast}
          </span>
        ) : null}
      </div>

      {/* Teams + scores */}
      <div className="divide-y divide-border">
        <TeamRow
          t={match.home}
          winner={winnerHome}
          dim={isFinal && winnerAway}
          showScore={!isPre}
          score={homeScore}
        />
        <TeamRow
          t={match.away}
          winner={winnerAway}
          dim={isFinal && winnerHome}
          showScore={!isPre}
          score={awayScore}
        />
      </div>

      {/* Data-incomplete banner (rare — completed match with no numeric scores). */}
      {match.dataIncomplete && (
        <div className="px-3 py-2 text-[11px] text-[var(--color-gold)]/90 bg-[var(--color-gold)]/[0.07] border-t border-[var(--color-gold)]/20">
          Score data unavailable — refreshing shortly.
        </div>
      )}

      {/* Result / toss note */}
      {(isLive || isFinal) && (match.result?.marginText || match.note) && (
        <div className="px-3 py-2 text-[11px] text-[var(--color-accent-cricket)]/90 bg-[var(--color-accent-cricket)]/[0.06] border-t border-[var(--color-accent-cricket)]/20 leading-snug">
          {isFinal && <Trophy className="inline size-3 mr-1 -mt-0.5" />}
          {match.result?.marginText || match.note}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-[10px] text-muted-foreground border-t border-border bg-background">
        {match.venue ? (
          <span className="truncate inline-flex items-center gap-1 min-w-0">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {match.venue}
              {match.city ? `, ${match.city}` : ""}
            </span>
          </span>
        ) : (
          <span />
        )}
        {match.kind === "bilateral" ? (
          <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold tracking-wider bg-[var(--color-accent-mlb)]/15 text-[var(--color-accent-mlb)] ring-1 ring-[var(--color-accent-mlb)]/30 text-[9px]">
            BILATERAL{match.format ? ` · ${match.format.toUpperCase()}` : ""}
          </span>
        ) : (
          <span className="text-[var(--color-accent-cricket)]/70 font-semibold shrink-0">
            {match.leagueAbbr || match.leagueName}
          </span>
        )}
      </div>
    </Link>
  );
}

function TeamRow({
  t,
  winner,
  dim,
  showScore,
  score,
}: {
  t: CricketMatch["home"];
  winner: boolean;
  dim: boolean;
  showScore: boolean;
  score: ScoreDisplay;
}) {
  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 ${winner ? "bg-[var(--color-accent-cricket)]/[0.07]" : ""}`}
    >
      <TeamCrest src={t.logo} abbr={t.abbr} name={t.name} className="size-8 shrink-0" />
      <div className="min-w-0">
        <div
          className={`text-sm truncate ${dim ? "text-muted-foreground" : winner ? "text-foreground font-semibold" : "text-foreground"}`}
        >
          {t.shortName || t.name}
        </div>
        {showScore && score.kind === "innings" && score.multi && (
          <div
            className={`text-[10px] tabular-nums leading-tight ${dim ? "text-muted-foreground" : "text-foreground"} truncate`}
          >
            {score.multi}
          </div>
        )}
      </div>
      {showScore ? (
        <div
          className={`shrink-0 text-right ${dim ? "text-muted-foreground" : winner ? "text-[var(--color-accent-cricket)]" : "text-foreground"}`}
        >
          {score.kind === "innings" ? (
            <>
              <div className="text-xl font-extrabold tabular-nums leading-none">
                <ScoreFlip value={score.runs} />
                {!score.allOut && (
                  <span className="text-sm font-bold text-muted-foreground">/{score.wickets}</span>
                )}
                {score.declared && (
                  <span className="text-xs text-[var(--color-gold)] ml-0.5">d</span>
                )}
              </div>
              <div className="mt-0.5 flex items-center justify-end gap-1 text-[9px] tabular-nums text-muted-foreground">
                {score.allOut && (
                  <span className="uppercase tracking-wider text-[var(--color-gold)]/80 font-bold">
                    all out
                  </span>
                )}
                {score.overs != null && score.overs > 0 && <span>{score.overs} ov</span>}
              </div>
            </>
          ) : score.kind === "yet-to-bat" ? (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              Yet to bat
            </div>
          ) : score.kind === "did-not-bat" ? (
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
              DNB
            </div>
          ) : (
            <div className="text-muted-foreground text-lg">—</div>
          )}
        </div>
      ) : (
        <div className="shrink-0 text-[10px] text-muted-foreground font-bold">{t.abbr}</div>
      )}
    </div>
  );
}
