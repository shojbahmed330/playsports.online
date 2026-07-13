// Programmatic SEO registry — derives team/player/H2H/archive entries from
// existing datasets so we ship thousands of long-tail landing pages without
// hand-authoring each one. Pure functions, safe in loaders.

import goalsData from "@/data/wc_goals.json";
import goals2026 from "@/data/wc_2026_goals.json";
import cardsData from "@/data/wc_cards.json";
import groupMatches from "@/data/wc_group_matches.json";
import { CHAMPIONS_OVERRIDE } from "@/lib/champions";
import type { Sport } from "@/lib/champions";

export type Sport2 = Sport; // re-export for ergonomics

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type Goal = { pid: string; name: string; team: string; pteam?: string; year: number; og?: boolean; pen?: boolean; pos?: string };
type Card = { pid?: string; name: string; team: string; year: number; type?: string };
type Match = { home_team: string; away_team: string; home_score: number; away_score: number; match_date?: string; tournament_year: number; round?: string; stadium?: string; city?: string };

const GOALS = [...(goalsData as Goal[]), ...(goals2026 as Goal[])];
const CARDS = cardsData as Card[];
const GROUPS = groupMatches as Record<string, Match[]>;

// ---------- TEAMS ----------
type TeamRow = { sport: Sport2; slug: string; name: string };

let _teams: TeamRow[] | null = null;
export function listTeams(): TeamRow[] {
  if (_teams) return _teams;
  const fb = new Set<string>();
  GOALS.forEach((g) => fb.add(g.team));
  Object.values(GROUPS).forEach((arr) => arr.forEach((m) => { fb.add(m.home_team); fb.add(m.away_team); }));
  _teams = Array.from(fb).filter(Boolean).map((name) => ({ sport: "football_wc" as Sport2, slug: slugify(name), name }));
  return _teams;
}

export function findTeam(sport: string, slug: string): TeamRow | null {
  return listTeams().find((t) => t.sport === sport && t.slug === slug) ?? null;
}

export function teamStats(name: string) {
  const goals = GOALS.filter((g) => g.team === name);
  const cards = CARDS.filter((c) => c.team === name);
  const matches: Match[] = [];
  Object.values(GROUPS).forEach((arr) => arr.forEach((m) => {
    if (m.home_team === name || m.away_team === name) matches.push(m);
  }));
  const years = Array.from(new Set(goals.map((g) => g.year).concat(matches.map((m) => m.tournament_year)))).sort();
  // top scorers for team
  const sc = new Map<string, number>();
  goals.forEach((g) => sc.set(g.name, (sc.get(g.name) ?? 0) + 1));
  const allScorers = Array.from(sc.entries()).sort((a, b) => b[1] - a[1]).map(([name, goals]) => ({ name, goals }));
  const topScorers = allScorers.slice(0, 10);
  // win/draw/loss
  let w = 0, d = 0, l = 0, gf = 0, ga = 0;
  matches.forEach((m) => {
    const isHome = m.home_team === name;
    const my = isHome ? m.home_score : m.away_score;
    const op = isHome ? m.away_score : m.home_score;
    gf += my; ga += op;
    if (my > op) w++;
    else if (my < op) l++;
    else d++;
  });
  return { goalsTotal: goals.length, cardsTotal: cards.length, matchesPlayed: matches.length, w, d, l, gf, ga, years, topScorers, allScorers, recentMatches: matches.slice(-10).reverse() };

}

// ---------- PLAYERS ----------
type PlayerRow = { sport: Sport2; slug: string; name: string; team: string };

let _players: PlayerRow[] | null = null;
export function listPlayers(): PlayerRow[] {
  if (_players) return _players;
  const map = new Map<string, PlayerRow>();
  GOALS.forEach((g) => {
    const slug = slugify(g.name);
    const key = `football_wc:${slug}`;
    if (!map.has(key)) map.set(key, { sport: "football_wc", slug, name: g.name, team: g.team });
  });
  _players = Array.from(map.values());
  return _players;
}

export function findPlayer(sport: string, slug: string): PlayerRow | null {
  return listPlayers().find((p) => p.sport === sport && p.slug === slug) ?? null;
}

export function playerStats(name: string) {
  const goals = GOALS.filter((g) => g.name === name);
  const cards = CARDS.filter((c) => c.name === name);
  const years = Array.from(new Set(goals.map((g) => g.year))).sort();
  const byYear = years.map((y) => ({ year: y, goals: goals.filter((g) => g.year === y).length }));
  const team = goals[0]?.team ?? "";
  return { name, team, goalsTotal: goals.length, cardsTotal: cards.length, years, byYear, pen: goals.filter((g) => g.pen).length, og: goals.filter((g) => g.og).length };
}

// ---------- HEAD-TO-HEAD ----------
type H2HRow = { sport: Sport2; slug: string; teamA: string; teamB: string; meetings: number };

let _h2h: H2HRow[] | null = null;
export function listH2H(): H2HRow[] {
  if (_h2h) return _h2h;
  const counter = new Map<string, { a: string; b: string; n: number }>();
  Object.values(GROUPS).forEach((arr) => arr.forEach((m) => {
    const [a, b] = [m.home_team, m.away_team].sort();
    const key = `${a}__${b}`;
    const cur = counter.get(key) ?? { a, b, n: 0 };
    cur.n++;
    counter.set(key, cur);
  }));
  _h2h = Array.from(counter.values())
    .filter((p) => p.n >= 1)
    .map((p) => ({ sport: "football_wc" as Sport2, slug: `${slugify(p.a)}-vs-${slugify(p.b)}`, teamA: p.a, teamB: p.b, meetings: p.n }));
  return _h2h;
}

export function findH2H(sport: string, slug: string): H2HRow | null {
  return listH2H().find((h) => h.sport === sport && h.slug === slug) ?? null;
}

export function h2hMatches(teamA: string, teamB: string): Match[] {
  const out: Match[] = [];
  Object.values(GROUPS).forEach((arr) => arr.forEach((m) => {
    if ((m.home_team === teamA && m.away_team === teamB) || (m.home_team === teamB && m.away_team === teamA)) out.push(m);
  }));
  return out.sort((a, b) => (a.match_date ?? "").localeCompare(b.match_date ?? ""));
}

// ---------- ARCHIVES ----------
type ArchiveRow = { sport: Sport2; year: number };

export function listArchives(): ArchiveRow[] {
  const years = new Set<number>();
  Object.keys(GROUPS).forEach((y) => years.add(Number(y)));
  GOALS.forEach((g) => years.add(g.year));
  CHAMPIONS_OVERRIDE.filter((c) => c.sport === "football_wc").forEach((c) => years.add(c.season));
  return Array.from(years).sort((a, b) => a - b).map((year) => ({ sport: "football_wc" as Sport2, year }));
}

export function archiveStats(year: number) {
  const matches = (GROUPS[String(year)] ?? []) as Match[];
  const goals = GOALS.filter((g) => g.year === year);
  const champion = CHAMPIONS_OVERRIDE.find((c) => c.sport === "football_wc" && c.season === year) ?? null;
  const sc = new Map<string, { name: string; team: string; goals: number }>();
  goals.forEach((g) => {
    const cur = sc.get(g.name) ?? { name: g.name, team: g.team, goals: 0 };
    cur.goals++;
    sc.set(g.name, cur);
  });
  const allScorers = Array.from(sc.values()).sort((a, b) => b.goals - a.goals);
  const topScorers = allScorers.slice(0, 10);
  return { matches, goals, champion, topScorers, allScorers };

}

// ---------- COUNTRY × YEAR ----------
export type CountryYear = { sport: Sport2; countrySlug: string; countryName: string; year: number };

export function teamYearStats(name: string, year: number) {
  const goals = GOALS.filter((g) => g.team === name && g.year === year);
  const matches = (GROUPS[String(year)] ?? []).filter((m) => m.home_team === name || m.away_team === name);
  let w = 0, d = 0, l = 0, gf = 0, ga = 0;
  matches.forEach((m) => {
    const isHome = m.home_team === name;
    const my = isHome ? m.home_score : m.away_score;
    const op = isHome ? m.away_score : m.home_score;
    gf += my; ga += op;
    if (my > op) w++;
    else if (my < op) l++;
    else d++;
  });
  const sc = new Map<string, number>();
  goals.forEach((g) => sc.set(g.name, (sc.get(g.name) ?? 0) + 1));
  const topScorers = Array.from(sc.entries()).sort((a, b) => b[1] - a[1]).map(([n, gs]) => ({ name: n, goals: gs }));
  return { year, matches, w, d, l, gf, ga, played: matches.length, goals, topScorers };
}

export function listCountryYears(): CountryYear[] {
  const out: CountryYear[] = [];
  const seen = new Set<string>();
  GOALS.forEach((g) => {
    const key = `${g.team}__${g.year}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ sport: "football_wc", countrySlug: slugify(g.team), countryName: g.team, year: g.year });
  });
  Object.entries(GROUPS).forEach(([y, arr]) => {
    const year = Number(y);
    arr.forEach((m) => {
      for (const team of [m.home_team, m.away_team]) {
        const key = `${team}__${year}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ sport: "football_wc", countrySlug: slugify(team), countryName: team, year });
      }
    });
  });
  return out;
}

export function findCountryYear(slug: string, year: number): CountryYear | null {
  return listCountryYears().find((c) => c.countrySlug === slug && c.year === year) ?? null;
}

// ---------- PLAYER × YEAR ----------
export type PlayerYear = { sport: Sport2; playerSlug: string; playerName: string; team: string; year: number };

export function playerYearStats(name: string, year: number) {
  const goals = GOALS.filter((g) => g.name === name && g.year === year);
  const cards = CARDS.filter((c) => c.name === name && c.year === year);
  const team = goals[0]?.team ?? "";
  return { year, team, goals: goals.length, pen: goals.filter((g) => g.pen).length, og: goals.filter((g) => g.og).length, cards: cards.length };
}

export function listPlayerYears(): PlayerYear[] {
  const seen = new Set<string>();
  const out: PlayerYear[] = [];
  GOALS.forEach((g) => {
    const key = `${g.name}__${g.year}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ sport: "football_wc", playerSlug: slugify(g.name), playerName: g.name, team: g.team, year: g.year });
  });
  return out;
}

export function findPlayerYear(slug: string, year: number): PlayerYear | null {
  return listPlayerYears().find((p) => p.playerSlug === slug && p.year === year) ?? null;
}

