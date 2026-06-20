import { X, Play, MapPin, CalendarDays } from "lucide-react";
import type { WCMatch } from "@/lib/supabase";
import { useEffect } from "react";

export function MatchModal({ match, onClose }: { match: WCMatch | null; onClose: () => void }) {
  useEffect(() => {
    if (!match) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [match, onClose]);

  if (!match) return null;
  const hasPen = match.home_score_pen != null && match.away_score_pen != null;
  const date = match.match_date
    ? new Date(match.match_date).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 size-8 grid place-items-center rounded-full bg-background/80 hover:bg-background border border-border"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="p-6 border-b border-border">
          <div className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
            {match.round} · {match.tournament_year}
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold truncate">{match.home_team}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold tabular-nums">
                {match.home_score ?? "-"} <span className="text-muted-foreground">:</span> {match.away_score ?? "-"}
              </div>
              {hasPen && (
                <div className="text-xs text-muted-foreground mt-1">
                  ({match.home_score_pen} - {match.away_score_pen} on penalties)
                </div>
              )}
            </div>
            <div className="text-left">
              <div className="text-lg sm:text-xl font-bold truncate">{match.away_team}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center mt-5 text-xs text-muted-foreground">
            {(match.stadium || match.city) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {[match.stadium, match.city].filter(Boolean).join(", ")}
              </span>
            )}
            {date && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {date}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="aspect-video rounded-xl bg-background border border-border grid place-items-center">
            <div className="text-center">
              <div className="size-14 rounded-full bg-gold/15 grid place-items-center mx-auto">
                <Play className="size-6 text-gold ml-0.5" fill="currentColor" />
              </div>
              <div className="mt-3 text-sm text-muted-foreground">Match footage coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
