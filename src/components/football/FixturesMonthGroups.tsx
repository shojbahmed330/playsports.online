import { useMemo } from "react";
import type { SportGame } from "@/lib/espn.functions";
import { ScoreCardEnhanced } from "./ScoreCardEnhanced";

/**
 * Group fixtures by month with sticky headers and anchor ids matching
 * `monthAnchorId()` so `FixturesCalendarStrip` can scroll to them.
 */
export function FixturesMonthGroups({
  games,
  compSlug,
}: {
  games: SportGame[];
  compSlug: string;
}) {
  const groups = useMemo(() => groupByMonth(games), [games]);

  if (games.length === 0) return null;

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <section key={g.key} id={g.key} className="scroll-mt-32">
          <header className="sticky top-28 z-10 -mx-4 px-4 sm:mx-0 sm:px-0 py-2 backdrop-blur bg-background/85 mb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-foreground/90">
                {g.label}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
                {g.games.length} {g.games.length === 1 ? "match" : "matches"}
              </span>
            </div>
          </header>
          <ul className="grid gap-2 sm:gap-3 sm:grid-cols-2">
            {g.games.map((game) => (
              <li key={game.id}>
                <ScoreCardEnhanced g={game} compSlug={compSlug} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function monthAnchorId(ms: number): string {
  const d = new Date(ms);
  return `month-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function groupByMonth(games: SportGame[]) {
  const map = new Map<string, { key: string; label: string; games: SportGame[] }>();
  for (const g of games) {
    const key = monthAnchorId(g.startTs);
    const label = new Date(g.startTs).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    if (!map.has(key)) map.set(key, { key, label, games: [] });
    map.get(key)!.games.push(g);
  }
  for (const grp of map.values()) {
    grp.games.sort((a, b) => {
      const rank = (s: string) => (s === "in" ? 0 : s === "pre" ? 1 : 2);
      const ra = rank(a.status), rb = rank(b.status);
      if (ra !== rb) return ra - rb;
      return a.startTs - b.startTs;
    });
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}
