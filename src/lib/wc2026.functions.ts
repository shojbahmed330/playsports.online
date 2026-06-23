import { createServerFn } from "@tanstack/react-start";

// Sofascore via RapidAPI. FIFA World Cup uniqueTournamentId = 16; 2026 seasonId = 58210.
const HOST = "sofascore.p.rapidapi.com";
const BASE = `https://${HOST}`;
const TID = 16;
const SID = 58210;

// In-memory cache per warm Worker instance. Different TTL per call — live
// fixtures / match events / stats must be fresh so scores update without a
// manual reload. Standings / scorers can be cached longer.
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { at: number; data: unknown }>();

async function apiGet(path: string, ttlMs: number = DEFAULT_TTL_MS): Promise<unknown> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY not configured");
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < ttlMs) return hit.data;
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Sofascore ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  cache.set(path, { at: Date.now(), data: json });
  return json;
}

// Short TTL for endpoints that change during a live match (score, minute, events).
const LIVE_TTL_MS = 20 * 1000; // 20s

// ===================== FIXTURES =====================

export type Wc2026Fixture = {
  id: number;
  startTs: number;          // seconds
  status: string;           // notstarted | inprogress | finished | postponed | canceled
  statusDesc: string;
  minute: number | null;
  group: string;            // "Group A" or "Round of 16", "Final", etc.
  venue: string | null;
  city: string | null;
  home: { id: number; name: string; code: string; goals: number | null };
  away: { id: number; name: string; code: string; goals: number | null };
};

function teamLogo(id: number) {
  return `https://api.sofascore.app/api/v1/team/${id}/image`;
}
export const wc2026TeamLogo = teamLogo;

function normalizeRound(tournamentName: string, roundInfo: any): string {
  // tournament.name like "FIFA World Cup, Group A" or "FIFA World Cup, Knockout stage"
  const m = /,\s*(.+)$/.exec(tournamentName ?? "");
  if (m) {
    const part = m[1].trim();
    if (/^group/i.test(part)) return part; // "Group A"
  }
  const r = roundInfo?.name as string | undefined;
  if (r) return r;
  const code = roundInfo?.round as number | undefined;
  if (code) {
    if (code === 1) return "Final";
    if (code === 2) return "Semi-Final";
    if (code === 4) return "Quarter-Final";
    if (code === 8) return "Round of 16";
    if (code === 16) return "Round of 32";
  }
  return "Other";
}

function mapEvent(e: any): Wc2026Fixture {
  return {
    id: e.id,
    startTs: e.startTimestamp,
    status: e.status?.type ?? "notstarted",
    statusDesc: e.status?.description ?? "",
    minute: e.time?.currentPeriodStartTimestamp
      ? Math.floor((Date.now() / 1000 - e.time.currentPeriodStartTimestamp) / 60)
      : null,
    group: normalizeRound(e.tournament?.name ?? "", e.roundInfo),
    venue: e.venue?.stadium?.name ?? null,
    city: e.venue?.city?.name ?? null,
    home: {
      id: e.homeTeam?.id,
      name: e.homeTeam?.name ?? "",
      code: e.homeTeam?.nameCode ?? "",
      goals: e.homeScore?.current ?? null,
    },
    away: {
      id: e.awayTeam?.id,
      name: e.awayTeam?.name ?? "",
      code: e.awayTeam?.nameCode ?? "",
      goals: e.awayScore?.current ?? null,
    },
  };
}

export const getWc2026Fixtures = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const fixtures: Wc2026Fixture[] = [];
    const seen = new Set<number>();
    // last matches (played) – may paginate
    for (let p = 0; p < 6; p++) {
      const raw = (await apiGet(
        `/tournaments/get-last-matches?tournamentId=${TID}&seasonId=${SID}&pageIndex=${p}`,
      )) as { events?: any[]; hasNextPage?: boolean };
      for (const e of raw.events ?? []) {
        if (!seen.has(e.id)) { seen.add(e.id); fixtures.push(mapEvent(e)); }
      }
      if (!raw.hasNextPage) break;
    }
    // next matches (upcoming)
    for (let p = 0; p < 6; p++) {
      const raw = (await apiGet(
        `/tournaments/get-next-matches?tournamentId=${TID}&seasonId=${SID}&pageIndex=${p}`,
      )) as { events?: any[]; hasNextPage?: boolean };
      for (const e of raw.events ?? []) {
        if (!seen.has(e.id)) { seen.add(e.id); fixtures.push(mapEvent(e)); }
      }
      if (!raw.hasNextPage) break;
    }
    fixtures.sort((a, b) => a.startTs - b.startTs);
    return { fixtures, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { fixtures: [] as Wc2026Fixture[], error: msg };
  }
});

// ===================== STANDINGS =====================

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
export type Wc2026Group = {
  group: string;            // "Group A"
  rows: Wc2026StandingRow[];
};

export const getWc2026Standings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await apiGet(
      `/tournaments/get-standings?tournamentId=${TID}&seasonId=${SID}&type=total`,
    )) as { standings?: any[] };
    const groups: Wc2026Group[] = (raw.standings ?? [])
      .filter((g: any) => /group/i.test(g.tournament?.name ?? ""))
      .map((g: any) => {
        const m = /,\s*(.+)$/.exec(g.tournament?.name ?? "");
        const name = m ? m[1].trim() : g.tournament?.name ?? "Group";
        return {
          group: name,
          rows: (g.rows ?? []).map((r: any) => ({
            rank: r.position,
            team: {
              id: r.team?.id,
              name: r.team?.name ?? "",
              code: r.team?.nameCode ?? "",
              fifaRanking: r.team?.ranking ?? null,
            },
            played: r.matches ?? 0,
            win: r.wins ?? 0,
            draw: r.draws ?? 0,
            lose: r.losses ?? 0,
            goalsFor: r.scoresFor ?? 0,
            goalsAgainst: r.scoresAgainst ?? 0,
            goalsDiff: r.scoreDiffFormatted ?? String((r.scoresFor ?? 0) - (r.scoresAgainst ?? 0)),
            points: r.points ?? 0,
          })),
        };
      });
    groups.sort((a, b) => a.group.localeCompare(b.group));
    return { groups, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { groups: [] as Wc2026Group[], error: msg };
  }
});

// ===================== TOP SCORERS =====================

export type Wc2026Scorer = {
  rank: number;
  name: string;
  playerId: number;
  team: { id: number; name: string; code: string };
  goals: number;
  assists: number | null;
};

export const getWc2026TopScorers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await apiGet(
      `/tournaments/get-top-players?tournamentId=${TID}&seasonId=${SID}&positionDetail=all`,
    )) as { topPlayers?: { goals?: any[]; assists?: any[] } };
    const goalsArr = raw.topPlayers?.goals ?? [];
    const scorers: Wc2026Scorer[] = goalsArr.slice(0, 25).map((row: any, i: number) => ({
      rank: i + 1,
      name: row.player?.name ?? "",
      playerId: row.player?.id,
      team: {
        id: row.team?.id,
        name: row.team?.name ?? "",
        code: row.team?.nameCode ?? "",
      },
      goals: row.statistics?.goals ?? 0,
      assists: row.statistics?.assists ?? null,
    }));
    return { scorers, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { scorers: [] as Wc2026Scorer[], error: msg };
  }
});

// ===================== FIFA RANKINGS (derived from standings) =====================

export type FifaRankRow = {
  rank: number;
  team: { id: number; name: string; code: string };
  group: string;
};

// Derives an "updated FIFA ranking" list from the WC 2026 standings response,
// which embeds each team's current FIFA ranking. Zero extra API cost.
export const getFifaRankings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await apiGet(
      `/tournaments/get-standings?tournamentId=${TID}&seasonId=${SID}&type=total`,
    )) as { standings?: any[] };
    const seen = new Map<number, FifaRankRow>();
    for (const g of raw.standings ?? []) {
      if (!/group/i.test(g.tournament?.name ?? "")) continue;
      const m = /,\s*(.+)$/.exec(g.tournament?.name ?? "");
      const groupName = m ? m[1].trim() : "";
      for (const r of g.rows ?? []) {
        const t = r.team;
        const rk = t?.ranking;
        if (!t || rk == null || rk === 0) continue;
        if (!seen.has(t.id)) {
          seen.set(t.id, {
            rank: rk,
            team: { id: t.id, name: t.name, code: t.nameCode ?? "" },
            group: groupName,
          });
        }
      }
    }
    const rows = Array.from(seen.values()).sort((a, b) => a.rank - b.rank);
    return { rows, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { rows: [] as FifaRankRow[], error: msg };
  }
});

// ===================== LIVE MATCH CENTER =====================

export type Wc2026MatchEvent = {
  id: number | string;
  minute: number | null;
  injuryTime: number | null;
  team: "home" | "away" | null;
  type: string;          // goal | yellowcard | redcard | substitution | penalty | own_goal | var
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
  group: string;          // "Possession", "Shots", …
  rows: { name: string; home: string; away: string }[];
}[];

function mapIncidentType(t: string): string {
  const s = (t ?? "").toLowerCase();
  if (s.includes("goal") && s.includes("own")) return "own_goal";
  if (s.includes("penalty") && s.includes("missed")) return "penalty_missed";
  if (s === "goal" || s.includes("goal")) return "goal";
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
      const raw = (await apiGet(
        `/matches/get-incidents?matchId=${data.matchId}`,
      )) as { incidents?: any[] };
      const incidents = (raw.incidents ?? [])
        .filter((i: any) => i.incidentType && i.incidentType !== "period")
        .map((i: any, idx: number): Wc2026MatchEvent => ({
          id: i.id ?? `${data.matchId}-${idx}`,
          minute: i.time ?? null,
          injuryTime: i.addedTime ?? null,
          team: i.isHome === true ? "home" : i.isHome === false ? "away" : null,
          type: mapIncidentType(i.incidentType ?? i.incidentClass ?? ""),
          playerName: i.player?.name ?? i.playerName ?? null,
          assistName: i.assist1?.name ?? null,
          description: i.text ?? i.reason ?? null,
        }));
      // sort ascending by minute
      incidents.sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));
      return { events: incidents, error: null as string | null };
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
      const raw = (await apiGet(
        `/matches/get-lineups?matchId=${data.matchId}`,
      )) as { confirmed?: boolean; home?: any; away?: any };
      const mapSide = (side: any): Wc2026LineupPlayer[] => {
        const players = side?.players ?? [];
        return players.map((p: any) => ({
          id: p.player?.id,
          name: p.player?.name ?? "",
          shirt: p.shirtNumber ?? p.jerseyNumber ?? null,
          position: p.position ?? null,
          captain: !!p.captain,
          substitute: !!p.substitute,
        }));
      };
      const lineups: Wc2026Lineups = {
        confirmed: !!raw.confirmed,
        formationHome: raw.home?.formation ?? null,
        formationAway: raw.away?.formation ?? null,
        home: mapSide(raw.home),
        away: mapSide(raw.away),
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
      const raw = (await apiGet(
        `/matches/get-statistics?matchId=${data.matchId}`,
      )) as { statistics?: any[] };
      // Use "ALL" period if available.
      const all = (raw.statistics ?? []).find((p: any) => p.period === "ALL")
        ?? (raw.statistics ?? [])[0];
      const groups: Wc2026MatchStats = (all?.groups ?? []).map((g: any) => ({
        group: g.groupName ?? "",
        rows: (g.statisticsItems ?? []).map((it: any) => ({
          name: it.name ?? "",
          home: String(it.home ?? "—"),
          away: String(it.away ?? "—"),
        })),
      }));
      return { stats: groups, error: null as string | null };
    } catch (e) {
      return {
        stats: [] as Wc2026MatchStats,
        error: e instanceof Error ? e.message : "Unknown error",
      };
    }
  });

// Fetches a single match's headline info (score, status, minute) — used by the
// match page when the user lands directly on it.
export const getWc2026Match = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const id = Number((d as any)?.matchId);
    if (!Number.isFinite(id)) throw new Error("matchId required");
    return { matchId: id };
  })
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(`/matches/detail?matchId=${data.matchId}`)) as { event?: any };
      const e = raw.event;
      if (!e) return { fixture: null as Wc2026Fixture | null, error: "Not found" };
      return { fixture: mapEvent(e), error: null as string | null };
    } catch (err) {
      return {
        fixture: null as Wc2026Fixture | null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  });

// ===================== ADMIN: clear cache =====================

export const clearWc2026Cache = createServerFn({ method: "POST" }).handler(async () => {
  cache.clear();
  return { ok: true, clearedAt: new Date().toISOString() };
});
