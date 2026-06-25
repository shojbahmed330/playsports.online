// Predicted Round of 32 generator for FIFA World Cup 2026.
//
// ESPN's scoreboard doesn't publish R32 fixtures until after the group stage
// settles, but the tournament structure (12 groups × 4 teams → 24 winners
// /runners-up + 8 best 3rd-placed teams = 32) is fixed. We compute a
// best-effort predicted bracket from current standings so users have something
// to look at — labelled "PREDICTED" so it's never confused with the real
// schedule. Once ESPN publishes the real fixture for any pair, the merger in
// Wc2026View drops the synthesized row.
//
// Note on slotting: FIFA's official R32 matrix is complex and depends on which
// 8 of the 12 third-placed teams advance (Euro-style lookup table). We use a
// simple deterministic snake pairing (#1 vs #32, #2 vs #31, …) over a 32-team
// seed list ordered: 12 group winners, 12 runners-up, 8 best 3rds. This won't
// match FIFA's exact pairings but produces a balanced, plausible bracket.

import type { WCMatch } from "@/lib/supabase";
import type { Wc2026Group, Wc2026StandingRow } from "@/lib/wc2026.functions";
import r32Schedule from "@/data/wc2026_r32_schedule.json";

type ScheduleRow = {
  slot: number;
  matchNo: number;
  dateISO: string;
  stadium: string;
  city: string;
};
const SCHEDULE = r32Schedule as ScheduleRow[];

function cmpRow(a: Wc2026StandingRow, b: Wc2026StandingRow) {
  if (b.points !== a.points) return b.points - a.points;
  const ad = a.goalsFor - a.goalsAgainst;
  const bd = b.goalsFor - b.goalsAgainst;
  if (bd !== ad) return bd - ad;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

export type R32Seeds = {
  winners: Wc2026StandingRow[];   // up to 12
  runners: Wc2026StandingRow[];   // up to 12
  bestThirds: Wc2026StandingRow[]; // up to 8 (best 8 across all 12 groups)
};

export function pickSeeds(groups: Wc2026Group[]): R32Seeds {
  const winners: Wc2026StandingRow[] = [];
  const runners: Wc2026StandingRow[] = [];
  const thirds: Wc2026StandingRow[] = [];

  const sortedGroups = groups
    .slice()
    .sort((a, b) => a.group.localeCompare(b.group));

  for (const g of sortedGroups) {
    const rows = g.rows.slice().sort(cmpRow);
    if (rows[0]) winners.push(rows[0]);
    if (rows[1]) runners.push(rows[1]);
    if (rows[2]) thirds.push(rows[2]);
  }
  const bestThirds = thirds.slice().sort(cmpRow).slice(0, 8);
  return { winners, runners, bestThirds };
}

function toMatch(
  i: number,
  home: Wc2026StandingRow,
  away: Wc2026StandingRow,
): WCMatch {
  const sched = SCHEDULE[i] ?? null;
  const startMs = sched ? new Date(sched.dateISO).getTime() : NaN;
  const matchNo = sched?.matchNo ?? 1000 + i;
  return {
    id: -9000 - (i + 1),
    tournament_year: 2026,
    round: "Round of 32",
    match_number: matchNo,
    home_team: home.team.name,
    away_team: away.team.name,
    home_score: null,
    away_score: null,
    home_score_pen: null,
    away_score_pen: null,
    match_date: Number.isFinite(startMs) ? new Date(startMs).toISOString() : null,
    stadium: sched?.stadium ?? null,
    city: sched?.city ?? null,
    video_url: null,
    predicted: true,
  };
}

/**
 * Compute 16 predicted R32 fixtures from current group standings.
 * Returns [] when not enough groups have entries to form 32 seeds.
 */
export function computeR32(groups: Wc2026Group[]): WCMatch[] {
  if (groups.length < 12) return [];
  const { winners, runners, bestThirds } = pickSeeds(groups);
  if (winners.length < 12 || runners.length < 12 || bestThirds.length < 8) {
    return [];
  }
  const seeds: Wc2026StandingRow[] = [...winners, ...runners, ...bestThirds];
  if (seeds.length < 32) return [];

  // Snake pairing: #1 vs #32, #2 vs #31, …, #16 vs #17
  const out: WCMatch[] = [];
  for (let i = 0; i < 16; i++) {
    const home = seeds[i];
    const away = seeds[31 - i];
    out.push(toMatch(i, home, away));
  }
  return out;
}
