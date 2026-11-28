import { Link } from "@tanstack/react-router";
import { Trophy, Sparkles } from "lucide-react";

type Props = {
  seasonLabel: string;
  liveCount: number;
  nextMatchLabel?: string | null;
  totalTitles: number;
};

/** IPL Home hero — trophy-shine gradient, live pulse + next-match chip. */
export function IplHero({ seasonLabel, liveCount, nextMatchLabel, totalTitles }: Props) {
  return (
    <section className="relative overflow-hidden ipl-hero-grad ipl-trophy-ring rounded-2xl mx-3 sm:mx-6 mt-4 px-5 py-6 sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 ipl-trophy-shine opacity-60" />
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-gold)]/90">
            <Sparkles className="size-3.5" />
            Indian Premier League
          </div>
          <h1 className="mt-2 truncate text-2xl sm:text-4xl font-black tracking-tight text-foreground">
            {seasonLabel}
          </h1>
          <p className="mt-1 text-sm text-foreground">
            Live scores, standings, Orange & Purple Cap, franchise stats and full history.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {liveCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-live)]/90 px-3 py-1 text-[11px] font-black text-foreground shadow-[0_8px_24px_-8px_rgba(244,63,94,0.7)]">
                <span className="relative inline-flex">
                  <span className="absolute inset-0 animate-ping rounded-full bg-muted motion-reduce:animate-none" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-muted" />
                </span>
                {liveCount} LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-foreground ring-1 ring-border">
                No matches in play
              </span>
            )}
            {nextMatchLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)]/15 px-3 py-1 text-[11px] font-semibold text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30">
                Next · {nextMatchLabel}
              </span>
            )}
            <Link
              to="/cricket"
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-foreground ring-1 ring-border hover:bg-muted"
            >
              ← Cricket hub
            </Link>
          </div>
        </div>
        <div className="hidden sm:flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 ring-1 ring-border backdrop-blur">
            <Trophy className="size-5 text-[var(--color-gold)]" />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest text-foreground">
                Seasons played
              </div>
              <div className="text-xl font-black text-foreground">{totalTitles}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
