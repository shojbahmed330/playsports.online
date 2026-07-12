/**
 * Phase 3 helpers over the historical seed in `src/data/competition-editions.ts`.
 *
 * Aggregations only — no fetching. Feeds the champions timeline, per-decade
 * record summaries, and title counts used by the scoped competition pages.
 */

import { COMPETITION_EDITIONS, type EditionSummary } from "@/data/competition-editions";

export type ChampionEntry = {
  year: number;
  winner: string;
  runnerUp?: string;
  finalScore?: string;
};

/** Chronological (oldest → newest) champions timeline for a competition. */
export function championsTimeline(compSlug: string): ChampionEntry[] {
  const editions = COMPETITION_EDITIONS[compSlug] ?? [];
  return editions
    .filter((e) => e.winner && e.winner !== "TBD")
    .map((e) => ({ year: e.year, winner: e.winner, runnerUp: e.runnerUp, finalScore: e.finalScore }))
    .sort((a, b) => a.year - b.year);
}

/** Title tallies aggregated from editions. */
export function titleCounts(compSlug: string): { team: string; titles: number; years: number[] }[] {
  const editions = COMPETITION_EDITIONS[compSlug] ?? [];
  const acc = new Map<string, number[]>();
  for (const e of editions) {
    if (!e.winner || e.winner === "TBD") continue;
    const arr = acc.get(e.winner) ?? [];
    arr.push(e.year);
    acc.set(e.winner, arr);
  }
  return Array.from(acc.entries())
    .map(([team, years]) => ({ team, titles: years.length, years: years.sort((a, b) => a - b) }))
    .sort((a, b) => b.titles - a.titles || a.team.localeCompare(b.team));
}

export type DecadeBucket = {
  /** e.g. 2020 for the 2020s. */
  decade: number;
  label: string;
  editions: EditionSummary[];
  champions: { team: string; titles: number }[];
  totalGoals?: number;
  totalMatches?: number;
};

/** Group a competition's editions by decade with roll-up stats. */
export function editionsByDecade(compSlug: string): DecadeBucket[] {
  const editions = COMPETITION_EDITIONS[compSlug] ?? [];
  const buckets = new Map<number, EditionSummary[]>();
  for (const e of editions) {
    const d = Math.floor(e.year / 10) * 10;
    const arr = buckets.get(d) ?? [];
    arr.push(e);
    buckets.set(d, arr);
  }
  return Array.from(buckets.entries())
    .map(([decade, list]) => {
      const winners = new Map<string, number>();
      let totalGoals = 0;
      let totalMatches = 0;
      let goalsSeen = false;
      let matchesSeen = false;
      for (const e of list) {
        if (e.winner && e.winner !== "TBD") winners.set(e.winner, (winners.get(e.winner) ?? 0) + 1);
        if (typeof e.goals === "number") { totalGoals += e.goals; goalsSeen = true; }
        if (typeof e.matches === "number") { totalMatches += e.matches; matchesSeen = true; }
      }
      return {
        decade,
        label: `${decade}s`,
        editions: list.sort((a, b) => a.year - b.year),
        champions: Array.from(winners.entries())
          .map(([team, titles]) => ({ team, titles }))
          .sort((a, b) => b.titles - a.titles || a.team.localeCompare(b.team)),
        totalGoals: goalsSeen ? totalGoals : undefined,
        totalMatches: matchesSeen ? totalMatches : undefined,
      };
    })
    .sort((a, b) => b.decade - a.decade);
}

/** Convenience: most recent completed edition (winner set, not "TBD"). */
export function latestCompletedEdition(compSlug: string): EditionSummary | null {
  const editions = COMPETITION_EDITIONS[compSlug] ?? [];
  const done = editions.filter((e) => e.winner && e.winner !== "TBD");
  if (done.length === 0) return null;
  return done.reduce((max, e) => (e.year > max.year ? e : max), done[0]);
}
