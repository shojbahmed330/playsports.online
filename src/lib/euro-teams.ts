/**
 * Canonical UEFA nation list + Euro-specific derived metadata used by
 * `/football/euro/teams`. Pure data + pure functions — no fetching.
 *
 * `bestFinish` is hand-curated (source: UEFA.com history). Nation flags
 * fall back to `flagFor` from euro-history when unknown.
 */

import { flagFor } from "@/lib/euro-history";
import { titleCounts } from "@/lib/competition-history";

export type EuroFinishTag = "Winners" | "Runners-up" | "Semi-finals" | "Quarter-finals" | "Group stage" | "Never qualified";

export type EuroNation = {
  name: string;
  /** ESPN team id if we can deep-link. Only present for Euro 2024 participants. */
  espnTeamId?: string;
  /** Best-ever Euro finals finish. */
  bestFinish: EuroFinishTag;
  /** Year of the best finish (or first if multiple). */
  bestYear?: number;
  /** Euro 2024 participant? */
  euro2024: boolean;
  /** Euro 2028 host? */
  euro2028Host: boolean;
};

/** 55 UEFA member nations (Russia included but currently suspended). */
export const EURO_NATIONS: EuroNation[] = [
  { name: "Spain",              espnTeamId: "164", bestFinish: "Winners",       bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Germany",            espnTeamId: "158", bestFinish: "Winners",       bestYear: 1996, euro2024: true,  euro2028Host: false },
  { name: "Italy",              espnTeamId: "162", bestFinish: "Winners",       bestYear: 2020, euro2024: true,  euro2028Host: false },
  { name: "France",             espnTeamId: "173", bestFinish: "Winners",       bestYear: 2000, euro2024: true,  euro2028Host: false },
  { name: "Portugal",           espnTeamId: "2318", bestFinish: "Winners",      bestYear: 2016, euro2024: true,  euro2028Host: false },
  { name: "Netherlands",        espnTeamId: "168", bestFinish: "Winners",       bestYear: 1988, euro2024: true,  euro2028Host: false },
  { name: "Greece",             espnTeamId: "376", bestFinish: "Winners",       bestYear: 2004, euro2024: false, euro2028Host: false },
  { name: "Denmark",            espnTeamId: "148", bestFinish: "Winners",       bestYear: 1992, euro2024: true,  euro2028Host: false },
  { name: "Czech Republic",     espnTeamId: "159", bestFinish: "Runners-up",    bestYear: 1996, euro2024: true,  euro2028Host: false },
  { name: "England",            espnTeamId: "448", bestFinish: "Runners-up",    bestYear: 2024, euro2024: true,  euro2028Host: true  },
  { name: "Belgium",            espnTeamId: "463", bestFinish: "Runners-up",    bestYear: 1980, euro2024: true,  euro2028Host: false },
  { name: "Serbia",             espnTeamId: "179", bestFinish: "Runners-up",    bestYear: 1968, euro2024: true,  euro2028Host: false },
  { name: "Russia",             bestFinish: "Runners-up",    bestYear: 1988, euro2024: false, euro2028Host: false },
  { name: "Croatia",            espnTeamId: "462", bestFinish: "Semi-finals",   bestYear: 1996, euro2024: true,  euro2028Host: false },
  { name: "Turkey",             espnTeamId: "396", bestFinish: "Semi-finals",   bestYear: 2008, euro2024: true,  euro2028Host: false },
  { name: "Wales",              espnTeamId: "1272", bestFinish: "Semi-finals",  bestYear: 2016, euro2024: false, euro2028Host: true  },
  { name: "Sweden",             espnTeamId: "371", bestFinish: "Semi-finals",   bestYear: 1992, euro2024: false, euro2028Host: false },
  { name: "Switzerland",        espnTeamId: "372", bestFinish: "Quarter-finals",bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Austria",            espnTeamId: "393", bestFinish: "Quarter-finals",bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Ukraine",            espnTeamId: "1268", bestFinish: "Quarter-finals",bestYear: 2020,euro2024: true,  euro2028Host: false },
  { name: "Poland",             espnTeamId: "371",  bestFinish: "Quarter-finals",bestYear: 2016,euro2024: true,  euro2028Host: false },
  { name: "Romania",            espnTeamId: "1274", bestFinish: "Quarter-finals",bestYear: 2000,euro2024: true,  euro2028Host: false },
  { name: "Slovakia",           espnTeamId: "3072", bestFinish: "Group stage",  bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Hungary",            espnTeamId: "1268", bestFinish: "Group stage",  bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Scotland",           espnTeamId: "168",  bestFinish: "Group stage",  bestYear: 2024, euro2024: true,  euro2028Host: true  },
  { name: "Albania",            espnTeamId: "1279", bestFinish: "Group stage",  bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Georgia",            espnTeamId: "3070", bestFinish: "Round of 16" as EuroFinishTag,   bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Slovenia",           espnTeamId: "377",  bestFinish: "Round of 16" as EuroFinishTag,   bestYear: 2024, euro2024: true,  euro2028Host: false },
  { name: "Northern Ireland",   bestFinish: "Round of 16" as EuroFinishTag,   bestYear: 2016, euro2024: false, euro2028Host: true  },
  { name: "Republic of Ireland",bestFinish: "Round of 16" as EuroFinishTag,   bestYear: 2016, euro2024: false, euro2028Host: true  },
  { name: "Iceland",            bestFinish: "Quarter-finals",bestYear: 2016, euro2024: false, euro2028Host: false },
  { name: "Norway",             bestFinish: "Group stage",   bestYear: 2000, euro2024: false, euro2028Host: false },
  { name: "Finland",            bestFinish: "Group stage",   bestYear: 2020, euro2024: false, euro2028Host: false },
  { name: "North Macedonia",    bestFinish: "Group stage",   bestYear: 2020, euro2024: false, euro2028Host: false },
  { name: "Bulgaria",           bestFinish: "Group stage",   bestYear: 2004, euro2024: false, euro2028Host: false },
  { name: "Latvia",             bestFinish: "Group stage",   bestYear: 2004, euro2024: false, euro2028Host: false },
  { name: "Israel",             bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Bosnia and Herzegovina", bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Cyprus",             bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Estonia",            bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Lithuania",          bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Luxembourg",         bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Malta",              bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Moldova",            bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Montenegro",         bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Kosovo",             bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Andorra",            bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Armenia",            bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Azerbaijan",         bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Belarus",            bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Faroe Islands",      bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Gibraltar",          bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Kazakhstan",         bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "Liechtenstein",      bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
  { name: "San Marino",         bestFinish: "Never qualified", euro2024: false, euro2028Host: false },
];

export type EuroChampionNation = {
  team: string;
  flag: string;
  titles: number;
  years: number[];
};

/** Derived: nations that have won the Euro at least once, most titles first. */
export function euroChampionNations(): EuroChampionNation[] {
  return titleCounts("euro").map((t) => ({
    team: t.team,
    flag: flagFor(t.team),
    titles: t.titles,
    years: t.years,
  }));
}

export type EuroTeamsFilter = "all" | "champions" | "euro2024" | "euro2028-hosts" | "never-qualified";

export const EURO_TEAMS_FILTERS: { id: EuroTeamsFilter; label: string }[] = [
  { id: "all",             label: "All 55" },
  { id: "champions",       label: "Euro winners" },
  { id: "euro2024",        label: "Euro 2024" },
  { id: "euro2028-hosts",  label: "Euro 2028 hosts" },
  { id: "never-qualified", label: "Never qualified" },
];

export function matchesEuroTeamsFilter(n: EuroNation, f: EuroTeamsFilter): boolean {
  switch (f) {
    case "all":             return true;
    case "champions":       return n.bestFinish === "Winners";
    case "euro2024":        return n.euro2024;
    case "euro2028-hosts":  return n.euro2028Host;
    case "never-qualified": return n.bestFinish === "Never qualified";
  }
}

/** Small helper for tone/color of a finish tag. */
export function finishTone(finish: string): string {
  if (finish === "Winners")        return "text-amber-200 bg-amber-500/15 ring-amber-400/25";
  if (finish === "Runners-up")     return "text-sky-200 bg-sky-500/15 ring-sky-400/25";
  if (finish === "Semi-finals")    return "text-emerald-200 bg-emerald-500/15 ring-emerald-400/25";
  if (finish === "Quarter-finals") return "text-indigo-200 bg-indigo-500/15 ring-indigo-400/25";
  if (finish === "Never qualified")return "text-muted-foreground bg-white/[0.04] ring-white/10";
  return "text-white/80 bg-white/[0.05] ring-white/10";
}
