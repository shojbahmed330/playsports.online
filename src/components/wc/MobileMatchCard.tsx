import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { confederationOf } from "@/lib/confederations";
import { fmtTime, fmtDateShort } from "@/lib/timezone";
import { useTimezone } from "./TimezonePicker";
import { Play, Radio, Clock } from "lucide-react";

type Status = "live" | "finished" | "upcoming" | "scheduled";

function statusOf(m: WCMatch): Status {
  if (m.match_date) {
    const t = new Date(m.match_date).getTime();
    const now = Date.now();
    if (m.home_score != null && m.away_score != null && now - t > 2 * 3600_000) return "finished";
    if (Math.abs(now - t) < 2.5 * 3600_000 && (m.home_score != null || now > t)) return "live";
    if (now < t) return t - now < 24 * 3600_000 ? "upcoming" : "scheduled";
  }
  if (m.home_score != null && m.away_score != null) return "finished";
  return "scheduled";
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "Kickoff!";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function winnerSide(m: WCMatch): "home" | "away" | null {
  if (m.home_score_pen != null && m.away_score_pen != null) {
    return m.home_score_pen > m.away_score_pen ? "home" : "away";
  }
  const h = m.home_score ?? 0, a = m.away_score ?? 0;
  if (h > a) return "home";
  if (a > h) return "away";
  return null;
}

export function MobileMatchCard({
  match, onClick, stage,
}: { match: WCMatch; onClick: () => void; stage?: string }) {
  const st = statusOf(match);
  const win = winnerSide(match);
  const homeConf = confederationOf(match.home_team);
  const awayConf = confederationOf(match.away_team);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (st !== "upcoming" && st !== "scheduled") return;
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(i);
  }, [st]);

  useTimezone(); // re-render when viewer changes their tz
  const date = match.match_date ? new Date(match.match_date) : null;
  const countdown = date && (st === "upcoming" || st === "scheduled")
    ? fmtCountdown(date.getTime() - now) : null;
  const timeStr = date ? fmtTime(date) : null;
  const dayStr = date ? fmtDateShort(date) : null;

  // Real 2026 ESPN matches navigate directly to the dedicated match page
  // (video + lineups + events). Historical / predicted rows still open the
  // in-page modal via onClick.
  const isRealEspn = match.tournament_year === 2026 && !match.predicted && match.id > 0;

  const cardClass = `group relative block w-full overflow-hidden rounded-2xl border bg-card text-left shadow-[var(--shadow-elevated)] transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
    ${match.predicted ? "border-dashed border-[var(--color-accent-mlb)]/40 hover:border-[var(--color-accent-mlb)]/60" : "border-border hover:border-primary/40"}`;

  const inner = (
    <>
      {/* dual confederation top-accent */}
      <div className="flex h-1" aria-hidden="true">
        <div className={`flex-1 conf-${homeConf}`} />
        <div className={`flex-1 conf-${awayConf}`} />
      </div>

      <div className="p-3">
        {/* status row */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {stage && (
              <span className="text-micro uppercase text-muted-foreground">
                {stage}
              </span>
            )}
            {st === "live" && (
              <span className="live-pulse inline-flex items-center gap-1 rounded-full bg-live/15 px-2 py-0.5 text-micro font-bold uppercase text-live ring-1 ring-live/40">
                <Radio className="minute-blink size-2.5" aria-hidden="true" /> Live
              </span>
            )}
            {st === "upcoming" && countdown && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-micro font-bold uppercase text-primary ring-1 ring-primary/30">
                <Clock className="size-2.5" aria-hidden="true" /> in {countdown}
              </span>
            )}
            {st === "finished" && (
              <span className="text-micro font-bold uppercase text-positive">FT</span>
            )}
          </div>
          {match.predicted && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-mlb)]/15 px-1.5 py-0.5 text-micro font-bold text-[var(--color-accent-mlb)] ring-1 ring-[var(--color-accent-mlb)]/40">
              <span className="size-1 rounded-full bg-[var(--color-accent-mlb)] animate-pulse motion-reduce:animate-none" aria-hidden="true" /> PREDICTED
            </span>
          )}
          {match.video_url && !match.predicted && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-micro font-bold text-primary ring-1 ring-primary/30">
              <Play className="size-2.5 fill-primary" aria-hidden="true" /> HL
            </span>
          )}
        </div>

        {/* teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className={`flex min-w-0 items-center gap-2 ${win === "home" ? "text-foreground" : "text-muted-foreground"}`}>
            <span className="shrink-0 text-2xl" aria-hidden="true">{flagOf(match.home_team)}</span>
            <div className="min-w-0">
              <div className="truncate text-caption font-semibold">{match.home_team}</div>
              {match.predicted && match.home_seed_label && (
                <div className="truncate text-micro uppercase text-[var(--color-accent-mlb)]/80">{match.home_seed_label}</div>
              )}
            </div>
          </div>
          <div className="px-2 text-center">
            <div className={`text-2xl font-black tabular-nums ${st === "live" ? "text-live" : "text-foreground"}`}>
              {match.home_score ?? "–"}<span className="mx-1 text-muted-foreground">:</span>{match.away_score ?? "–"}
            </div>
          </div>
          <div className={`flex min-w-0 items-center justify-end gap-2 ${win === "away" ? "text-foreground" : "text-muted-foreground"}`}>
            <div className="min-w-0 text-right">
              <div className="truncate text-caption font-semibold">{match.away_team}</div>
              {match.predicted && match.away_seed_label && (
                <div className="truncate text-micro uppercase text-[var(--color-accent-mlb)]/80">{match.away_seed_label}</div>
              )}
            </div>
            <span className="shrink-0 text-2xl" aria-hidden="true">{flagOf(match.away_team)}</span>
          </div>
        </div>

        {match.home_score_pen != null && match.away_score_pen != null && (
          <div className="mt-1.5 text-center">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-micro text-primary">
              {match.home_score_pen}-{match.away_score_pen} on penalties
            </span>
          </div>
        )}

        {/* footer */}
        {(() => {
          const isUnplayed = match.home_score == null && match.away_score == null;
          if (dayStr || timeStr) {
            return (
              <div className="mt-2 flex items-center justify-between text-micro text-muted-foreground">
                <span className="truncate">{[dayStr, timeStr].filter(Boolean).join(" · ")}</span>
                {match.stadium && <span className="ml-2 truncate">{match.stadium}</span>}
              </div>
            );
          }
          if (isUnplayed) {
            return (
              <div className="mt-2 flex items-center justify-between text-micro">
                <span className="font-semibold uppercase text-muted-foreground">Kickoff TBD</span>
                {match.stadium && <span className="ml-2 truncate text-muted-foreground">{match.stadium}</span>}
              </div>
            );
          }
          if (match.stadium) {
            return (
              <div className="mt-2 flex items-center justify-end text-micro text-muted-foreground">
                <span className="truncate">{match.stadium}</span>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Footer hint — kept inside the same card so the whole card is one big tap target */}
      {isRealEspn && (
        <div className="block border-t border-border bg-primary/10 py-1.5 text-center text-micro text-primary">
          Open Match Centre →
        </div>
      )}
      {match.predicted && (
        <div className="border-t border-[var(--color-accent-mlb)]/20 bg-[var(--color-accent-mlb)]/10 py-1.5 text-center text-micro text-[var(--color-accent-mlb)]">
          Tap for fixture preview
        </div>
      )}
    </>
  );

  if (isRealEspn) {
    return (
      <Link
        to="/football/match/$id"
        params={{ id: String(match.id) }}
        className={cardClass}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={cardClass} type="button">
      {inner}
    </button>
  );
}
