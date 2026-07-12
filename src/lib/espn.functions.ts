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
    athleteId: string | null;
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
          athleteId: l?.athlete?.id ? String(l.athlete.id) : null,
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


// ───────────── SINGLE COMPETITION TEAM ─────────────
export type CompetitionTeamDetailDTO = {
  id: string;
  name: string;
  displayName: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  color: string | null;
  location: string | null;
  venue: string | null;
  record: string | null;
  standingSummary: string | null;
  nextEvent: {
    id: string;
    date: string;
    name: string;
    shortName: string;
    homeAway: string | null;
    opponent: string | null;
  } | null;
};

export const getCompetitionTeam = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string; teamId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(
        `/${data.sportPath}/teams/${data.teamId}`,
        6 * 60 * 60_000,
      )) as any;
      const t = raw?.team ?? {};
      const nextEv = t?.nextEvent?.[0];
      const nextComp = nextEv?.competitions?.[0];
      const opp = nextComp?.competitors?.find((c: any) => String(c?.id) !== String(t.id));
      const team: CompetitionTeamDetailDTO = {
        id: String(t.id ?? data.teamId),
        name: t.name ?? "",
        displayName: t.displayName ?? t.name ?? "",
        shortName: t.shortDisplayName ?? t.nickname ?? t.name ?? "",
        abbr: t.abbreviation ?? "",
        logo: t.logos?.[0]?.href ?? t.logo ?? null,
        color: t.color ? `#${t.color}` : null,
        location: t.location ?? null,
        venue: t?.franchise?.venue?.fullName ?? t?.venue?.fullName ?? null,
        record: t?.record?.items?.[0]?.summary ?? null,
        standingSummary: t?.standingSummary ?? null,
        nextEvent: nextEv
          ? {
              id: String(nextEv?.id ?? ""),
              date: nextEv?.date ?? "",
              name: nextEv?.name ?? "",
              shortName: nextEv?.shortName ?? "",
              homeAway: nextComp?.competitors?.find((c: any) => String(c?.id) === String(t.id))?.homeAway ?? null,
              opponent: opp?.team?.displayName ?? opp?.team?.name ?? null,
            }
          : null,
      };
      return { team, error: null as string | null };
    } catch (e) {
      return { team: null as CompetitionTeamDetailDTO | null, error: e instanceof Error ? e.message : "Unknown" };
    }
  });



// ───────────── SINGLE COMPETITION PLAYER ─────────────
export type CompetitionPlayerDTO = {
  id: string;
  displayName: string;
  fullName: string;
  jersey: string | null;
  position: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  headshot: string | null;
  citizenship: string | null;
  team: { id: string; name: string; logo: string | null } | null;
  stats: { label: string; value: string }[];
};

export const getCompetitionPlayer = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string; playerId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(
        `/${data.sportPath}/athletes/${data.playerId}`,
        6 * 60 * 60_000,
      )) as any;
      const a = raw?.athlete ?? raw?.items?.[0] ?? {};
      const teamRaw = a?.team ?? null;
      const statsRaw: any[] =
        a?.statistics?.splits?.categories?.[0]?.stats ??
        a?.statistics?.categories?.[0]?.stats ??
        [];
      const player: CompetitionPlayerDTO = {
        id: String(a?.id ?? data.playerId),
        displayName: a?.displayName ?? a?.fullName ?? "",
        fullName: a?.fullName ?? a?.displayName ?? "",
        jersey: a?.jersey ? String(a.jersey) : null,
        position: a?.position?.displayName ?? a?.position?.name ?? null,
        age: typeof a?.age === "number" ? a.age : null,
        height: a?.displayHeight ?? null,
        weight: a?.displayWeight ?? null,
        headshot: a?.headshot?.href ?? null,
        citizenship: a?.citizenship ?? a?.birthPlace?.country ?? null,
        team: teamRaw
          ? {
              id: String(teamRaw?.id ?? ""),
              name: teamRaw?.displayName ?? teamRaw?.name ?? "",
              logo: teamRaw?.logos?.[0]?.href ?? teamRaw?.logo ?? null,
            }
          : null,
        stats: statsRaw.slice(0, 12).map((s: any) => ({
          label: s?.displayName ?? s?.name ?? "",
          value: s?.displayValue ?? String(s?.value ?? ""),
        })),
      };
      return { player, error: null as string | null };
    } catch (e) {
      return {
        player: null as CompetitionPlayerDTO | null,
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });


// ───────────── TEAM RUN IN A SPECIFIC SEASON / EDITION ─────────────
export type TeamSeasonMatch = {
  id: string;
  date: string;
  status: "pre" | "in" | "post";
  home: { id: string; name: string; logo: string | null; score: number | null; winner: boolean | null };
  away: { id: string; name: string; logo: string | null; score: number | null; winner: boolean | null };
  venue: string | null;
  round: string | null;
};

export type TeamSeasonDTO = {
  teamId: string;
  teamName: string;
  logo: string | null;
  year: number;
  matches: TeamSeasonMatch[];
  summary: { played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number };
};

export const getCompetitionTeamSeason = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string; teamId: string; year: number | string }) => ({
    sportPath: d.sportPath,
    teamId: String(d.teamId),
    year: Number(d.year),
  }))
  .handler(async ({ data }): Promise<{ season: TeamSeasonDTO | null; error: string | null }> => {
    try {
      const raw = (await apiGet(
        `/${data.sportPath}/teams/${data.teamId}/schedule?season=${data.year}`,
        60 * 60_000,
      )) as any;
      const teamRaw = raw?.team ?? {};
      const events = (raw?.events ?? []) as any[];
      const teamId = String(teamRaw?.id ?? data.teamId);
      const matches: TeamSeasonMatch[] = events.map((ev) => {
        const c = ev?.competitions?.[0] ?? {};
        const cs = c?.competitors ?? [];
        const h = cs.find((x: any) => x?.homeAway === "home") ?? cs[0] ?? {};
        const a = cs.find((x: any) => x?.homeAway === "away") ?? cs[1] ?? {};
        const state = c?.status?.type?.state ?? ev?.status?.type?.state ?? "pre";
        const parse = (x: any) => {
          const s = x?.score;
          if (s == null) return null;
          if (typeof s === "number") return Number.isFinite(s) ? s : null;
          if (typeof s === "string") { const n = Number(s); return Number.isFinite(n) ? n : null; }
          if (typeof s === "object") {
            if (typeof s.value === "number") return s.value;
            if (typeof s.displayValue === "string") { const n = Number(s.displayValue); return Number.isFinite(n) ? n : null; }
          }
          return null;
        };
        return {
          id: String(ev?.id ?? ""),
          date: ev?.date ?? "",
          status: (state === "in" ? "in" : state === "post" ? "post" : "pre") as "pre" | "in" | "post",
          home: {
            id: String(h?.team?.id ?? h?.id ?? ""),
            name: h?.team?.displayName ?? h?.team?.name ?? "",
            logo: h?.team?.logos?.[0]?.href ?? h?.team?.logo ?? null,
            score: parse(h),
            winner: typeof h?.winner === "boolean" ? h.winner : null,
          },
          away: {
            id: String(a?.team?.id ?? a?.id ?? ""),
            name: a?.team?.displayName ?? a?.team?.name ?? "",
            logo: a?.team?.logos?.[0]?.href ?? a?.team?.logo ?? null,
            score: parse(a),
            winner: typeof a?.winner === "boolean" ? a.winner : null,
          },
          venue: c?.venue?.fullName ?? ev?.venue?.fullName ?? null,
          round: ev?.season?.type?.name ?? ev?.week?.text ?? null,
        };
      });

      const summary = { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
      for (const m of matches) {
        if (m.status !== "post") continue;
        const isHome = m.home.id === teamId;
        const gf = isHome ? m.home.score : m.away.score;
        const ga = isHome ? m.away.score : m.home.score;
        if (gf == null || ga == null) continue;
        summary.played++;
        summary.goalsFor += gf;
        summary.goalsAgainst += ga;
        if (gf > ga) summary.wins++;
        else if (gf < ga) summary.losses++;
        else summary.draws++;
      }

      const season: TeamSeasonDTO = {
        teamId,
        teamName: teamRaw?.displayName ?? teamRaw?.name ?? "",
        logo: teamRaw?.logos?.[0]?.href ?? teamRaw?.logo ?? null,
        year: data.year,
        matches: matches.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime()),
        summary,
      };
      return { season, error: null };
    } catch (e) {
      return { season: null, error: e instanceof Error ? e.message : "Unknown" };
    }
  });


// ───────────── MATCH DETAIL / SUMMARY ─────────────
export type MatchSummaryTeam = {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  score: number | null;
  winner: boolean | null;
  record: string | null;
};

export type MatchGoalEvent = {
  minute: string;
  team: "home" | "away" | null;
  scorer: string;
  assist: string | null;
  type: string | null;
};

export type MatchSummaryDTO = {
  id: string;
  date: string;
  status: "pre" | "in" | "post";
  statusDetail: string;
  clock: string | null;
  venue: string | null;
  broadcast: string | null;
  league: string;
  home: MatchSummaryTeam;
  away: MatchSummaryTeam;
  goals: MatchGoalEvent[];
  attendance: number | null;
  officials: { name: string; role: string }[];
};

export const getCompetitionMatch = createServerFn({ method: "GET" })
  .inputValidator((d: { sportPath: string; matchId: string }) => d)
  .handler(async ({ data }): Promise<{ match: MatchSummaryDTO | null; error: string | null }> => {
    try {
      const raw = (await apiGet(
        `/${data.sportPath}/summary?event=${data.matchId}`,
        30_000,
      )) as any;
      const header = raw?.header ?? {};
      const c = header?.competitions?.[0] ?? {};
      const cs = c?.competitors ?? [];
      const homeRaw = cs.find((x: any) => x?.homeAway === "home") ?? cs[0] ?? {};
      const awayRaw = cs.find((x: any) => x?.homeAway === "away") ?? cs[1] ?? {};
      const state = c?.status?.type?.state ?? "pre";
      const parseScore = (x: any) => {
        const s = x?.score;
        if (s == null) return null;
        const n = typeof s === "number" ? s : Number(s);
        return Number.isFinite(n) ? n : null;
      };
      const mapTeam = (t: any): MatchSummaryTeam => ({
        id: String(t?.team?.id ?? t?.id ?? ""),
        name: t?.team?.displayName ?? t?.team?.name ?? "",
        shortName: t?.team?.shortDisplayName ?? t?.team?.name ?? "",
        abbr: t?.team?.abbreviation ?? "",
        logo: t?.team?.logos?.[0]?.href ?? t?.team?.logo ?? null,
        score: parseScore(t),
        winner: typeof t?.winner === "boolean" ? t.winner : null,
        record: t?.record?.[0]?.summary ?? null,
      });
      const home = mapTeam(homeRaw);
      const away = mapTeam(awayRaw);

      // Goals from key events / details
      const details: any[] = raw?.plays ?? raw?.commentary ?? c?.details ?? [];
      const goals: MatchGoalEvent[] = [];
      for (const d of details) {
        const isGoal =
          d?.scoringPlay === true ||
          d?.type?.text?.toLowerCase?.().includes("goal") ||
          d?.type?.id === "70" ||
          d?.type?.id === "98";
        if (!isGoal) continue;
        const teamId = String(d?.team?.id ?? "");
        const side = teamId === home.id ? "home" : teamId === away.id ? "away" : null;
        goals.push({
          minute: d?.clock?.displayValue ?? d?.time?.displayValue ?? "",
          team: side,
          scorer:
            d?.athletesInvolved?.[0]?.displayName ??
            d?.participants?.[0]?.athlete?.displayName ??
            d?.text ??
            "Goal",
          assist:
            d?.athletesInvolved?.[1]?.displayName ??
            d?.participants?.[1]?.athlete?.displayName ??
            null,
          type: d?.type?.text ?? null,
        });
      }

      const officialsRaw: any[] = raw?.gameInfo?.officials ?? c?.officials ?? [];
      const officials = officialsRaw.map((o: any) => ({
        name: o?.displayName ?? o?.fullName ?? "",
        role: o?.position?.displayName ?? o?.position?.name ?? "Official",
      }));

      const attendance =
        typeof raw?.gameInfo?.attendance === "number" ? raw.gameInfo.attendance : null;

      const match: MatchSummaryDTO = {
        id: String(header?.id ?? data.matchId),
        date: c?.date ?? header?.date ?? "",
        status: (state === "in" ? "in" : state === "post" ? "post" : "pre") as "pre" | "in" | "post",
        statusDetail: c?.status?.type?.shortDetail ?? c?.status?.type?.description ?? "",
        clock: c?.status?.displayClock ?? null,
        venue: c?.venue?.fullName ?? raw?.gameInfo?.venue?.fullName ?? null,
        broadcast: c?.broadcasts?.[0]?.names?.join(", ") ?? null,
        league: header?.league?.name ?? "",
        home,
        away,
        goals,
        attendance,
        officials,
      };
      return { match, error: null };
    } catch (e) {
      return { match: null, error: e instanceof Error ? e.message : "Unknown" };
    }
  });
