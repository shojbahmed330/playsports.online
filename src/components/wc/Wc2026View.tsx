import { useCallback, useMemo, useState } from "react";
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
import { DateScrubber, filterByDateKey } from "./DateScrubber";
import { flagOf } from "@/lib/flags";
import { fetch2026VideoMap, videoKey } from "@/lib/wc-2026-videos";
import { computeR32, computePredictedKnockout, inferWc2026KnockoutMatchNo } from "@/lib/wc2026-r32-format";


import { applyFilter, useMyTeams, type FootballFilter } from "@/lib/football-filters";
import { FootballPitchSkeleton, FootballEmptyBall } from "@/components/football/FootballSkeleton";

const HOUR = 60 * 60 * 1000;
const LIVE_MS = 20 * 1000;

// Shared click handler: group/knockout cards should open the in-page modal.
// The dedicated match centre is still available from inside the modal, but the
// first tap/click now always gives users the highlight/details popup they expect.
function useWcPick(setModal: (m: WCMatch | null) => void) {
  return useCallback((m: WCMatch) => {
    setModal(m);
  }, [setModal]);
}


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
        id: 0, // synthetic — 2026 rows aren't persisted; UI-only.
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

// alias-key → canonical display name (from standings), so fixtures and
// curated videos all render the same team label (e.g. always "South Korea",
// never a mix of "Korea Republic" / "South Korea" / "korea").
function buildCanonicalName(groups: Wc2026Group[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const g of groups) for (const r of g.rows) m.set(aliasKey(r.team.name), r.team.name);
  return m;
}

// Sorted alias-pair key — used to dedupe ESPN fixtures vs curated videos
// regardless of which spelling each side uses.
function aliasPairKey(a: string, b: string): string {
  return [aliasKey(a), aliasKey(b)].sort().join("|");
}

function isSeedPlaceholder(name: string): boolean {
  return /(\bTBD\b|Group\s+[A-L].*(Winner|2nd|Runner|Place)|Third\s+Place|Winner\s+Group|Runner-up\s+Group|Round\s+of\s+\d+|Quarterfinal|Semifinal|Final\s+Winner|Final\s+Loser|\b[123][A-L]\b)/i.test(name);
}

function isPlaceholderMatch(match: WCMatch): boolean {
  return isSeedPlaceholder(match.home_team) || isSeedPlaceholder(match.away_team);
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function toWcMatches(
  fixtures: Wc2026Fixture[],
  videoMap: Map<string, string> | undefined,
  teamGroup: Map<string, string>,
  canonName: Map<string, string>,
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
    const home = canonName.get(aliasKey(f.home.name)) ?? f.home.name;
    const away = canonName.get(aliasKey(f.away.name)) ?? f.away.name;
    const matchDate = f.startTs ? new Date(f.startTs * 1000).toISOString() : null;
    const officialKnockoutNo = inferWc2026KnockoutMatchNo(matchDate);
    return {
      id: f.id,
      tournament_year: 2026,
      round,
      match_number: officialKnockoutNo ?? i + 1,
      home_team: home,
      away_team: away,
      home_score: f.home.goals,
      away_score: f.away.goals,
      home_score_pen: null,
      away_score_pen: null,
      match_date: matchDate,
      stadium: f.venue,
      city: f.city,
      video_url: videoMap?.get(videoKey(f.home.name, f.away.name)) ?? null,
      status: f.status,
      statusDesc: f.statusDesc,
      minute: f.minute,
    };
  });
}

// Synthesize group-stage fixtures from curated highlights when ESPN hasn't
// published the event yet — only pairs whose teams sit in the same group.
function synthGroupFixturesFromVideos(
  videoMap: Map<string, string> | undefined,
  teamGroup: Map<string, string>,
  canonName: Map<string, string>,
  existing: WCMatch[],
): WCMatch[] {
  if (!videoMap || teamGroup.size === 0) return [];
  // Dedupe by sorted alias-pair so "Korea Republic vs Mexico" matches
  // "south korea|mexico" and we don't duplicate.
  const seen = new Set(existing.map((m) => aliasPairKey(m.home_team, m.away_team)));
  const out: WCMatch[] = [];
  let i = 0;
  for (const [k, url] of videoMap.entries()) {
    const [a, b] = k.split("|");
    if (!a || !b) continue;
    const pairKey = aliasPairKey(a, b);
    if (seen.has(pairKey)) continue;
    const ga = teamGroup.get(aliasKey(a));
    const gb = teamGroup.get(aliasKey(b));
    if (!ga || ga !== gb) continue; // skip non-group pairs / unknown teams
    seen.add(pairKey);
    const home = canonName.get(aliasKey(a)) ?? titleCase(a);
    const away = canonName.get(aliasKey(b)) ?? titleCase(b);
    out.push({
      id: -5000 - i,
      tournament_year: 2026,
      round: ga,
      match_number: 100 + i,
      home_team: home,
      away_team: away,
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
export function Wc2026GroupsView({ filter = "all", team, date, onDateChange }: { filter?: FootballFilter; team?: string; date?: string; onDateChange?: (d: string | undefined) => void } = {}) {
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
  const canonName = useMemo(
    () => buildCanonicalName(sQ.data?.groups ?? []),
    [sQ.data],
  );
  const wcMatchesAll = useMemo(() => {
    const fromEspn = toWcMatches(fQ.data?.fixtures ?? [], vQ.data, teamGroup, canonName);
    const synth = synthGroupFixturesFromVideos(vQ.data, teamGroup, canonName, fromEspn);
    return [...fromEspn, ...synth];
  }, [fQ.data, vQ.data, teamGroup, canonName]);
  const { teams: myTeams } = useMyTeams();
  // Filtered by team/my-teams/etc — used for groups when no date is picked
  // so users still see every fixture by default.
  const wcMatchesAllFiltered = useMemo(
    () => applyFilter(wcMatchesAll, filter, team, myTeams),
    [wcMatchesAll, filter, team, myTeams],
  );
  // When a date is selected (e.g. "Today"), narrow the fixtures shown
  // inside each group card AND the live ticker to that date.
  const wcMatchesForDate = useMemo(
    () => filterByDateKey(wcMatchesAllFiltered, date),
    [wcMatchesAllFiltered, date],
  );
  // Group cards always show every fixture; the date-filtered subset renders
  // in a dedicated "Matches on this date" panel above.
  const wcMatches = wcMatchesAllFiltered;


  const [activeMatch, setActiveMatch] = useState<WCMatch | null>(null);
  const handlePick = useWcPick(setActiveMatch);

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


      {onDateChange && (
        <DateScrubber matches={wcMatchesAll} value={date} onChange={onDateChange} className="mb-4" />
      )}

      {date && wcMatchesForDate.length === 0 && (
        <div className="mb-4 rounded-xl border border-sky-500/30 bg-sky-500/5 px-4 py-3 text-xs text-sky-200">
          No matches scheduled on this date. All group fixtures still shown below — tap “Clear date” on the scrubber to dismiss.
        </div>
      )}

      {date && wcMatchesForDate.length > 0 && (
        <section className="mb-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="block w-1.5 h-5 rounded-full bg-sky-400" />
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
              Matches on this date
            </h3>
            <span className="text-[10px] text-sky-200/70">{wcMatchesForDate.length} fixture{wcMatchesForDate.length === 1 ? "" : "s"}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {wcMatchesForDate.map((m, i) => (
              <MatchCard key={`d-${m.id}`} match={m} round="round_of_16" index={i} onClick={() => handlePick(m)} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile-only swipeable group deck */}
      <div className="md:hidden">
        <MobileGroupDeck groups={wcGroups} matches={wcMatches} onPick={handlePick} />
      </div>



      {/* Desktop layout */}
      <div className="hidden md:block">
        <GroupStage
          groups={wcGroups}
          matches={wcMatches}
          year={2026}
          onPick={handlePick}
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
export function Wc2026KnockoutView({ filter = "all", team, date, onDateChange }: { filter?: FootballFilter; team?: string; date?: string; onDateChange?: (d: string | undefined) => void } = {}) {
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
  const canonName = useMemo(
    () => buildCanonicalName(sQ.data?.groups ?? []),
    [sQ.data],
  );
  const wcMatchesRaw = useMemo(
    () => toWcMatches(fQ.data?.fixtures ?? [], vQ.data, teamGroup, canonName),
    [fQ.data, vQ.data, teamGroup, canonName],
  );

  // Predicted bracket — synthesize R32 + R16 + QF + SF + 3rd + Final from
  // standings whenever ESPN hasn't published that round yet. Dedup strategy:
  // R32 → by sorted team-pair key (real ESPN R32 drops the matching predicted).
  // R16/QF/SF/3rd/F → per-round wipeout: as soon as ESPN posts any fixture
  // for that round, ALL predicted rows of that round are dropped.
  const wcMatchesWithR32 = useMemo(() => {
    const groups = sQ.data?.groups ?? [];
    if (groups.length === 0) return wcMatchesRaw;

    // R32 — merge ESPN's official dated fixture with our corrected FIFA seed
    // matrix. If ESPN still says "Group H 2nd Place", the UI shows the current
    // standings projection from the correct group (never a team from another
    // group), while keeping ESPN's event id/date/venue for auto-replacement.
    const attachVideo = (m: WCMatch): WCMatch => ({
      ...m,
      video_url: m.video_url ?? vQ.data?.get(videoKey(m.home_team, m.away_team)) ?? null,
    });
    const predictedR32 = computeR32(groups).map(attachVideo);
    const predictedR32ByNo = new Map(predictedR32.map((m) => [m.match_number ?? 0, m]));
    const rawMerged = wcMatchesRaw.flatMap((m) => {
      const k = classifyKnockout(m.round);
      if (k === "round_of_32") {
        const projected = predictedR32ByNo.get(m.match_number ?? 0);
        if (projected && isPlaceholderMatch(m)) {
          return [{
            ...m,
            home_team: projected.home_team,
            away_team: projected.away_team,
            video_url: projected.video_url ?? vQ.data?.get(videoKey(projected.home_team, projected.away_team)) ?? m.video_url,
            predicted: true,
            home_seed_label: projected.home_seed_label,
            away_seed_label: projected.away_seed_label,
          }];
        }
      }
      // Later-round ESPN placeholders are written as "Round of 32 1 Winner";
      // hide those and show our clearer deterministic "Winner Match 73" chain
      // until ESPN publishes real teams.
      if (k && k !== "round_of_32" && isPlaceholderMatch(m)) return [];
      return [m];
    });
    const existingR32MatchNos = new Set(
      rawMerged
        .filter((m) => classifyKnockout(m.round) === "round_of_32")
        .map((m) => m.match_number),
    );
    const synthR32 = predictedR32.filter((p) => !existingR32MatchNos.has(p.match_number));

    // R16 → Final — per-round wipeout (predicted team names are placeholders
    // like "Winner Match 73", so pair-key dedup wouldn't work).
    const predictedLater = computePredictedKnockout(groups);
    const espnHasRound = (key: RoundKey) =>
      rawMerged.some((m) => classifyKnockout(m.round) === key && !m.predicted && !isPlaceholderMatch(m));
    const synthLater = predictedLater.filter((p) => {
      const k = classifyKnockout(p.round);
      return k ? !espnHasRound(k) : true;
    });

    return [...rawMerged.map(attachVideo), ...synthR32.map(attachVideo), ...synthLater];
  }, [wcMatchesRaw, sQ.data, vQ.data]);

  const { teams: myTeams } = useMyTeams();
  // Knockout bracket is structural — never filter it by date. Date filter only
  // narrows the live ticker / per-day list, otherwise selecting "today" would
  // hide R32 fixtures scheduled later in the week and surface the EmptyBox.
  const wcMatchesBracket = useMemo(
    () => applyFilter(wcMatchesWithR32, filter, team, myTeams),
    [wcMatchesWithR32, filter, team, myTeams],
  );
  const wcMatches = useMemo(
    () => filterByDateKey(wcMatchesBracket, date),
    [wcMatchesBracket, date],
  );

  const groupedKnockout = useMemo(() => {
    const order: RoundKey[] = ["round_of_32", "round_of_16", "quarter_final", "semi_final", "third_place", "final"];
    const m: Partial<Record<RoundKey, WCMatch[]>> = {};
    for (const match of wcMatchesBracket) {
      const k = classifyKnockout(match.round);
      if (!k) continue;
      (m[k] ||= []).push(match);
    }
    return order
      .filter((r) => (m[r]?.length ?? 0) > 0)
      .map((r) => [r, m[r]!] as const);
  }, [wcMatchesBracket]);


  const [activeMatch, setActiveMatch] = useState<WCMatch | null>(null);
  const handlePick = useWcPick(setActiveMatch);

  if (fQ.isLoading) return <FootballPitchSkeleton rows={6} />;
  if (fQ.data?.error && wcMatches.length === 0) return <ErrBox msg={fQ.data.error} />;

  return (
    <div className="space-y-10">
      <MobileLiveTicker matches={wcMatches} />

      {onDateChange && (
        <DateScrubber matches={wcMatchesWithR32} value={date} onChange={onDateChange} />
      )}



      {groupedKnockout.length === 0 ? (
        <EmptyBox
          title="Knockout bracket starts after the group stage"
          body="Once group games wrap up, the Round of 32 lights up here automatically. Meanwhile, tap the Groups tab above to follow the qualification race."
        />
      ) : (
        <>
          {/* Mobile vertical bracket with stage chips */}
          <MobileBracket
            rounds={groupedKnockout.map(([round, matches]) => ({ round, matches }))}
            onPick={handlePick}
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
                      onClick={() => handlePick(m)}
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
            No goals scored yet.
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
