/**
 * Copa América helpers on top of `COMPETITION_EDITIONS["copa-america"]`.
 * Pure functions — no fetching, no state.
 */

import { COMPETITION_EDITIONS, type EditionSummary } from "@/data/competition-editions";
import { titleCounts } from "@/lib/competition-history";

export const COPA_NATION_FLAG: Record<string, string> = {
  Argentina: "🇦🇷",
  Brazil: "🇧🇷",
  Uruguay: "🇺🇾",
  Chile: "🇨🇱",
  Paraguay: "🇵🇾",
  Peru: "🇵🇪",
  Bolivia: "🇧🇴",
  Colombia: "🇨🇴",
  Ecuador: "🇪🇨",
  Venezuela: "🇻🇪",
  Mexico: "🇲🇽",
  "United States": "🇺🇸",
  "Home-and-away": "🌎",
};

export function copaFlag(nation?: string): string {
  if (!nation) return "🏳️";
  return COPA_NATION_FLAG[nation.trim()] ?? "🏳️";
}

export function getCopaEditions(): EditionSummary[] {
  return COMPETITION_EDITIONS["copa-america"] ?? [];
}

export function getCopaTopScorerByYear(year: number) {
  return getCopaEditions().find((e) => e.year === year)?.topScorer;
}

export type CopaStats = {
  tournaments: number;
  champions: number;
  span: string;
  goals: number;
  matches: number;
};

export function copaStats(): CopaStats {
  const eds = getCopaEditions().filter((e) => e.winner && e.winner !== "TBD");
  const winners = new Set(eds.map((e) => e.winner));
  const goals = eds.reduce((s, e) => s + (e.goals ?? 0), 0);
  const matches = eds.reduce((s, e) => s + (e.matches ?? 0), 0);
  const years = eds.map((e) => e.year).sort((a, b) => a - b);
  const first = years[0] ?? 1916;
  const last = years[years.length - 1] ?? new Date().getFullYear();
  return {
    tournaments: eds.length,
    champions: winners.size,
    span: `${first} → ${last}`,
    goals,
    matches,
  };
}

/** Titles-by-nation aggregate for Copa. */
export function copaTitleCounts() {
  return titleCounts("copa-america");
}

// ---------------- Curated static datasets ----------------

export type CopaScorer = { name: string; nation: string; goals: number; era: string };
export const COPA_ALLTIME_TOP_SCORERS: CopaScorer[] = [
  { name: "Norberto Méndez", nation: "Argentina", goals: 17, era: "1945–1956" },
  { name: "Zizinho", nation: "Brazil", goals: 17, era: "1942–1957" },
  { name: "Teodoro Fernández", nation: "Peru", goals: 15, era: "1935–1947" },
  { name: "Severino Varela", nation: "Uruguay", goals: 15, era: "1939–1947" },
  { name: "Ademir", nation: "Brazil", goals: 13, era: "1945–1953" },
  { name: "Eduardo Vargas", nation: "Chile", goals: 13, era: "2011–2021" },
  { name: "Gabriel Batistuta", nation: "Argentina", goals: 13, era: "1991–1995" },
  { name: "Lionel Messi", nation: "Argentina", goals: 13, era: "2007–2024" },
];

export type CopaApp = { name: string; nation: string; apps: number; era: string };
export const COPA_MOST_APPEARANCES: CopaApp[] = [
  { name: "Sergio Livingstone", nation: "Chile", apps: 34, era: "1941–1953" },
  { name: "Ángel Romero", nation: "Paraguay", apps: 34, era: "2011–2024" },
  { name: "Lionel Messi", nation: "Argentina", apps: 39, era: "2007–2024" },
  { name: "Zizinho", nation: "Brazil", apps: 33, era: "1942–1957" },
  { name: "Ángel Di María", nation: "Argentina", apps: 30, era: "2011–2024" },
  { name: "Carlos Valderrama", nation: "Colombia", apps: 27, era: "1987–1995" },
];

export type CopaLegend = {
  name: string;
  playerId?: string;
  tally: string;
  years: string;
  decade: string;
  image?: string;
};

export const COPA_LEGENDS: CopaLegend[] = [
  {
    name: "Lionel Messi",
    playerId: "45843",
    tally: "13 goals · 2 titles",
    years: "Argentina · 2007–2024",
    decade: "2007→",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/45843.png",
  },
  {
    name: "Zizinho",
    tally: "17 goals · 1949 champion",
    years: "Brazil · 1942–1957",
    decade: "1940s–50s",
  },
  {
    name: "Norberto Méndez",
    tally: "17 goals · 3 titles",
    years: "Argentina · 1945–1956",
    decade: "1940s–50s",
  },
  {
    name: "Alexis Sánchez",
    playerId: "45262",
    tally: "2 titles · 2015 & 2016",
    years: "Chile · 2007–2024",
    decade: "2010s",
    image: "https://a.espncdn.com/i/headshots/soccer/players/full/45262.png",
  },
  {
    name: "Ronaldo",
    tally: "10 Copa goals · 2 titles",
    years: "Brazil · 1995–1999",
    decade: "1990s",
  },
  {
    name: "Eduardo Vargas",
    tally: "13 Copa goals · 2 titles",
    years: "Chile · 2011–2021",
    decade: "2010s",
  },
];

export type CopaMatchup = { a: string; b: string; flags: string };
export const COPA_MATCHUPS: CopaMatchup[] = [
  { a: "Argentina", b: "Brazil", flags: "🇦🇷 🇧🇷" },
  { a: "Argentina", b: "Uruguay", flags: "🇦🇷 🇺🇾" },
  { a: "Brazil", b: "Uruguay", flags: "🇧🇷 🇺🇾" },
  { a: "Chile", b: "Argentina", flags: "🇨🇱 🇦🇷" },
  { a: "Colombia", b: "Argentina", flags: "🇨🇴 🇦🇷" },
  { a: "Brazil", b: "Paraguay", flags: "🇧🇷 🇵🇾" },
];

/** On-this-day hits: date-based match against finalDate, then loose text scan. */
export function getCopaOnThisDay(today: Date): { year: number; text: string }[] {
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const key = `${mm}-${dd}`;
  const hits: { year: number; text: string }[] = [];
  for (const e of getCopaEditions()) {
    if (e.finalDate && e.finalDate.endsWith(`-${key}`)) {
      hits.push({
        year: e.year,
        text: `Copa ${e.year} final — ${e.winner} ${e.finalScore ?? "beat"} ${e.runnerUp ?? ""}${e.finalVenue ? ` at ${e.finalVenue}` : ""}.`,
      });
    }
    if (!e.notableMoments) continue;
    for (const m of e.notableMoments) {
      if (mentionsToday(m, today)) hits.push({ year: e.year, text: m });
    }
  }
  return hits;
}

function mentionsToday(text: string, today: Date): boolean {
  const day = today.getDate();
  const monthIdx = today.getMonth();
  const monthLong = today.toLocaleString("en-GB", { month: "long" });
  const monthShort = today.toLocaleString("en-GB", { month: "short" });
  const lower = text.toLowerCase();
  const re = new RegExp(
    `\\b${day}\\s*(st|nd|rd|th)?\\s*(of\\s+)?${monthLong.toLowerCase()}|` +
      `${monthLong.toLowerCase()}\\s+${day}\\b|` +
      `${monthShort.toLowerCase()}\\s+${day}\\b|` +
      `\\b${String(day).padStart(2, "0")}[/-]${String(monthIdx + 1).padStart(2, "0")}\\b`,
  );
  return re.test(lower);
}
