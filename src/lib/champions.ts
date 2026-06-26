// Tournament champions registry — single source of truth.
//
// Why a config file (not a DB table)?
// - Champion data is small, slow-changing (≤1 winner per tournament per year).
// - Lives next to TOURNAMENT_CONFIG so audits/year-rollovers are local.
// - Auto-updatable from the admin panel by writing this file or by mirroring
//   into Supabase later (see `resolveChampion` adapter shape below).
//
// To record a new winner: add an entry to CHAMPIONS_OVERRIDE for the year,
// or wire `resolveChampion` to a DB query if/when an admin form is added.

export type Sport = "football_wc" | "icc_wc" | "t20_wc" | "ipl" | "mlb" | "nba" | "nhl" | "mls";

export type ChampionRecord = {
  sport: Sport;
  season: number;          // year (or season-end year for split seasons)
  champion: string;        // winning team / country
  runnerUp?: string;
  thirdPlace?: string;
  emoji?: string;          // flag or crest emoji
  confirmedAt?: string;    // ISO timestamp when admin confirmed
};

// Hard-coded confirmed champions (historical + current).
// Newest first. Add new rows here when a tournament concludes.
export const CHAMPIONS_OVERRIDE: ChampionRecord[] = [
  // Football — FIFA Men's World Cup
  { sport: "football_wc", season: 2022, champion: "Argentina", runnerUp: "France", thirdPlace: "Croatia", emoji: "🇦🇷" },
  { sport: "football_wc", season: 2018, champion: "France", runnerUp: "Croatia", thirdPlace: "Belgium", emoji: "🇫🇷" },
  { sport: "football_wc", season: 2014, champion: "Germany", runnerUp: "Argentina", thirdPlace: "Netherlands", emoji: "🇩🇪" },
  { sport: "football_wc", season: 2010, champion: "Spain", runnerUp: "Netherlands", thirdPlace: "Germany", emoji: "🇪🇸" },
  { sport: "football_wc", season: 2006, champion: "Italy", runnerUp: "France", thirdPlace: "Germany", emoji: "🇮🇹" },
  { sport: "football_wc", season: 2002, champion: "Brazil", runnerUp: "Germany", thirdPlace: "Turkey", emoji: "🇧🇷" },
  { sport: "football_wc", season: 1998, champion: "France", runnerUp: "Brazil", thirdPlace: "Croatia", emoji: "🇫🇷" },

  // IPL — last few known seasons (extend as new finals conclude).
  { sport: "ipl", season: 2024, champion: "Kolkata Knight Riders", runnerUp: "Sunrisers Hyderabad", emoji: "🏏" },
  { sport: "ipl", season: 2023, champion: "Chennai Super Kings", runnerUp: "Gujarat Titans", emoji: "🏏" },
  { sport: "ipl", season: 2022, champion: "Gujarat Titans", runnerUp: "Rajasthan Royals", emoji: "🏏" },

  // ICC ODI World Cup
  { sport: "icc_wc", season: 2023, champion: "Australia", runnerUp: "India", emoji: "🇦🇺" },
  { sport: "icc_wc", season: 2019, champion: "England", runnerUp: "New Zealand", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },

  // T20 World Cup
  { sport: "t20_wc", season: 2024, champion: "India", runnerUp: "South Africa", emoji: "🇮🇳" },
  { sport: "t20_wc", season: 2022, champion: "England", runnerUp: "Pakistan", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
];

const KEY = (sport: Sport, season: number) => `${sport}:${season}`;

const INDEX = new Map<string, ChampionRecord>(
  CHAMPIONS_OVERRIDE.map((c) => [KEY(c.sport, c.season), c]),
);

/** Returns the confirmed champion for a sport+season, or null when unknown. */
export function getChampion(sport: Sport, season: number): ChampionRecord | null {
  return INDEX.get(KEY(sport, season)) ?? null;
}

/** All champions for a sport, newest first. */
export function getChampionHistory(sport: Sport): ChampionRecord[] {
  return CHAMPIONS_OVERRIDE
    .filter((c) => c.sport === sport)
    .sort((a, b) => b.season - a.season);
}

/**
 * Adapter slot: if/when champions are mirrored to a Cloud table, swap this
 * to read from Supabase and fall back to CHAMPIONS_OVERRIDE for un-mirrored
 * historical seasons. The UI only depends on { sport, season } in/out.
 */
export async function resolveChampion(sport: Sport, season: number): Promise<ChampionRecord | null> {
  return getChampion(sport, season);
}
