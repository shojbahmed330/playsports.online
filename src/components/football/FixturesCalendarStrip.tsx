import { useMemo } from "react";
import type { SportGame } from "@/lib/espn.functions";
import { monthAnchorId } from "./FixturesMonthGroups";

/**
 * Horizontal month scrubber. Tapping a chip smooth-scrolls to that month
 * group's anchor. Only rendered when there is at least one fixture.
 */
export function FixturesCalendarStrip({ games }: { games: SportGame[] }) {
  const months = useMemo(() => {
    const map = new Map<string, { key: string; short: string; count: number }>();
    for (const g of games) {
      const key = monthAnchorId(g.startTs);
      const short = new Date(g.startTs).toLocaleDateString(undefined, { month: "short", year: "2-digit" });
      if (!map.has(key)) map.set(key, { key, short, count: 0 });
      map.get(key)!.count++;
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [games]);

  if (months.length <= 1) return null;

  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 mb-4">
      <div className="flex gap-1.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
        {months.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              const el = document.getElementById(m.key);
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 min-h-[44px] text-xs font-bold uppercase tracking-widest text-muted-foreground hover:border-white/25 hover:text-foreground transition"
          >
            {m.short}
            <span className="tabular-nums text-[10px] rounded-full bg-white/10 px-1.5 py-0.5">{m.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
