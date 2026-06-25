import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { confederationOf } from "@/lib/confederations";
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

  const date = match.match_date ? new Date(match.match_date) : null;
  const countdown = date && (st === "upcoming" || st === "scheduled")
    ? fmtCountdown(date.getTime() - now) : null;
  const timeStr = date ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : null;
  const dayStr = date ? date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : null;

  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left rounded-2xl overflow-hidden bg-gray-950 border transition-all active:scale-[0.99] shadow-lg
        ${match.predicted ? "border-dashed border-sky-500/40 hover:border-sky-400/60" : "border-white/[0.08] hover:border-amber-500/40"}`}
    >
      {/* dual confederation top-accent */}
      <div className="flex h-1">
        <div className={`flex-1 conf-${homeConf}`} />
        <div className={`flex-1 conf-${awayConf}`} />
      </div>

      <div className="p-3">
        {/* status row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {stage && (
              <span className="text-[9.5px] uppercase tracking-widest text-gray-500 font-bold">
                {stage}
              </span>
            )}
            {st === "live" && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-widest text-red-300 bg-red-500/15 ring-1 ring-red-500/40 rounded-full px-2 py-0.5 live-pulse">
                <Radio className="size-2.5 minute-blink" /> Live
              </span>
            )}
            {st === "upcoming" && countdown && (
              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/15 ring-1 ring-amber-500/30 rounded-full px-2 py-0.5">
                <Clock className="size-2.5" /> in {countdown}
              </span>
            )}
            {st === "finished" && (
              <span className="text-[9.5px] uppercase tracking-widest text-emerald-400 font-bold">FT</span>
            )}
          </div>
          {match.predicted && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/40 rounded-full px-1.5 py-0.5">
              <span className="size-1 rounded-full bg-sky-400 animate-pulse" /> PREDICTED
            </span>
          )}
          {match.video_url && !match.predicted && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 rounded-full px-1.5 py-0.5">
              <Play className="size-2.5 fill-amber-300" /> HL
            </span>
          )}
        </div>

        {/* teams + score */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className={`flex items-center gap-2 ${win === "home" ? "text-white" : "text-gray-400"}`}>
            <span className="text-2xl shrink-0">{flagOf(match.home_team)}</span>
            <span className="text-sm font-semibold truncate">{match.home_team}</span>
          </div>
          <div className="text-center px-2">
            <div className={`text-2xl font-black tabular-nums ${st === "live" ? "text-red-300" : "text-white"}`}>
              {match.home_score ?? "–"}<span className="text-gray-600 mx-1">:</span>{match.away_score ?? "–"}
            </div>
          </div>
          <div className={`flex items-center gap-2 justify-end ${win === "away" ? "text-white" : "text-gray-400"}`}>
            <span className="text-sm font-semibold truncate text-right">{match.away_team}</span>
            <span className="text-2xl shrink-0">{flagOf(match.away_team)}</span>
          </div>
        </div>

        {match.home_score_pen != null && match.away_score_pen != null && (
          <div className="text-center mt-1.5">
            <span className="text-[10px] text-amber-400 bg-amber-500/10 rounded-full px-2 py-0.5">
              {match.home_score_pen}-{match.away_score_pen} on penalties
            </span>
          </div>
        )}

        {/* footer */}
        {(dayStr || timeStr || match.stadium) && (
          <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
            <span className="truncate">{[dayStr, timeStr].filter(Boolean).join(" · ")}</span>
            {match.stadium && <span className="truncate ml-2">{match.stadium}</span>}
          </div>
        )}
      </div>

      {/* Open match centre quick link for 2026 fixtures — only real ESPN events */}
      {match.tournament_year === 2026 && !match.predicted && match.id > 0 && (
        <Link
          to="/football/match/$id"
          params={{ id: String(match.id) }}
          onClick={(e) => e.stopPropagation()}
          className="block text-center text-[10px] py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-300 border-t border-white/5 hover:bg-amber-500/20"
        >
          Open Match Centre →
        </Link>
      )}
      {match.predicted && (
        <div className="text-center text-[10px] py-1.5 bg-sky-500/[0.06] text-sky-300 border-t border-sky-500/20">
          Tap for fixture preview
        </div>
      )}
    </button>
  );
}
