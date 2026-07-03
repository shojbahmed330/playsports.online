// Phase 2.1 — MLS SSR SEO entity registry (teams, MLS Cup editions, MVPs).
// Pure aggregators; safe to call from loaders (SSR).

import historyData from "@/data/mls/history.json";
import { slugify } from "@/lib/seo/programmatic";

// ─────────────────────────── TEAMS (static; 2025 season, 30 clubs) ───────────────────────────
export type MlsConference = "Eastern" | "Western";
export type MlsTeamEntity = {
  slug: string;
  espnId: string;
  name: string;
  short: string;
  abbr: string;
  city: string;
  conference: MlsConference;
  logo: string;
};

function espnLogo(abbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${abbr.toLowerCase()}.png`;
}

const RAW_TEAMS: Array<Omit<MlsTeamEntity, "slug" | "logo">> = [
  // Eastern Conference
  { espnId: "18418", name: "Atlanta United FC",     short: "Atlanta United",   abbr: "ATL",  city: "Atlanta",       conference: "Eastern" },
  { espnId: "9720",  name: "CF Montréal",           short: "Montréal",         abbr: "MTL",  city: "Montréal",       conference: "Eastern" },
  { espnId: "21300", name: "Charlotte FC",          short: "Charlotte",        abbr: "CLT",  city: "Charlotte",     conference: "Eastern" },
  { espnId: "182",   name: "Chicago Fire FC",       short: "Chicago Fire",     abbr: "CHI",  city: "Chicago",       conference: "Eastern" },
  { espnId: "183",   name: "Columbus Crew",         short: "Crew",             abbr: "CLB",  city: "Columbus",      conference: "Eastern" },
  { espnId: "193",   name: "D.C. United",           short: "D.C. United",      abbr: "DC",   city: "Washington",    conference: "Eastern" },
  { espnId: "18267", name: "FC Cincinnati",         short: "Cincinnati",       abbr: "CIN",  city: "Cincinnati",    conference: "Eastern" },
  { espnId: "20232", name: "Inter Miami CF",        short: "Inter Miami",      abbr: "MIA",  city: "Miami",         conference: "Eastern" },
  { espnId: "18986", name: "Nashville SC",          short: "Nashville",        abbr: "NSH",  city: "Nashville",     conference: "Eastern" },
  { espnId: "189",   name: "New England Revolution", short: "Revolution",      abbr: "NE",   city: "Foxborough",    conference: "Eastern" },
  { espnId: "17606", name: "New York City FC",      short: "NYCFC",            abbr: "NYC",  city: "New York",      conference: "Eastern" },
  { espnId: "190",   name: "New York Red Bulls",    short: "Red Bulls",        abbr: "RBNY", city: "Harrison",      conference: "Eastern" },
  { espnId: "12011", name: "Orlando City SC",       short: "Orlando City",     abbr: "ORL",  city: "Orlando",       conference: "Eastern" },
  { espnId: "10739", name: "Philadelphia Union",    short: "Union",            abbr: "PHI",  city: "Chester",       conference: "Eastern" },
  { espnId: "7318",  name: "Toronto FC",            short: "Toronto FC",       abbr: "TOR",  city: "Toronto",       conference: "Eastern" },
  // Western Conference
  { espnId: "20906", name: "Austin FC",             short: "Austin",           abbr: "ATX",  city: "Austin",        conference: "Western" },
  { espnId: "184",   name: "Colorado Rapids",       short: "Rapids",           abbr: "COL",  city: "Commerce City", conference: "Western" },
  { espnId: "185",   name: "FC Dallas",             short: "Dallas",           abbr: "DAL",  city: "Frisco",        conference: "Western" },
  { espnId: "6077",  name: "Houston Dynamo FC",     short: "Dynamo",           abbr: "HOU",  city: "Houston",       conference: "Western" },
  { espnId: "187",   name: "LA Galaxy",             short: "Galaxy",           abbr: "LA",   city: "Carson",        conference: "Western" },
  { espnId: "18966", name: "Los Angeles FC",        short: "LAFC",             abbr: "LAFC", city: "Los Angeles",   conference: "Western" },
  { espnId: "17362", name: "Minnesota United FC",   short: "Minnesota United", abbr: "MIN",  city: "Saint Paul",    conference: "Western" },
  { espnId: "9723",  name: "Portland Timbers",      short: "Timbers",          abbr: "POR",  city: "Portland",      conference: "Western" },
  { espnId: "4771",  name: "Real Salt Lake",        short: "RSL",              abbr: "RSL",  city: "Sandy",         conference: "Western" },
  { espnId: "22529", name: "San Diego FC",          short: "San Diego",        abbr: "SD",   city: "San Diego",     conference: "Western" },
  { espnId: "191",   name: "San Jose Earthquakes",  short: "Earthquakes",      abbr: "SJ",   city: "San Jose",      conference: "Western" },
  { espnId: "9726",  name: "Seattle Sounders FC",   short: "Sounders",         abbr: "SEA",  city: "Seattle",       conference: "Western" },
  { espnId: "186",   name: "Sporting Kansas City",  short: "Sporting KC",      abbr: "SKC",  city: "Kansas City",   conference: "Western" },
  { espnId: "21812", name: "St. Louis City SC",     short: "St. Louis City",   abbr: "STL",  city: "St. Louis",     conference: "Western" },
  { espnId: "9727",  name: "Vancouver Whitecaps FC", short: "Whitecaps",       abbr: "VAN",  city: "Vancouver",     conference: "Western" },
];

const TEAMS: MlsTeamEntity[] = RAW_TEAMS.map((t) => ({
  ...t,
  slug: slugify(t.name),
  logo: espnLogo(t.abbr),
}));

const TEAM_BY_SLUG = new Map(TEAMS.map((t) => [t.slug, t]));
const TEAM_BY_ID = new Map(TEAMS.map((t) => [t.espnId, t]));
const TEAM_BY_NAME = new Map(TEAMS.map((t) => [t.name.toLowerCase(), t]));
// Common alt names used in history.json
const TEAM_ALIASES: Record<string, string> = {
  "los angeles fc": "lafc",
  "new york red bulls": "red bull new york",
};

export function listMlsTeams(): MlsTeamEntity[] {
  return TEAMS;
}
export function getMlsTeamBySlug(slug: string): MlsTeamEntity | null {
  return TEAM_BY_SLUG.get(slug) ?? null;
}
export function getMlsTeamByEspnId(id: string): MlsTeamEntity | null {
  return TEAM_BY_ID.get(String(id)) ?? null;
}
export function getMlsTeamByName(name: string): MlsTeamEntity | null {
  const key = name.trim().toLowerCase();
  return TEAM_BY_NAME.get(key) ?? TEAM_BY_NAME.get(TEAM_ALIASES[key] ?? "") ?? null;
}

// ─────────────────────────── MLS CUP CHAMPIONS ───────────────────────────
type ChampionRow = { season: string; champion: string; runnerUp: string; fmvp: string; result: string };
const H = historyData as { champions: ChampionRow[] };

export type MlsCupEdition = ChampionRow & { year: number };

const EDITIONS: MlsCupEdition[] = H.champions.map((c) => ({ ...c, year: Number(c.season) }));
const EDITION_BY_YEAR = new Map(EDITIONS.map((e) => [e.year, e]));

export function listMlsCupYears(): number[] {
  return EDITIONS.map((e) => e.year);
}
export function getMlsCupByYear(year: number): MlsCupEdition | null {
  return EDITION_BY_YEAR.get(year) ?? null;
}
export function listMlsCups(): MlsCupEdition[] {
  return EDITIONS;
}

// ─────────────────────────── PLAYERS (MLS Cup MVP registry) ───────────────────────────
export type MlsPlayerEntity = {
  slug: string;
  name: string;
  honors: Array<{ kind: "MLS Cup MVP"; year: number; team: string }>;
};

let _players: MlsPlayerEntity[] | null = null;
function buildPlayers(): MlsPlayerEntity[] {
  if (_players) return _players;
  const map = new Map<string, MlsPlayerEntity>();
  for (const e of EDITIONS) {
    const rawName = e.fmvp?.trim();
    if (!rawName) continue;
    if (rawName.includes(" & ") || rawName.includes(",")) continue;
    const slug = slugify(rawName);
    const p = map.get(slug) ?? { slug, name: rawName, honors: [] };
    p.honors.push({ kind: "MLS Cup MVP", year: e.year, team: e.champion });
    map.set(slug, p);
  }
  _players = Array.from(map.values());
  return _players;
}

export function listMlsPlayers(): MlsPlayerEntity[] {
  return buildPlayers();
}
export function getMlsPlayerBySlug(slug: string): MlsPlayerEntity | null {
  return buildPlayers().find((p) => p.slug === slug) ?? null;
}
