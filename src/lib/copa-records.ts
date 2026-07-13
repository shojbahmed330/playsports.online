/**
 * Copa América records + history-filter data. Curated static leaderboards
 * feeding `/football/copa-america/records` and the history filter chips.
 * Same shape/pattern as `euro-records.ts`. No fetching, no state.
 */

import type { EditionSummary } from "@/data/competition-editions";
import { copaFlag, getCopaEditions } from "@/lib/copa-history";

export type LeaderRow = {
  rank: number;
  name: string;
  nation: string;
  value: number;
  suffix?: string;
  note?: string;
  year?: number;
};

/** All-time Copa América top scorers. */
export const COPA_TOP_SCORERS_LB: LeaderRow[] = [
  { rank: 1, name: "Norberto Méndez", nation: "Argentina", value: 17, note: "1945–1956 · 3 titles" },
  { rank: 2, name: "Zizinho", nation: "Brazil", value: 17, note: "1942–1957 · 1949 champion" },
  { rank: 3, name: "Teodoro Fernández", nation: "Peru", value: 15, note: "1935–1947" },
  { rank: 4, name: "Severino Varela", nation: "Uruguay", value: 15, note: "1939–1947" },
  { rank: 5, name: "Ademir", nation: "Brazil", value: 13, note: "1945–1953" },
  { rank: 6, name: "Lionel Messi", nation: "Argentina", value: 13, note: "2007–2024 · 2 titles" },
];

/** Most Copa América titles won by nation. */
export const COPA_MOST_TITLES_LB: LeaderRow[] = [
  { rank: 1, name: "Argentina", nation: "Argentina", value: 16, note: "last: 2024" },
  { rank: 2, name: "Uruguay", nation: "Uruguay", value: 15, note: "last: 2011" },
  { rank: 3, name: "Brazil", nation: "Brazil", value: 9, note: "last: 2019" },
  { rank: 4, name: "Peru", nation: "Peru", value: 2, note: "1939 · 1975" },
  { rank: 5, name: "Paraguay", nation: "Paraguay", value: 2, note: "1953 · 1979" },
  { rank: 6, name: "Chile", nation: "Chile", value: 2, note: "2015 · 2016" },
];

/** Most Copa América tournament appearances (as a player). */
export const COPA_MOST_APPS_LB: LeaderRow[] = [
  { rank: 1, name: "Lionel Messi", nation: "Argentina", value: 39, suffix: "matches", note: "2007–2024" },
  { rank: 2, name: "Sergio Livingstone", nation: "Chile", value: 34, suffix: "matches", note: "1941–1953" },
  { rank: 3, name: "Ángel Romero", nation: "Paraguay", value: 34, suffix: "matches", note: "2011–2024" },
  { rank: 4, name: "Zizinho", nation: "Brazil", value: 33, suffix: "matches", note: "1942–1957" },
  { rank: 5, name: "Ángel Di María", nation: "Argentina", value: 30, suffix: "matches", note: "2011–2024" },
  { rank: 6, name: "Carlos Valderrama", nation: "Colombia", value: 27, suffix: "matches", note: "1987–1995" },
];

/** Most goals scored in a single Copa América tournament (individual). */
export const COPA_SINGLE_EDITION_GOALS_LB: LeaderRow[] = [
  { rank: 1, name: "Jair", nation: "Brazil", value: 9, year: 1949, note: "Golden Boot" },
  { rank: 2, name: "Humberto Maschio", nation: "Argentina", value: 9, year: 1957, note: "Golden Boot" },
  { rank: 3, name: "Javier Ambrois", nation: "Uruguay", value: 7, year: 1957 },
  { rank: 4, name: "Paolo Guerrero", nation: "Peru", value: 5, year: 2011, note: "Golden Boot" },
  { rank: 5, name: "Eduardo Vargas", nation: "Chile", value: 6, year: 2016, note: "Centenario" },
];

export type RecordMoment = {
  date: string; // YYYY-MM-DD
  headline: string;
  detail: string;
  year: number;
};

/** "On this day" record-setting Copa moments. */
export const COPA_RECORD_MOMENTS: RecordMoment[] = [
  { date: "2024-07-14", headline: "Argentina's record 16th Copa", detail: "Lautaro's 112th-minute winner beats Colombia 1–0 in Miami. Argentina overtake Uruguay as the sole title leader.", year: 2024 },
  { date: "2021-07-10", headline: "Messi's first major with Argentina", detail: "Di María chips Ederson at the Maracanã — Argentina 1–0 Brazil, ending a 28-year trophy drought.", year: 2021 },
  { date: "2019-07-07", headline: "Brazil back home", detail: "Brazil beat Peru 3–1 at the Maracanã — first Copa at home since 1989.", year: 2019 },
  { date: "2016-06-26", headline: "Chile go back-to-back", detail: "Chile beat Argentina on pens again — this time in the Centenario final at MetLife.", year: 2016 },
  { date: "2015-07-04", headline: "Chile's first-ever Copa", detail: "Chile beat Argentina 4–1 on pens in Santiago — end of a 99-year wait for a first title.", year: 2015 },
  { date: "2011-07-24", headline: "Uruguay's record 15th", detail: "Uruguay beat Paraguay 3–0 in Buenos Aires to reclaim the record title haul.", year: 2011 },
];

export function nextCopaRecordMoment(now = new Date()): { moment: RecordMoment; daysAway: number; isToday: boolean } | null {
  if (!COPA_RECORD_MOMENTS.length) return null;
  const ms = 86_400_000;
  const y = now.getUTCFullYear();
  let best: { moment: RecordMoment; daysAway: number; isToday: boolean } | null = null;
  for (const m of COPA_RECORD_MOMENTS) {
    const [, mm, dd] = m.date.split("-").map(Number);
    const next = new Date(Date.UTC(y, mm - 1, dd));
    if (next.getTime() < Date.UTC(y, now.getUTCMonth(), now.getUTCDate())) {
      next.setUTCFullYear(y + 1);
    }
    const days = Math.round((next.getTime() - Date.UTC(y, now.getUTCMonth(), now.getUTCDate())) / ms);
    const isToday = mm === now.getUTCMonth() + 1 && dd === now.getUTCDate();
    if (!best || days < best.daysAway || (isToday && !best.isToday)) {
      best = { moment: m, daysAway: days, isToday };
    }
    if (isToday) break;
  }
  return best;
}

// ---------------- Copa history filters ----------------

export type CopaFilterId = "all" | "amateur" | "modern" | "centenario";

export const COPA_FILTERS: { id: CopaFilterId; label: string }[] = [
  { id: "all", label: "All eras" },
  { id: "amateur", label: "Amateur (1916–1974)" },
  { id: "modern", label: "Modern (1975–1999)" },
  { id: "centenario", label: "Centenario+ (2016–now)" },
];

export function copaFiltersMatch(e: EditionSummary, f: CopaFilterId): boolean {
  switch (f) {
    case "all": return true;
    case "amateur": return e.year <= 1974;
    case "modern": return e.year >= 1975 && e.year <= 1999;
    case "centenario": return e.year >= 2016;
    default: return true;
  }
}

/** Anniversary of a Copa final relative to today. */
export function copaAnniversary(): { edition: EditionSummary; yearsAgo: number; isToday: boolean; daysAway: number } | null {
  const withDate = getCopaEditions().filter((e) => e.finalDate);
  if (!withDate.length) return null;
  const now = new Date();
  const y = now.getUTCFullYear();
  const ms = 86_400_000;
  let best: { edition: EditionSummary; yearsAgo: number; isToday: boolean; daysAway: number } | null = null;
  for (const e of withDate) {
    const [yr, mm, dd] = (e.finalDate as string).split("-").map(Number);
    const next = new Date(Date.UTC(y, mm - 1, dd));
    if (next.getTime() < Date.UTC(y, now.getUTCMonth(), now.getUTCDate())) {
      next.setUTCFullYear(y + 1);
    }
    const days = Math.round((next.getTime() - Date.UTC(y, now.getUTCMonth(), now.getUTCDate())) / ms);
    const isToday = mm === now.getUTCMonth() + 1 && dd === now.getUTCDate();
    if (!best || days < best.daysAway || (isToday && !best.isToday)) {
      best = { edition: e, yearsAgo: y - yr, isToday, daysAway: days };
    }
    if (isToday) break;
  }
  return best;
}

/** Convenience flag lookup used in shared row templates. */
export function flag(nation: string): string {
  return copaFlag(nation);
}
