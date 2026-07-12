import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

/** Set a status-aware shared edge cache header. */
function setEdgeCache(hasLive: boolean) {
  try {
    setResponseHeader(
      "Cache-Control",
      hasLive
        ? "public, s-maxage=20, stale-while-revalidate=60"
        : "public, s-maxage=120, stale-while-revalidate=300",
    );
  } catch {
    /* not in a request context (e.g. test) — ignore */
  }
}


// ESPN's public "site.api" — same source ESPN.com itself uses.
// No API key, works on Cloudflare Workers (pure fetch).
const BASE = "https://site.api.espn.com/apis/site/v2/sports";

// In-memory cache per warm Worker instance.
type CacheEntry = { at: number; ttl: number; data: unknown };
const cache = new Map<string, CacheEntry>();

async function apiGet(path: string, ttlMs: number): Promise<unknown> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;
  const res = await fetch(`${BASE}${path}`, {
    headers: { "user-agent": "lovable-sports-archive/1.0" },
  });
  if (!res.ok) {
    throw new Error(`ESPN ${res.status} for ${path}`);
  }
  const json = await res.json();
  cache.set(path, { at: Date.now(), ttl: ttlMs, data: json });
  return json;
}

// ───────────── DTO TYPES (clean, serializable) ─────────────
export type SportTeam = {
  id: string;
  name: string;           // "Los Angeles Dodgers"
  shortName: string;      // "Dodgers"
  abbr: string;           // "LAD"
  logo: string | null;
  color: string | null;
  score: number | null;
  record: string | null;  // "12-4"
  winner: boolean | null;
};

export type SportGame = {
  id: string;
  startTs: number;          // ms epoch
  status: "pre" | "in" | "post";
  statusDetail: string;     // "Top 5th" / "Final" / "7:05 PM ET"
  period: number | null;
  clock: string | null;
  shortDetail: string;
  venue: string | null;
  home: SportTeam;
  away: SportTeam;
  broadcast: string | null;
  league: string;           // "MLB"
};

export type StandingRow = {
  teamId: string;
  team: string;
  abbr: string;
  logo: string | null;
  wins: number;
  losses: number;
  ties: number | null;     // hockey/soccer
  otLosses: number | null; // hockey
  pct: number | null;
  gamesBack: string | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  streak: string | null;
  conference: string | null;
  division: string | null;
};

export type NewsItem = {
  id: string;
  headline: string;
  description: string;
  publishedAt: string;
  image: string | null;
  link: string;
  category?: string | null;
  byline?: string | null;
  type?: string | null;
  premium?: boolean;
};

// ───────────── ADAPTERS ─────────────
function pickLogo(t: any): string | null {
  return t?.team?.logo ?? t?.team?.logos?.[0]?.href ?? null;
}

function mapCompetitor(c: any): SportTeam {
  const t = c?.team ?? {};
  const record = Array.isArray(c?.records) && c.records.length
    ? (c.records.find((r: any) => r.type === "total")?.summary ?? c.records[0].summary)
    : null;
  return {
    id: String(t.id ?? ""),
    name: t.displayName ?? t.name ?? "",
    shortName: t.shortDisplayName ?? t.name ?? "",
    abbr: t.abbreviation ?? "",
    logo: t.logo ?? t.logos?.[0]?.href ?? null,
    color: t.color ? `#${t.color}` : null,
    score: c?.score != null ? Number(c.score) : null,
    record,
    winner: typeof c?.winner === "boolean" ? c.winner : null,
  };
}

function mapEvent(e: any, league: string): SportGame {
  const comp = e?.competitions?.[0] ?? {};
  const competitors: any[] = comp.competitors ?? [];
  const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0] ?? {};
  const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1] ?? {};
  const status = e?.status?.type?.state ?? comp?.status?.type?.state ?? "pre";
  const broadcast =
    comp?.broadcasts?.[0]?.names?.join(", ") ??
    comp?.geoBroadcasts?.[0]?.media?.shortName ??
    null;
  return {
    id: String(e.id ?? comp.id ?? ""),
    startTs: e.date ? new Date(e.date).getTime() : 0,
    status: (status === "in" || status === "post") ? status : "pre",
    statusDetail: e?.status?.type?.detail ?? e?.status?.type?.description ?? "",
    period: e?.status?.period ?? null,
    clock: e?.status?.displayClock ?? null,
    shortDetail: e?.status?.type?.shortDetail ?? "",
    venue: comp?.venue?.fullName ?? null,
    home: mapCompetitor(home),
    away: mapCompetitor(away),
    broadcast,
    league,
  };
}

// ───────────── SERVER FUNCTIONS ─────────────
// Scoreboard — short TTL because scores update fast.
export const getScoreboard = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string; league: string; yyyymmdd?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const q = data.yyyymmdd ? `?dates=${data.yyyymmdd}` : "";
      const raw = (await apiGet(`/${data.sportPath}/scoreboard${q}`, 60_000)) as any;
      const events: any[] = raw?.events ?? [];
      const games: SportGame[] = events.map((e) => mapEvent(e, data.league));
      games.sort((a, b) => a.startTs - b.startTs);
      const day = raw?.day?.date ?? data.yyyymmdd ?? new Date().toISOString().slice(0, 10);
      return { games, day, error: null as string | null };
    } catch (e) {
      return { games: [] as SportGame[], day: "", error: e instanceof Error ? e.message : "Unknown" };
    }
  });

// Standings — longer TTL.
export const getStandings = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string }) => d)
  .handler(async ({ data }) => {
    try {
      // Try the "standings" endpoint which returns groups/children.
      const raw = (await apiGet(`/${data.sportPath}/standings`, 60 * 60_000)) as any;
      const groups: { name: string; rows: StandingRow[] }[] = [];

      function pushRows(name: string, entries: any[]) {
        const rows: StandingRow[] = entries.map((e: any) => {
          const stats: any[] = e?.stats ?? [];
          const stat = (k: string) =>
            stats.find((s: any) => s?.name === k || s?.type === k || s?.shortDisplayName === k);
          const num = (k: string) => {
            const s = stat(k);
            const v = s?.value;
            return typeof v === "number" ? v : null;
          };
          const str = (k: string) => {
            const s = stat(k);
            return s?.displayValue ?? null;
          };
          return {
            teamId: String(e?.team?.id ?? ""),
            team: e?.team?.displayName ?? e?.team?.name ?? "",
            abbr: e?.team?.abbreviation ?? "",
            logo: e?.team?.logos?.[0]?.href ?? e?.team?.logo ?? null,
            wins: num("wins") ?? 0,
            losses: num("losses") ?? 0,
            ties: num("ties"),
            otLosses: num("otLosses"),
            pct: num("winPercent"),
            gamesBack: str("gamesBehind"),
            pointsFor: num("pointsFor") ?? num("pointsForPerGame"),
            pointsAgainst: num("pointsAgainst") ?? num("pointsAgainstPerGame"),
            streak: str("streak"),
            conference: null,
            division: null,
          };
        });
        groups.push({ name, rows });
      }

      // Shape 1: { children: [{ name, standings: { entries } }] }
      if (Array.isArray(raw?.children)) {
        for (const c of raw.children) {
          const entries = c?.standings?.entries ?? [];
          if (entries.length) pushRows(c.name ?? "Standings", entries);
        }
      }
      // Shape 2: { standings: { entries } } (single table; common for MLS/soccer)
      if (!groups.length && raw?.standings?.entries?.length) {
        pushRows("Standings", raw.standings.entries);
      }

      return { groups, error: null as string | null };
    } catch (e) {
      return { groups: [] as { name: string; rows: StandingRow[] }[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });

// News — longer TTL.
export const getSportNews = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string; limit?: number }) => d)
  .handler(async ({ data }) => {
    try {
      const limit = data.limit ?? 40;
      const raw = (await apiGet(`/${data.sportPath}/news?limit=${limit}`, 15 * 60_000)) as any;
      const articles: any[] = raw?.articles ?? [];
      const items: NewsItem[] = articles.slice(0, limit).map((a: any) => {
        const cats: any[] = a?.categories ?? [];
        const primaryCat = cats.find((c) => c?.type === "league" || c?.description)?.description
          ?? cats[0]?.description ?? null;
        return {
          id: String(a.id ?? a.dataSourceIdentifier ?? a.headline),
          headline: a.headline ?? a.title ?? "",
          description: a.description ?? "",
          publishedAt: a.published ?? a.lastModified ?? "",
          image: a.images?.[0]?.url ?? null,
          link: a.links?.web?.href ?? a.links?.mobile?.href ?? "",
          category: primaryCat,
          byline: a.byline ?? null,
          type: a.type ?? null,
          premium: !!a.premium,
        };
      });
      return { items, error: null as string | null };
    } catch (e) {
      return { items: [] as NewsItem[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });

// Today's headline games across every sport — for the home hub.
export const getMultiSportToday = createServerFn({ method: "GET" })
  .inputValidator((d: { sports: { path: string; league: string }[] }) => d)
  .handler(async ({ data }) => {
    const out: Record<string, SportGame[]> = {};
    await Promise.all(
      data.sports.map(async (s) => {
        try {
          const raw = (await apiGet(`/${s.path}/scoreboard`, 60_000)) as any;
          const events: any[] = raw?.events ?? [];
          out[s.league] = events.slice(0, 6).map((e) => mapEvent(e, s.league));
        } catch {
          out[s.league] = [];
        }
      }),
    );
    const hasLive = Object.values(out).flat().some((g) => g.status === "in");
    setEdgeCache(hasLive);
    return { byLeague: out };
  });

// ───────────── COMPETITION TEAMS + LEADERS ─────────────
export type CompetitionTeamDTO = {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  color: string | null;
  location: string | null;
};

export const getCompetitionTeams = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(`/${data.sportPath}/teams`, 24 * 60 * 60_000)) as any;
      const buckets: any[] = raw?.sports?.[0]?.leagues?.[0]?.teams ?? [];
      const teams: CompetitionTeamDTO[] = buckets.map((b: any) => {
        const t = b?.team ?? {};
        return {
          id: String(t.id ?? ""),
          name: t.displayName ?? t.name ?? "",
          shortName: t.shortDisplayName ?? t.nickname ?? t.name ?? "",
          abbr: t.abbreviation ?? "",
          logo: t.logos?.[0]?.href ?? t.logo ?? null,
          color: t.color ? `#${t.color}` : null,
          location: t.location ?? null,
        };
      });
      teams.sort((a, b) => a.name.localeCompare(b.name));
      return { teams, error: null as string | null };
    } catch (e) {
      return { teams: [] as CompetitionTeamDTO[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });

export type CompetitionLeaderDTO = {
  category: string;
  displayName: string;
  leaders: {
    rank: number;
    athlete: string;
    team: string | null;
    teamLogo: string | null;
    value: string;
  }[];
};

export const getCompetitionLeaders = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(`/${data.sportPath}/leaders`, 60 * 60_000)) as any;
      const cats: any[] = raw?.leaders?.categories ?? raw?.categories ?? [];
      const out: CompetitionLeaderDTO[] = cats.map((c: any) => ({
        category: c?.name ?? "",
        displayName: c?.displayName ?? c?.name ?? "",
        leaders: (c?.leaders ?? []).slice(0, 10).map((l: any, i: number) => ({
          rank: i + 1,
          athlete: l?.athlete?.displayName ?? l?.displayName ?? "",
          team: l?.team?.displayName ?? l?.team?.name ?? null,
          teamLogo: l?.team?.logos?.[0]?.href ?? l?.team?.logo ?? null,
          value: l?.displayValue ?? String(l?.value ?? ""),
        })),
      })).filter((c) => c.leaders.length > 0);
      return { categories: out, error: null as string | null };
    } catch (e) {
      return { categories: [] as CompetitionLeaderDTO[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });


