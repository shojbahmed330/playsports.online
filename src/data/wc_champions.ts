// Champion + host quick-lookup per FIFA World Cup edition.
// Used by YearTile and per-year SEO. Keep concise — full records live in DB.

export type WcChampion = {
  year: number;
  champion: string;       // canonical country name (matches flags.ts keys)
  host: string;           // host country / co-hosts
  finalScore?: string;    // e.g. "3-3 (4-2 pen)" or "4-2"
  runnerUp?: string;
};

export const WC_CHAMPIONS: Record<number, WcChampion> = {
  1930: { year: 1930, champion: "Uruguay",       host: "Uruguay",        finalScore: "4-2", runnerUp: "Argentina" },
  1934: { year: 1934, champion: "Italy",         host: "Italy",          finalScore: "2-1 (a.e.t.)", runnerUp: "Czechoslovakia" },
  1938: { year: 1938, champion: "Italy",         host: "France",         finalScore: "4-2", runnerUp: "Hungary" },
  1950: { year: 1950, champion: "Uruguay",       host: "Brazil",         finalScore: "2-1", runnerUp: "Brazil" },
  1954: { year: 1954, champion: "West Germany",  host: "Switzerland",    finalScore: "3-2", runnerUp: "Hungary" },
  1958: { year: 1958, champion: "Brazil",        host: "Sweden",         finalScore: "5-2", runnerUp: "Sweden" },
  1962: { year: 1962, champion: "Brazil",        host: "Chile",          finalScore: "3-1", runnerUp: "Czechoslovakia" },
  1966: { year: 1966, champion: "England",       host: "England",        finalScore: "4-2 (a.e.t.)", runnerUp: "West Germany" },
  1970: { year: 1970, champion: "Brazil",        host: "Mexico",         finalScore: "4-1", runnerUp: "Italy" },
  1974: { year: 1974, champion: "West Germany",  host: "West Germany",   finalScore: "2-1", runnerUp: "Netherlands" },
  1978: { year: 1978, champion: "Argentina",     host: "Argentina",      finalScore: "3-1 (a.e.t.)", runnerUp: "Netherlands" },
  1982: { year: 1982, champion: "Italy",         host: "Spain",          finalScore: "3-1", runnerUp: "West Germany" },
  1986: { year: 1986, champion: "Argentina",     host: "Mexico",         finalScore: "3-2", runnerUp: "West Germany" },
  1990: { year: 1990, champion: "West Germany",  host: "Italy",          finalScore: "1-0", runnerUp: "Argentina" },
  1994: { year: 1994, champion: "Brazil",        host: "United States",  finalScore: "0-0 (3-2 pen)", runnerUp: "Italy" },
  1998: { year: 1998, champion: "France",        host: "France",         finalScore: "3-0", runnerUp: "Brazil" },
  2002: { year: 2002, champion: "Brazil",        host: "South Korea / Japan", finalScore: "2-0", runnerUp: "Germany" },
  2006: { year: 2006, champion: "Italy",         host: "Germany",        finalScore: "1-1 (5-3 pen)", runnerUp: "France" },
  2010: { year: 2010, champion: "Spain",         host: "South Africa",   finalScore: "1-0 (a.e.t.)", runnerUp: "Netherlands" },
  2014: { year: 2014, champion: "Germany",       host: "Brazil",         finalScore: "1-0 (a.e.t.)", runnerUp: "Argentina" },
  2018: { year: 2018, champion: "France",        host: "Russia",         finalScore: "4-2", runnerUp: "Croatia" },
  2022: { year: 2022, champion: "Argentina",     host: "Qatar",          finalScore: "3-3 (4-2 pen)", runnerUp: "France" },
};

export function getChampion(year: number): WcChampion | null {
  return WC_CHAMPIONS[year] ?? null;
}
