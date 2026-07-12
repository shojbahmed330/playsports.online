import { useQueries } from "@tanstack/react-query";
import { getScoreboard } from "@/lib/espn.functions";
import { toYmd } from "./DateScrubber";
import { LastEditionRecap } from "./LastEditionRecap";
import type { Competition } from "@/lib/competitions";
import { ArrowRight, Calendar } from "lucide-react";

/**
 * Empty-state for a scores date with zero matches. Peeks +1/+7/+30 days
 * ahead to surface the nearest actual matchday, and falls back to the
 * last completed edition recap.
 */
export function ScoresEmptyState({
  comp,
  value,
  onJumpTo,
  showRecap,
}: {
  comp: Competition;
  value: Date;
  onJumpTo: (d: Date) => void;
  showRecap: boolean;
}) {
  const offsets = [1, 7, 30];
  const peeks = useQueries({
    queries: offsets.map((delta) => {
      const d = new Date(value);
      d.setDate(d.getDate() + delta);
      const ymd = toYmd(d);
      return {
        queryKey: ["comp-scoreboard-peek", comp.slug, ymd],
        queryFn: () =>
          getScoreboard({
            data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name, yyyymmdd: ymd },
          }),
        staleTime: 5 * 60_000,
      };
    }),
  });

  const nextHit = peeks.find((q) => (q.data?.games?.length ?? 0) > 0);
  const nextDate = nextHit
    ? (() => {
        const idx = peeks.indexOf(nextHit);
        const d = new Date(value);
        d.setDate(d.getDate() + offsets[idx]);
        return d;
      })()
    : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:py-8 text-center">
        <div className="mx-auto grid place-items-center size-10 rounded-xl bg-white/5 text-muted-foreground mb-2">
          <Calendar className="size-5" />
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          No {comp.shortName} matches on this date.
        </p>
        {nextDate && (
          <button
            type="button"
            onClick={() => onJumpTo(nextDate)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary px-3.5 py-2 text-xs font-bold hover:bg-primary/15 transition"
          >
            Jump to {nextDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            <ArrowRight className="size-3.5" />
          </button>
        )}
      </div>

      {showRecap && (
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Last completed edition
          </div>
          <LastEditionRecap comp={comp} />
        </div>
      )}
    </div>
  );
}
