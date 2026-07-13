// Phase 2.2 — Tournament leaderboard aggregators. Pure functions over
// wc_goals.json and wc_cards.json, safe to call from SSR loaders.

import goalsData from "@/data/wc_goals.json";
import goals2026 from "@/data/wc_2026_goals.json";
import cardsData from "@/data/wc_cards.json";
import cards2026 from "@/data/wc_2026_cards.json";
import { slugify } from "@/lib/seo/programmatic";

type Goal = { pid: string; name: string; team: string; year: number; og: boolean; pen: boolean; pos: string };
type Card = { pid: string; name: string; team: string; year: number; type: "yellow" | "red"; pos: string };

const GOALS = [...(goalsData as Goal[]), ...(goals2026 as unknown as Goal[])];
const CARDS = [...(cardsData as Card[]), ...(cards2026 as unknown as Card[])];

// ── Tournaments ───────────────────────────────────────────────────────
export const TOURNAMENTS = [
  { slug: "fifa-world-cup-2026", name: "FIFA World Cup 2026", year: 2026 },
  { slug: "fifa-world-cup-2022", name: "FIFA World Cup 2022", year: 2022 },
  { slug: "fifa-world-cup-2018", name: "FIFA World Cup 2018", year: 2018 },
  { slug: "fifa-world-cup-2014", name: "FIFA World Cup 2014", year: 2014 },
  { slug: "fifa-world-cup-all-time", name: "FIFA World Cup — All-time", year: null as number | null },
] as const;

export type TournamentSlug = (typeof TOURNAMENTS)[number]["slug"];

export function getTournament(slug: string) {
  return TOURNAMENTS.find((t) => t.slug === slug) ?? null;
}

// ── Leaderboards ──────────────────────────────────────────────────────
export const LEADERBOARDS = [
  { slug: "top-scorers", name: "Top Scorers", metric: "Goals" },
  { slug: "yellow-cards", name: "Yellow Cards", metric: "Yellow cards" },
  { slug: "red-cards", name: "Red Cards", metric: "Red cards" },
] as const;

export type LeaderboardSlug = (typeof LEADERBOARDS)[number]["slug"];

export function getLeaderboard(slug: string) {
  return LEADERBOARDS.find((l) => l.slug === slug) ?? null;
}

export type LeaderboardRow = {
  rank: number;
  pid: string;
  name: string;
  slug: string;
  team: string;
  count: number;
};

function filterYear<T extends { year: number }>(rows: T[], year: number | null): T[] {
  return year == null ? rows : rows.filter((r) => r.year === year);
}

function tally(rows: Array<{ pid: string; name: string; team: string }>): LeaderboardRow[] {
  const map = new Map<string, LeaderboardRow>();
  for (const r of rows) {
    const key = r.pid;
    const existing = map.get(key);
    if (existing) existing.count++;
    else map.set(key, { rank: 0, pid: r.pid, name: r.name, slug: slugify(r.name), team: r.team, count: 1 });
  }
  const list = Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  list.forEach((row, i) => (row.rank = i + 1));
  return list;
}

/** Return leaderboard rows for a (tournament, leaderboard) pair. */
export function computeLeaderboard(tournamentSlug: string, boardSlug: string, limit = 50): LeaderboardRow[] {
  const t = getTournament(tournamentSlug);
  const b = getLeaderboard(boardSlug);
  if (!t || !b) return [];
  if (b.slug === "top-scorers") {
    const rows = filterYear(GOALS, t.year).filter((g) => !g.og);
    return tally(rows).slice(0, limit);
  }
  if (b.slug === "yellow-cards") {
    const rows = filterYear(CARDS, t.year).filter((c) => c.type === "yellow");
    return tally(rows).slice(0, limit);
  }
  if (b.slug === "red-cards") {
    const rows = filterYear(CARDS, t.year).filter((c) => c.type === "red");
    return tally(rows).slice(0, limit);
  }
  return [];
}

/** All (tournament, leaderboard) combos that actually have data — for sitemap. */
export function listLeaderboardUrls(): Array<{ tournament: string; leaderboard: string; count: number }> {
  const out: Array<{ tournament: string; leaderboard: string; count: number }> = [];
  for (const t of TOURNAMENTS) {
    for (const b of LEADERBOARDS) {
      const rows = computeLeaderboard(t.slug, b.slug, 1);
      if (rows.length > 0) out.push({ tournament: t.slug, leaderboard: b.slug, count: rows.length });
    }
  }
  return out;
}

// ── Player stat sub-pages ─────────────────────────────────────────────
export type PlayerStat = {
  year: number;
  goals: number;
  penalties: number;
  ownGoals: number;
  yellows: number;
  reds: number;
  team: string;
};

/** Per-year stat table for a player slug (matches slugified name). */
export function getPlayerStatHistory(playerSlug: string): {
  name: string;
  team: string;
  rows: PlayerStat[];
  totals: PlayerStat;
} | null {
  const goalRows = GOALS.filter((g) => slugify(g.name) === playerSlug);
  const cardRows = CARDS.filter((c) => slugify(c.name) === playerSlug);
  if (goalRows.length === 0 && cardRows.length === 0) return null;
  const name = (goalRows[0] ?? cardRows[0]).name;
  const team = (goalRows[0] ?? cardRows[0]).team;

  const years = new Set<number>([...goalRows.map((g) => g.year), ...cardRows.map((c) => c.year)]);
  const rows: PlayerStat[] = [];
  for (const year of Array.from(years).sort()) {
    const yg = goalRows.filter((g) => g.year === year);
    const yc = cardRows.filter((c) => c.year === year);
    rows.push({
      year,
      goals: yg.filter((g) => !g.og).length,
      penalties: yg.filter((g) => g.pen).length,
      ownGoals: yg.filter((g) => g.og).length,
      yellows: yc.filter((c) => c.type === "yellow").length,
      reds: yc.filter((c) => c.type === "red").length,
      team: (yg[0] ?? yc[0]).team,
    });
  }
  const totals: PlayerStat = {
    year: 0,
    goals: rows.reduce((s, r) => s + r.goals, 0),
    penalties: rows.reduce((s, r) => s + r.penalties, 0),
    ownGoals: rows.reduce((s, r) => s + r.ownGoals, 0),
    yellows: rows.reduce((s, r) => s + r.yellows, 0),
    reds: rows.reduce((s, r) => s + r.reds, 0),
    team,
  };
  return { name, team, rows, totals };
}
