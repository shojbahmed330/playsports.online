import { z } from "zod";
import { fallback } from "@tanstack/zod-adapter";

export const PLAYER_TABS = [
  "overview",
  "scorers",
  "discipline",
  "countries",
  "rankings",
  "compare",
  "records",
] as const;
export type PlayerTab = (typeof PLAYER_TABS)[number];

export const POSITIONS = ["ALL", "GK", "DEF", "MID", "FWD"] as const;
export type PositionFilter = (typeof POSITIONS)[number];

export const ERAS = ["ALL", "pre-war", "classic", "modern", "current"] as const;
export type Era = (typeof ERAS)[number];

export const GOAL_TYPES = ["ALL", "open", "penalty", "og"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const SORTS = [
  "goals",
  "goals_per_tournament",
  "tournaments",
  "name",
  "recent",
] as const;
export type SortKey = (typeof SORTS)[number];

export const ERA_YEARS: Record<Exclude<Era, "ALL">, number[]> = {
  "pre-war": [1930, 1934, 1938],
  classic: [1950, 1954, 1958, 1962, 1966, 1970, 1974, 1978],
  modern: [1982, 1986, 1990, 1994, 1998, 2002, 2006],
  current: [2010, 2014, 2018, 2022, 2026],
};

// CSV helpers — store array filters as comma-separated strings in the URL
// so deep links stay short and TanStack's zod adapter stays happy.
const csv = (s: string): string[] =>
  s.split(",").map((x) => x.trim()).filter(Boolean);
const searchString = z.preprocess((value) => value == null ? "" : String(value), z.string());

export const playersSearchSchema = z.object({
  tab: fallback(z.enum(PLAYER_TABS), "overview").default("overview"),
  q: fallback(searchString, "").default(""),
  years: fallback(searchString, "").default(""), // CSV of years
  countries: fallback(searchString, "").default(""), // CSV of countries
  confeds: fallback(searchString, "").default(""), // CSV of confederations
  pos: fallback(z.enum(POSITIONS), "ALL").default("ALL"),
  era: fallback(z.enum(ERAS), "ALL").default("ALL"),
  goalType: fallback(z.enum(GOAL_TYPES), "ALL").default("ALL"),
  minGoals: fallback(z.number().int().min(1).max(20), 1).default(1),
  sort: fallback(z.enum(SORTS), "goals").default("goals"),
  player: fallback(searchString, "").default(""), // "Name||Country"
  compare: fallback(searchString, "").default(""), // "Name||Country" entries joined by ;;
});

export type PlayersSearch = {
  tab: PlayerTab;
  q: string;
  years: string;
  countries: string;
  confeds: string;
  pos: PositionFilter;
  era: Era;
  goalType: GoalType;
  minGoals: number;
  sort: SortKey;
  player: string;
  compare: string;
};

export const playersDefaults: PlayersSearch = {
  tab: "overview",
  q: "",
  years: "",
  countries: "",
  confeds: "",
  pos: "ALL",
  era: "ALL",
  goalType: "ALL",
  minGoals: 1,
  sort: "goals",
  player: "",
  compare: "",
};

export const parseList = csv;
export const joinList = (xs: string[]) => xs.join(",");

export const parsePlayerKey = (key: string): { name: string; country: string } | null => {
  if (!key) return null;
  const [name, country] = key.split("||");
  if (!name || !country) return null;
  return { name, country };
};
export const playerKey = (name: string, country: string) => `${name}||${country}`;

export const parseComparePlayers = (raw: string) =>
  raw
    .split(";;")
    .map(parsePlayerKey)
    .filter((x): x is { name: string; country: string } => x !== null)
    .slice(0, 4);

export const joinComparePlayers = (
  players: { name: string; country: string }[],
) => players.map((p) => playerKey(p.name, p.country)).join(";;");

// Diacritic-insensitive fuzzy match.
export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const fuzzyMatch = (haystack: string, needle: string) => {
  if (!needle) return true;
  return norm(haystack).includes(norm(needle));
};

// Active filter count for the mobile sheet badge.
export function activeFilterCount(s: PlayersSearch): number {
  let n = 0;
  if (s.q) n++;
  if (parseList(s.years).length) n++;
  if (parseList(s.countries).length) n++;
  if (parseList(s.confeds).length) n++;
  if (s.pos !== "ALL") n++;
  if (s.era !== "ALL") n++;
  if (s.goalType !== "ALL") n++;
  if (s.minGoals > 1) n++;
  if (s.sort !== "goals") n++;
  return n;
}
