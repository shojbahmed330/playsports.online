import { useMemo } from "react";
import type { WCMatch } from "@/lib/supabase";
import { Link } from "@tanstack/react-router";
import { Radio, ChevronRight } from "lucide-react";
import { flagOf } from "@/lib/flags";

/**
 * Mobile-only marquee strip showing currently-live and next-up matches.
 * Shown above the Football content for 2026 fixtures.
 */
export function MobileLiveTicker({ matches }: { matches: WCMatch[] }) {
  const featured = useMemo(() => {
    const now = Date.now();
    const enriched = matches
      .filter((m) => m.match_date)
      .map((m) => {
        const t = new Date(m.match_date!).getTime();
        const diff = t - now;
        const live = Math.abs(diff) < 2.5 * 3600_000;
        return { m, t, diff, live };
      })
      .sort((a, b) => {
        if (a.live !== b.live) return a.live ? -1 : 1;
        return Math.abs(a.diff) - Math.abs(b.diff);
      })
      .slice(0, 6)
      .map((x) => x);
    return enriched;
  }, [matches]);

  if (featured.length === 0) return null;

  return (
    <div className="md:hidden -mx-4 px-4 mb-3 overflow-x-auto snap-x snap-mandatory">
      <div className="flex gap-2">
        {featured.map(({ m, live, diff }) => (
          <Link
            key={m.id}
            to="/football/match/$id"
            params={{ id: String(m.id) }}
            className={`snap-start shrink-0 min-w-[230px] rounded-xl border px-3 py-2 ${
              live
                ? "border-red-500/40 bg-red-500/10"
                : "border-gray-800 bg-gray-900/60"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-widest text-gray-500 truncate">
                {m.round}
              </span>
              {live ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-red-300">
                  <Radio className="size-2.5 minute-blink" /> Live
                </span>
              ) : (
                <span className="text-[9px] text-amber-300 font-semibold">
                  in {fmtShort(diff)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="truncate flex items-center gap-1">
                <span className="text-base">{flagOf(m.home_team)}</span>
                {m.home_team.slice(0, 10)}
              </span>
              <span className="tabular-nums text-amber-400 mx-1">
                {m.home_score ?? "–"}–{m.away_score ?? "–"}
              </span>
              <span className="truncate text-right flex items-center gap-1">
                {m.away_team.slice(0, 10)}
                <span className="text-base">{flagOf(m.away_team)}</span>
              </span>
            </div>
            <div className="flex items-center justify-end mt-1 text-[9px] text-gray-500">
              Match centre <ChevronRight className="size-3" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function fmtShort(ms: number) {
  const s = Math.floor(Math.abs(ms) / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
