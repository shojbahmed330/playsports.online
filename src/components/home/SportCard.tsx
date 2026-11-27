import { Link } from "@tanstack/react-router";
import { ArrowRight, Trophy } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import type { SportGame } from "@/lib/espn.functions";
import { Countdown } from "@/components/sports/Countdown";
import { formatLocalTime } from "@/lib/time";

const SHELL =
  "group relative block overflow-hidden rounded-2xl border border-border bg-gradient-to-br transition-all hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[var(--shadow-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function SportCard({
  sport,
  liveCount,
  next,
  recent,
}: {
  sport: SportConfig;
  liveCount: number;
  next: SportGame | null;
  recent: SportGame | null;
}) {
  return (
    <Link
      to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
      className={`${SHELL} ${sport.bgGrad}`}
    >
      <div className="relative p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between">
          <div
            className={`grid size-12 shrink-0 place-items-center rounded-xl text-2xl ring-1 ${sport.chipBg} ${sport.ring}`}
            aria-hidden="true"
          >
            {sport.emoji}
          </div>
          {liveCount > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-live/15 px-2 py-0.5 text-micro font-bold text-live ring-1 ring-live/30">
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-live/70 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-live" />
              </span>
              {liveCount} live
            </span>
          ) : next ? (
            <Countdown ts={next.startTs} compact />
          ) : null}
        </div>

        <div className={`text-micro uppercase ${sport.accent}`}>
          {liveCount > 0 ? "Live now" : next ? "Up next" : "Open"}
        </div>
        <div className="mt-0.5 text-h3 leading-tight text-foreground">{sport.label}</div>

        {next ? (
          <div className="mt-3 space-y-0.5 text-caption text-muted-foreground">
            <div className="truncate font-semibold text-foreground">
              {next.away.shortName || next.away.abbr} @ {next.home.shortName || next.home.abbr}
            </div>
            <div>{formatLocalTime(next.startTs)}</div>
          </div>
        ) : recent ? (
          <div className="mt-3 text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">
              {recent.away.abbr} {recent.away.score} – {recent.home.score} {recent.home.abbr}
            </span>{" "}
            <span>· Final</span>
          </div>
        ) : (
          <div className="mt-3 line-clamp-2 text-caption text-muted-foreground">{sport.tagline}</div>
        )}

        <div
          className={`mt-3 inline-flex items-center gap-1 text-caption font-bold transition-all group-hover:gap-2 ${sport.accent}`}
        >
          Open <ArrowRight className="size-3" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export function FifaCard() {
  return (
    <Link
      to="/football"
      search={{ year: 2026 }}
      className={`${SHELL} from-[var(--color-accent-football)]/25 via-background to-background`}
    >
      <div className="relative p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-football)]/15 ring-1 ring-[var(--color-accent-football)]/40">
            <Trophy className="size-6 text-[var(--color-accent-football)]" aria-hidden="true" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-football)]/15 px-2 py-0.5 text-micro font-bold text-[var(--color-accent-football)] ring-1 ring-[var(--color-accent-football)]/30">
            <span aria-hidden="true">⭐</span> Archive
          </span>
        </div>
        <div className="text-micro uppercase text-[var(--color-accent-football)]">
          FIFA World Cup
        </div>
        <div className="mt-0.5 text-h3 leading-tight text-foreground">1930 → 2026</div>
        <div className="mt-3 text-caption leading-snug text-muted-foreground">
          Every match, every goal, every player — plus live 2026.
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-caption font-bold text-[var(--color-accent-football)] transition-all group-hover:gap-2">
          Explore <ArrowRight className="size-3" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export function CricketCard() {
  return (
    <Link
      to="/cricket"
      className={`${SHELL} from-[var(--color-accent-cricket)]/25 via-background to-background`}
    >
      <div className="relative p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between">
          <div
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-cricket)]/15 text-2xl ring-1 ring-[var(--color-accent-cricket)]/40"
            aria-hidden="true"
          >
            🏏
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-cricket)]/15 px-2 py-0.5 text-micro font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30">
            All formats
          </span>
        </div>
        <div className="text-micro uppercase text-[var(--color-accent-cricket)]">Cricket</div>
        <div className="mt-0.5 text-h3 leading-tight text-foreground">Live · IPL · WC</div>
        <div className="mt-3 text-caption leading-snug text-muted-foreground">
          Scores, series hubs, points tables and history.
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-caption font-bold text-[var(--color-accent-cricket)] transition-all group-hover:gap-2">
          Explore <ArrowRight className="size-3" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
