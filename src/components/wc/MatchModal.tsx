import { X, MapPin, CalendarDays, ExternalLink, Sparkles, Radio } from "lucide-react";
import { type WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { useEffect, useRef, useState } from "react";
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

/**
 * Match detail surface. On mobile (<sm) it slides up from the bottom as a
 * draggable bottom-sheet with a drag handle and rounded top corners; on
 * desktop it stays centered like a traditional modal.
 */
export function MatchModal({ match, onClose }: { match: WCMatch | null; onClose: () => void }) {
  // ESC to close
  useEffect(() => {
    if (!match) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [match, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!match) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [match]);

  // Drag-to-dismiss state (mobile only)
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragDy, setDragDy] = useState(0);
  const dragStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth >= 640) return;
    dragStartY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current == null) return;
    const dy = e.touches[0].clientY - dragStartY.current;
    if (dy > 0) setDragDy(dy);
  };
  const onTouchEnd = () => {
    if (dragDy > 120) onClose();
    setDragDy(0);
    dragStartY.current = null;
  };

  if (!match) return null;
  const hasPen = match.home_score_pen != null && match.away_score_pen != null;
  const win = winnerSide(match);
  const date = match.match_date
    ? new Date(match.match_date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const is2026 = match.tournament_year === 2026;
  const isPredicted = !!match.predicted;
  // Predicted rows use synthesized negative ids and have no ESPN summary.
  const canShowLiveCenter = is2026 && !isPredicted && match.id > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={dragDy > 0 ? { transform: `translateY(${dragDy}px)`, transition: "none" } : undefined}
        className="relative w-full sm:max-w-[640px] max-h-[92vh] sm:max-h-[90vh] sm:my-8
          rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl
          overflow-hidden flex flex-col
          animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2 pb-1 grid place-items-center shrink-0">
          <span className="block h-1.5 w-10 rounded-full bg-gray-700" />
        </div>

        {/* Sticky header (visible while scrolling content) */}
        <div className="flex items-center justify-between px-5 pt-2 sm:pt-4 pb-2 gap-2 shrink-0 border-b border-gray-900/80 bg-gray-950/95 backdrop-blur z-10">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`shrink-0 font-bold text-[10px] uppercase tracking-widest rounded-full px-3 py-1 ${
              isPredicted
                ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/40"
                : "bg-gradient-to-r from-amber-500 to-amber-600 text-black"
            }`}>
              {isPredicted ? "Predicted" : match.round} · {match.tournament_year}
            </span>
            {is2026 && !isPredicted && (
              <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold text-red-300 bg-red-500/10 ring-1 ring-red-500/40 rounded-full px-2 py-0.5">
                <Radio className="size-2.5" /> Live data
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isPredicted && (
              <ShareButton
                title={`${match.home_team} vs ${match.away_team} — ${match.tournament_year} World Cup`}
                url={`/football/match/${match.id}`}
              />
            )}
            <button
              onClick={onClose}
              className="size-8 grid place-items-center rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 sm:px-6 pt-5 pb-2">
            {/* Score row */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">{flagOf(match.home_team)}</span>
                <span className={`truncate text-sm sm:text-lg font-semibold ${win === "home" ? "text-amber-400" : "text-gray-300"}`}>
                  {match.home_team}
                </span>
                {!isPredicted && <StarTeamButton team={match.home_team} />}
              </div>
              <div className={`text-3xl sm:text-5xl font-black tabular-nums whitespace-nowrap ${
                isPredicted ? "text-gray-600" : "text-amber-400"
              }`}>
                {match.home_score ?? "–"} <span className="text-gray-700 mx-0.5">:</span> {match.away_score ?? "–"}
              </div>
              <div className="flex-1 flex items-center gap-1.5 min-w-0 justify-end">
                {!isPredicted && <StarTeamButton team={match.away_team} />}
                <span className={`truncate text-sm sm:text-lg font-semibold text-right ${win === "away" ? "text-amber-400" : "text-gray-300"}`}>
                  {match.away_team}
                </span>
                <span className="text-xl sm:text-2xl shrink-0">{flagOf(match.away_team)}</span>
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
                  <span>{date}{match.match_date && new Date(match.match_date).getTime() > Date.now()
                    ? ` · ${new Date(match.match_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}</span>
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

          {/* Predicted-fixture explainer */}
          {isPredicted && (
            <div className="mx-5 sm:mx-6 mt-3 rounded-xl border border-dashed border-sky-500/40 bg-sky-500/[0.06] p-4">
              <div className="flex items-start gap-2.5">
                <Sparkles className="size-4 text-sky-300 mt-0.5 shrink-0" />
                <div className="text-xs text-sky-200/90 leading-relaxed">
                  <div className="font-bold text-sky-300 mb-1">Predicted Round of 32 fixture</div>
                  These teams are derived from current group standings using the
                  official FIFA 2026 R32 snake-pairing. The real opponents will
                  drop in here automatically once the group stage settles and
                  FIFA / ESPN publishes the bracket.
                </div>
              </div>
            </div>
          )}

          {/* Video / highlights (skip for predicted) */}
          {!isPredicted && (
            <div className="px-5 sm:px-6 pt-4">
              <VideoPlayer videoUrl={match.video_url} matchTitle={`${match.home_team} vs ${match.away_team}`} />
            </div>
          )}

          {/* 2026 Live Match Centre — only for real ESPN events */}
          {canShowLiveCenter && (
            <div className="px-5 sm:px-6 pt-5 space-y-4">
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

          {/* Predicted: still surface broadcasters because users want to know
              where to watch the eventual fixture. */}
          {isPredicted && (
            <div className="px-5 sm:px-6 pt-4">
              <WatchLivePanel compact />
            </div>
          )}

          <div className="p-5 sm:p-6 pt-4">
            <button
              onClick={onClose}
              className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-2.5 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
