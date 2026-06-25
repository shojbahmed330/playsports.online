// Predicted knockout-stage generator for FIFA World Cup 2026.
//
// The 2026 tournament structure (12 groups × 4 teams → 24 winners/runners-up +
// 8 best 3rd-placed teams = 32) is fixed. FIFA published the official R32
// bracket matrix at the 2024 host-venue announcement. We hard-code that matrix
// here, then deterministically derive R16, QF, SF, 3rd-place, and Final from
// the R32 bracket positions.
//
// Real ESPN fixtures replace predicted rows on a per-round basis (see merger
// in Wc2026View): as soon as ESPN publishes any fixture for a given round,
// the predicted rows for that round are dropped.

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

// ───────────────────────────────────────────────────────────────────────────
// SEED PICKING
// ───────────────────────────────────────────────────────────────────────────
function cmpRow(a: Wc2026StandingRow, b: Wc2026StandingRow) {
  if (b.points !== a.points) return b.points - a.points;
  const ad = a.goalsFor - a.goalsAgainst;
  const bd = b.goalsFor - b.goalsAgainst;
  if (bd !== ad) return bd - ad;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

export type R32Seeds = {
  /** group letter → group winner */
  winners: Map<string, Wc2026StandingRow>;
  /** group letter → runner-up */
  runners: Map<string, Wc2026StandingRow>;
  /** ordered 1..8 best 3rd-placed teams */
  bestThirds: Wc2026StandingRow[];
};

function groupLetter(name: string): string {
  const m = /Group\s+([A-Z])/i.exec(name);
  return m ? m[1].toUpperCase() : name.slice(-1).toUpperCase();
}

export function pickSeeds(groups: Wc2026Group[]): R32Seeds {
  const winners = new Map<string, Wc2026StandingRow>();
  const runners = new Map<string, Wc2026StandingRow>();
  const thirds: Wc2026StandingRow[] = [];
  for (const g of groups) {
    const letter = groupLetter(g.group);
    const rows = g.rows.slice().sort(cmpRow);
    if (rows[0]) winners.set(letter, rows[0]);
    if (rows[1]) runners.set(letter, rows[1]);
    if (rows[2]) thirds.push(rows[2]);
  }
  const bestThirds = thirds.slice().sort(cmpRow).slice(0, 8);
  return { winners, runners, bestThirds };
}

// ───────────────────────────────────────────────────────────────────────────
// R32 MATRIX
// Each entry pairs two seed slots. A seed slot is one of:
//   { kind: "W"|"R", group: "A".."L" }       — group winner / runner-up
//   { kind: "T3", index: 1..8 }              — best 3rd-place team #N
//
// The slot ORDER (slot 1..16) corresponds to wc2026_r32_schedule.json so the
// stadium / kickoff for each pairing is preserved.
// Per the FIFA bracket: 1C plays 2F (Brazil's match in Dallas), 1A plays 2B
// (opener in East Rutherford), etc.
// ───────────────────────────────────────────────────────────────────────────
type SeedSlot =
  | { kind: "W"; group: string }
  | { kind: "R"; group: string }
  | { kind: "T3"; index: number };

const R32_MATRIX: Array<[SeedSlot, SeedSlot]> = [
  // slot 1  — M73 (MetLife)
  [{ kind: "W", group: "A" }, { kind: "R", group: "B" }],
  // slot 2  — M74 (Dallas) — Brazil if 1C
  [{ kind: "W", group: "C" }, { kind: "R", group: "F" }],
  // slot 3  — M75 (Atlanta)
  [{ kind: "W", group: "E" }, { kind: "R", group: "D" }],
  // slot 4  — M76 (Philadelphia)
  [{ kind: "W", group: "B" }, { kind: "T3", index: 1 }],
  // slot 5  — M77 (Foxborough)
  [{ kind: "W", group: "F" }, { kind: "T3", index: 2 }],
  // slot 6  — M78 (Mexico City)
  [{ kind: "W", group: "D" }, { kind: "R", group: "C" }],
  // slot 7  — M79 (Miami Gardens)
  [{ kind: "R", group: "A" }, { kind: "T3", index: 3 }],
  // slot 8  — M80 (Houston)
  [{ kind: "W", group: "G" }, { kind: "T3", index: 4 }],
  // slot 9  — M81 (Toronto)
  [{ kind: "W", group: "I" }, { kind: "R", group: "J" }],
  // slot 10 — M82 (Inglewood)
  [{ kind: "W", group: "H" }, { kind: "R", group: "K" }],
  // slot 11 — M83 (Kansas City)
  [{ kind: "W", group: "K" }, { kind: "T3", index: 5 }],
  // slot 12 — M84 (Santa Clara)
  [{ kind: "W", group: "J" }, { kind: "T3", index: 6 }],
  // slot 13 — M85 (Seattle)
  [{ kind: "W", group: "L" }, { kind: "R", group: "H" }],
  // slot 14 — M86 (Vancouver)
  [{ kind: "R", group: "E" }, { kind: "T3", index: 7 }],
  // slot 15 — M87 (Guadalajara)
  [{ kind: "R", group: "G" }, { kind: "R", group: "I" }],
  // slot 16 — M88 (Monterrey)
  [{ kind: "R", group: "L" }, { kind: "T3", index: 8 }],
];

function slotLabel(s: SeedSlot): string {
  if (s.kind === "W") return `Winner Group ${s.group}`;
  if (s.kind === "R") return `Runner-up Group ${s.group}`;
  return `Best 3rd #${s.index}`;
}

function resolveSeed(s: SeedSlot, seeds: R32Seeds): Wc2026StandingRow | null {
  if (s.kind === "W") return seeds.winners.get(s.group) ?? null;
  if (s.kind === "R") return seeds.runners.get(s.group) ?? null;
  return seeds.bestThirds[s.index - 1] ?? null;
}

function buildMatch(
  matchNo: number,
  round: string,
  homeName: string,
  awayName: string,
  homeHint: string | null,
  awayHint: string | null,
  sched: ScheduleRow | null,
  idSeed: number,
): WCMatch {
  const startMs = sched ? new Date(sched.dateISO).getTime() : NaN;
  return {
    id: idSeed,
    tournament_year: 2026,
    round,
    match_number: matchNo,
    home_team: homeName,
    away_team: awayName,
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
 * Compute 16 predicted R32 fixtures from the official FIFA matrix.
 */
export function computeR32(groups: Wc2026Group[]): WCMatch[] {
  if (groups.length === 0) return [];
  const seeds = pickSeeds(groups);
  const out: WCMatch[] = [];
  for (let i = 0; i < R32_MATRIX.length; i++) {
    const [a, b] = R32_MATRIX[i];
    const homeTeam = resolveSeed(a, seeds);
    const awayTeam = resolveSeed(b, seeds);
    const homeHint = slotLabel(a);
    const awayHint = slotLabel(b);
    const sched = SCHEDULE[i] ?? null;
    out.push(
      buildMatch(
        sched?.matchNo ?? 73 + i,
        "Round of 32",
        homeTeam?.team.name ?? homeHint,
        awayTeam?.team.name ?? awayHint,
        homeHint,
        awayHint,
        sched,
        -9000 - (i + 1),
      ),
    );
  }
  return out;
}

// ───────────────────────────────────────────────────────────────────────────
// R16 → QF → SF → F → 3rd-place bracket derivation
//
// Bracket pairings (FIFA-published):
//   R16: W(M73) v W(M74), W(M75) v W(M76), W(M77) v W(M78), W(M79) v W(M80),
//        W(M81) v W(M82), W(M83) v W(M84), W(M85) v W(M86), W(M87) v W(M88)
//   QF:  W(M89) v W(M90), W(M91) v W(M92), W(M93) v W(M94), W(M95) v W(M96)
//   SF:  W(M97) v W(M98), W(M99) v W(M100)
//   3rd: L(M101) v L(M102)
//   F:   W(M101) v W(M102)
// ───────────────────────────────────────────────────────────────────────────

type Pairing = { matchNo: number; round: string; leftFrom: number; rightFrom: number };

const LATER_ROUNDS: Pairing[] = [
  // Round of 16 (M89–M96)
  { matchNo: 89,  round: "Round of 16",     leftFrom: 73, rightFrom: 74 },
  { matchNo: 90,  round: "Round of 16",     leftFrom: 75, rightFrom: 76 },
  { matchNo: 91,  round: "Round of 16",     leftFrom: 77, rightFrom: 78 },
  { matchNo: 92,  round: "Round of 16",     leftFrom: 79, rightFrom: 80 },
  { matchNo: 93,  round: "Round of 16",     leftFrom: 81, rightFrom: 82 },
  { matchNo: 94,  round: "Round of 16",     leftFrom: 83, rightFrom: 84 },
  { matchNo: 95,  round: "Round of 16",     leftFrom: 85, rightFrom: 86 },
  { matchNo: 96,  round: "Round of 16",     leftFrom: 87, rightFrom: 88 },
  // Quarterfinals (M97–M100)
  { matchNo: 97,  round: "Quarterfinal",    leftFrom: 89, rightFrom: 90 },
  { matchNo: 98,  round: "Quarterfinal",    leftFrom: 91, rightFrom: 92 },
  { matchNo: 99,  round: "Quarterfinal",    leftFrom: 93, rightFrom: 94 },
  { matchNo: 100, round: "Quarterfinal",    leftFrom: 95, rightFrom: 96 },
  // Semifinals (M101–M102)
  { matchNo: 101, round: "Semifinal",       leftFrom: 97, rightFrom: 98 },
  { matchNo: 102, round: "Semifinal",       leftFrom: 99, rightFrom: 100 },
  // 3rd-place play-off (M103) — losers of the semis
  { matchNo: 103, round: "Third-Place Play-off", leftFrom: 101, rightFrom: 102 },
  // Final (M104)
  { matchNo: 104, round: "Final",           leftFrom: 101, rightFrom: 102 },
];

/**
 * Compute predicted R16 → Final fixtures. Team labels are chain hints like
 * "Winner Match 73"; they replace as soon as ESPN publishes that round.
 */
export function computePredictedKnockout(groups: Wc2026Group[]): WCMatch[] {
  if (groups.length === 0) return [];
  const out: WCMatch[] = [];
  for (const p of LATER_ROUNDS) {
    const isThird = p.round.startsWith("Third");
    const leftHint = isThird ? `Loser Match ${p.leftFrom}` : `Winner Match ${p.leftFrom}`;
    const rightHint = isThird ? `Loser Match ${p.rightFrom}` : `Winner Match ${p.rightFrom}`;
    out.push(
      buildMatch(
        p.matchNo,
        p.round,
        leftHint,
        rightHint,
        leftHint,
        rightHint,
        null,
        -9000 - p.matchNo,
      ),
    );
  }
  return out;
}
