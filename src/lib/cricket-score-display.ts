// Shared score-rendering rules so cards, hero and mini-cards agree.
// Never invents "/0" — respects parsed summary + linescore.
import type { CricketMatch, CricketTeam } from "@/lib/cricket.functions";

export type ScoreDisplay =
  | { kind: "yet-to-bat" }
  | { kind: "did-not-bat" }
  | { kind: "innings"; runs: number; wickets: number; overs: number | null; allOut: boolean; declared: boolean; multi?: string }
  | { kind: "no-score" };

function pickLatest(t: CricketTeam) {
  // Prefer merged linescore (already reconciled with parsed summary in mapTeam),
  // fall back to parsed summary innings.
  if (t.innings.length > 0) {
    const last = t.innings[t.innings.length - 1];
    return {
      runs: last.runs,
      wickets: last.wickets,
      overs: last.overs || null,
      allOut: last.wickets >= 10 || /all out/i.test(last.description),
      declared: /declared/i.test(last.description),
      count: t.innings.length,
    };
  }
  if (t.parsedScore.innings.length > 0) {
    const last = t.parsedScore.innings[t.parsedScore.innings.length - 1];
    return { runs: last.runs, wickets: last.wickets, overs: last.overs, allOut: last.allOut, declared: last.declared, count: t.parsedScore.innings.length };
  }
  return null;
}

export function displayScore(match: CricketMatch, side: "home" | "away"): ScoreDisplay {
  const t = match[side];
  const other = match[side === "home" ? "away" : "home"];

  // DNB / yet to bat
  if (t.parsedScore.didNotBat && t.innings.length === 0) {
    // If the match is completed and opponent has batted, this side didn't bat this innings.
    if (match.status === "post" && (other.innings.length > 0 || other.parsedScore.innings.length > 0)) {
      return { kind: "did-not-bat" };
    }
    if (match.status === "in" && (other.innings.length > 0 || other.parsedScore.innings.length > 0)) {
      return { kind: "yet-to-bat" };
    }
    return { kind: "no-score" };
  }

  const latest = pickLatest(t);
  if (!latest) return { kind: "no-score" };

  const multi = t.parsedScore.innings.length > 1
    ? t.parsedScore.innings
        .map((i) => `${i.runs}${i.allOut ? "" : `/${i.wickets}`}${i.declared ? "d" : ""}`)
        .join(" & ")
    : undefined;

  return {
    kind: "innings",
    runs: latest.runs,
    wickets: latest.wickets,
    overs: latest.overs,
    allOut: latest.allOut,
    declared: latest.declared,
    multi,
  };
}

/** Compact one-liner for cards / sticky bar: "172 & 210/4d (48.3)" or "45/0 (5.2)". */
export function scoreLine(d: ScoreDisplay): string {
  if (d.kind === "did-not-bat") return "Did not bat";
  if (d.kind === "yet-to-bat") return "Yet to bat";
  if (d.kind === "no-score") return "—";
  if (d.multi) return d.overs ? `${d.multi} (${d.overs} ov)` : d.multi;
  const w = d.allOut ? "" : `/${d.wickets}`;
  const dec = d.declared ? "d" : "";
  return d.overs ? `${d.runs}${w}${dec} (${d.overs} ov)` : `${d.runs}${w}${dec}`;
}
