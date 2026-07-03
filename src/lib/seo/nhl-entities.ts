// Phase 2.1 — NHL SSR SEO entity registry.
// Pure aggregators over bundled JSON + a static team map — safe in loaders (SSR).

import historyData from "@/data/nhl/history.json";
import { slugify } from "@/lib/seo/programmatic";

// ─────────────────────────── TEAMS (static) ───────────────────────────
// ESPN team IDs are stable; slugs are canonical SEO handles.
export type NhlTeamEntity = {
  slug: string;
  espnId: string;
  name: string;
  short: string;
  abbr: string;
  city: string;
  conference: "Eastern" | "Western";
  division: "Atlantic" | "Metropolitan" | "Central" | "Pacific";
  logo: string;
};

function espnLogo(abbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/nhl/500/${abbr.toLowerCase()}.png`;
}

const RAW_TEAMS: Array<Omit<NhlTeamEntity, "slug" | "logo">> = [
  // Eastern — Atlantic
  { espnId: "1", name: "Boston Bruins", short: "Bruins", abbr: "BOS", city: "Boston", conference: "Eastern", division: "Atlantic" },
  { espnId: "2", name: "Buffalo Sabres", short: "Sabres", abbr: "BUF", city: "Buffalo", conference: "Eastern", division: "Atlantic" },
  { espnId: "5", name: "Detroit Red Wings", short: "Red Wings", abbr: "DET", city: "Detroit", conference: "Eastern", division: "Atlantic" },
  { espnId: "26", name: "Florida Panthers", short: "Panthers", abbr: "FLA", city: "Sunrise", conference: "Eastern", division: "Atlantic" },
  { espnId: "10", name: "Montréal Canadiens", short: "Canadiens", abbr: "MTL", city: "Montréal", conference: "Eastern", division: "Atlantic" },
  { espnId: "14", name: "Ottawa Senators", short: "Senators", abbr: "OTT", city: "Ottawa", conference: "Eastern", division: "Atlantic" },
  { espnId: "20", name: "Tampa Bay Lightning", short: "Lightning", abbr: "TB", city: "Tampa", conference: "Eastern", division: "Atlantic" },
  { espnId: "21", name: "Toronto Maple Leafs", short: "Maple Leafs", abbr: "TOR", city: "Toronto", conference: "Eastern", division: "Atlantic" },
  // Eastern — Metropolitan
  { espnId: "7", name: "Carolina Hurricanes", short: "Hurricanes", abbr: "CAR", city: "Raleigh", conference: "Eastern", division: "Metropolitan" },
  { espnId: "29", name: "Columbus Blue Jackets", short: "Blue Jackets", abbr: "CBJ", city: "Columbus", conference: "Eastern", division: "Metropolitan" },
  { espnId: "11", name: "New Jersey Devils", short: "Devils", abbr: "NJ", city: "Newark", conference: "Eastern", division: "Metropolitan" },
  { espnId: "12", name: "New York Islanders", short: "Islanders", abbr: "NYI", city: "New York", conference: "Eastern", division: "Metropolitan" },
  { espnId: "13", name: "New York Rangers", short: "Rangers", abbr: "NYR", city: "New York", conference: "Eastern", division: "Metropolitan" },
  { espnId: "15", name: "Philadelphia Flyers", short: "Flyers", abbr: "PHI", city: "Philadelphia", conference: "Eastern", division: "Metropolitan" },
  { espnId: "16", name: "Pittsburgh Penguins", short: "Penguins", abbr: "PIT", city: "Pittsburgh", conference: "Eastern", division: "Metropolitan" },
  { espnId: "23", name: "Washington Capitals", short: "Capitals", abbr: "WSH", city: "Washington", conference: "Eastern", division: "Metropolitan" },
  // Western — Central
  { espnId: "4", name: "Chicago Blackhawks", short: "Blackhawks", abbr: "CHI", city: "Chicago", conference: "Western", division: "Central" },
  { espnId: "17", name: "Colorado Avalanche", short: "Avalanche", abbr: "COL", city: "Denver", conference: "Western", division: "Central" },
  { espnId: "9", name: "Dallas Stars", short: "Stars", abbr: "DAL", city: "Dallas", conference: "Western", division: "Central" },
  { espnId: "30", name: "Minnesota Wild", short: "Wild", abbr: "MIN", city: "St. Paul", conference: "Western", division: "Central" },
  { espnId: "27", name: "Nashville Predators", short: "Predators", abbr: "NSH", city: "Nashville", conference: "Western", division: "Central" },
  { espnId: "19", name: "St. Louis Blues", short: "Blues", abbr: "STL", city: "St. Louis", conference: "Western", division: "Central" },
  { espnId: "129764", name: "Utah Mammoth", short: "Mammoth", abbr: "UTA", city: "Salt Lake City", conference: "Western", division: "Central" },
  { espnId: "28", name: "Winnipeg Jets", short: "Jets", abbr: "WPG", city: "Winnipeg", conference: "Western", division: "Central" },
  // Western — Pacific
  { espnId: "25", name: "Anaheim Ducks", short: "Ducks", abbr: "ANA", city: "Anaheim", conference: "Western", division: "Pacific" },
  { espnId: "3", name: "Calgary Flames", short: "Flames", abbr: "CGY", city: "Calgary", conference: "Western", division: "Pacific" },
  { espnId: "6", name: "Edmonton Oilers", short: "Oilers", abbr: "EDM", city: "Edmonton", conference: "Western", division: "Pacific" },
  { espnId: "8", name: "Los Angeles Kings", short: "Kings", abbr: "LA", city: "Los Angeles", conference: "Western", division: "Pacific" },
  { espnId: "18", name: "San Jose Sharks", short: "Sharks", abbr: "SJ", city: "San Jose", conference: "Western", division: "Pacific" },
  { espnId: "124292", name: "Seattle Kraken", short: "Kraken", abbr: "SEA", city: "Seattle", conference: "Western", division: "Pacific" },
  { espnId: "22", name: "Vancouver Canucks", short: "Canucks", abbr: "VAN", city: "Vancouver", conference: "Western", division: "Pacific" },
  { espnId: "37", name: "Vegas Golden Knights", short: "Golden Knights", abbr: "VGK", city: "Paradise", conference: "Western", division: "Pacific" },
];

const TEAMS: NhlTeamEntity[] = RAW_TEAMS.map((t) => ({
  ...t,
  slug: slugify(t.name),
  logo: espnLogo(t.abbr),
}));

const TEAM_BY_SLUG = new Map(TEAMS.map((t) => [t.slug, t]));
const TEAM_BY_ID = new Map(TEAMS.map((t) => [t.espnId, t]));
const TEAM_BY_NAME = new Map(TEAMS.map((t) => [t.name.toLowerCase(), t]));

export function listNhlTeams(): NhlTeamEntity[] {
  return TEAMS;
}
export function getNhlTeamBySlug(slug: string): NhlTeamEntity | null {
  return TEAM_BY_SLUG.get(slug) ?? null;
}
export function getNhlTeamByEspnId(id: string): NhlTeamEntity | null {
  return TEAM_BY_ID.get(String(id)) ?? null;
}
export function getNhlTeamByName(name: string): NhlTeamEntity | null {
  return TEAM_BY_NAME.get(name.toLowerCase()) ?? null;
}

// ─────────────────────────── HISTORY (Stanley Cup) ───────────────────────────
type ChampionRow = { season: string; champion: string; runnerUp: string; fmvp: string; result: string };
const H = historyData as { champions: ChampionRow[] };

export type StanleyCupEdition = ChampionRow & { year: number };

function seasonToYear(season: string): number {
  // "2023-24" → 2024 (finals year)
  const [start, end] = season.split("-");
  const startNum = Number(start);
  if (!Number.isFinite(startNum)) return 0;
  return end ? Number(`${start.slice(0, 2)}${end}`) : startNum + 1;
}

const EDITIONS: StanleyCupEdition[] = H.champions.map((c) => ({ ...c, year: seasonToYear(c.season) }));
const EDITION_BY_YEAR = new Map(EDITIONS.map((e) => [e.year, e]));

export function listStanleyCupYears(): number[] {
  return EDITIONS.map((e) => e.year);
}
export function getStanleyCupByYear(year: number): StanleyCupEdition | null {
  return EDITION_BY_YEAR.get(year) ?? null;
}
export function listStanleyCups(): StanleyCupEdition[] {
  return EDITIONS;
}

// ─────────────────────────── PLAYERS (Conn Smythe registry) ───────────────────────────
export type NhlPlayerEntity = {
  slug: string;
  name: string;
  honors: Array<{
    kind: "Conn Smythe (Playoffs MVP)";
    year: number;
    team: string;
  }>;
};

let _players: NhlPlayerEntity[] | null = null;
function buildPlayers(): NhlPlayerEntity[] {
  if (_players) return _players;
  const map = new Map<string, NhlPlayerEntity>();
  for (const e of EDITIONS) {
    const rawName = e.fmvp?.trim();
    if (!rawName) continue;
    if (rawName.includes(" & ") || rawName.includes(",")) continue; // skip co-winners
    const slug = slugify(rawName);
    const p = map.get(slug) ?? { slug, name: rawName, honors: [] };
    p.honors.push({ kind: "Conn Smythe (Playoffs MVP)", year: e.year, team: e.champion });
    map.set(slug, p);
  }
  _players = Array.from(map.values());
  return _players;
}

export function listNhlPlayers(): NhlPlayerEntity[] {
  return buildPlayers();
}
export function getNhlPlayerBySlug(slug: string): NhlPlayerEntity | null {
  return buildPlayers().find((p) => p.slug === slug) ?? null;
}
