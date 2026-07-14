import { useEffect, useState } from "react";
import type { CricketMatch } from "@/lib/cricket.functions";
import { displayScore, scoreLine } from "@/lib/cricket-score-display";

/** Thin bar that appears once the hero is scrolled past. */
export function MatchStickyBar({ match }: { match: CricketMatch }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 260);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const home = displayScore(match, "home");
  const away = displayScore(match, "away");
  const isLive = match.status === "in";

  return (
    <div
      className={`sticky top-0 z-30 border-b border-emerald-500/20 bg-gray-950/95 backdrop-blur transition-all ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-3 text-xs">
        {isLive && (
          <span className="size-1.5 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1 flex items-center gap-2 tabular-nums truncate">
          <span className="font-bold text-white truncate">{match.home.abbr || match.home.shortName}</span>
          <span className="text-emerald-200 truncate">{scoreLine(home)}</span>
          <span className="text-gray-500 shrink-0">vs</span>
          <span className="font-bold text-white truncate">{match.away.abbr || match.away.shortName}</span>
          <span className="text-emerald-200 truncate">{scoreLine(away)}</span>
        </div>
        {match.result?.marginText && (
          <span className="hidden sm:inline text-emerald-300 truncate">· {match.result.marginText}</span>
        )}
      </div>
    </div>
  );
}
