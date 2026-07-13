import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { FOOTBALL_WC, liveWcYear } from "@/lib/tournament-config";

function setEdgeCache(hasLive: boolean) {
  try {
    setResponseHeader(
      "Cache-Control",
      hasLive
        ? "public, s-maxage=20, stale-while-revalidate=60"
        : "public, s-maxage=300, stale-while-revalidate=900",
    );
  } catch {}
}


// ESPN public API (free, no key) is the authoritative source for live WC data.
// FIFA World Cup league slug = "fifa.world".
// SEASON + WC_RANGE are now derived from tournament-config so the next
// World Cup (2030, 2034, …) auto-takes over without code changes.
const ESPN_SITE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const ESPN_CORE = "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world";
const ESPN_WEB  = "https://site.web.api.espn.com/apis/common/v3/sports/soccer/fifa.world";
const SEASON = liveWcYear();
const WC_RANGE = (() => {
  const w = FOOTBALL_WC.seasonWindows[SEASON];
  if (!w) return "20260611-20260719"; // safety fallback
  return `${w.start.replace(/-/g, "")}-${w.end.replace(/-/g, "")}`;
})();

import { cachedFetch } from "@/lib/sports-cache";

const DEFAULT_TTL_MS = 60 * 60 * 1000;
const LIVE_TTL_MS = 20 * 1000;

/**
 * Fetch a JSON URL from ESPN with two-tier caching:
 *  - Persistent Supabase cache (`sports_data_cache`)  ← survives cold starts
 *  - In-process memory fallback inside `cachedFetch`
 *
 * Cache key is the URL itself, scoped as football/espn so future season
 * archiving can target it by prefix.
 */
async function espnGet(url: string, ttlMs: number = DEFAULT_TTL_MS): Promise<unknown> {
  // Derive a category from the URL path so `sports_data_cache.category` stays
  // meaningful (scorers / standings / summary / …).
  const path = (() => {
    try { return new URL(url).pathname.split("/").filter(Boolean).slice(-2).join("/"); }
    catch { return "misc"; }
  })();
  return cachedFetch<unknown>(
    {
      key: `espn:soccer:fifa.world:${SEASON}:${url}`,
      sport: "football",
      category: path,
      ttlMs,
    },
    async () => {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`ESPN ${res.status}: ${txt.slice(0, 200)}`);
      }
      return res.json();
    },
  );
}

// ===================== TYPES (unchanged shape — consumers don't need to change) =====================

export type Wc2026Fixture = {
  id: number;
  startTs: number;
  status: string;
  statusDesc: string;
  minute: number | null;
  group: string;
  venue: string | null;
  city: string | null;
  home: { id: number; name: string; code: string; goals: number | null };
  away: { id: number; name: string; code: string; goals: number | null };
};

export type Wc2026StandingRow = {
  rank: number;
  team: { id: number; name: string; code: string; fifaRanking: number | null };
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: string;
  points: number;
};
export type Wc2026Group = { group: string; rows: Wc2026StandingRow[] };

export type Wc2026Scorer = {
  rank: number;
  name: string;
  playerId: number;
  team: { id: number; name: string; code: string };
  goals: number;
  penalties: number;
  assists: number | null;
};

export type Wc2026PlayerEvent = {
  id: string;
  eventId: number;
  minute: number | null;
  type: "goal" | "penalty_goal" | "own_goal" | "penalty_miss" | "yellow" | "red";
  playerId: number;
  playerName: string;
  team: { id: number; name: string; code: string };
};

export type FifaRankRow = {
  rank: number;
  team: { id: number; name: string; code: string };
  group: string;
};

export type Wc2026MatchEvent = {
  id: number | string;
  minute: number | null;
  injuryTime: number | null;
  team: "home" | "away" | null;
  type: string;
  playerName: string | null;
  assistName?: string | null;
  description: string | null;
};

export type Wc2026LineupPlayer = {
  id: number;
  name: string;
  shirt: number | null;
  position: string | null;
  captain: boolean;
  substitute: boolean;
};

export type Wc2026Lineups = {
  confirmed: boolean;
  formationHome: string | null;
  formationAway: string | null;
  home: Wc2026LineupPlayer[];
  away: Wc2026LineupPlayer[];
};

export type Wc2026MatchStats = {
  group: string;
  rows: { name: string; home: string; away: string }[];
}[];

export type Wc2026CommentaryItem = {
  id: string;
  sequence: number;
  minute: number | null;
  team: "home" | "away" | null;
  text: string;
  type: string;
};

export type Wc2026Official = {
  name: string;
  role: string;
};

// ===================== HELPERS =====================

export function wc2026TeamLogo(id: number) {
  return `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
}

function mapStatus(state: string | undefined): string {
  if (state === "in") return "inprogress";
  if (state === "post") return "finished";
  return "notstarted";
}

function deriveGroup(ev: any): string {
  // ESPN puts grouping in event.season.type.name, or competitions[0].notes,
  // or competitions[0].type.text ("Group Stage", "Round of 32", etc.)
  const comp = ev?.competitions?.[0] ?? {};
  const notes = comp?.notes ?? [];
  const classify = (value: unknown): string | null => {
    const h = String(value ?? "");
    if (!h) return null;
    const m = /Group\s+[A-Z]/i.exec(h);
    if (m) return m[0].replace(/\s+/, " ");
    if (/round[\s-]+of[\s-]+16/i.test(h)) return "Round of 16";
    if (/round[\s-]+of[\s-]+32/i.test(h)) return "Round of 32";
    if (/quarter/i.test(h)) return "Quarter-Final";
    if (/semi/i.test(h)) return "Semi-Final";
    if (/third|3rd|play-?off/i.test(h)) return "Third-Place Play-off";
    if (/\bfinal\b/i.test(h)) return "Final";
    if (/group[\s-]+stage/i.test(h)) return "Group Stage";
    return null;
  };
  for (const n of notes) {
    const hit = classify(n?.headline);
    if (hit) return hit;
  }
  for (const value of [comp?.altGameNote, comp?.type?.text, ev?.season?.slug, ev?.season?.type?.name]) {
    const hit = classify(value);
    if (hit) return hit;
  }
  const t = comp?.type?.text ?? ev?.season?.type?.name ?? "";
  if (/group/i.test(t)) return "Group Stage";
  return t || "Other";
}

function mapEvent(ev: any): Wc2026Fixture {
  const comp = ev?.competitions?.[0] ?? {};
  const competitors = comp.competitors ?? [];
  const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0] ?? {};
  const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1] ?? {};
  const status = ev?.status ?? comp.status ?? {};
  const startTs = Math.floor(new Date(ev.date).getTime() / 1000);
  const period = status?.period ?? null;
  const clock = status?.displayClock as string | undefined;
  let minute: number | null = null;
  if (mapStatus(status?.type?.state) === "inprogress" && clock) {
    const m = /^(\d+)/.exec(clock);
    if (m) minute = Number(m[1]) + (period && period > 1 ? 45 * (period - 1) : 0);
  }
  return {
    id: Number(ev.id),
    startTs,
    status: mapStatus(status?.type?.state),
    statusDesc: status?.type?.description ?? "",
    minute,
    group: deriveGroup(ev),
    venue: comp.venue?.fullName ?? null,
    city: comp.venue?.address?.city ?? null,
    home: {
      id: Number(home.team?.id ?? 0),
      name: home.team?.displayName ?? "",
      code: (home.team?.abbreviation ?? "").toUpperCase(),
      goals: home.score != null ? Number(home.score) : null,
    },
    away: {
      id: Number(away.team?.id ?? 0),
      name: away.team?.displayName ?? "",
      code: (away.team?.abbreviation ?? "").toUpperCase(),
      goals: away.score != null ? Number(away.score) : null,
    },
  };
}

// ===================== FIXTURES =====================

export const getWc2026Fixtures = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await espnGet(
      `${ESPN_SITE}/scoreboard?dates=${WC_RANGE}&limit=200`,
      LIVE_TTL_MS,
    )) as { events?: any[] };
    const fixtures: Wc2026Fixture[] = (raw.events ?? []).map(mapEvent);
    fixtures.sort((a, b) => a.startTs - b.startTs);
    setEdgeCache(fixtures.some((f) => f.status === "inprogress"));
    return { fixtures, error: null as string | null };
  } catch (e) {
    return {
      fixtures: [] as Wc2026Fixture[],
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
});


// ===================== STANDINGS =====================

function statVal(stats: any[], names: string[]): number {
  for (const n of names) {
    const s = stats.find((x) => x?.name === n || x?.type === n || x?.abbreviation === n);
    if (s && s.value != null) return Number(s.value);
  }
  return 0;
}

function flattenStandingsTree(node: any, out: any[]): void {
  if (!node) return;
  if (Array.isArray(node.children) && node.children.length) {
    for (const c of node.children) flattenStandingsTree(c, out);
  }
  if (node.standings?.entries?.length) out.push(node);
}

export const getWc2026Standings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await espnGet(
      `${ESPN_CORE}/standings?season=${SEASON}`,
    )) as any;
    const groupsRaw: any[] = [];
    flattenStandingsTree(raw, groupsRaw);
    const groups: Wc2026Group[] = groupsRaw
      .filter((g) => /group/i.test(g?.name ?? g?.abbreviation ?? ""))
      .map((g) => {
        const name = String(g.name ?? g.abbreviation ?? "Group");
        const rows: Wc2026StandingRow[] = (g.standings?.entries ?? []).map((en: any, i: number) => {
          const stats = en.stats ?? [];
          const win = statVal(stats, ["wins"]);
          const draw = statVal(stats, ["ties"]);
          const lose = statVal(stats, ["losses"]);
          const gf = statVal(stats, ["pointsFor", "goalsFor"]);
          const ga = statVal(stats, ["pointsAgainst", "goalsAgainst"]);
          const played = statVal(stats, ["gamesPlayed"]) || win + draw + lose;
          const points = statVal(stats, ["points"]) || win * 3 + draw;
          const rank = statVal(stats, ["rank"]) || i + 1;
          return {
            rank,
            team: {
              id: Number(en.team?.id ?? 0),
              name: en.team?.displayName ?? "",
              code: (en.team?.abbreviation ?? "").toUpperCase(),
              fifaRanking: null,
            },
            played, win, draw, lose,
            goalsFor: gf, goalsAgainst: ga,
            goalsDiff: String(gf - ga),
            points,
          };
        });
        rows.sort((a, b) => a.rank - b.rank);
        return { group: name, rows };
      });
    groups.sort((a, b) => a.group.localeCompare(b.group));
    return { groups, error: null as string | null };
  } catch (e) {
    return {
      groups: [] as Wc2026Group[],
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
});

// ===================== PLAYER EVENTS / TOP SCORERS =====================
// ESPN's `/leaders?season=...` endpoint is 404 for this competition, so we
// aggregate player stats by walking the scoreboard and reading each event's
// authoritative `keyEvents`/`details` array (cached per-event for 5 min).
const SCORERS_TTL_MS = 5 * 60 * 1000;

function eventAthlete(d: any): { id: number; name: string } | null {
  const raw = d?.participants?.[0]?.athlete ?? d?.athletesInvolved?.[0] ?? d?.athlete ?? null;
  const id = Number(raw?.id ?? 0);
  const name = raw?.displayName ?? raw?.fullName ?? raw?.name ?? "";
  if (!id || !name) return null;
  return { id, name };
}

function eventMinute(d: any): number | null {
  if (d?.clock?.value != null) return Math.floor(Number(d.clock.value) / 60);
  const display = String(d?.clock?.displayValue ?? d?.displayTime ?? "");
  const m = /^(\d+)/.exec(display);
  if (m) return Number(m[1]);
  return d?.minute != null ? Number(d.minute) : null;
}

function eventTeam(d: any): { id: number; name: string; code: string } {
  return {
    id: Number(d?.team?.id ?? d?.teamId ?? 0),
    name: d?.team?.displayName ?? d?.team?.name ?? "",
    code: (d?.team?.abbreviation ?? "").toUpperCase(),
  };
}

function classifyPlayerEvent(d: any): Wc2026PlayerEvent["type"] | null {
  const typeText = String(d?.type?.text ?? d?.type?.type ?? d?.type?.id ?? "").toLowerCase();
  const text = String(d?.text ?? d?.description ?? "").toLowerCase();
  const hay = `${typeText} ${text}`;
  const isShootout = d?.shootout === true;
  const scoring = d?.scoringPlay === true;

  if (isShootout) return null; // shoot-out goals/cards are not tournament player stats
  if (/own[ -]?goal/.test(hay)) return "own_goal";
  if (hay.includes("yellow") && hay.includes("red")) return "red";
  if (hay.includes("red card") || typeText === "red-card") return "red";
  if (hay.includes("yellow card") || typeText === "yellow-card") return "yellow";
  if (hay.includes("penalty") && /(saved|miss|missed|off target)/.test(hay)) return "penalty_miss";
  if (scoring && hay.includes("penalty")) return "penalty_goal";
  if (scoring || typeText.includes("goal")) return "goal";
  return null;
}

async function collectWc2026PlayerEvents(): Promise<Wc2026PlayerEvent[]> {
  const sb = (await espnGet(
    `${ESPN_SITE}/scoreboard?dates=${WC_RANGE}&limit=200`,
    LIVE_TTL_MS,
  )) as { events?: any[] };
  const events = (sb.events ?? []).filter((e: any) => {
    const st = e?.status?.type?.state;
    return st === "post" || st === "in";
  });

  const out: Wc2026PlayerEvent[] = [];
  const seen = new Set<string>();
  const batch = 8;
  for (let i = 0; i < events.length; i += batch) {
    const chunk = events.slice(i, i + batch);
    const sums = await Promise.all(
      chunk.map((ev: any) =>
        espnGet(`${ESPN_SITE}/summary?event=${ev.id}`, SCORERS_TTL_MS).catch(() => null),
      ),
    );
    for (let j = 0; j < sums.length; j++) {
      const summary = sums[j];
      const eventId = Number(chunk[j]?.id ?? 0);
      if (!summary || typeof summary !== "object" || !eventId) continue;
      const details: any[] = (summary as any).keyEvents ?? (summary as any).details ?? [];
      for (const d of details) {
        const type = classifyPlayerEvent(d);
        if (!type) continue;
        const athlete = eventAthlete(d);
        if (!athlete) continue;
        const dedupe = `${eventId}:${d?.id ?? ""}:${athlete.id}:${type}:${d?.clock?.displayValue ?? d?.displayTime ?? ""}:${d?.text ?? ""}`;
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        out.push({
          id: String(d?.id ?? dedupe),
          eventId,
          minute: eventMinute(d),
          type,
          playerId: athlete.id,
          playerName: athlete.name,
          team: eventTeam(d),
        });
      }
    }
  }
  out.sort((a, b) => a.eventId - b.eventId || (a.minute ?? 0) - (b.minute ?? 0));
  return out;
}

export const getWc2026PlayerEvents = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const events = await collectWc2026PlayerEvents();
    return { events, error: null as string | null };
  } catch (e) {
    console.warn("wc2026 player events unavailable", e instanceof Error ? e.message : e);
    return { events: [] as Wc2026PlayerEvent[], error: null as string | null };
  }
});

export const getWc2026TopScorers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    type Agg = {
      playerId: number;
      name: string;
      teamId: number;
      teamName: string;
      teamCode: string;
      goals: number;
      penalties: number;
    };
    const agg = new Map<number, Agg>();
    const playerEvents = await collectWc2026PlayerEvents();
    for (const ev of playerEvents) {
      if (ev.type !== "goal" && ev.type !== "penalty_goal") continue;
      const cur = agg.get(ev.playerId);
      if (cur) {
        cur.goals += 1;
        if (ev.type === "penalty_goal") cur.penalties += 1;
      } else {
        agg.set(ev.playerId, {
          playerId: ev.playerId,
          name: ev.playerName,
          teamId: ev.team.id,
          teamName: ev.team.name,
          teamCode: ev.team.code,
          goals: 1,
          penalties: ev.type === "penalty_goal" ? 1 : 0,
        });
      }
    }

    const sorted = Array.from(agg.values()).sort((a, b) => b.goals - a.goals);
    const scorers: Wc2026Scorer[] = sorted.slice(0, 50).map((a, i) => ({
      rank: i + 1,
      name: a.name,
      playerId: a.playerId,
      team: { id: a.teamId, name: a.teamName, code: a.teamCode },
      goals: a.goals,
      penalties: a.penalties,
      assists: null,
    }));
    return { scorers, error: null as string | null };
  } catch (e) {
    // Do not surface provider/quota/404 details in the public UI. The scorer
    // table is non-critical and can stay empty until official goal data exists.
    console.warn("wc2026 top scorers unavailable", e instanceof Error ? e.message : e);
    return {
      scorers: [] as Wc2026Scorer[],
      error: null as string | null,
    };
  }
});



// ===================== FIFA RANKINGS (derived from standings) =====================
// ESPN's standings payload doesn't carry FIFA ranking — return empty list; the
// /players page also reads from a bundled fifa_rankings.json fallback.
export const getFifaRankings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sQ = (await espnGet(`${ESPN_CORE}/standings?season=${SEASON}`)) as any;
    const groupsRaw: any[] = [];
    flattenStandingsTree(sQ, groupsRaw);
    const seen = new Map<number, FifaRankRow>();
    let rank = 1;
    for (const g of groupsRaw) {
      const name = String(g.name ?? "");
      if (!/group/i.test(name)) continue;
      for (const en of g.standings?.entries ?? []) {
        const id = Number(en.team?.id ?? 0);
        if (!id || seen.has(id)) continue;
        seen.set(id, {
          rank: rank++,
          team: {
            id,
            name: en.team?.displayName ?? "",
            code: (en.team?.abbreviation ?? "").toUpperCase(),
          },
          group: name,
        });
      }
    }
    return { rows: Array.from(seen.values()), error: null as string | null };
  } catch (e) {
    return {
      rows: [] as FifaRankRow[],
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
});

// ===================== MATCH DETAIL / EVENTS / LINEUPS / STATS =====================

async function fetchSummary(matchId: number, ttl = LIVE_TTL_MS): Promise<any> {
  return espnGet(`${ESPN_SITE}/summary?event=${matchId}`, ttl);
}

function mapIncidentType(t: string): string {
  const s = (t ?? "").toLowerCase();
  if (s.includes("own")) return "own_goal";
  if (s.includes("penalty") && s.includes("miss")) return "penalty_missed";
  if (s.includes("goal")) return "goal";
  if (s.includes("yellow") && s.includes("red")) return "yellow_red";
  if (s.includes("yellow")) return "yellowcard";
  if (s.includes("red")) return "redcard";
  if (s.includes("substitution") || s === "sub") return "substitution";
  if (s.includes("var")) return "var";
  return s || "event";
}

export const getWc2026MatchEvents = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.matchId);
    if (!Number.isFinite(id)) throw new Error("matchId required");
    return { matchId: id };
  })
  .handler(async ({ data }) => {
    try {
      const raw = (await fetchSummary(data.matchId)) as any;
      const homeId = raw?.header?.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "home")?.team?.id;
      const details: any[] = raw?.details ?? raw?.keyEvents ?? [];
      const events: Wc2026MatchEvent[] = details.map((d: any, i: number) => {
        const teamId = d.team?.id ?? d.teamId;
        const side: "home" | "away" | null =
          teamId == null ? null : String(teamId) === String(homeId) ? "home" : "away";
        return {
          id: d.id ?? `${data.matchId}-${i}`,
          minute: d.clock?.value != null ? Math.floor(Number(d.clock.value) / 60) : (d.minute ?? null),
          injuryTime: null,
          team: side,
          type: mapIncidentType(d.type?.text ?? d.type?.id ?? ""),
          playerName: d.athletesInvolved?.[0]?.displayName ?? null,
          assistName: d.athletesInvolved?.[1]?.displayName ?? null,
          description: d.text ?? null,
        };
      });
      events.sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
      return { events, error: null as string | null };
    } catch (e) {
      return {
        events: [] as Wc2026MatchEvent[],
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  });

export const getWc2026MatchLineups = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.matchId);
    if (!Number.isFinite(id)) throw new Error("matchId required");
    return { matchId: id };
  })
  .handler(async ({ data }) => {
    try {
      const raw = (await fetchSummary(data.matchId, DEFAULT_TTL_MS)) as any;
      const rosters: any[] = raw?.rosters ?? [];
      const home = rosters.find((r) => r.homeAway === "home") ?? rosters[0];
      const away = rosters.find((r) => r.homeAway === "away") ?? rosters[1];
      const mapSide = (side: any): Wc2026LineupPlayer[] =>
        (side?.roster ?? []).map((p: any) => ({
          id: Number(p.athlete?.id ?? 0),
          name: p.athlete?.displayName ?? "",
          shirt: p.jersey != null ? Number(p.jersey) : null,
          position: p.position?.abbreviation ?? p.position?.name ?? null,
          captain: !!p.captain,
          substitute: !p.starter,
        }));
      const lineups: Wc2026Lineups = {
        confirmed: !!(home?.roster?.length || away?.roster?.length),
        formationHome: home?.formation ?? null,
        formationAway: away?.formation ?? null,
        home: mapSide(home),
        away: mapSide(away),
      };
      return { lineups, error: null as string | null };
    } catch (e) {
      return {
        lineups: null as Wc2026Lineups | null,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  });

export const getWc2026MatchStats = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.matchId);
    if (!Number.isFinite(id)) throw new Error("matchId required");
    return { matchId: id };
  })
  .handler(async ({ data }) => {
    try {
      const raw = (await fetchSummary(data.matchId)) as any;
      const teamStats: any[] = raw?.boxscore?.teams ?? [];
      if (teamStats.length < 2) return { stats: [] as Wc2026MatchStats, error: null };
      const homeStats = (teamStats.find((t) => t.homeAway === "home") ?? teamStats[0])?.statistics ?? [];
      const awayStats = (teamStats.find((t) => t.homeAway === "away") ?? teamStats[1])?.statistics ?? [];
      const map = new Map<string, { home: string; away: string }>();
      for (const s of homeStats) map.set(s.name ?? s.label, { home: String(s.displayValue ?? "—"), away: "—" });
      for (const s of awayStats) {
        const k = s.name ?? s.label;
        const ex = map.get(k);
        if (ex) ex.away = String(s.displayValue ?? "—");
        else map.set(k, { home: "—", away: String(s.displayValue ?? "—") });
      }
      const rows = Array.from(map.entries()).map(([name, v]) => ({ name, home: v.home, away: v.away }));
      const stats: Wc2026MatchStats = rows.length ? [{ group: "Match Stats", rows }] : [];
      return { stats, error: null as string | null };
    } catch (e) {
      return {
        stats: [] as Wc2026MatchStats,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  });

export const getWc2026Match = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.matchId);
    if (!Number.isFinite(id)) throw new Error("matchId required");
    return { matchId: id };
  })
  .handler(async ({ data }) => {
    try {
      let realId = data.matchId;
      // Sequential match numbers (1..200) from tournament stage pages are
      // NOT ESPN event ids — resolve them via the fixture list, sorted by
      // kickoff, so /football/match/1 → first match of the tournament, etc.
      if (realId > 0 && realId < 10000) {
        const raw = (await espnGet(
          `${ESPN_SITE}/scoreboard?dates=${WC_RANGE}&limit=200`,
          LIVE_TTL_MS,
        )) as { events?: any[] };
        const fixtures: Wc2026Fixture[] = (raw.events ?? []).map(mapEvent);
        fixtures.sort((a, b) => a.startTs - b.startTs);
        const fx = fixtures[realId - 1];
        if (!fx) return { fixture: null as Wc2026Fixture | null, error: "Match not found" };
        realId = fx.id;
      }
      const raw = (await fetchSummary(realId)) as any;
      const header = raw?.header;
      if (!header) return { fixture: null as Wc2026Fixture | null, error: "Not found" };
      const ev = {
        id: header.id,
        date: header.competitions?.[0]?.date,
        season: header.season,
        status: header.competitions?.[0]?.status,
        competitions: header.competitions,
      };
      return { fixture: mapEvent(ev), error: null as string | null };
    } catch (err) {
      return {
        fixture: null as Wc2026Fixture | null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  });

// ===================== PLAYER PROFILE =====================

export type Wc2026PlayerProfile = {
  id: number;
  name: string;
  fullName: string | null;
  headshot: string | null;
  jersey: string | null;
  position: string | null;
  team: { id: number | null; name: string | null; logo: string | null } | null;
  birthDate: string | null;
  age: number | null;
  birthplace: string | null;
  nationality: string | null;
  heightCm: number | null;
  weightKg: number | null;
  bio: { label: string; value: string }[];
  stats: { group: string; rows: { name: string; value: string }[] }[];
  espnUrl: string | null;
};

function pickHeadshot(a: any): string | null {
  return a?.headshot?.href ?? a?.headshot ?? a?.image?.href ?? null;
}

export const getWc2026PlayerProfile = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.playerId);
    if (!Number.isFinite(id) || id <= 0) throw new Error("playerId required");
    return { playerId: id };
  })
  .handler(async ({ data }) => {
    const tryLeagues = ["fifa.world", "all"];
    let overview: any = null;
    let stats: any = null;
    let lastErr: string | null = null;
    for (const lg of tryLeagues) {
      try {
        overview = await espnGet(
          `https://site.web.api.espn.com/apis/common/v3/sports/soccer/${lg}/athletes/${data.playerId}`,
          DEFAULT_TTL_MS,
        );
        if (overview) break;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
      }
    }
    if (!overview) {
      return {
        profile: null as Wc2026PlayerProfile | null,
        error: lastErr ?? "Player not found",
      };
    }
    // stats endpoint (optional — many WC players have no aggregated stats)
    try {
      stats = await espnGet(
        `https://site.web.api.espn.com/apis/common/v3/sports/soccer/all/athletes/${data.playerId}/stats`,
        DEFAULT_TTL_MS,
      );
    } catch {
      stats = null;
    }

    const a = overview?.athlete ?? overview;
    const teamRaw = a?.team ?? overview?.team ?? null;
    const profile: Wc2026PlayerProfile = {
      id: Number(a?.id ?? data.playerId),
      name: a?.displayName ?? a?.fullName ?? "",
      fullName: a?.fullName ?? null,
      headshot: pickHeadshot(a),
      jersey: a?.jersey ?? null,
      position: a?.position?.displayName ?? a?.position?.name ?? a?.position?.abbreviation ?? null,
      team: teamRaw
        ? {
            id: Number(teamRaw?.id ?? 0) || null,
            name: teamRaw?.displayName ?? teamRaw?.name ?? null,
            logo: teamRaw?.logo ?? teamRaw?.logos?.[0]?.href ?? null,
          }
        : null,
      birthDate: a?.dateOfBirth ?? a?.birthDate ?? null,
      age: typeof a?.age === "number" ? a.age : null,
      birthplace:
        [a?.birthPlace?.city, a?.birthPlace?.state, a?.birthPlace?.country]
          .filter(Boolean)
          .join(", ") || null,
      nationality: a?.citizenship ?? a?.nationality ?? a?.birthPlace?.country ?? null,
      heightCm: typeof a?.height === "number" ? Math.round(a.height) : null,
      weightKg: typeof a?.weight === "number" ? Math.round(a.weight) : null,
      bio: [],
      stats: [],
      espnUrl: a?.links?.find?.((l: any) => /player/i.test(l?.rel?.join?.(" ") ?? ""))?.href ?? null,
    };

    // Fold a small bio block
    const bio = profile.bio;
    if (profile.position) bio.push({ label: "Position", value: profile.position });
    if (profile.jersey) bio.push({ label: "Jersey", value: `#${profile.jersey}` });
    if (profile.team?.name) bio.push({ label: "Club", value: profile.team.name });
    if (profile.nationality) bio.push({ label: "Nationality", value: profile.nationality });
    if (profile.birthDate) {
      const d = new Date(profile.birthDate);
      const ageStr = profile.age != null ? ` (${profile.age})` : "";
      bio.push({ label: "Born", value: `${d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}${ageStr}` });
    }
    if (profile.birthplace) bio.push({ label: "Birthplace", value: profile.birthplace });
    if (profile.heightCm) bio.push({ label: "Height", value: `${profile.heightCm} cm` });
    if (profile.weightKg) bio.push({ label: "Weight", value: `${profile.weightKg} kg` });

    // Stats: ESPN returns categories[].stats[] OR splits.categories[].stats[]
    try {
      const cats: any[] =
        stats?.categories ??
        stats?.splits?.categories ??
        a?.statistics?.splits?.categories ??
        [];
      for (const c of cats) {
        const rows = (c?.stats ?? []).map((s: any) => ({
          name: s?.displayName ?? s?.name ?? "",
          value: String(s?.displayValue ?? s?.value ?? "—"),
        })).filter((r: any) => r.name);
        if (rows.length) {
          profile.stats.push({ group: c?.displayName ?? c?.name ?? "Stats", rows });
        }
      }
    } catch {}

    return { profile, error: null as string | null };
  });

export const getWc2026MatchCommentary = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.matchId);
    if (!Number.isFinite(id)) throw new Error("matchId required");
    return { matchId: id };
  })
  .handler(async ({ data }) => {
    try {
      const raw = (await fetchSummary(data.matchId)) as any;
      const homeId = raw?.header?.competitions?.[0]?.competitors?.find((c: any) => c.homeAway === "home")?.team?.id;
      const list: any[] = raw?.commentary ?? [];
      const items: Wc2026CommentaryItem[] = list.map((c: any, i: number) => {
        const teamId = c?.team?.id ?? c?.play?.team?.id;
        const side: "home" | "away" | null =
          teamId == null ? null : String(teamId) === String(homeId) ? "home" : "away";
        const minRaw = c?.time?.value ?? (c?.play?.clock?.value != null ? Math.floor(Number(c.play.clock.value) / 60) : null);
        return {
          id: String(c?.id ?? `${data.matchId}-c-${i}`),
          sequence: Number(c?.sequence ?? i),
          minute: minRaw != null ? Number(minRaw) : null,
          team: side,
          text: c?.text ?? c?.play?.text ?? "",
          type: mapIncidentType(c?.play?.type?.text ?? c?.play?.type?.id ?? ""),
        };
      }).filter((i: Wc2026CommentaryItem) => i.text);
      items.sort((a, b) => b.sequence - a.sequence);
      return { items, error: null as string | null };
    } catch (e) {
      return { items: [] as Wc2026CommentaryItem[], error: e instanceof Error ? e.message : "Unknown error" };
    }
  });

export const getWc2026MatchOfficials = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.matchId);
    if (!Number.isFinite(id)) throw new Error("matchId required");
    return { matchId: id };
  })
  .handler(async ({ data }) => {
    try {
      const raw = (await fetchSummary(data.matchId)) as any;
      const officials: any[] = raw?.gameInfo?.officials ?? raw?.header?.competitions?.[0]?.officials ?? [];
      const items: Wc2026Official[] = officials.map((o: any) => ({
        name: o?.displayName ?? o?.fullName ?? "",
        role: o?.position?.displayName ?? o?.position?.name ?? o?.type?.text ?? "Official",
      })).filter((o: Wc2026Official) => o.name);
      const attendance = raw?.gameInfo?.attendance ?? null;
      return {
        officials: items,
        attendance: attendance != null ? Number(attendance) : null,
        error: null as string | null,
      };
    } catch (e) {
      return {
        officials: [] as Wc2026Official[],
        attendance: null as number | null,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  });

// ===================== ADMIN: clear cache =====================

export const clearWc2026Cache = createServerFn({ method: "POST" }).handler(async () => {
  // Cache lives in Supabase (`sports_data_cache`) now. Purge the football
  // rows scoped to the current season so the next request refetches ESPN.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("sports_data_cache")
    .delete()
    .like("cache_key", `espn:soccer:fifa.world:%`)
    .eq("is_archived", false);
  if (error) throw new Error(error.message);
  return { ok: true, clearedAt: new Date().toISOString() };
});

