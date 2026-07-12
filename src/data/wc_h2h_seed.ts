/**
 * Curated FIFA World Cup head-to-head seed.
 * ESPN's fifa.world team schedule endpoint only returns the current tournament,
 * so historical matchups (e.g. Argentina vs Brazil across every WC) require
 * hand-curated data. Add more nation pairings as needed.
 *
 * Team names must match ESPN's `displayName` for fifa.world teams so the
 * dropdown selection resolves cleanly.
 */

export type WcH2HMatch = {
  date: string; // ISO
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  round: string; // e.g. "Group Stage · 1974", "Round of 16 · 1990", "Final · 1978"
};

// Key is `${lowerA}|${lowerB}` where the two team names are sorted
// alphabetically. Always look up with the sorted key.
export const WC_H2H_SEED: Record<string, WcH2HMatch[]> = {
  "argentina|brazil": [
    { date: "1978-06-18", home: "Brazil", away: "Argentina", homeScore: 0, awayScore: 0, round: "Second Round · 1978" },
    { date: "1982-07-02", home: "Brazil", away: "Argentina", homeScore: 3, awayScore: 1, round: "Second Round · 1982" },
    { date: "1990-06-24", home: "Argentina", away: "Brazil", homeScore: 1, awayScore: 0, round: "Round of 16 · 1990" },
  ],
  "argentina|germany": [
    { date: "1958-06-08", home: "West Germany", away: "Argentina", homeScore: 3, awayScore: 1, round: "Group Stage · 1958" },
    { date: "1966-07-16", home: "West Germany", away: "Argentina", homeScore: 0, awayScore: 0, round: "Group Stage · 1966" },
    { date: "1986-06-29", home: "Argentina", away: "West Germany", homeScore: 3, awayScore: 2, round: "Final · 1986" },
    { date: "1990-07-08", home: "West Germany", away: "Argentina", homeScore: 1, awayScore: 0, round: "Final · 1990" },
    { date: "2006-06-30", home: "Germany", away: "Argentina", homeScore: 1, awayScore: 1, round: "Quarter-final · 2006 (GER won 4-2 on pens)" },
    { date: "2010-07-03", home: "Germany", away: "Argentina", homeScore: 4, awayScore: 0, round: "Quarter-final · 2010" },
    { date: "2014-07-13", home: "Germany", away: "Argentina", homeScore: 1, awayScore: 0, round: "Final · 2014 (a.e.t.)" },
  ],
  "brazil|france": [
    { date: "1958-06-24", home: "Brazil", away: "France", homeScore: 5, awayScore: 2, round: "Semi-final · 1958" },
    { date: "1986-06-21", home: "France", away: "Brazil", homeScore: 1, awayScore: 1, round: "Quarter-final · 1986 (FRA won 4-3 pens)" },
    { date: "1998-07-12", home: "France", away: "Brazil", homeScore: 3, awayScore: 0, round: "Final · 1998" },
    { date: "2006-07-01", home: "France", away: "Brazil", homeScore: 1, awayScore: 0, round: "Quarter-final · 2006" },
  ],
  "brazil|germany": [
    { date: "2002-06-30", home: "Brazil", away: "Germany", homeScore: 2, awayScore: 0, round: "Final · 2002" },
    { date: "2014-07-08", home: "Brazil", away: "Germany", homeScore: 1, awayScore: 7, round: "Semi-final · 2014" },
  ],
  "argentina|france": [
    { date: "1930-07-15", home: "Argentina", away: "France", homeScore: 1, awayScore: 0, round: "Group Stage · 1930" },
    { date: "1978-06-06", home: "Argentina", away: "France", homeScore: 2, awayScore: 1, round: "Group Stage · 1978" },
    { date: "2018-06-30", home: "France", away: "Argentina", homeScore: 4, awayScore: 3, round: "Round of 16 · 2018" },
    { date: "2022-12-18", home: "Argentina", away: "France", homeScore: 3, awayScore: 3, round: "Final · 2022 (ARG won 4-2 pens)" },
  ],
  "england|germany": [
    { date: "1966-07-30", home: "England", away: "West Germany", homeScore: 4, awayScore: 2, round: "Final · 1966 (a.e.t.)" },
    { date: "1970-06-14", home: "West Germany", away: "England", homeScore: 3, awayScore: 2, round: "Quarter-final · 1970 (a.e.t.)" },
    { date: "1990-07-04", home: "West Germany", away: "England", homeScore: 1, awayScore: 1, round: "Semi-final · 1990 (GER won 4-3 pens)" },
    { date: "2010-06-27", home: "Germany", away: "England", homeScore: 4, awayScore: 1, round: "Round of 16 · 2010" },
  ],
  "brazil|italy": [
    { date: "1970-06-21", home: "Brazil", away: "Italy", homeScore: 4, awayScore: 1, round: "Final · 1970" },
    { date: "1982-07-05", home: "Italy", away: "Brazil", homeScore: 3, awayScore: 2, round: "Second Round · 1982" },
    { date: "1994-07-17", home: "Brazil", away: "Italy", homeScore: 0, awayScore: 0, round: "Final · 1994 (BRA won 3-2 pens)" },
  ],
  "france|germany": [
    { date: "1982-07-08", home: "West Germany", away: "France", homeScore: 3, awayScore: 3, round: "Semi-final · 1982 (GER won 5-4 pens)" },
    { date: "1986-06-25", home: "West Germany", away: "France", homeScore: 2, awayScore: 0, round: "Semi-final · 1986" },
    { date: "2014-07-04", home: "France", away: "Germany", homeScore: 0, awayScore: 1, round: "Quarter-final · 2014" },
  ],
};

function keyFor(a: string, b: string): string {
  const [x, y] = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort();
  return `${x}|${y}`;
}

export function seededWcH2H(a: string, b: string): WcH2HMatch[] {
  return WC_H2H_SEED[keyFor(a, b)] ?? [];
}
