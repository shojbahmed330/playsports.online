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

function teamLabel(seed: Wc2026StandingRow | null, slotHint: string): {
  id: number; name: string; code: string;
} {
  if (seed) {
    return { id: seed.team.id, name: seed.team.name, code: seed.team.code };
  }
  return { id: 0, name: slotHint, code: "TBD" };
}

function toMatch(
  i: number,
  home: Wc2026StandingRow | null,
  away: Wc2026StandingRow | null,
  homeHint: string,
  awayHint: string,
): WCMatch {
  const sched = SCHEDULE[i] ?? null;
  const startMs = sched ? new Date(sched.dateISO).getTime() : NaN;
  const matchNo = sched?.matchNo ?? 1000 + i;
  const h = teamLabel(home, homeHint);
  const a = teamLabel(away, awayHint);
  return {
    id: -9000 - (i + 1),
    tournament_year: 2026,
    round: "Round of 32",
    match_number: matchNo,
    home_team: h.name,
    away_team: a.name,
    home_score: null,
    away_score: null,
    home_score_pen: null,
    away_score_pen: null,
    match_date: Number.isFinite(startMs) ? new Date(startMs).toISOString() : null,
    stadium: sched?.stadium ?? null,
    city: sched?.city ?? null,
    video_url: null,
    predicted: true,
    home_seed_label: homeHint,
    away_seed_label: awayHint,
  };
}

/**
 * Compute 16 predicted R32 fixtures. Always returns 16 rows — slots without
 * resolved seeds render with TBD placeholders so users see the schedule even
 * before the group stage settles.
 */
export function computeR32(groups: Wc2026Group[]): WCMatch[] {
  const { winners, runners, bestThirds } = pickSeeds(groups);
  // Build 32-slot seed list; pad with nulls when standings are partial.
  const seeds: (Wc2026StandingRow | null)[] = Array.from({ length: 32 }, () => null);
  for (let i = 0; i < 12; i++) seeds[i] = winners[i] ?? null;        // 0..11  winners
  for (let i = 0; i < 12; i++) seeds[12 + i] = runners[i] ?? null;   // 12..23 runners-up
  for (let i = 0; i < 8; i++) seeds[24 + i] = bestThirds[i] ?? null; // 24..31 best 3rds

  const hintFor = (idx: number): string => {
    if (idx < 12) return `Winner Group ${String.fromCharCode(65 + idx)}`;
    if (idx < 24) return `Runner-up Group ${String.fromCharCode(65 + (idx - 12))}`;
    return `Best 3rd #${idx - 23}`;
  };

  // Snake pairing: #1 vs #32, #2 vs #31, …, #16 vs #17
  const out: WCMatch[] = [];
  for (let i = 0; i < 16; i++) {
    out.push(toMatch(i, seeds[i], seeds[31 - i], hintFor(i), hintFor(31 - i)));
  }
  return out;
}
