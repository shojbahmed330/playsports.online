// Phase 2.1 — MLB SSR SEO entity registry.
// Pure aggregators over bundled JSON + a static team map — safe in loaders (SSR).

import historyData from "@/data/mlb/history.json";
import { slugify } from "@/lib/seo/programmatic";

// ─────────────────────────── TEAMS (static) ───────────────────────────
// ESPN team IDs are stable; slugs are canonical SEO handles.
export type MlbTeamEntity = {
  slug: string;
  espnId: string;
  name: string;
  short: string;
  abbr: string;
  city: string;
  league: "AL" | "NL";
  division: "East" | "Central" | "West";
  logo: string;
};

function espnLogo(abbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${abbr.toLowerCase()}.png`;
}

const RAW_TEAMS: Array<Omit<MlbTeamEntity, "slug" | "logo">> = [
  { espnId: "1", name: "Baltimore Orioles", short: "Orioles", abbr: "BAL", city: "Baltimore", league: "AL", division: "East" },
  { espnId: "2", name: "Boston Red Sox", short: "Red Sox", abbr: "BOS", city: "Boston", league: "AL", division: "East" },
  { espnId: "3", name: "Los Angeles Angels", short: "Angels", abbr: "LAA", city: "Anaheim", league: "AL", division: "West" },
  { espnId: "4", name: "Chicago White Sox", short: "White Sox", abbr: "CWS", city: "Chicago", league: "AL", division: "Central" },
  { espnId: "5", name: "Cleveland Guardians", short: "Guardians", abbr: "CLE", city: "Cleveland", league: "AL", division: "Central" },
  { espnId: "6", name: "Detroit Tigers", short: "Tigers", abbr: "DET", city: "Detroit", league: "AL", division: "Central" },
  { espnId: "7", name: "Kansas City Royals", short: "Royals", abbr: "KC", city: "Kansas City", league: "AL", division: "Central" },
  { espnId: "8", name: "Milwaukee Brewers", short: "Brewers", abbr: "MIL", city: "Milwaukee", league: "NL", division: "Central" },
  { espnId: "9", name: "Minnesota Twins", short: "Twins", abbr: "MIN", city: "Minneapolis", league: "AL", division: "Central" },
  { espnId: "10", name: "New York Yankees", short: "Yankees", abbr: "NYY", city: "New York", league: "AL", division: "East" },
  { espnId: "11", name: "Athletics", short: "Athletics", abbr: "ATH", city: "Oakland", league: "AL", division: "West" },
  { espnId: "12", name: "Seattle Mariners", short: "Mariners", abbr: "SEA", city: "Seattle", league: "AL", division: "West" },
  { espnId: "13", name: "Texas Rangers", short: "Rangers", abbr: "TEX", city: "Arlington", league: "AL", division: "West" },
  { espnId: "14", name: "Toronto Blue Jays", short: "Blue Jays", abbr: "TOR", city: "Toronto", league: "AL", division: "East" },
  { espnId: "15", name: "Atlanta Braves", short: "Braves", abbr: "ATL", city: "Atlanta", league: "NL", division: "East" },
  { espnId: "16", name: "Chicago Cubs", short: "Cubs", abbr: "CHC", city: "Chicago", league: "NL", division: "Central" },
  { espnId: "17", name: "Cincinnati Reds", short: "Reds", abbr: "CIN", city: "Cincinnati", league: "NL", division: "Central" },
  { espnId: "18", name: "Houston Astros", short: "Astros", abbr: "HOU", city: "Houston", league: "AL", division: "West" },
  { espnId: "19", name: "Los Angeles Dodgers", short: "Dodgers", abbr: "LAD", city: "Los Angeles", league: "NL", division: "West" },
  { espnId: "20", name: "Washington Nationals", short: "Nationals", abbr: "WSH", city: "Washington", league: "NL", division: "East" },
  { espnId: "21", name: "New York Mets", short: "Mets", abbr: "NYM", city: "New York", league: "NL", division: "East" },
  { espnId: "22", name: "Philadelphia Phillies", short: "Phillies", abbr: "PHI", city: "Philadelphia", league: "NL", division: "East" },
  { espnId: "23", name: "Pittsburgh Pirates", short: "Pirates", abbr: "PIT", city: "Pittsburgh", league: "NL", division: "Central" },
  { espnId: "24", name: "St. Louis Cardinals", short: "Cardinals", abbr: "STL", city: "St. Louis", league: "NL", division: "Central" },
  { espnId: "25", name: "San Diego Padres", short: "Padres", abbr: "SD", city: "San Diego", league: "NL", division: "West" },
  { espnId: "26", name: "San Francisco Giants", short: "Giants", abbr: "SF", city: "San Francisco", league: "NL", division: "West" },
  { espnId: "27", name: "Tampa Bay Rays", short: "Rays", abbr: "TB", city: "St. Petersburg", league: "AL", division: "East" },
  { espnId: "28", name: "Miami Marlins", short: "Marlins", abbr: "MIA", city: "Miami", league: "NL", division: "East" },
  { espnId: "29", name: "Arizona Diamondbacks", short: "Diamondbacks", abbr: "ARI", city: "Phoenix", league: "NL", division: "West" },
  { espnId: "30", name: "Colorado Rockies", short: "Rockies", abbr: "COL", city: "Denver", league: "NL", division: "West" },
];

const TEAMS: MlbTeamEntity[] = RAW_TEAMS.map((t) => ({
  ...t,
  slug: slugify(t.name),
  logo: espnLogo(t.abbr),
}));

const TEAM_BY_SLUG = new Map(TEAMS.map((t) => [t.slug, t]));
const TEAM_BY_ID = new Map(TEAMS.map((t) => [t.espnId, t]));
const TEAM_BY_ABBR = new Map(TEAMS.map((t) => [t.abbr.toUpperCase(), t]));

export function listMlbTeams(): MlbTeamEntity[] {
  return TEAMS;
}
export function getMlbTeamBySlug(slug: string): MlbTeamEntity | null {
  return TEAM_BY_SLUG.get(slug) ?? null;
}
export function getMlbTeamByEspnId(id: string): MlbTeamEntity | null {
  return TEAM_BY_ID.get(String(id)) ?? null;
}
export function getMlbTeamByAbbr(abbr: string): MlbTeamEntity | null {
  return TEAM_BY_ABBR.get(abbr.toUpperCase()) ?? null;
}

// ─────────────────────────── HISTORY TYPES ───────────────────────────
type WsRow = { year: number; champion: string; runnerUp: string; result: string; mvp: string };
type AwardRow = { year: number; player: string; team: string };
type LeaderRow = { rank: number; player: string; value: string };

const H = historyData as {
  worldSeries: WsRow[];
  mvp: { AL: AwardRow[]; NL: AwardRow[] };
  cyYoung: { AL: AwardRow[]; NL: AwardRow[] };
  rookieOfYear: { AL: AwardRow[]; NL: AwardRow[] };
  allTimeLeaders: Record<string, LeaderRow[]>;
};

// ─────────────────────────── WORLD SERIES EDITIONS ───────────────────────────
export type WsEdition = WsRow;

export function listWorldSeriesYears(): number[] {
  return H.worldSeries.map((w) => w.year);
}
export function getWorldSeriesByYear(year: number): WsEdition | null {
  return H.worldSeries.find((w) => w.year === year) ?? null;
}
export function listWorldSeries(): WsEdition[] {
  return H.worldSeries;
}

// ─────────────────────────── PLAYERS (historical registry) ───────────────────────────
export type MlbPlayerEntity = {
  slug: string;
  name: string;
  honors: Array<{
    kind: "MVP" | "Cy Young" | "Rookie of the Year" | "World Series MVP" | "All-Time Leader";
    year?: number;
    league?: "AL" | "NL";
    team?: string;
    category?: string;
    value?: string;
    rank?: number;
  }>;
};

let _players: MlbPlayerEntity[] | null = null;
function buildPlayers(): MlbPlayerEntity[] {
  if (_players) return _players;
  const map = new Map<string, MlbPlayerEntity>();
  const put = (rawName: string, honor: MlbPlayerEntity["honors"][number]) => {
    const name = rawName.trim();
    if (!name) return;
    // skip co-winners like "Curt Schilling & Randy Johnson"
    if (name.includes(" & ") || name.includes(",")) {
      for (const part of name.split(/\s*(?:&|,)\s*/)) put(part, honor);
      return;
    }
    const slug = slugify(name);
    const e = map.get(slug) ?? { slug, name, honors: [] };
    e.honors.push(honor);
    map.set(slug, e);
  };

  for (const w of H.worldSeries) {
    put(w.mvp, { kind: "World Series MVP", year: w.year, team: w.champion });
  }
  for (const lg of ["AL", "NL"] as const) {
    for (const r of H.mvp[lg]) put(r.player, { kind: "MVP", year: r.year, league: lg, team: r.team });
    for (const r of H.cyYoung[lg]) put(r.player, { kind: "Cy Young", year: r.year, league: lg, team: r.team });
    for (const r of H.rookieOfYear[lg]) put(r.player, { kind: "Rookie of the Year", year: r.year, league: lg, team: r.team });
  }
  for (const [category, rows] of Object.entries(H.allTimeLeaders)) {
    for (const r of rows) put(r.player, { kind: "All-Time Leader", category, value: r.value, rank: r.rank });
  }

  _players = Array.from(map.values());
  return _players;
}

export function listMlbPlayers(): MlbPlayerEntity[] {
  return buildPlayers();
}
export function getMlbPlayerBySlug(slug: string): MlbPlayerEntity | null {
  return buildPlayers().find((p) => p.slug === slug) ?? null;
}

// ─────────────────────────── RECORD CATEGORIES ───────────────────────────
export const MLB_RECORD_CATEGORIES: Array<{
  slug: string;
  title: string;
  metric: string;
  group: "batting" | "pitching";
  key: keyof typeof H.allTimeLeaders;
}> = [
  { slug: "career-home-runs", title: "Career Home Runs Leaders", metric: "HR", group: "batting", key: "homeRuns" },
  { slug: "career-hits", title: "Career Hits Leaders", metric: "H", group: "batting", key: "hits" },
  { slug: "career-batting-average", title: "Career Batting Average Leaders", metric: "AVG", group: "batting", key: "battingAverage" },
  { slug: "career-wins", title: "Career Pitching Wins Leaders", metric: "W", group: "pitching", key: "wins" },
  { slug: "career-strikeouts", title: "Career Strikeouts Leaders", metric: "K", group: "pitching", key: "strikeouts" },
  { slug: "career-saves", title: "Career Saves Leaders", metric: "SV", group: "pitching", key: "saves" },
  { slug: "career-era", title: "Career ERA Leaders", metric: "ERA", group: "pitching", key: "era" },
];

export function listMlbRecordCategories() {
  return MLB_RECORD_CATEGORIES;
}
export function getMlbRecordCategory(slug: string) {
  const cat = MLB_RECORD_CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return null;
  return { ...cat, rows: H.allTimeLeaders[cat.key] ?? [] };
}
