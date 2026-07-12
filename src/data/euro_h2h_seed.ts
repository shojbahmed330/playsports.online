/**
 * Curated UEFA European Championship head-to-head seed.
 * ESPN's uefa.euro schedule endpoint only returns the current tournament
 * cycle, so historical Euro meetings (finals, iconic knockouts) must be
 * hand-curated to keep H2H pages populated.
 *
 * Team names must match ESPN uefa.euro `displayName` for clean matching.
 */

export type EuroH2HMatch = {
  date: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  round: string;
};

export const EURO_H2H_SEED: Record<string, EuroH2HMatch[]> = {
  "france|portugal": [
    { date: "1984-06-23", home: "France", away: "Portugal", homeScore: 3, awayScore: 2, round: "Semi-final · Euro 1984 (a.e.t.)" },
    { date: "2000-06-28", home: "France", away: "Portugal", homeScore: 2, awayScore: 1, round: "Semi-final · Euro 2000 (Golden Goal)" },
    { date: "2016-07-10", home: "Portugal", away: "France", homeScore: 1, awayScore: 0, round: "Final · Euro 2016 (a.e.t.)" },
    { date: "2020-06-23", home: "Portugal", away: "France", homeScore: 2, awayScore: 2, round: "Group Stage · Euro 2020" },
    { date: "2024-07-05", home: "Portugal", away: "France", homeScore: 0, awayScore: 0, round: "Quarter-final · Euro 2024 (FRA won 5-3 pens)" },
  ],
  "england|italy": [
    { date: "2012-06-24", home: "England", away: "Italy", homeScore: 0, awayScore: 0, round: "Quarter-final · Euro 2012 (ITA won 4-2 pens)" },
    { date: "2021-07-11", home: "Italy", away: "England", homeScore: 1, awayScore: 1, round: "Final · Euro 2020 (ITA won 3-2 pens)" },
  ],
  "italy|spain": [
    { date: "2008-06-22", home: "Spain", away: "Italy", homeScore: 0, awayScore: 0, round: "Quarter-final · Euro 2008 (ESP won 4-2 pens)" },
    { date: "2012-07-01", home: "Spain", away: "Italy", homeScore: 4, awayScore: 0, round: "Final · Euro 2012" },
    { date: "2016-06-27", home: "Italy", away: "Spain", homeScore: 2, awayScore: 0, round: "Round of 16 · Euro 2016" },
    { date: "2021-07-06", home: "Italy", away: "Spain", homeScore: 1, awayScore: 1, round: "Semi-final · Euro 2020 (ITA won 4-2 pens)" },
    { date: "2024-06-20", home: "Spain", away: "Italy", homeScore: 1, awayScore: 0, round: "Group Stage · Euro 2024" },
  ],
  "germany|italy": [
    { date: "1996-06-19", home: "Germany", away: "Italy", homeScore: 0, awayScore: 0, round: "Group Stage · Euro 1996" },
    { date: "2012-06-28", home: "Germany", away: "Italy", homeScore: 1, awayScore: 2, round: "Semi-final · Euro 2012" },
    { date: "2016-07-02", home: "Germany", away: "Italy", homeScore: 1, awayScore: 1, round: "Quarter-final · Euro 2016 (GER won 6-5 pens)" },
  ],
  "france|germany": [
    { date: "2016-07-07", home: "France", away: "Germany", homeScore: 2, awayScore: 0, round: "Semi-final · Euro 2016" },
    { date: "2020-06-15", home: "France", away: "Germany", homeScore: 1, awayScore: 0, round: "Group Stage · Euro 2020" },
  ],
  "england|netherlands": [
    { date: "1988-06-15", home: "Netherlands", away: "England", homeScore: 3, awayScore: 1, round: "Group Stage · Euro 1988" },
    { date: "1996-06-18", home: "England", away: "Netherlands", homeScore: 4, awayScore: 1, round: "Group Stage · Euro 1996" },
    { date: "2004-06-22", home: "Netherlands", away: "England", homeScore: 4, awayScore: 1, round: "Group Stage · Euro 2004" },
    { date: "2024-07-10", home: "Netherlands", away: "England", homeScore: 1, awayScore: 2, round: "Semi-final · Euro 2024" },
  ],
  "greece|portugal": [
    { date: "2004-06-12", home: "Portugal", away: "Greece", homeScore: 1, awayScore: 2, round: "Group Stage · Euro 2004" },
    { date: "2004-07-04", home: "Portugal", away: "Greece", homeScore: 0, awayScore: 1, round: "Final · Euro 2004" },
  ],
  "england|germany": [
    { date: "1996-06-26", home: "England", away: "Germany", homeScore: 1, awayScore: 1, round: "Semi-final · Euro 1996 (GER won 6-5 pens)" },
    { date: "2000-06-17", home: "England", away: "Germany", homeScore: 1, awayScore: 0, round: "Group Stage · Euro 2000" },
    { date: "2020-06-29", home: "England", away: "Germany", homeScore: 2, awayScore: 0, round: "Round of 16 · Euro 2020" },
  ],
  "netherlands|soviet union": [
    { date: "1988-06-25", home: "Netherlands", away: "Soviet Union", homeScore: 2, awayScore: 0, round: "Final · Euro 1988" },
  ],
  "denmark|germany": [
    { date: "1992-06-26", home: "Denmark", away: "Germany", homeScore: 2, awayScore: 0, round: "Final · Euro 1992" },
  ],
  "france|spain": [
    { date: "1984-06-27", home: "France", away: "Spain", homeScore: 2, awayScore: 0, round: "Final · Euro 1984" },
    { date: "2024-07-09", home: "Spain", away: "France", homeScore: 2, awayScore: 1, round: "Semi-final · Euro 2024" },
  ],
  "germany|spain": [
    { date: "2008-06-29", home: "Germany", away: "Spain", homeScore: 0, awayScore: 1, round: "Final · Euro 2008" },
    { date: "2024-07-05", home: "Spain", away: "Germany", homeScore: 2, awayScore: 1, round: "Quarter-final · Euro 2024 (a.e.t.)" },
  ],
};

function keyFor(a: string, b: string): string {
  const [x, y] = [a.trim().toLowerCase(), b.trim().toLowerCase()].sort();
  return `${x}|${y}`;
}

export function seededEuroH2H(a: string, b: string): EuroH2HMatch[] {
  return EURO_H2H_SEED[keyFor(a, b)] ?? [];
}
