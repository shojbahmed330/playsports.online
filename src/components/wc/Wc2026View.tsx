import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trophy } from "lucide-react";
import {
  getWc2026Fixtures,
  getWc2026Standings,
  getWc2026TopScorers,
  type Wc2026Fixture,
  type Wc2026Group,
} from "@/lib/wc2026.functions";
import type { WCGroup, WCMatch } from "@/lib/supabase";
import { GroupStage } from "./GroupStage";
import { MatchCard, type RoundKey } from "./MatchCard";
import { MatchModal } from "./MatchModal";
import { flagOf } from "@/lib/flags";
import { useState } from "react";

const HOUR = 60 * 60 * 1000;

// ──────────────────────────────────────────────────────────────
// Adapters: SofaScore shape → app's WCGroup / WCMatch shapes so
// the 2026 view renders with the exact same components & styling
// used by 2018, 2022, etc.
// ──────────────────────────────────────────────────────────────
function toWcGroups(groups: Wc2026Group[]): WCGroup[] {
  const out: WCGroup[] = [];
  for (const g of groups) {
    for (const r of g.rows) {
      out.push({
        tournament_year: 2026,
        group_name: g.group, // e.g. "Group A"
        team: r.team.name,
        position: r.rank,
        played: r.played,
        won: r.win,
        drawn: r.draw,
        lost: r.lose,
        goals_for: r.goalsFor,
        goals_against: r.goalsAgainst,
        points: r.points,
        qualified: r.rank <= 2, // top 2 advance from each 4-team group
      });
    }
  }
  return out;
}

function toWcMatches(fixtures: Wc2026Fixture[]): WCMatch[] {
  return fixtures.map((f, i) => ({
    id: f.id,
    tournament_year: 2026,
    round: f.group, // "Group A" / "Round of 16" / "Final" etc.
    match_number: i + 1,
    home_team: f.home.name,
    away_team: f.away.name,
    home_score: f.home.goals,
    away_score: f.away.goals,
    home_score_pen: null,
    away_score_pen: null,
    match_date: f.startTs ? new Date(f.startTs * 1000).toISOString() : null,
    stadium: f.venue,
    city: f.city,
    video_url: null,
  }));
}

function classifyKnockout(round: string): RoundKey | null {
  const r = round.toLowerCase();
  if (r.includes("third") || r.startsWith("3rd")) return "third_place";
  if (r.includes("semi")) return "semi_final";
  if (r.includes("quarter")) return "quarter_final";
  if (r.includes("round of 16") || r === "round of 16") return "round_of_16";
  if (r === "final" || r.endsWith(" final")) return "final";
  return null;
}

const ROUND_LABEL: Record<RoundKey, string> = {
  round_of_16: "Round of 16",
  quarter_final: "Quarter Finals",
  semi_final: "Semi Finals",
  final: "Final",
  third_place: "Third-Place Play-off",
};

// ============================================================
// GROUP STAGE — reuses GroupStage component (same design as 2018/2022)
// ============================================================
export function Wc2026GroupsView() {
  const standingsFn = useServerFn(getWc2026Standings);
  const fixturesFn = useServerFn(getWc2026Fixtures);

  const sQ = useQuery({
    queryKey: ["wc2026", "standings"],
    queryFn: () => standingsFn(),
    staleTime: HOUR,
    retry: 1,
  });
  const fQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: HOUR,
    retry: 1,
  });

  // Hooks BEFORE any conditional returns — fixes the previous
  // "page didn't load" error which was a Rules-of-Hooks violation.
  const wcGroups = useMemo(
    () => toWcGroups(sQ.data?.groups ?? []),
    [sQ.data],
  );
  const wcMatches = useMemo(
    () => toWcMatches(fQ.data?.fixtures ?? []),
    [fQ.data],
  );

  const [activeMatch, setActiveMatch] = useState<WCMatch | null>(null);

  if (sQ.isLoading) return <Spinner />;
  const apiErr = sQ.data?.error || fQ.data?.error;
  if (apiErr && wcGroups.length === 0) return <ErrBox msg={apiErr} />;
  if (wcGroups.length === 0) {
    return (
      <EmptyBox
        title="Groups not drawn yet"
        body="Group standings will appear here once the draw is published."
      />
    );
  }

  return (
    <>
      <GroupStage
        groups={wcGroups}
        matches={wcMatches}
        year={2026}
        onPick={setActiveMatch}
      />
      <MatchModal match={activeMatch} onClose={() => setActiveMatch(null)} />
    </>
  );
}

// ============================================================
// KNOCKOUT + TOP SCORERS — reuses MatchCard (same design)
// ============================================================
export function Wc2026KnockoutView() {
  const fixturesFn = useServerFn(getWc2026Fixtures);
  const scorersFn = useServerFn(getWc2026TopScorers);

  const fQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: HOUR,
    retry: 1,
  });
  const tQ = useQuery({
    queryKey: ["wc2026", "scorers"],
    queryFn: () => scorersFn(),
    staleTime: HOUR,
    retry: 1,
  });

  // All hooks before returns.
  const wcMatches = useMemo(
    () => toWcMatches(fQ.data?.fixtures ?? []),
    [fQ.data],
  );
  const groupedKnockout = useMemo(() => {
    const order: RoundKey[] = ["round_of_16", "quarter_final", "semi_final", "third_place", "final"];
    const m: Partial<Record<RoundKey, WCMatch[]>> = {};
    for (const match of wcMatches) {
      const k = classifyKnockout(match.round);
      if (!k) continue;
      (m[k] ||= []).push(match);
    }
    return order
      .filter((r) => (m[r]?.length ?? 0) > 0)
      .map((r) => [r, m[r]!] as const);
  }, [wcMatches]);

  const [activeMatch, setActiveMatch] = useState<WCMatch | null>(null);

  if (fQ.isLoading) return <Spinner />;
  if (fQ.data?.error && wcMatches.length === 0) return <ErrBox msg={fQ.data.error} />;

  return (
    <div className="space-y-10">
      {groupedKnockout.length === 0 ? (
        <EmptyBox
          title="Knockout bracket not yet available"
          body="The bracket will populate after the group stage ends."
        />
      ) : (
        groupedKnockout.map(([round, list]) => (
          <section key={round} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="block w-1.5 h-6 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400">
                {ROUND_LABEL[round]}
              </h3>
              <span className="text-[10px] text-gray-500">{list.length} match{list.length === 1 ? "" : "es"}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {list.map((m, i) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  round={round}
                  index={i}
                  isFinal={round === "final"}
                  onClick={() => setActiveMatch(m)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Top Scorers */}
      <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-amber-400 mb-4 flex items-center gap-2">
          <Trophy className="size-4" /> Top Scorers
        </h3>
        {tQ.isLoading ? (
          <div className="text-xs text-gray-500 py-2">Loading…</div>
        ) : (tQ.data?.scorers?.length ?? 0) === 0 ? (
          <div className="text-xs text-gray-500 py-2">
            {tQ.data?.error ?? "No goals scored yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {tQ.data!.scorers.map((s) => (
              <div
                key={s.playerId}
                className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-800/40"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-500 w-7 tabular-nums">#{s.rank}</span>
                  <span className="text-base leading-none">{flagOf(s.team.name)}</span>
                  <span className="truncate font-medium text-white">{s.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase">{s.team.code}</span>
                </div>
                <span className="text-amber-400 font-bold tabular-nums">
                  {s.goals}
                  <span className="text-[10px] text-gray-500 ml-1">G</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <MatchModal match={activeMatch} onClose={() => setActiveMatch(null)} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
function ErrBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
      ⚠️ {msg}
    </div>
  );
}
function EmptyBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
      <Trophy className="size-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
