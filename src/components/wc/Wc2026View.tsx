import { useMemo, useState } from "react";
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
import { MobileGroupDeck } from "./MobileGroupDeck";
import { MobileBracket } from "./MobileBracket";
import { MobileLiveTicker } from "./MobileLiveTicker";
import { WatchLivePanel } from "./WatchLivePanel";
import { flagOf } from "@/lib/flags";
import { fetch2026VideoMap, videoKey } from "@/lib/wc-2026-videos";

import { applyFilter, useMyTeams, type FootballFilter } from "@/lib/football-filters";
import { FootballPitchSkeleton, FootballEmptyBall } from "@/components/football/FootballSkeleton";

const HOUR = 60 * 60 * 1000;
const LIVE_MS = 20 * 1000;

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

// Normalize a team name to a lookup key — strips accents/punctuation so
// "Türkiye" === "turkiye", "USA" === "United States", etc.
function nameKey(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
const NAME_ALIASES: Record<string, string> = {
  usa: "united states",
  us: "united states",
  "korea republic": "south korea",
  korea: "south korea",
  "cote d ivoire": "ivory coast",
  "cote divoire": "ivory coast",
  "cabo verde": "cape verde",
  czechia: "czech republic",
  turkiye: "turkey",
  "congo dr": "dr congo",
  "democratic republic of congo": "dr congo",
};
function aliasKey(s: string): string {
  const k = nameKey(s);
  return NAME_ALIASES[k] ?? k;
}

// team → "Group X" map built from standings
function buildTeamGroup(groups: Wc2026Group[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const g of groups) for (const r of g.rows) m.set(aliasKey(r.team.name), g.group);
  return m;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function toWcMatches(
  fixtures: Wc2026Fixture[],
  videoMap: Map<string, string> | undefined,
  teamGroup: Map<string, string>,
): WCMatch[] {
  return fixtures.map((f, i) => {
    // Fix ESPN's generic "Group Stage"/"Other" → real "Group X" using standings.
    let round = f.group;
    const isKnownGroup = /Group\s+[A-Z0-9]/i.test(round);
    const isKnownKnockout =
      /(round of (32|16)|quarter|semi|final|third|play-?off)/i.test(round);
    if (!isKnownGroup && !isKnownKnockout) {
      const gh = teamGroup.get(aliasKey(f.home.name));
      const ga = teamGroup.get(aliasKey(f.away.name));
      if (gh && gh === ga) round = gh;
    }
    return {
      id: f.id,
      tournament_year: 2026,
      round,
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
      video_url: videoMap?.get(videoKey(f.home.name, f.away.name)) ?? null,
    };
  });
}

// Synthesize group-stage fixtures from curated highlights when ESPN hasn't
// published the event yet — only pairs whose teams sit in the same group.
function synthGroupFixturesFromVideos(
  videoMap: Map<string, string> | undefined,
  teamGroup: Map<string, string>,
  existing: WCMatch[],
): WCMatch[] {
  if (!videoMap || teamGroup.size === 0) return [];
  // Reverse lookup so we can render official display names from standings.
  const aliasToDisplay = new Map<string, string>();
  for (const [aKey, _g] of teamGroup) aliasToDisplay.set(aKey, aKey);
  const seen = new Set(existing.map((m) => videoKey(m.home_team, m.away_team)));
  const out: WCMatch[] = [];
  let i = 0;
  for (const [k, url] of videoMap.entries()) {
    if (seen.has(k)) continue;
    const [a, b] = k.split("|");
    if (!a || !b) continue;
    const ga = teamGroup.get(aliasKey(a));
    const gb = teamGroup.get(aliasKey(b));
    if (!ga || ga !== gb) continue; // skip non-group pairs / unknown teams
    seen.add(k);
    out.push({
      id: -5000 - i,
      tournament_year: 2026,
      round: ga,
      match_number: 100 + i,
      home_team: titleCase(a),
      away_team: titleCase(b),
      home_score: null,
      away_score: null,
      home_score_pen: null,
      away_score_pen: null,
      match_date: null,
      stadium: null,
      city: null,
      video_url: url,
    });
    i++;
  }
  return out;
}

function classifyKnockout(round: string): RoundKey | null {
  const r = round.toLowerCase();
  if (r.includes("third") || r.startsWith("3rd")) return "third_place";
  if (r.includes("semi")) return "semi_final";
  if (r.includes("quarter")) return "quarter_final";
  if (r.includes("round of 16")) return "round_of_16";
  if (r.includes("round of 32") || r.includes("last 32") || r.includes("playoff round") || r.includes("play-off round")) return "round_of_32";
  if (r === "final" || r.endsWith(" final")) return "final";
  return null;
}

const ROUND_LABEL: Record<RoundKey, string> = {
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter_final: "Quarter Finals",
  semi_final: "Semi Finals",
  final: "Final",
  third_place: "Third-Place Play-off",
};

// ============================================================
// GROUP STAGE — reuses GroupStage component (same design as 2018/2022)
// ============================================================
export function Wc2026GroupsView({ filter = "all", team }: { filter?: FootballFilter; team?: string } = {}) {
  const standingsFn = useServerFn(getWc2026Standings);
  const fixturesFn = useServerFn(getWc2026Fixtures);

  const sQ = useQuery({
    queryKey: ["wc2026", "standings"],
    queryFn: () => standingsFn(),
    staleTime: 5 * 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
  const fQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: LIVE_MS,
    refetchInterval: LIVE_MS,
    retry: 1,
  });

  // Hooks BEFORE any conditional returns — fixes the previous
  // "page didn't load" error which was a Rules-of-Hooks violation.
  const wcGroups = useMemo(
    () => toWcGroups(sQ.data?.groups ?? []),
    [sQ.data],
  );
  const vQ = useQuery({
    queryKey: ["wc2026", "video_map"],
    queryFn: () => fetch2026VideoMap(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const teamGroup = useMemo(
    () => buildTeamGroup(sQ.data?.groups ?? []),
    [sQ.data],
  );
  const wcMatchesAll = useMemo(() => {
    const fromEspn = toWcMatches(fQ.data?.fixtures ?? [], vQ.data, teamGroup);
    const synth = synthGroupFixturesFromVideos(vQ.data, teamGroup, fromEspn);
    return [...fromEspn, ...synth];
  }, [fQ.data, vQ.data, teamGroup]);
  const { teams: myTeams } = useMyTeams();
  const wcMatches = useMemo(
    () => applyFilter(wcMatchesAll, filter, team, myTeams),
    [wcMatchesAll, filter, team, myTeams],
  );

  const [activeMatch, setActiveMatch] = useState<WCMatch | null>(null);

  if (sQ.isLoading) return <FootballPitchSkeleton rows={6} />;
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
      <MobileLiveTicker matches={wcMatches} />

      {/* Mobile-only swipeable group deck */}
      <div className="md:hidden">
        <MobileGroupDeck groups={wcGroups} matches={wcMatches} onPick={setActiveMatch} />
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block">
        <GroupStage
          groups={wcGroups}
          matches={wcMatches}
          year={2026}
          onPick={setActiveMatch}
        />
      </div>

      <div className="mt-6">
        <WatchLivePanel />
      </div>

      <MatchModal match={activeMatch} onClose={() => setActiveMatch(null)} />
    </>
  );
}

// ============================================================
// KNOCKOUT + TOP SCORERS — reuses MatchCard (same design)
// ============================================================
export function Wc2026KnockoutView({ filter = "all", team }: { filter?: FootballFilter; team?: string } = {}) {
  const fixturesFn = useServerFn(getWc2026Fixtures);
  const scorersFn = useServerFn(getWc2026TopScorers);
  const standingsFn = useServerFn(getWc2026Standings);

  const sQ = useQuery({
    queryKey: ["wc2026", "standings"],
    queryFn: () => standingsFn(),
    staleTime: 5 * 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  const fQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: LIVE_MS,
    refetchInterval: LIVE_MS,
    retry: 1,
  });
  const tQ = useQuery({
    queryKey: ["wc2026", "scorers"],
    queryFn: () => scorersFn(),
    staleTime: 5 * 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });

  // All hooks before returns.
  const vQ = useQuery({
    queryKey: ["wc2026", "video_map"],
    queryFn: () => fetch2026VideoMap(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
  const teamGroup = useMemo(
    () => buildTeamGroup(sQ.data?.groups ?? []),
    [sQ.data],
  );
  const wcMatchesRaw = useMemo(
    () => toWcMatches(fQ.data?.fixtures ?? [], vQ.data, teamGroup),
    [fQ.data, vQ.data, teamGroup],
  );
  const { teams: myTeams } = useMyTeams();
  const wcMatches = useMemo(
    () => applyFilter(wcMatchesRaw, filter, team, myTeams),
    [wcMatchesRaw, filter, team, myTeams],
  );
  const groupedKnockout = useMemo(() => {
    const order: RoundKey[] = ["round_of_32", "round_of_16", "quarter_final", "semi_final", "third_place", "final"];
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

  if (fQ.isLoading) return <FootballPitchSkeleton rows={6} />;
  if (fQ.data?.error && wcMatches.length === 0) return <ErrBox msg={fQ.data.error} />;

  return (
    <div className="space-y-10">
      <MobileLiveTicker matches={wcMatches} />

      {groupedKnockout.length === 0 ? (
        <EmptyBox
          title="Knockout bracket not yet available"
          body="The bracket will populate after the group stage ends."
        />
      ) : (
        <>
          {/* Mobile vertical bracket with stage chips */}
          <MobileBracket
            rounds={groupedKnockout.map(([round, matches]) => ({ round, matches }))}
            onPick={setActiveMatch}
          />

          {/* Desktop grid */}
          <div className="hidden md:block space-y-10">
            {groupedKnockout.map(([round, list]) => (
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
            ))}
          </div>
        </>
      )}

      <WatchLivePanel />


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
