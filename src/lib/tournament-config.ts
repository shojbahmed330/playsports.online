/**
 * Central tournament + season config.
 *
 * Goal: remove "2026" / "2025" hard-codes from across the app so future
 * tournaments (2030 WC, IPL 2027, MLB 2027, etc.) appear automatically
 * — kono code deploy ke wait na kore.
 *
 * Step 1 of the Auto-Update plan.
 */

// ---------- FIFA Men's World Cup ----------

export type WcSeasonWindow = {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  host: string;
  teams: number;
  /** Key into KNOCKOUT_FORMATS registry (Step 4). */
  format: string;
};

export const FOOTBALL_WC = {
  /** Full historical + future-confirmed year list. */
  years: [
    1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974,
    1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014,
    2018, 2022, 2026, 2030, 2034,
  ] as const,

  /** Confirmed window + format per future season. */
  seasonWindows: {
    2026: { start: "2026-06-11", end: "2026-07-19", host: "USA/CAN/MEX",  teams: 48, format: "r32_48team_v1" },
    2030: { start: "2030-06-08", end: "2030-07-21", host: "ESP/POR/MAR",  teams: 48, format: "r32_48team_v1" },
    2034: { start: "2034-11-01", end: "2034-12-18", host: "Saudi Arabia", teams: 48, format: "r32_48team_v1" },
  } as Record<number, WcSeasonWindow>,
};

/**
 * Choose the "current" WC year for landing pages / SEO.
 * Rule: if a tournament is currently running → that year.
 * Otherwise → the next upcoming year with a confirmed window.
 * Fallback → latest year with a confirmed window.
 */
export function pickCurrentWcYear(now: Date = new Date()): number {
  const ts = now.getTime();
  const entries = Object.entries(FOOTBALL_WC.seasonWindows)
    .map(([y, w]) => ({ year: Number(y), start: new Date(w.start).getTime(), end: new Date(w.end).getTime() }))
    .sort((a, b) => a.year - b.year);

  // 1. currently running
  for (const e of entries) {
    if (ts >= e.start && ts <= e.end) return e.year;
  }
  // 2. next upcoming
  for (const e of entries) {
    if (ts < e.start) return e.year;
  }
  // 3. latest known
  return entries[entries.length - 1]?.year ?? 2026;
}

/** Active "live data" WC year — the one whose ESPN feed we should poll. */
export function liveWcYear(now: Date = new Date()): number {
  return pickCurrentWcYear(now);
}

// ---------- Other sports — date-based current season ----------

type Sport = "mlb" | "nba" | "nhl" | "mls";

/**
 * Date-based current-season picker. Falls back to previous year for off-season
 * sports so leaderboard / standings UI always shows the most recently meaningful
 * year — callers should still try current → previous if the API returns empty.
 */
export function currentSeason(sport: Sport, now: Date = new Date()): number {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1; // 1..12

  switch (sport) {
    case "mlb":
      // Regular season Mar–Oct, postseason Oct–early Nov.
      return m >= 3 && m <= 11 ? y : y - 1;

    case "nba":
      // Season spans Oct (year N) → Jun (year N+1). API uses end-year.
      return m >= 10 ? y + 1 : y;

    case "nhl":
      // Same split as NBA.
      return m >= 10 ? y + 1 : y;

    case "mls":
      // Single calendar year (Feb–Dec).
      return y;
  }
}
