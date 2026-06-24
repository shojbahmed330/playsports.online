import { X, MapPin, CalendarDays, ExternalLink } from "lucide-react";
import { type WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { VideoPlayer } from "./VideoPlayer";
import { LiveMatchCenter } from "./LiveMatchCenter";
import { WatchLivePanel } from "./WatchLivePanel";
import { ShareButton } from "@/components/football/ShareButton";
import { StarTeamButton } from "@/components/football/StarTeamButton";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

function winnerSide(m: WCMatch): "home" | "away" | "draw" {
  if (m.home_score_pen != null && m.away_score_pen != null) {
    return m.home_score_pen > m.away_score_pen ? "home" : "away";
  }
  const h = m.home_score ?? 0, a = m.away_score ?? 0;
  if (h > a) return "home";
  if (a > h) return "away";
  return "draw";
}

export function MatchModal({ match, onClose }: { match: WCMatch | null; onClose: () => void }) {
  useEffect(() => {
    if (!match) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [match, onClose]);

  if (!match) return null;
  const hasPen = match.home_score_pen != null && match.away_score_pen != null;
  const win = winnerSide(match);
  const date = match.match_date
    ? new Date(match.match_date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const is2026 = match.tournament_year === 2026;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start sm:place-items-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] my-2 sm:my-8 rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 gap-2">
          <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-[10px] uppercase tracking-widest rounded-full px-3 py-1">
            {match.round} · {match.tournament_year}
          </span>
          <div className="flex items-center gap-2">
            <ShareButton
              title={`${match.home_team} vs ${match.away_team} — ${match.tournament_year} World Cup`}
              url={`/football/match/${match.id}`}
            />
            <button
              onClick={onClose}
              className="size-8 grid place-items-center rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-5 pb-2">
          {/* Score row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <span className="text-2xl shrink-0">{flagOf(match.home_team)}</span>
              <span className={`truncate text-base sm:text-lg font-semibold ${win === "home" ? "text-amber-400" : "text-gray-300"}`}>
                {match.home_team}
              </span>
              <StarTeamButton team={match.home_team} />
            </div>
            <div className="text-5xl font-black text-amber-400 tabular-nums whitespace-nowrap">
              {match.home_score ?? "-"} <span className="text-gray-600">-</span> {match.away_score ?? "-"}
            </div>
            <div className="flex-1 flex items-center gap-1.5 min-w-0 justify-end">
              <StarTeamButton team={match.away_team} />
              <span className={`truncate text-base sm:text-lg font-semibold text-right ${win === "away" ? "text-amber-400" : "text-gray-300"}`}>
                {match.away_team}
              </span>
              <span className="text-2xl shrink-0">{flagOf(match.away_team)}</span>
            </div>
          </div>

          {hasPen && (
            <div className="text-center text-sm text-amber-600 mt-2">
              ({match.home_score_pen} - {match.away_score_pen} on penalties)
            </div>
          )}

          {/* Info rows */}
          <div className="mt-5 flex flex-col gap-1.5 text-sm text-gray-400">
            {date && (
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-gray-500" />
                <span>{date}</span>
              </div>
            )}
            {(match.stadium || match.city) && (
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-gray-500" />
                <span>{[match.stadium, match.city].filter(Boolean).join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Video / highlights */}
        <div className="px-6 pt-4">
          <VideoPlayer videoUrl={match.video_url} matchTitle={`${match.home_team} vs ${match.away_team}`} />
        </div>

        {/* 2026 live match center + broadcasters */}
        {is2026 && (
          <div className="px-6 pt-5 space-y-4">
            <LiveMatchCenter
              fixture={{
                id: match.id,
                startTs: match.match_date ? Math.floor(new Date(match.match_date).getTime() / 1000) : 0,
                status: "notstarted",
                statusDesc: "",
                minute: null,
                group: match.round,
                venue: match.stadium,
                city: match.city,
                home: { id: 0, name: match.home_team, code: "", goals: match.home_score },
                away: { id: 0, name: match.away_team, code: "", goals: match.away_score },
              } as Wc2026Fixture}
            />
            <WatchLivePanel compact />
            <Link
              to="/football/match/$id"
              params={{ id: String(match.id) }}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 py-2 text-xs font-medium text-amber-300"
              onClick={onClose}
            >
              Open full match page <ExternalLink className="size-3.5" />
            </Link>
          </div>
        )}

        <div className="p-6 pt-4">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-2.5 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
