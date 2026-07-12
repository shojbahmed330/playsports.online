// Per-tournament FIFA World Cup summary rows.
// Consumed by /football/tournaments/$year and country-year pages for SEO.
// Sources: Wikipedia (FIFA World Cup editions) + wc_champions.ts.

export type WcTournament = {
  year: number;
  host: string;
  hostSlug: string;         // simple slug (e.g. "qatar", "south-korea-japan")
  champion: string;
  runnerUp: string;
  third?: string;
  fourth?: string;
  finalScore: string;
  topScorer: string;
  topScorerGoals: number;
  topScorerTeam: string;
  goldenBall?: string;      // best player
  teams: number;            // participating nations
  matches: number;
  totalGoals: number;
  goalsPerMatch: string;    // formatted
  attendance?: number;
  startDate: string;        // ISO
  endDate: string;
};

export const WC_TOURNAMENTS: WcTournament[] = [
  { year: 1930, host: "Uruguay", hostSlug: "uruguay", champion: "Uruguay", runnerUp: "Argentina", third: "United States", fourth: "Yugoslavia", finalScore: "4-2", topScorer: "Guillermo Stábile", topScorerGoals: 8, topScorerTeam: "Argentina", teams: 13, matches: 18, totalGoals: 70, goalsPerMatch: "3.89", attendance: 590549, startDate: "1930-07-13", endDate: "1930-07-30" },
  { year: 1934, host: "Italy", hostSlug: "italy", champion: "Italy", runnerUp: "Czechoslovakia", third: "Germany", fourth: "Austria", finalScore: "2-1 (a.e.t.)", topScorer: "Oldřich Nejedlý", topScorerGoals: 5, topScorerTeam: "Czechoslovakia", teams: 16, matches: 17, totalGoals: 70, goalsPerMatch: "4.12", attendance: 363000, startDate: "1934-05-27", endDate: "1934-06-10" },
  { year: 1938, host: "France", hostSlug: "france", champion: "Italy", runnerUp: "Hungary", third: "Brazil", fourth: "Sweden", finalScore: "4-2", topScorer: "Leônidas", topScorerGoals: 7, topScorerTeam: "Brazil", teams: 15, matches: 18, totalGoals: 84, goalsPerMatch: "4.67", attendance: 375700, startDate: "1938-06-04", endDate: "1938-06-19" },
  { year: 1950, host: "Brazil", hostSlug: "brazil", champion: "Uruguay", runnerUp: "Brazil", third: "Sweden", fourth: "Spain", finalScore: "2-1", topScorer: "Ademir", topScorerGoals: 8, topScorerTeam: "Brazil", teams: 13, matches: 22, totalGoals: 88, goalsPerMatch: "4.00", attendance: 1045246, startDate: "1950-06-24", endDate: "1950-07-16" },
  { year: 1954, host: "Switzerland", hostSlug: "switzerland", champion: "West Germany", runnerUp: "Hungary", third: "Austria", fourth: "Uruguay", finalScore: "3-2", topScorer: "Sándor Kocsis", topScorerGoals: 11, topScorerTeam: "Hungary", teams: 16, matches: 26, totalGoals: 140, goalsPerMatch: "5.38", attendance: 768607, startDate: "1954-06-16", endDate: "1954-07-04" },
  { year: 1958, host: "Sweden", hostSlug: "sweden", champion: "Brazil", runnerUp: "Sweden", third: "France", fourth: "West Germany", finalScore: "5-2", topScorer: "Just Fontaine", topScorerGoals: 13, topScorerTeam: "France", teams: 16, matches: 35, totalGoals: 126, goalsPerMatch: "3.60", attendance: 819810, startDate: "1958-06-08", endDate: "1958-06-29" },
  { year: 1962, host: "Chile", hostSlug: "chile", champion: "Brazil", runnerUp: "Czechoslovakia", third: "Chile", fourth: "Yugoslavia", finalScore: "3-1", topScorer: "Garrincha / Vavá / Sánchez / Ivanov / Albert / Jerković", topScorerGoals: 4, topScorerTeam: "Brazil / Chile / USSR / Hungary / Yugoslavia", teams: 16, matches: 32, totalGoals: 89, goalsPerMatch: "2.78", attendance: 893172, startDate: "1962-05-30", endDate: "1962-06-17" },
  { year: 1966, host: "England", hostSlug: "england", champion: "England", runnerUp: "West Germany", third: "Portugal", fourth: "Soviet Union", finalScore: "4-2 (a.e.t.)", topScorer: "Eusébio", topScorerGoals: 9, topScorerTeam: "Portugal", teams: 16, matches: 32, totalGoals: 89, goalsPerMatch: "2.78", attendance: 1563135, startDate: "1966-07-11", endDate: "1966-07-30" },
  { year: 1970, host: "Mexico", hostSlug: "mexico", champion: "Brazil", runnerUp: "Italy", third: "West Germany", fourth: "Uruguay", finalScore: "4-1", topScorer: "Gerd Müller", topScorerGoals: 10, topScorerTeam: "West Germany", goldenBall: "Pelé", teams: 16, matches: 32, totalGoals: 95, goalsPerMatch: "2.97", attendance: 1603975, startDate: "1970-05-31", endDate: "1970-06-21" },
  { year: 1974, host: "West Germany", hostSlug: "west-germany", champion: "West Germany", runnerUp: "Netherlands", third: "Poland", fourth: "Brazil", finalScore: "2-1", topScorer: "Grzegorz Lato", topScorerGoals: 7, topScorerTeam: "Poland", goldenBall: "Johan Cruyff", teams: 16, matches: 38, totalGoals: 97, goalsPerMatch: "2.55", attendance: 1865762, startDate: "1974-06-13", endDate: "1974-07-07" },
  { year: 1978, host: "Argentina", hostSlug: "argentina", champion: "Argentina", runnerUp: "Netherlands", third: "Brazil", fourth: "Italy", finalScore: "3-1 (a.e.t.)", topScorer: "Mario Kempes", topScorerGoals: 6, topScorerTeam: "Argentina", goldenBall: "Mario Kempes", teams: 16, matches: 38, totalGoals: 102, goalsPerMatch: "2.68", attendance: 1545791, startDate: "1978-06-01", endDate: "1978-06-25" },
  { year: 1982, host: "Spain", hostSlug: "spain", champion: "Italy", runnerUp: "West Germany", third: "Poland", fourth: "France", finalScore: "3-1", topScorer: "Paolo Rossi", topScorerGoals: 6, topScorerTeam: "Italy", goldenBall: "Paolo Rossi", teams: 24, matches: 52, totalGoals: 146, goalsPerMatch: "2.81", attendance: 2109723, startDate: "1982-06-13", endDate: "1982-07-11" },
  { year: 1986, host: "Mexico", hostSlug: "mexico", champion: "Argentina", runnerUp: "West Germany", third: "France", fourth: "Belgium", finalScore: "3-2", topScorer: "Gary Lineker", topScorerGoals: 6, topScorerTeam: "England", goldenBall: "Diego Maradona", teams: 24, matches: 52, totalGoals: 132, goalsPerMatch: "2.54", attendance: 2394031, startDate: "1986-05-31", endDate: "1986-06-29" },
  { year: 1990, host: "Italy", hostSlug: "italy", champion: "West Germany", runnerUp: "Argentina", third: "Italy", fourth: "England", finalScore: "1-0", topScorer: "Salvatore Schillaci", topScorerGoals: 6, topScorerTeam: "Italy", goldenBall: "Salvatore Schillaci", teams: 24, matches: 52, totalGoals: 115, goalsPerMatch: "2.21", attendance: 2516215, startDate: "1990-06-08", endDate: "1990-07-08" },
  { year: 1994, host: "United States", hostSlug: "united-states", champion: "Brazil", runnerUp: "Italy", third: "Sweden", fourth: "Bulgaria", finalScore: "0-0 (3-2 pen)", topScorer: "Hristo Stoichkov / Oleg Salenko", topScorerGoals: 6, topScorerTeam: "Bulgaria / Russia", goldenBall: "Romário", teams: 24, matches: 52, totalGoals: 141, goalsPerMatch: "2.71", attendance: 3587538, startDate: "1994-06-17", endDate: "1994-07-17" },
  { year: 1998, host: "France", hostSlug: "france", champion: "France", runnerUp: "Brazil", third: "Croatia", fourth: "Netherlands", finalScore: "3-0", topScorer: "Davor Šuker", topScorerGoals: 6, topScorerTeam: "Croatia", goldenBall: "Ronaldo", teams: 32, matches: 64, totalGoals: 171, goalsPerMatch: "2.67", attendance: 2785100, startDate: "1998-06-10", endDate: "1998-07-12" },
  { year: 2002, host: "South Korea / Japan", hostSlug: "south-korea-japan", champion: "Brazil", runnerUp: "Germany", third: "Turkey", fourth: "South Korea", finalScore: "2-0", topScorer: "Ronaldo", topScorerGoals: 8, topScorerTeam: "Brazil", goldenBall: "Oliver Kahn", teams: 32, matches: 64, totalGoals: 161, goalsPerMatch: "2.52", attendance: 2705197, startDate: "2002-05-31", endDate: "2002-06-30" },
  { year: 2006, host: "Germany", hostSlug: "germany", champion: "Italy", runnerUp: "France", third: "Germany", fourth: "Portugal", finalScore: "1-1 (5-3 pen)", topScorer: "Miroslav Klose", topScorerGoals: 5, topScorerTeam: "Germany", goldenBall: "Zinedine Zidane", teams: 32, matches: 64, totalGoals: 147, goalsPerMatch: "2.30", attendance: 3359439, startDate: "2006-06-09", endDate: "2006-07-09" },
  { year: 2010, host: "South Africa", hostSlug: "south-africa", champion: "Spain", runnerUp: "Netherlands", third: "Germany", fourth: "Uruguay", finalScore: "1-0 (a.e.t.)", topScorer: "Thomas Müller / Diego Forlán / Wesley Sneijder / David Villa", topScorerGoals: 5, topScorerTeam: "Germany / Uruguay / Netherlands / Spain", goldenBall: "Diego Forlán", teams: 32, matches: 64, totalGoals: 145, goalsPerMatch: "2.27", attendance: 3178856, startDate: "2010-06-11", endDate: "2010-07-11" },
  { year: 2014, host: "Brazil", hostSlug: "brazil", champion: "Germany", runnerUp: "Argentina", third: "Netherlands", fourth: "Brazil", finalScore: "1-0 (a.e.t.)", topScorer: "James Rodríguez", topScorerGoals: 6, topScorerTeam: "Colombia", goldenBall: "Lionel Messi", teams: 32, matches: 64, totalGoals: 171, goalsPerMatch: "2.67", attendance: 3429873, startDate: "2014-06-12", endDate: "2014-07-13" },
  { year: 2018, host: "Russia", hostSlug: "russia", champion: "France", runnerUp: "Croatia", third: "Belgium", fourth: "England", finalScore: "4-2", topScorer: "Harry Kane", topScorerGoals: 6, topScorerTeam: "England", goldenBall: "Luka Modrić", teams: 32, matches: 64, totalGoals: 169, goalsPerMatch: "2.64", attendance: 3031768, startDate: "2018-06-14", endDate: "2018-07-15" },
  { year: 2022, host: "Qatar", hostSlug: "qatar", champion: "Argentina", runnerUp: "France", third: "Croatia", fourth: "Morocco", finalScore: "3-3 (4-2 pen)", topScorer: "Kylian Mbappé", topScorerGoals: 8, topScorerTeam: "France", goldenBall: "Lionel Messi", teams: 32, matches: 64, totalGoals: 172, goalsPerMatch: "2.69", attendance: 3404252, startDate: "2022-11-20", endDate: "2022-12-18" },
  { year: 2026, host: "United States / Canada / Mexico", hostSlug: "united-states-canada-mexico", champion: "TBD", runnerUp: "TBD", finalScore: "TBD", topScorer: "TBD", topScorerGoals: 0, topScorerTeam: "TBD", teams: 48, matches: 104, totalGoals: 0, goalsPerMatch: "TBD", startDate: "2026-06-11", endDate: "2026-07-19" },
];

export function getTournament(year: number): WcTournament | null {
  return WC_TOURNAMENTS.find((t) => t.year === year) ?? null;
}

export const WC_YEARS: number[] = WC_TOURNAMENTS.map((t) => t.year);
