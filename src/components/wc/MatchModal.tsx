import { X, MapPin, CalendarDays, ExternalLink, Sparkles, Radio } from "lucide-react";
import { type WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LiveMatchCenter } from "./LiveMatchCenter";
import { WatchLivePanel } from "./WatchLivePanel";
import { ShareButton } from "@/components/football/ShareButton";
import { StarTeamButton } from "@/components/football/StarTeamButton";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";
import { MatchHighlightCard } from "./MatchHighlightCard";

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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${match.home_team} vs ${match.away_team} — ${match.tournament_year} World Cup`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={dragDy > 0 ? { transform: `translateY(${dragDy}px)`, transition: "none" } : undefined}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-[var(--shadow-elevated)] animate-in slide-in-from-bottom-4 duration-200 motion-reduce:animate-none sm:my-8 sm:max-h-[90vh] sm:max-w-[640px] sm:rounded-2xl sm:slide-in-from-bottom-0 sm:zoom-in-95"
      >
        {/* Mobile drag handle */}
        <div className="grid shrink-0 place-items-center pb-1 pt-2 sm:hidden">
          <span className="block h-1.5 w-10 rounded-full bg-muted-foreground/40" aria-hidden="true" />
        </div>

        {/* Sticky header (visible while scrolling content) */}
        <div className="z-10 flex shrink-0 items-center justify-between gap-2 border-b border-border bg-background/95 px-5 pb-2 pt-2 backdrop-blur sm:pt-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className={`shrink-0 rounded-full px-3 py-1 text-micro font-bold uppercase ${
              isPredicted
                ? "bg-[var(--color-accent-mlb)]/15 text-[var(--color-accent-mlb)] ring-1 ring-[var(--color-accent-mlb)]/40"
                : "bg-primary text-primary-foreground"
            }`}>
              {isPredicted ? "Predicted" : match.round} · {match.tournament_year}
            </span>
            {is2026 && !isPredicted && (
              <span className="hidden items-center gap-1 rounded-full bg-live/10 px-2 py-0.5 text-micro font-bold text-live ring-1 ring-live/40 xs:inline-flex">
                <Radio className="size-2.5" aria-hidden="true" /> Live data
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!isPredicted && (
              <ShareButton
                title={`${match.home_team} vs ${match.away_team} — ${match.tournament_year} World Cup`}
                url={`/football/match/${match.id}`}
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid size-11 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close match details"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="px-5 pb-2 pt-5 sm:px-6">
            {/* Score row */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <span className="shrink-0 text-xl sm:text-2xl" aria-hidden="true">{flagOf(match.home_team)}</span>
                <span className={`truncate text-caption font-semibold sm:text-lg ${win === "home" ? "text-primary" : "text-foreground"}`}>
                  {match.home_team}
                </span>
                {!isPredicted && <StarTeamButton team={match.home_team} />}
              </div>
              <div className={`whitespace-nowrap text-3xl font-black tabular-nums sm:text-5xl ${
                isPredicted ? "text-muted-foreground/60" : "text-primary"
              }`}>
                {match.home_score ?? "–"} <span className="mx-0.5 text-muted-foreground">:</span> {match.away_score ?? "–"}
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                {!isPredicted && <StarTeamButton team={match.away_team} />}
                <span className={`truncate text-right text-caption font-semibold sm:text-lg ${win === "away" ? "text-primary" : "text-foreground"}`}>
                  {match.away_team}
                </span>
                <span className="shrink-0 text-xl sm:text-2xl" aria-hidden="true">{flagOf(match.away_team)}</span>
              </div>
            </div>

            {hasPen && (
              <div className="mt-2 text-center text-caption text-primary">
                ({match.home_score_pen} - {match.away_score_pen} on penalties)
              </div>
            )}

            {/* Info rows */}
            <div className="mt-5 flex flex-col gap-1.5 text-caption text-muted-foreground">
              {date && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>{date}{match.match_date && new Date(match.match_date).getTime() > Date.now()
                    ? ` · ${new Date(match.match_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                    : ""}</span>
                </div>
              )}
              {(match.stadium || match.city) && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span>{[match.stadium, match.city].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Predicted-fixture explainer */}
          {isPredicted && (
            <div className="mx-5 mt-3 rounded-xl border border-dashed border-[var(--color-accent-mlb)]/40 bg-[var(--color-accent-mlb)]/[0.06] p-4 sm:mx-6">
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-mlb)]" aria-hidden="true" />
                <div className="text-caption leading-relaxed text-[var(--color-accent-mlb)]/90">
                  <div className="mb-1 font-bold text-[var(--color-accent-mlb)]">Predicted Round of 32 fixture</div>
                  These teams are derived from current group standings using the
                  official FIFA 2026 R32 snake-pairing. The real opponents will
                  drop in here automatically once the group stage settles and
                  FIFA / ESPN publishes the bracket.
                </div>
              </div>
            </div>
          )}

          {/* Video / highlights */}
          {(!isPredicted || match.video_url) && (
            <div className="px-5 pt-4 sm:px-6">
              <MatchHighlightCard
                home={match.home_team}
                away={match.away_team}
                videoUrl={match.video_url}
              />
            </div>
          )}

          {/* 2026 Live Match Centre — only for real ESPN events */}
          {canShowLiveCenter && (
            <div className="space-y-4 px-5 pt-5 sm:px-6">
              <LiveMatchCenter
                fixture={{
                  id: match.id,
                  startTs: match.match_date ? Math.floor(new Date(match.match_date).getTime() / 1000) : 0,
                  status: match.status ?? "notstarted",
                  statusDesc: match.statusDesc ?? "",
                  minute: match.minute ?? null,
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
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 py-2 text-caption font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={onClose}
              >
                Open full match page <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Predicted: still surface broadcasters because users want to know
              where to watch the eventual fixture. */}
          {isPredicted && (
            <div className="px-5 pt-4 sm:px-6">
              <WatchLivePanel compact />
            </div>
          )}

          <div className="p-5 pt-4 sm:p-6">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 w-full rounded-lg bg-muted py-2.5 text-caption font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
