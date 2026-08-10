// Programmatic long-tail SEO layer for MLB / NBA / NHL / MLS / Cricket.
// Pure aggregators over bundled JSON — safe to call from SSR loaders.
//
// For each sport we expose:
//   - listChampions()          → normalized {seasonLabel, champion, runnerUp, extra}[]
//   - listChampionTeamSlugs()  → slugs (from historical + current names) with WS/Cup appearances
//   - getTeamHistory(slug)     → { name, championships, runnerUps, appearances }
// Plus sitemap URL helpers at the bottom.

import mlbHistory from "@/data/mlb/history.json";
import nbaHistory from "@/data/nba/history.json";
import nhlHistory from "@/data/nhl/history.json";
import mlsHistory from "@/data/mls/history.json";
import cricketHistory from "@/data/cricket/history.json";
import { slugify } from "@/lib/seo/programmatic";

// ─────────── Shared types ───────────
export type ChampionRow = {
  seasonLabel: string;     // "2024" or "2024-25"
  year: number;            // numeric year (for sort)
  champion: string;
  runnerUp: string;
  result?: string;
  extra?: string;          // MVP / FMVP
};

export type TeamHistory = {
  slug: string;
  name: string;            // canonical display name
  championships: ChampionRow[];
  runnerUps: ChampionRow[];
  appearances: number;     // championships + runnerUps
};

// ─────────── Normalizers per sport ───────────
type MlbWs = { year: number; champion: string; runnerUp: string; result: string; mvp: string };
type SeasonRow = { season: string; champion: string; runnerUp: string; fmvp?: string; result: string };
type CricketRow = { year: number; champion: string; runnerUp: string; host?: string; venue?: string; result?: string };

function yearOfSeason(s: string): number {
  // "2024-25" → 2024, "2024" → 2024
  const m = s.match(/^(\d{4})/);
  return m ? Number(m[1]) : 0;
}

const MLB_CHAMPIONS: ChampionRow[] = (mlbHistory as { worldSeries: MlbWs[] }).worldSeries.map((w) => ({
  seasonLabel: String(w.year),
  year: w.year,
  champion: w.champion,
  runnerUp: w.runnerUp,
  result: w.result,
  extra: w.mvp,
}));

const NBA_CHAMPIONS: ChampionRow[] = (nbaHistory as { champions: SeasonRow[] }).champions.map((w) => ({
  seasonLabel: w.season,
  year: yearOfSeason(w.season),
  champion: w.champion,
  runnerUp: w.runnerUp,
  result: w.result,
  extra: w.fmvp,
}));

const NHL_CHAMPIONS: ChampionRow[] = (nhlHistory as { champions: SeasonRow[] }).champions.map((w) => ({
  seasonLabel: w.season,
  year: yearOfSeason(w.season),
  champion: w.champion,
  runnerUp: w.runnerUp,
  result: w.result,
  extra: w.fmvp,
}));

const MLS_CHAMPIONS: ChampionRow[] = (mlsHistory as { champions: SeasonRow[] }).champions.map((w) => ({
  seasonLabel: w.season,
  year: yearOfSeason(w.season),
  champion: w.champion,
  runnerUp: w.runnerUp,
  result: w.result,
  extra: w.fmvp,
}));

type CricketData = Record<
  string,
  { label: string; format?: string; emoji?: string; champions?: CricketRow[] }
>;
const CRICKET = cricketHistory as CricketData;

function cricketAllRows(): ChampionRow[] {
  const out: ChampionRow[] = [];
  for (const key of Object.keys(CRICKET)) {
    const t = CRICKET[key];
    for (const c of t.champions ?? []) {
      out.push({
        seasonLabel: `${t.label} ${c.year}`,
        year: c.year,
        champion: c.champion,
        runnerUp: c.runnerUp,
        result: c.result,
        extra: c.host,
      });
    }
  }
  return out;
}
const CRICKET_ALL: ChampionRow[] = cricketAllRows();

// ─────────── Public: champion rows ───────────
export function listMlbChampions()     { return MLB_CHAMPIONS; }
export function listNbaChampions()     { return NBA_CHAMPIONS; }
export function listNhlChampions()     { return NHL_CHAMPIONS; }
export function listMlsChampions()     { return MLS_CHAMPIONS; }
export function listCricketChampions() { return CRICKET_ALL; }

export function listCricketTournamentKeys(): Array<{ key: string; label: string; emoji?: string; count: number }> {
  return Object.keys(CRICKET).map((k) => ({
    key: k,
    label: CRICKET[k].label,
    emoji: CRICKET[k].emoji,
    count: (CRICKET[k].champions ?? []).length,
  }));
}

// ─────────── Team-history builder ───────────
function buildTeamHistory(rows: ChampionRow[]): Map<string, TeamHistory> {
  const map = new Map<string, TeamHistory>();
  const add = (name: string, row: ChampionRow, kind: "champ" | "ru") => {
    if (!name) return;
    const slug = slugify(name);
    if (!slug) return;
    let cur = map.get(slug);
    if (!cur) {
      cur = { slug, name, championships: [], runnerUps: [], appearances: 0 };
      map.set(slug, cur);
    }
    if (kind === "champ") cur.championships.push(row);
    else cur.runnerUps.push(row);
    cur.appearances = cur.championships.length + cur.runnerUps.length;
  };
  for (const r of rows) {
    add(r.champion, r, "champ");
    add(r.runnerUp, r, "ru");
  }
  // Sort each team's rows newest first.
  for (const t of map.values()) {
    t.championships.sort((a, b) => b.year - a.year);
    t.runnerUps.sort((a, b) => b.year - a.year);
  }
  return map;
}

const MLB_TEAMS_MAP     = buildTeamHistory(MLB_CHAMPIONS);
const NBA_TEAMS_MAP     = buildTeamHistory(NBA_CHAMPIONS);
const NHL_TEAMS_MAP     = buildTeamHistory(NHL_CHAMPIONS);
const MLS_TEAMS_MAP     = buildTeamHistory(MLS_CHAMPIONS);
const CRICKET_TEAMS_MAP = buildTeamHistory(CRICKET_ALL);

function listSlugs(m: Map<string, TeamHistory>): string[] {
  return Array.from(m.keys()).sort();
}
function listSummaries(m: Map<string, TeamHistory>): TeamHistory[] {
  return Array.from(m.values()).sort(
    (a, b) => b.championships.length - a.championships.length || a.name.localeCompare(b.name),
  );
}

export const mlbTeamHistorySlugs     = () => listSlugs(MLB_TEAMS_MAP);
export const nbaTeamHistorySlugs     = () => listSlugs(NBA_TEAMS_MAP);
export const nhlTeamHistorySlugs     = () => listSlugs(NHL_TEAMS_MAP);
export const mlsTeamHistorySlugs     = () => listSlugs(MLS_TEAMS_MAP);
export const cricketTeamHistorySlugs = () => listSlugs(CRICKET_TEAMS_MAP);

export const listMlbTeamHistories     = () => listSummaries(MLB_TEAMS_MAP);
export const listNbaTeamHistories     = () => listSummaries(NBA_TEAMS_MAP);
export const listNhlTeamHistories     = () => listSummaries(NHL_TEAMS_MAP);
export const listMlsTeamHistories     = () => listSummaries(MLS_TEAMS_MAP);
export const listCricketTeamHistories = () => listSummaries(CRICKET_TEAMS_MAP);

export const getMlbTeamHistory     = (slug: string) => MLB_TEAMS_MAP.get(slug) ?? null;
export const getNbaTeamHistory     = (slug: string) => NBA_TEAMS_MAP.get(slug) ?? null;
export const getNhlTeamHistory     = (slug: string) => NHL_TEAMS_MAP.get(slug) ?? null;
export const getMlsTeamHistory     = (slug: string) => MLS_TEAMS_MAP.get(slug) ?? null;
export const getCricketTeamHistory = (slug: string) => CRICKET_TEAMS_MAP.get(slug) ?? null;

// ─────────── Champion aggregates (for all-time champions pages) ───────────
export type ChampionAggregate = { name: string; slug: string; titles: number; years: number[] };

function aggregate(rows: ChampionRow[]): ChampionAggregate[] {
  const map = new Map<string, ChampionAggregate>();
  for (const r of rows) {
    const slug = slugify(r.champion);
    let cur = map.get(slug);
    if (!cur) {
      cur = { name: r.champion, slug, titles: 0, years: [] };
      map.set(slug, cur);
    }
    cur.titles++;
    cur.years.push(r.year);
  }
  for (const a of map.values()) a.years.sort((x, y) => y - x);
  return Array.from(map.values()).sort(
    (a, b) => b.titles - a.titles || a.name.localeCompare(b.name),
  );
}

export const aggregateMlbChampions     = () => aggregate(MLB_CHAMPIONS);
export const aggregateNbaChampions     = () => aggregate(NBA_CHAMPIONS);
export const aggregateNhlChampions     = () => aggregate(NHL_CHAMPIONS);
export const aggregateMlsChampions     = () => aggregate(MLS_CHAMPIONS);
export const aggregateCricketChampions = () => aggregate(CRICKET_ALL);

// ─────────── Sitemap URL helpers ───────────
type Url = { path: string; changefreq: "monthly" | "yearly"; priority: string };

function urlsFor(sport: string, slugs: string[]): Url[] {
  return slugs.map((s) => ({
    path: `/${sport}/team-history/${s}`,
    changefreq: "yearly" as const,
    priority: "0.65",
  }));
}

export const mlbProgrammaticUrls = () => urlsFor("mlb", mlbTeamHistorySlugs());
export const nbaProgrammaticUrls = () => urlsFor("nba", nbaTeamHistorySlugs());
export const nhlProgrammaticUrls = () => urlsFor("nhl", nhlTeamHistorySlugs());
export const mlsProgrammaticUrls = () => urlsFor("mls", mlsTeamHistorySlugs());

// Cricket doesn't get a /cricket/champions page (that lives at /cricket/tournaments/$slug already).
// Only team-history is added.
export function cricketProgrammaticUrls(): Url[] {
  return cricketTeamHistorySlugs().map((s) => ({
    path: `/cricket/team-history/${s}`,
    changefreq: "yearly" as const,
    priority: "0.65",
  }));
}
