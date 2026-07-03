// Phase 2.1 — NBA SSR SEO entity registry (teams, Finals editions, FMVPs).
// Pure aggregators; safe to call from loaders (SSR).

import historyData from "@/data/nba/history.json";
import { slugify } from "@/lib/seo/programmatic";

// ─────────────────────────── TEAMS (static; 30 franchises) ───────────────────────────
export type NbaConference = "Eastern" | "Western";
export type NbaDivision = "Atlantic" | "Central" | "Southeast" | "Northwest" | "Pacific" | "Southwest";
export type NbaTeamEntity = {
  slug: string;
  espnId: string;
  name: string;
  short: string;
  abbr: string;
  city: string;
  conference: NbaConference;
  division: NbaDivision;
  logo: string;
};

function espnLogo(abbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/nba/500/${abbr.toLowerCase()}.png`;
}

const RAW_TEAMS: Array<Omit<NbaTeamEntity, "slug" | "logo">> = [
  // Eastern — Atlantic
  { espnId: "2",  name: "Boston Celtics",         short: "Celtics",     abbr: "BOS", city: "Boston",       conference: "Eastern", division: "Atlantic" },
  { espnId: "17", name: "Brooklyn Nets",          short: "Nets",        abbr: "BKN", city: "Brooklyn",     conference: "Eastern", division: "Atlantic" },
  { espnId: "18", name: "New York Knicks",        short: "Knicks",      abbr: "NYK", city: "New York",     conference: "Eastern", division: "Atlantic" },
  { espnId: "20", name: "Philadelphia 76ers",     short: "76ers",       abbr: "PHI", city: "Philadelphia", conference: "Eastern", division: "Atlantic" },
  { espnId: "28", name: "Toronto Raptors",        short: "Raptors",     abbr: "TOR", city: "Toronto",      conference: "Eastern", division: "Atlantic" },
  // Eastern — Central
  { espnId: "4",  name: "Chicago Bulls",          short: "Bulls",       abbr: "CHI", city: "Chicago",      conference: "Eastern", division: "Central" },
  { espnId: "5",  name: "Cleveland Cavaliers",    short: "Cavaliers",   abbr: "CLE", city: "Cleveland",    conference: "Eastern", division: "Central" },
  { espnId: "8",  name: "Detroit Pistons",        short: "Pistons",     abbr: "DET", city: "Detroit",      conference: "Eastern", division: "Central" },
  { espnId: "11", name: "Indiana Pacers",         short: "Pacers",      abbr: "IND", city: "Indianapolis", conference: "Eastern", division: "Central" },
  { espnId: "15", name: "Milwaukee Bucks",        short: "Bucks",       abbr: "MIL", city: "Milwaukee",    conference: "Eastern", division: "Central" },
  // Eastern — Southeast
  { espnId: "1",  name: "Atlanta Hawks",          short: "Hawks",       abbr: "ATL", city: "Atlanta",      conference: "Eastern", division: "Southeast" },
  { espnId: "30", name: "Charlotte Hornets",      short: "Hornets",     abbr: "CHA", city: "Charlotte",    conference: "Eastern", division: "Southeast" },
  { espnId: "14", name: "Miami Heat",             short: "Heat",        abbr: "MIA", city: "Miami",        conference: "Eastern", division: "Southeast" },
  { espnId: "19", name: "Orlando Magic",          short: "Magic",       abbr: "ORL", city: "Orlando",      conference: "Eastern", division: "Southeast" },
  { espnId: "27", name: "Washington Wizards",     short: "Wizards",     abbr: "WSH", city: "Washington",   conference: "Eastern", division: "Southeast" },
  // Western — Northwest
  { espnId: "7",  name: "Denver Nuggets",         short: "Nuggets",     abbr: "DEN", city: "Denver",       conference: "Western", division: "Northwest" },
  { espnId: "16", name: "Minnesota Timberwolves", short: "Timberwolves", abbr: "MIN", city: "Minneapolis",  conference: "Western", division: "Northwest" },
  { espnId: "25", name: "Oklahoma City Thunder",  short: "Thunder",     abbr: "OKC", city: "Oklahoma City", conference: "Western", division: "Northwest" },
  { espnId: "22", name: "Portland Trail Blazers", short: "Trail Blazers", abbr: "POR", city: "Portland",   conference: "Western", division: "Northwest" },
  { espnId: "26", name: "Utah Jazz",              short: "Jazz",        abbr: "UTAH", city: "Salt Lake City", conference: "Western", division: "Northwest" },
  // Western — Pacific
  { espnId: "9",  name: "Golden State Warriors",  short: "Warriors",    abbr: "GS",  city: "San Francisco", conference: "Western", division: "Pacific" },
  { espnId: "12", name: "LA Clippers",            short: "Clippers",    abbr: "LAC", city: "Los Angeles",  conference: "Western", division: "Pacific" },
  { espnId: "13", name: "Los Angeles Lakers",     short: "Lakers",      abbr: "LAL", city: "Los Angeles",  conference: "Western", division: "Pacific" },
  { espnId: "21", name: "Phoenix Suns",           short: "Suns",        abbr: "PHX", city: "Phoenix",      conference: "Western", division: "Pacific" },
  { espnId: "23", name: "Sacramento Kings",       short: "Kings",       abbr: "SAC", city: "Sacramento",   conference: "Western", division: "Pacific" },
  // Western — Southwest
  { espnId: "6",  name: "Dallas Mavericks",       short: "Mavericks",   abbr: "DAL", city: "Dallas",       conference: "Western", division: "Southwest" },
  { espnId: "10", name: "Houston Rockets",        short: "Rockets",     abbr: "HOU", city: "Houston",      conference: "Western", division: "Southwest" },
  { espnId: "29", name: "Memphis Grizzlies",      short: "Grizzlies",   abbr: "MEM", city: "Memphis",      conference: "Western", division: "Southwest" },
  { espnId: "3",  name: "New Orleans Pelicans",   short: "Pelicans",    abbr: "NO",  city: "New Orleans",  conference: "Western", division: "Southwest" },
  { espnId: "24", name: "San Antonio Spurs",      short: "Spurs",       abbr: "SA",  city: "San Antonio",  conference: "Western", division: "Southwest" },
];

const TEAMS: NbaTeamEntity[] = RAW_TEAMS.map((t) => ({
  ...t,
  slug: slugify(t.name),
  logo: espnLogo(t.abbr),
}));

const TEAM_BY_SLUG = new Map(TEAMS.map((t) => [t.slug, t]));
const TEAM_BY_ID = new Map(TEAMS.map((t) => [t.espnId, t]));
const TEAM_BY_NAME = new Map(TEAMS.map((t) => [t.name.toLowerCase(), t]));

// Historical franchise aliases (moved/renamed) that appear in history.json.
const TEAM_ALIASES: Record<string, string> = {
  "seattle supersonics": "oklahoma city thunder",
  "new jersey nets": "brooklyn nets",
};

export function listNbaTeams(): NbaTeamEntity[] {
  return TEAMS;
}
export function getNbaTeamBySlug(slug: string): NbaTeamEntity | null {
  return TEAM_BY_SLUG.get(slug) ?? null;
}
export function getNbaTeamByEspnId(id: string): NbaTeamEntity | null {
  return TEAM_BY_ID.get(String(id)) ?? null;
}
export function getNbaTeamByName(name: string): NbaTeamEntity | null {
  const key = name.trim().toLowerCase();
  return TEAM_BY_NAME.get(key) ?? TEAM_BY_NAME.get(TEAM_ALIASES[key] ?? "") ?? null;
}

// ─────────────────────────── FINALS EDITIONS ───────────────────────────
type ChampionRow = { season: string; champion: string; runnerUp: string; fmvp: string; result: string };
const H = historyData as { champions: ChampionRow[] };

export type NbaFinalsEdition = ChampionRow & { year: number };

function seasonToYear(season: string): number {
  // "2023-24" → 2024; "1999-00" → 2000.
  const start = Number(season.split("-")[0]);
  return Number.isFinite(start) ? start + 1 : 0;
}

const EDITIONS: NbaFinalsEdition[] = H.champions.map((c) => ({ ...c, year: seasonToYear(c.season) }));
const EDITION_BY_YEAR = new Map(EDITIONS.map((e) => [e.year, e]));

export function listNbaFinalsYears(): number[] {
  return EDITIONS.map((e) => e.year);
}
export function getNbaFinalsByYear(year: number): NbaFinalsEdition | null {
  return EDITION_BY_YEAR.get(year) ?? null;
}
export function listNbaFinals(): NbaFinalsEdition[] {
  return EDITIONS;
}

// ─────────────────────────── PLAYERS (Finals MVP registry) ───────────────────────────
export type NbaPlayerEntity = {
  slug: string;
  name: string;
  honors: Array<{ kind: "Finals MVP"; year: number; team: string }>;
};

let _players: NbaPlayerEntity[] | null = null;
function buildPlayers(): NbaPlayerEntity[] {
  if (_players) return _players;
  const map = new Map<string, NbaPlayerEntity>();
  for (const e of EDITIONS) {
    const rawName = e.fmvp?.trim();
    if (!rawName) continue;
    if (rawName.includes(" & ") || rawName.includes(",")) continue;
    const slug = slugify(rawName);
    const p = map.get(slug) ?? { slug, name: rawName, honors: [] };
    p.honors.push({ kind: "Finals MVP", year: e.year, team: e.champion });
    map.set(slug, p);
  }
  _players = Array.from(map.values());
  return _players;
}

export function listNbaPlayers(): NbaPlayerEntity[] {
  return buildPlayers();
}
export function getNbaPlayerBySlug(slug: string): NbaPlayerEntity | null {
  return buildPlayers().find((p) => p.slug === slug) ?? null;
}
