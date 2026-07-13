/**
 * Euro-specific history helpers on top of `COMPETITION_EDITIONS.euro`.
 * Pure functions — no fetching, no state. Feeds hero stats, filter chips,
 * "on this day" surface and hosts strip on `/football/euro/history`.
 */

import { COMPETITION_EDITIONS, type EditionSummary } from "@/data/competition-editions";

export const EURO_NATION_FLAG: Record<string, string> = {
  Spain: "🇪🇸",
  Germany: "🇩🇪",
  "West Germany": "🇩🇪",
  Italy: "🇮🇹",
  France: "🇫🇷",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Greece: "🇬🇷",
  Denmark: "🇩🇰",
  Czechoslovakia: "🇨🇿",
  "Czech Republic": "🇨🇿",
  "Soviet Union": "🏳️",
  USSR: "🏳️",
  Belgium: "🇧🇪",
  Yugoslavia: "🏳️",
  Sweden: "🇸🇪",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Austria: "🇦🇹",
  Switzerland: "🇨🇭",
  Poland: "🇵🇱",
  Ukraine: "🇺🇦",
  "Pan-Europe": "🇪🇺",
  "UK & Ireland": "🇬🇧",
};

export function flagFor(nation?: string): string {
  if (!nation) return "🏳️";
  return EURO_NATION_FLAG[nation.trim()] ?? "🏳️";
}

export function euroEditions(): EditionSummary[] {
  return COMPETITION_EDITIONS.euro ?? [];
}

export type EuroStats = {
  tournaments: number;
  champions: number;
  goals: number;
  matches: number;
  span: string; // e.g. "1960 → 2024"
  yearsCovered: number;
};

export function euroStats(): EuroStats {
  const eds = euroEditions().filter((e) => e.winner && e.winner !== "TBD");
  const winners = new Set(eds.map((e) => e.winner));
  const goals = eds.reduce((sum, e) => sum + (e.goals ?? 0), 0);
  const matches = eds.reduce((sum, e) => sum + (e.matches ?? 0), 0);
  const years = eds.map((e) => e.year).sort((a, b) => a - b);
  const first = years[0] ?? 1960;
  const last = years[years.length - 1] ?? new Date().getFullYear();
  return {
    tournaments: eds.length,
    champions: winners.size,
    goals,
    matches,
    span: `${first} → ${last}`,
    yearsCovered: last - first,
  };
}

/** Hosts strip: every past host with the year(s) they hosted. */
export function euroHostsList(): { host: string; years: number[]; flag: string }[] {
  const acc = new Map<string, number[]>();
  for (const e of euroEditions()) {
    if (!e.host) continue;
    const arr = acc.get(e.host) ?? [];
    arr.push(e.year);
    acc.set(e.host, arr);
  }
  return Array.from(acc.entries())
    .map(([host, years]) => ({
      host,
      years: years.sort((a, b) => a - b),
      flag: flagFor(host.split(" / ")[0]),
    }))
    .sort((a, b) => a.years[0] - b.years[0]);
}

export type EuroFilterId =
  | "all"
  | "solo-hosts"
  | "co-hosted"
  | "pens"
  | "golden-goal"
  | "extra-time";

export const EURO_FILTERS: { id: EuroFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "solo-hosts", label: "Solo hosts" },
  { id: "co-hosted", label: "Co-hosted" },
  { id: "pens", label: "Finals on pens" },
  { id: "golden-goal", label: "Golden goal era" },
  { id: "extra-time", label: "Extra-time finals" },
];

export function euroFiltersMatch(edition: EditionSummary, filter: EuroFilterId): boolean {
  const host = edition.host ?? "";
  const score = (edition.finalScore ?? "").toLowerCase();
  switch (filter) {
    case "all":
      return true;
    case "solo-hosts":
      return !!host && !host.includes("/") && !host.includes("Pan-");
    case "co-hosted":
      return host.includes("/") || host.includes("Pan-");
    case "pens":
      return /pens|penalt/.test(score);
    case "golden-goal":
      return score.includes("golden goal");
    case "extra-time":
      return /a\.e\.t\.|golden goal/.test(score);
    default:
      return true;
  }
}

/**
 * "On this day" match — closest anniversary of a Euro final relative to
 * today. Returns the edition + how many years ago + whether it's exactly today.
 */
export function euroAnniversary(now = new Date()): {
  edition: EditionSummary;
  yearsAgo: number;
  isToday: boolean;
  daysAway: number;
} | null {
  const withDate = euroEditions().filter((e) => e.finalDate);
  if (!withDate.length) return null;

  const currentYear = now.getFullYear();
  let best: {
    edition: EditionSummary;
    daysAway: number;
    yearsAgo: number;
    isToday: boolean;
  } | null = null;

  for (const e of withDate) {
    const [, m, d] = (e.finalDate as string).split("-").map(Number);
    // Candidate this year, else next year (for the "next anniversary" case).
    const thisYearDate = new Date(Date.UTC(currentYear, m - 1, d));
    const nextYearDate = new Date(Date.UTC(currentYear + 1, m - 1, d));
    const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const cand =
      thisYearDate.getTime() >= nowUtc ? thisYearDate : nextYearDate;
    const daysAway = Math.round((cand.getTime() - nowUtc) / (1000 * 60 * 60 * 24));
    const yearsAgo = cand.getUTCFullYear() - e.year;
    const isToday = daysAway === 0;
    if (!best || daysAway < best.daysAway || (isToday && !best.isToday)) {
      best = { edition: e, daysAway, yearsAgo, isToday };
    }
  }
  return best;
}
