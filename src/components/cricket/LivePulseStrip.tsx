import { Link } from "@tanstack/react-router";
import type { CricketMatch } from "@/lib/cricket.functions";

/**
 * LivePulseStrip â€” auto-scrolling marquee of currently live matches.
 * Duplicates content for seamless loop. Pauses on hover.
 */
export function LivePulseStrip({ matches }: { matches: CricketMatch[] }) {
  const live = matches.filter((m) => m.status === "in");
  if (live.length === 0) return null;

  // duplicate for seamless scroll
  const items = [...live, ...live];

  return (
    <div className="relative border-y border-[var(--color-live)]/20 bg-gradient-to-r from-[var(--color-live)]/40 via-[var(--color-live)]/30 to-[var(--color-gold)]/30 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div className="flex items-center gap-3 py-2.5">
        <div className="shrink-0 pl-3 sm:pl-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-live)]">
          <span className="size-1.5 rounded-full bg-[var(--color-live)] animate-pulse motion-reduce:animate-none" />
          Live now
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="flex gap-2 sm:gap-3 animate-[ticker_50s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap will-change-transform">
            {items.map((m, idx) => (
              <PulseItem key={`${m.id}-${idx}`} match={m} />
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function PulseItem({ match }: { match: CricketMatch }) {
  const home = match.home;
  const away = match.away;
  return (
    <Link
      to="/cricket/match/$id"
      params={{ id: match.id }}
      search={{ leagueId: match.leagueId }}
      className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background hover:bg-background ring-1 ring-[var(--color-live)]/20 hover:ring-[var(--color-live)]/40 transition-all text-xs"
    >
      <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-gold)]/80">
        {match.leagueAbbr || match.leagueName?.slice(0, 4) || "â€”"}
      </span>
      <span className="font-semibold text-foreground">{home.abbr || home.shortName?.slice(0, 3)}</span>
      <span className="font-mono text-[var(--color-accent-cricket)]/90">
        {home.scoreSummary || (home.totalRuns ? String(home.totalRuns) : "â€”")}
      </span>
      <span className="text-muted-foreground">vs</span>
      <span className="font-semibold text-foreground">{away.abbr || away.shortName?.slice(0, 3)}</span>
      <span className="font-mono text-[var(--color-accent-cricket)]/90">
        {away.scoreSummary || (away.totalRuns ? String(away.totalRuns) : "â€”")}
      </span>
      <span className="text-[10px] text-[var(--color-live)]/90">Â· {match.shortDetail || "live"}</span>
    </Link>
  );
}
