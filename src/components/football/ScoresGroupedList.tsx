import { useMemo } from "react";
import type { SportGame } from "@/lib/espn.functions";
import { ScoreCardEnhanced } from "./ScoreCardEnhanced";

/**
 * Group matches by stage/matchday derived from ESPN's `shortDetail`
 * (e.g. "Group A", "Quarterfinal"). Live matches always float to the
 * top group. Falls back to a single "Matches" group.
 */
export function ScoresGroupedList({
  games,
  compSlug,
}: {
  games: SportGame[];
  compSlug: string;
}) {
  const groups = useMemo(() => groupGames(games), [games]);

  if (games.length === 0) return null;

  return (
    <div className="space-y-6">
      {groups.map((grp) => (
        <section key={grp.name} id={slug(grp.name)} className="scroll-mt-32">
          <header className="sticky top-28 z-10 -mx-4 px-4 sm:mx-0 sm:px-0 py-2 backdrop-blur bg-background/85 mb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-foreground/90">
                {grp.name}
              </h3>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
                {grp.games.length} {grp.games.length === 1 ? "match" : "matches"}
              </span>
            </div>
          </header>
          <ul className="grid gap-2 sm:gap-3 sm:grid-cols-2">
            {grp.games.map((g) => (
              <li key={g.id}>
                <ScoreCardEnhanced g={g} compSlug={compSlug} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function stageFor(g: SportGame): string {
  const d = (g.shortDetail || "").toLowerCase();
  if (d.includes("final") && !d.includes("semi") && !d.includes("quarter")) return "Final";
  if (d.includes("semi")) return "Semi-finals";
  if (d.includes("quarter")) return "Quarter-finals";
  if (d.includes("round of 16") || d.includes("r16")) return "Round of 16";
  const grp = /group\s+([a-l])/i.exec(g.shortDetail || "");
  if (grp) return `Group ${grp[1].toUpperCase()}`;
  const md = /matchday\s+(\d+)/i.exec(g.shortDetail || "");
  if (md) return `Matchday ${md[1]}`;
  return "Matches";
}

function groupGames(games: SportGame[]) {
  const map = new Map<string, SportGame[]>();
  for (const g of games) {
    const key = stageFor(g);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(g);
  }
  // Sort each group: live first, then upcoming asc, then finished desc.
  for (const arr of map.values()) {
    arr.sort((a, b) => {
      const rank = (s: string) => (s === "in" ? 0 : s === "pre" ? 1 : 2);
      const ra = rank(a.status), rb = rank(b.status);
      if (ra !== rb) return ra - rb;
      if (a.status === "post") return b.startTs - a.startTs;
      return a.startTs - b.startTs;
    });
  }
  return Array.from(map, ([name, games]) => ({ name, games }));
}
