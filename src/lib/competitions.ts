/**
 * Central football competitions registry.
 *
 * Each entry drives dedicated `/football/<slug>/...` routes: hero, subnav,
 * scores/standings/history/records — all scoped to that competition.
 *
 * Adding a new competition = one entry here + optional seed data under
 * `src/data/competitions/<slug>/`.
 */

export type CompetitionKind = "tournament" | "league";

export type CompetitionHeroTheme = {
  /** CSS `background` value for the hero backdrop. */
  gradient: string;
  /** Tailwind gradient stops for the title accent (`from-… via-… to-…`). */
  titleAccent: string;
  /** Short tag color, e.g. WC gold, Euro blue. */
  chipAccent: string;
  /** Ticker/pill emoji or short symbol (rendered before the comp name). */
  emoji: string;
};

export type Competition = {
  /** URL slug — `/football/<slug>`. */
  slug: string;
  /** Full display name. */
  name: string;
  /** Short display name for pills/tickers. */
  shortName: string;
  /** ESPN league id used with `soccer/<espnLeague>/...` endpoints. */
  espnLeague: string;
  /** Tournament (knockout + groups) vs continuous league. */
  kind: CompetitionKind;
  /** All confirmed edition/season years (chronological). For leagues, the end year of each season. */
  years: readonly number[];
  /** Which year to feature as "current" on the landing page. */
  currentSeason: number;
  /** Governing body. */
  confederation: string;
  /** Optional one-liner shown under the hero title. */
  tagline?: string;
  /** Hero + accent theme. */
  hero: CompetitionHeroTheme;
};

// -------------- registry --------------

export const COMPETITIONS: Competition[] = [
  {
    slug: "world-cup",
    name: "FIFA World Cup",
    shortName: "World Cup",
    espnLeague: "fifa.world",
    kind: "tournament",
    years: [
      1930, 1934, 1938, 1950, 1954, 1958, 1962, 1966, 1970, 1974,
      1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014,
      2018, 2022, 2026, 2030, 2034,
    ],
    currentSeason: 2026,
    confederation: "FIFA",
    tagline: "Every kickoff, group table, knockout tie and top scorer since 1930.",
    hero: {
      gradient:
        "radial-gradient(60% 80% at 50% 0%, oklch(0.78 0.18 75 / 0.30), transparent 60%), radial-gradient(40% 70% at 85% 100%, oklch(0.62 0.24 27 / 0.22), transparent 60%), radial-gradient(50% 80% at 15% 100%, oklch(0.58 0.20 250 / 0.18), transparent 60%)",
      titleAccent: "from-amber-300 via-rose-400 to-blue-400",
      chipAccent: "bg-amber-500 text-black",
      emoji: "🏆",
    },
  },
  {
    slug: "euro",
    name: "UEFA European Championship",
    shortName: "Euro",
    espnLeague: "uefa.euro",
    kind: "tournament",
    years: [
      1960, 1964, 1968, 1972, 1976, 1980, 1984, 1988, 1992, 1996,
      2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028,
    ],
    currentSeason: 2028,
    confederation: "UEFA",
    tagline: "Europe's championship — every edition, every winner, every top scorer.",
    hero: {
      gradient:
        "radial-gradient(60% 80% at 50% 0%, oklch(0.58 0.22 250 / 0.32), transparent 60%), radial-gradient(45% 70% at 85% 100%, oklch(0.65 0.20 200 / 0.22), transparent 60%), radial-gradient(50% 80% at 15% 100%, oklch(0.72 0.18 190 / 0.18), transparent 60%)",
      titleAccent: "from-blue-300 via-sky-300 to-indigo-400",
      chipAccent: "bg-blue-500 text-white",
      emoji: "⭐",
    },
  },
  {
    slug: "copa-america",
    name: "Copa América",
    shortName: "Copa",
    espnLeague: "conmebol.america",
    kind: "tournament",
    years: [
      1916, 1917, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1929,
      1935, 1937, 1939, 1941, 1942, 1945, 1946, 1947, 1949, 1953, 1955, 1956,
      1957, 1959, 1963, 1967, 1975, 1979, 1983,
      1987, 1989, 1991, 1993, 1995, 1997, 1999, 2001, 2004, 2007,
      2011, 2015, 2016, 2019, 2021, 2024, 2028,
    ],

    currentSeason: 2028,
    confederation: "CONMEBOL",
    tagline: "South America's oldest continental championship, played since 1916.",
    hero: {
      gradient:
        "radial-gradient(60% 80% at 50% 0%, oklch(0.72 0.22 145 / 0.30), transparent 60%), radial-gradient(45% 70% at 85% 100%, oklch(0.72 0.20 55 / 0.22), transparent 60%), radial-gradient(50% 80% at 15% 100%, oklch(0.55 0.20 145 / 0.18), transparent 60%)",
      titleAccent: "from-emerald-300 via-lime-300 to-amber-300",
      chipAccent: "bg-emerald-500 text-black",
      emoji: "🌎",
    },
  },
  {
    slug: "laliga",
    name: "La Liga",
    shortName: "La Liga",
    espnLeague: "esp.1",
    kind: "league",
    years: [
      1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005,
      2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ],

    currentSeason: 2026,
    confederation: "RFEF (Spain)",
    tagline: "Spanish top flight — El Clásico, Pichichi, and 90+ years of champions.",
    hero: {
      gradient:
        "radial-gradient(60% 80% at 50% 0%, oklch(0.65 0.24 25 / 0.30), transparent 60%), radial-gradient(45% 70% at 85% 100%, oklch(0.75 0.22 70 / 0.22), transparent 60%), radial-gradient(50% 80% at 15% 100%, oklch(0.55 0.24 25 / 0.18), transparent 60%)",
      titleAccent: "from-red-400 via-orange-300 to-amber-300",
      chipAccent: "bg-red-600 text-white",
      emoji: "🇪🇸",
    },
  },
];

export const COMPETITION_SLUGS = COMPETITIONS.map((c) => c.slug);

export function getCompetition(slug: string): Competition | null {
  return COMPETITIONS.find((c) => c.slug === slug) ?? null;
}

export function requireCompetition(slug: string): Competition {
  const c = getCompetition(slug);
  if (!c) throw new Error(`Unknown competition slug: ${slug}`);
  return c;
}

/** Human-readable season label — "2024" for tournaments, "2024/25" for leagues. */
export function formatSeasonLabel(comp: Competition, year: number): string {
  if (comp.kind === "league") {
    const short = String(year).slice(-2);
    const prev = String(year - 1);
    return `${prev}/${short}`;
  }
  return String(year);
}
