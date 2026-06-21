import { createServerFn } from "@tanstack/react-start";

// API-Football via RapidAPI. League 1 = FIFA World Cup, season 2026.
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = `https://${HOST}/v3`;
const LEAGUE = 1;
const SEASON = 2026;

// In-memory cache per warm Worker instance.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, { at: number; data: unknown }>();

async function apiGet(path: string): Promise<unknown> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new Error("RAPIDAPI_KEY not configured");
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": HOST },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`API-Football ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = await res.json();
  cache.set(path, { at: Date.now(), data: json });
  return json;
}

export type Wc2026Fixture = {
  id: number;
  date: string;
  status: string;       // NS, 1H, HT, 2H, FT, AET, PEN, PST, CANC
  statusLong: string;
  elapsed: number | null;
  round: string;
  venue: string | null;
  city: string | null;
  home: { id: number; name: string; logo: string; goals: number | null };
  away: { id: number; name: string; logo: string; goals: number | null };
};

export const getWc2026Fixtures = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await apiGet(`/fixtures?league=${LEAGUE}&season=${SEASON}`)) as {
      response?: Array<Record<string, any>>;
    };
    const fixtures: Wc2026Fixture[] = (raw.response ?? []).map((f) => ({
      id: f.fixture?.id,
      date: f.fixture?.date,
      status: f.fixture?.status?.short ?? "NS",
      statusLong: f.fixture?.status?.long ?? "",
      elapsed: f.fixture?.status?.elapsed ?? null,
      round: f.league?.round ?? "",
      venue: f.fixture?.venue?.name ?? null,
      city: f.fixture?.venue?.city ?? null,
      home: {
        id: f.teams?.home?.id,
        name: f.teams?.home?.name ?? "",
        logo: f.teams?.home?.logo ?? "",
        goals: f.goals?.home ?? null,
      },
      away: {
        id: f.teams?.away?.id,
        name: f.teams?.away?.name ?? "",
        logo: f.teams?.away?.logo ?? "",
        goals: f.goals?.away ?? null,
      },
    }));
    fixtures.sort((a, b) => a.date.localeCompare(b.date));
    return { fixtures, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { fixtures: [] as Wc2026Fixture[], error: msg };
  }
});

export type Wc2026Standing = {
  rank: number;
  team: { id: number; name: string; logo: string };
  group: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDiff: number;
};

export const getWc2026Standings = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await apiGet(`/standings?league=${LEAGUE}&season=${SEASON}`)) as {
      response?: Array<{ league?: { standings?: any[][] } }>;
    };
    const groups = raw.response?.[0]?.league?.standings ?? [];
    const standings: Wc2026Standing[] = [];
    for (const g of groups) {
      for (const row of g) {
        standings.push({
          rank: row.rank,
          team: { id: row.team?.id, name: row.team?.name, logo: row.team?.logo },
          group: row.group ?? "",
          points: row.points ?? 0,
          played: row.all?.played ?? 0,
          win: row.all?.win ?? 0,
          draw: row.all?.draw ?? 0,
          lose: row.all?.lose ?? 0,
          goalsFor: row.all?.goals?.for ?? 0,
          goalsAgainst: row.all?.goals?.against ?? 0,
          goalsDiff: row.goalsDiff ?? 0,
        });
      }
    }
    return { standings, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { standings: [] as Wc2026Standing[], error: msg };
  }
});

export type Wc2026Scorer = {
  rank: number;
  name: string;
  photo: string | null;
  team: { name: string; logo: string };
  goals: number;
  assists: number;
};

export const getWc2026TopScorers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const raw = (await apiGet(`/players/topscorers?league=${LEAGUE}&season=${SEASON}`)) as {
      response?: Array<Record<string, any>>;
    };
    const scorers: Wc2026Scorer[] = (raw.response ?? []).map((r, i) => ({
      rank: i + 1,
      name: r.player?.name ?? "",
      photo: r.player?.photo ?? null,
      team: {
        name: r.statistics?.[0]?.team?.name ?? "",
        logo: r.statistics?.[0]?.team?.logo ?? "",
      },
      goals: r.statistics?.[0]?.goals?.total ?? 0,
      assists: r.statistics?.[0]?.goals?.assists ?? 0,
    }));
    return { scorers, error: null as string | null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { scorers: [] as Wc2026Scorer[], error: msg };
  }
});

export type Wc2026Event = {
  minute: number | null;
  team: string;
  player: string;
  assist: string | null;
  type: string;      // Goal, Card, subst, Var
  detail: string;    // Normal Goal, Yellow Card, Red Card, ...
};

export const getWc2026FixtureEvents = createServerFn({ method: "GET" })
  .inputValidator((d: { fixtureId: number }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(`/fixtures/events?fixture=${data.fixtureId}`)) as {
        response?: Array<Record<string, any>>;
      };
      const events: Wc2026Event[] = (raw.response ?? []).map((e) => ({
        minute: e.time?.elapsed ?? null,
        team: e.team?.name ?? "",
        player: e.player?.name ?? "",
        assist: e.assist?.name ?? null,
        type: e.type ?? "",
        detail: e.detail ?? "",
      }));
      return { events, error: null as string | null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return { events: [] as Wc2026Event[], error: msg };
    }
  });

export const clearWc2026Cache = createServerFn({ method: "POST" }).handler(async () => {
  cache.clear();
  return { ok: true, clearedAt: new Date().toISOString() };
});
