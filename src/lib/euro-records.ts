/**
 * Euro-specific records data — curated static leaderboards feeding the
 * `/football/euro/records` page. Same shape/pattern as `euro-history.ts`.
 * No fetching, no state.
 */

import { flagFor } from "@/lib/euro-history";

export type LeaderRow = {
  rank: number;
  name: string;
  nation: string;
  value: number;
  suffix?: string;
  note?: string;
  year?: number;
};

/** All-time Euro top scorers (finals tournaments only). */
export const EURO_TOP_SCORERS: LeaderRow[] = [
  { rank: 1, name: "Cristiano Ronaldo", nation: "Portugal", value: 14, note: "5 tournaments" },
  { rank: 2, name: "Michel Platini", nation: "France", value: 9, note: "Euro 1984" },
  { rank: 3, name: "Alan Shearer", nation: "England", value: 7, note: "1992–2000" },
  { rank: 4, name: "Antoine Griezmann", nation: "France", value: 7, note: "2016–2024" },
  { rank: 5, name: "Ruud van Nistelrooy", nation: "Netherlands", value: 6, note: "2004–2008" },
  { rank: 6, name: "Álvaro Morata", nation: "Spain", value: 6, note: "2016–2024" },
];

/** Most Euro titles won by nation. */
export const EURO_MOST_TITLES: LeaderRow[] = [
  { rank: 1, name: "Spain", nation: "Spain", value: 4, note: "1964 · 2008 · 2012 · 2024" },
  { rank: 2, name: "Germany", nation: "Germany", value: 3, note: "1972 · 1980 · 1996" },
  { rank: 3, name: "Italy", nation: "Italy", value: 2, note: "1968 · 2020" },
  { rank: 4, name: "France", nation: "France", value: 2, note: "1984 · 2000" },
  { rank: 5, name: "Portugal", nation: "Portugal", value: 1, note: "2016" },
  { rank: 6, name: "Greece", nation: "Greece", value: 1, note: "2004" },
];

/** Most Euro final tournaments appeared in (as a player). */
export const EURO_MOST_APPEARANCES: LeaderRow[] = [
  { rank: 1, name: "Cristiano Ronaldo", nation: "Portugal", value: 30, suffix: "matches", note: "5 tournaments · 2004–2024" },
  { rank: 2, name: "Pepe", nation: "Portugal", value: 21, suffix: "matches", note: "4 tournaments" },
  { rank: 3, name: "Bastian Schweinsteiger", nation: "Germany", value: 18, suffix: "matches", note: "2004–2016" },
  { rank: 4, name: "Manuel Neuer", nation: "Germany", value: 18, suffix: "matches", note: "2012–2024" },
  { rank: 5, name: "Toni Kroos", nation: "Germany", value: 17, suffix: "matches", note: "2012–2024" },
  { rank: 6, name: "João Moutinho", nation: "Portugal", value: 17, suffix: "matches", note: "2012–2020" },
];

/** Most goals scored in a single Euro tournament (individual). */
export const EURO_SINGLE_EDITION_GOALS: LeaderRow[] = [
  { rank: 1, name: "Michel Platini", nation: "France", value: 9, year: 1984, note: "5 matches — record still stands" },
  { rank: 2, name: "Antoine Griezmann", nation: "France", value: 6, year: 2016, note: "Golden Boot · 7 matches" },
  { rank: 3, name: "Alan Shearer", nation: "England", value: 5, year: 1996, note: "Golden Boot" },
  { rank: 4, name: "Patrick Kluivert", nation: "Netherlands", value: 5, year: 2000 },
  { rank: 5, name: "Milan Baroš", nation: "Czech Republic", value: 5, year: 2004, note: "Golden Boot" },
];

export type RecordMoment = {
  date: string; // ISO YYYY-MM-DD
  headline: string;
  detail: string;
  year: number;
};

/** "On this day" record-setting moments. Curated, sorted by month-day. */
export const EURO_RECORD_MOMENTS: RecordMoment[] = [
  { date: "2024-07-14", headline: "Spain claim 4th title", detail: "Beat England 2–1 in Berlin — record fourth Euro crown, most of any nation.", year: 2024 },
  { date: "2016-07-10", headline: "Portugal's first major trophy", detail: "Éder's extra-time strike sinks France 1–0 in Paris. Ronaldo lifts it despite an early injury.", year: 2016 },
  { date: "2012-07-01", headline: "Biggest final win", detail: "Spain 4–0 Italy in Kyiv — largest winning margin in a Euro final.", year: 2012 },
  { date: "2004-07-04", headline: "Greatest upset in Euro history", detail: "Greece 1–0 Portugal in Lisbon — 150-1 outsiders lift the trophy.", year: 2004 },
  { date: "1984-06-27", headline: "Platini's 9-goal record set", detail: "France beat Spain 2–0 to win Euro '84; Platini finishes with 9 goals in 5 matches — still unmatched.", year: 1984 },
];

/** Pick the closest "on this day" record moment. */
export function nextRecordMoment(now = new Date()): { moment: RecordMoment; daysAway: number; isToday: boolean } | null {
  if (!EURO_RECORD_MOMENTS.length) return null;
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const y = now.getUTCFullYear();
  let best: { moment: RecordMoment; daysAway: number; isToday: boolean } | null = null;
  for (const m of EURO_RECORD_MOMENTS) {
    const [, mm, dd] = m.date.split("-").map(Number);
    const thisYear = Date.UTC(y, mm - 1, dd);
    const cand = thisYear >= nowUtc ? thisYear : Date.UTC(y + 1, mm - 1, dd);
    const daysAway = Math.round((cand - nowUtc) / 86_400_000);
    if (!best || daysAway < best.daysAway) {
      best = { moment: m, daysAway, isToday: daysAway === 0 };
    }
  }
  return best;
}

export function flag(nation: string): string {
  return flagFor(nation);
}
