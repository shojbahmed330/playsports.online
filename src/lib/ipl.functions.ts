import { createServerFn } from "@tanstack/react-start";
import franchises from "@/data/cricket/ipl/franchises.json";
import history from "@/data/cricket/ipl/history.json";

// IPL-specific server functions layered on top of ESPN's cricket API.
// Shapes mirror cricket.functions.ts so existing CricketMatchCard renders.

const BASE = "https://site.api.espn.com/apis/site/v2/sports/cricket";

// Known ESPN series IDs per IPL season. "current" is the alias 8048 that
// ESPN rolls over to the active season; we keep it first so getIplOverview
// always hits the live tournament without us touching code each year.
export const IPL_SEASON_IDS: { year: number | "current"; id: string }[] = [
  { year: "current", id: "8048" },
  { year: 2024, id: "1410320" },
  { year: 2023, id: "1345038" },
  { year: 2022, id: "1298423" },
  { year: 2021, id: "1249875" },
  { year: 2020, id: "1210595" },
  { year: 2019, id: "1165643" },
  { year: 2018, id: "1131611" },
  { year: 2017, id: "1078425" },
  { year: 2016, id: "968307" },
  { year: 2015, id: "791129" },
  { year: 2014, id: "695871" },
  { year: 2013, id: "586733" },
  { year: 2012, id: "520932" },
  { year: 2011, id: "418064" },
  { year: 2010, id: "374163" },
  { year: 2009, id: "313494" },
  { year: 2008, id: "313487" },
];

type CacheEntry = { at: number; ttl: number; data: unknown };
const cache = new Map<string, CacheEntry>();

async function apiGet(path: string, ttlMs: number): Promise<unknown> {
  const { cachedFetch } = await import("@/lib/sports-cache");
  return cachedFetch<unknown>(
    { key: `espn:ipl:${path}`, sport: "ipl", category: "raw", ttlMs },
    async () => {
      const res = await fetch(`${BASE}${path}`, {
        headers: { "user-agent": "lovable-sports-archive/1.0" },
      });
      if (!res.ok) throw new Error(`ESPN cricket ${res.status} for ${path}`);
      return res.json();
    },
  );
}

// ─── DTOs ─────────────────────────────────────────────

export type IplMatchLite = {
  id: string;
  startTs: number;
  status: "pre" | "in" | "post";
  statusDetail: string;
  shortDetail: string;
  description: string;
  venue: string | null;
  city: string | null;
  broadcast: string | null;
  home: IplTeamScore;
  away: IplTeamScore;
  note: string | null;
};

export type IplTeamScore = {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  color: string | null;
  scoreSummary: string | null;
  totalRuns: number;
  wickets: number;
  overs: number;
  winner: boolean | null;
};

export type IplStandingsRow = {
  teamId: string;
  teamName: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  played: number;
  wins: number;
  losses: number;
  ties: number;
  noResults: number;
  points: number;
  nrr: number;
  form: ("W" | "L" | "T" | "N")[];
};

export type IplLeader = {
  athleteId: string;
  athleteName: string;
  teamId: string;
  teamAbbr: string;
  teamName: string;
  headshot: string | null;
  value: number;
  displayValue: string;
  rank: number;
};

// ─── mappers ──────────────────────────────────────────

function mapTeamScore(c: any): IplTeamScore {
  const t = c?.team ?? {};
  const ls: any[] = Array.isArray(c?.linescores) ? c.linescores : [];
  const last = ls[ls.length - 1] ?? {};
  const totalRuns = ls.reduce((s, l) => s + Number(l?.runs ?? 0), 0);
  return {
    id: String(t.id ?? ""),
    name: t.displayName ?? t.name ?? "",
    shortName: t.shortDisplayName ?? t.abbreviation ?? t.name ?? "",
    abbr: t.abbreviation ?? "",
    logo: t.logo ?? t.logos?.[0]?.href ?? null,
    color: t.color ? (String(t.color).startsWith("#") ? t.color : `#${t.color}`) : null,
    scoreSummary: typeof c?.score === "string" ? c.score : null,
    totalRuns,
    wickets: Number(last?.wickets ?? 0),
    overs: Number(last?.overs ?? 0),
    winner: c?.winner === true || c?.winner === "true" ? true : c?.winner === false ? false : null,
  };
}

function mapMatch(e: any): IplMatchLite {
  const comp = e?.competitions?.[0] ?? {};
  const cs: any[] = comp?.competitors ?? [];
  const home = cs.find((c) => c.homeAway === "home") ?? cs[0] ?? {};
  const away = cs.find((c) => c.homeAway === "away") ?? cs[1] ?? {};
  const stateRaw = e?.status?.type?.state ?? "pre";
  const completed = e?.status?.type?.completed;
  let status: IplMatchLite["status"] = "pre";
  if (completed) status = "post";
  else if (stateRaw === "in" || stateRaw === "post") status = stateRaw;
  return {
    id: String(e.id ?? comp.id ?? ""),
    startTs: e?.date ? new Date(e.date).getTime() : 0,
    status,
    statusDetail: e?.status?.type?.detail ?? "",
    shortDetail: e?.status?.type?.shortDetail ?? "",
    description: e?.description ?? comp?.description ?? "",
    venue: comp?.venue?.fullName ?? null,
    city: comp?.venue?.address?.city ?? null,
    broadcast: comp?.broadcasts?.[0]?.names?.join(", ") ?? null,
    home: mapTeamScore(home),
    away: mapTeamScore(away),
    note: comp?.notes?.[0]?.headline ?? e?.status?.type?.description ?? null,
  };
}

function computeStandings(matches: IplMatchLite[]): IplStandingsRow[] {
  const rows = new Map<string, IplStandingsRow>();
  const ensure = (t: IplTeamScore): IplStandingsRow => {
    let r = rows.get(t.id);
    if (!r) {
      r = {
        teamId: t.id,
        teamName: t.name,
        shortName: t.shortName,
        abbr: t.abbr,
        logo: t.logo,
        played: 0,
        wins: 0,
        losses: 0,
        ties: 0,
        noResults: 0,
        points: 0,
        nrr: 0,
        form: [],
      };
      rows.set(t.id, r);
    }
    return r;
  };
  for (const m of matches) {
    if (m.status !== "post") continue;
    const h = ensure(m.home);
    const a = ensure(m.away);
    h.played++;
    a.played++;
    if (m.home.winner === true) {
      h.wins++; a.losses++;
      h.points += 2;
      h.form.unshift("W"); a.form.unshift("L");
    } else if (m.away.winner === true) {
      a.wins++; h.losses++;
      a.points += 2;
      a.form.unshift("W"); h.form.unshift("L");
    } else {
      h.ties++; a.ties++;
      h.points += 1; a.points += 1;
      h.form.unshift("T"); a.form.unshift("T");
    }
    h.form = h.form.slice(0, 5);
    a.form = a.form.slice(0, 5);
  }
  return Array.from(rows.values()).sort(
    (x, y) => y.points - x.points || y.wins - x.wins || y.nrr - x.nrr,
  );
}

function resolveSeasonId(year: number | "current"): string {
  return IPL_SEASON_IDS.find((s) => s.year === year)?.id ?? "8048";
}

// ─── server functions ────────────────────────────────

export const getIplSeason = createServerFn({ method: "GET" })
  .inputValidator((d: { year?: number | "current" }) => ({ year: d.year ?? "current" as const }))
  .handler(async ({ data }) => {
    const id = resolveSeasonId(data.year);
    try {
      const raw = (await apiGet(`/${id}/scoreboard`, 30_000)) as any;
      const events: any[] = raw?.events ?? [];
      const matches = events.map(mapMatch).sort((a, b) => a.startTs - b.startTs);
      return {
        year: data.year,
        seasonId: id,
        matches,
        standings: computeStandings(matches),
        error: null as string | null,
      };
    } catch (e) {
      return {
        year: data.year,
        seasonId: id,
        matches: [] as IplMatchLite[],
        standings: [] as IplStandingsRow[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

export const getIplOverview = createServerFn({ method: "GET" })
  .handler(async () => {
    const id = "8048";
    try {
      const raw = (await apiGet(`/${id}/scoreboard`, 30_000)) as any;
      const events: any[] = raw?.events ?? [];
      const matches = events.map(mapMatch).sort((a, b) => a.startTs - b.startTs);
      const live = matches.filter((m) => m.status === "in");
      const upcoming = matches.filter((m) => m.status === "pre");
      const finished = matches.filter((m) => m.status === "post");
      return {
        seasonId: id,
        seasonLabel: raw?.leagues?.[0]?.season?.displayName ?? raw?.leagues?.[0]?.name ?? "IPL",
        live,
        next: upcoming[0] ?? null,
        upcoming: upcoming.slice(0, 6),
        recent: finished.slice(-6).reverse(),
        standings: computeStandings(matches).slice(0, 10),
        error: null as string | null,
      };
    } catch (e) {
      return {
        seasonId: id,
        seasonLabel: "IPL",
        live: [] as IplMatchLite[],
        next: null as IplMatchLite | null,
        upcoming: [] as IplMatchLite[],
        recent: [] as IplMatchLite[],
        standings: [] as IplStandingsRow[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// Franchise registry — static JSON, exposed as a server fn so consumers
// share one cache key + can later swap to a live source without changes.
export const getIplTeams = createServerFn({ method: "GET" }).handler(async () => ({
  teams: franchises as typeof franchises,
}));

export const getIplHistory = createServerFn({ method: "GET" }).handler(async () => ({
  seasons: (history as typeof history).slice().sort((a, b) => b.year - a.year),
}));

// Per-team page: franchise meta + this season's fixtures involving the team.
export const getIplTeam = createServerFn({ method: "GET" })
  .inputValidator((d: { teamId: string; year?: number | "current" }) => ({
    teamId: d.teamId,
    year: d.year ?? "current" as const,
  }))
  .handler(async ({ data }) => {
    const team = (franchises as typeof franchises).find((t) => t.id === data.teamId);
    if (!team) return { team: null, fixtures: [] as IplMatchLite[], titles: [] as number[], error: "Team not found" };
    const seasonId = resolveSeasonId(data.year);
    let fixtures: IplMatchLite[] = [];
    try {
      const raw = (await apiGet(`/${seasonId}/scoreboard`, 30_000)) as any;
      const events: any[] = raw?.events ?? [];
      fixtures = events
        .map(mapMatch)
        .filter((m) => m.home.id === team.espnId || m.away.id === team.espnId)
        .sort((a, b) => a.startTs - b.startTs);
    } catch {
      /* ignore — empty fixtures */
    }
    return {
      team,
      fixtures,
      titles: team.titleYears,
      error: null as string | null,
    };
  });

export type IplSquadPlayer = {
  athleteId: string;
  name: string;
  headshot: string | null;
  position: string | null;
  jersey: string | null;
  appearances: number;
};

// Derive a squad list by scanning summaries of the current season for this team.
// ESPN cricket doesn't expose a stable roster endpoint, so we union athletes
// who took the field for the franchise across this season's completed matches.
export const getIplTeamSquad = createServerFn({ method: "GET" })
  .inputValidator((d: { teamId: string; year?: number | "current" }) => ({
    teamId: d.teamId,
    year: d.year ?? "current" as const,
  }))
  .handler(async ({ data }) => {
    const team = (franchises as typeof franchises).find((t) => t.id === data.teamId);
    if (!team) return { players: [] as IplSquadPlayer[] };
    const seasonId = resolveSeasonId(data.year);
    const ck = `__ipl_squad__${seasonId}_${team.espnId}`;
    const hit = cache.get(ck);
    if (hit && Date.now() - hit.at < hit.ttl) return hit.data as { players: IplSquadPlayer[] };

    let events: any[] = [];
    try {
      const raw = (await apiGet(`/${seasonId}/scoreboard`, 60_000)) as any;
      events = raw?.events ?? [];
    } catch {
      return { players: [] as IplSquadPlayer[] };
    }

    const teamEvents = events
      .filter((e) => {
        const cs = e?.competitions?.[0]?.competitors ?? [];
        return cs.some((c: any) => String(c?.team?.id) === team.espnId);
      })
      .filter((e) => e?.status?.type?.completed)
      .map((e) => String(e.id))
      .slice(0, 14);

    const agg = new Map<string, IplSquadPlayer>();
    const CONCURRENCY = 5;
    for (let i = 0; i < teamEvents.length; i += CONCURRENCY) {
      const batch = teamEvents.slice(i, i + CONCURRENCY);
      const parts = await Promise.all(
        batch.map(async (eid) => {
          try { return (await apiGet(`/${seasonId}/summary?event=${eid}`, 120_000)) as any; }
          catch { return null; }
        }),
      );
      for (const raw of parts) {
        if (!raw) continue;
        const rosters: any[] = Array.isArray(raw?.rosters) ? raw.rosters : [];
        for (const r of rosters) {
          if (String(r?.team?.id) !== team.espnId) continue;
          const list = Array.isArray(r?.roster) ? r.roster : [];
          for (const p of list) {
            const a = p?.athlete ?? {};
            const aid = String(a.id ?? "");
            if (!aid) continue;
            const hs = a?.headshot?.href ?? (typeof a?.headshot === "string" ? a.headshot : null);
            const existing = agg.get(aid);
            if (existing) existing.appearances += 1;
            else agg.set(aid, {
              athleteId: aid,
              name: a.displayName ?? a.fullName ?? a.shortName ?? "",
              headshot: hs ?? null,
              position: a?.position?.abbreviation ?? a?.position?.name ?? null,
              jersey: a?.jersey ?? null,
              appearances: 1,
            });
          }
        }
      }
    }

    const players = Array.from(agg.values()).sort(
      (a, b) => b.appearances - a.appearances || a.name.localeCompare(b.name),
    );
    const out = { players };
    cache.set(ck, { at: Date.now(), ttl: 10 * 60_000, data: out });
    return out;
  });

// Orange / Purple cap — derive from finished season matches by scanning
// per-match boxscore stats. Cached aggressively; ESPN has no season-leader
// endpoint for IPL.
export const getIplLeaders = createServerFn({ method: "GET" })
  .inputValidator((d: { year?: number | "current"; metric?: "runs" | "wickets" | "sixes" }) => ({
    year: d.year ?? "current" as const,
    metric: d.metric ?? "runs" as const,
  }))
  .handler(async ({ data }) => {
    const id = resolveSeasonId(data.year);
    const ck = `__ipl_leaders__${id}_${data.metric}`;
    const hit = cache.get(ck);
    if (hit && Date.now() - hit.at < hit.ttl) return hit.data as { leaders: IplLeader[]; year: typeof data.year };

    let events: any[] = [];
    try {
      const raw = (await apiGet(`/${id}/scoreboard`, 60_000)) as any;
      events = raw?.events ?? [];
    } catch {
      return { leaders: [] as IplLeader[], year: data.year };
    }

    // Cap per-invocation subrequests; Workers limit ≈ 50.
    const finishedIds = events
      .filter((e) => e?.status?.type?.completed)
      .map((e) => String(e.id))
      .slice(0, 40);

    const agg = new Map<string, { name: string; teamId: string; teamAbbr: string; teamName: string; headshot: string | null; value: number }>();

    const CONCURRENCY = 6;
    for (let i = 0; i < finishedIds.length; i += CONCURRENCY) {
      const batch = finishedIds.slice(i, i + CONCURRENCY);
      const parts = await Promise.all(
        batch.map(async (eid) => {
          try {
            return (await apiGet(`/${id}/summary?event=${eid}`, 120_000)) as any;
          } catch {
            return null;
          }
        }),
      );
      for (const raw of parts) {
        if (!raw) continue;
        const rosters: any[] = Array.isArray(raw?.rosters) ? raw.rosters : [];
        for (const r of rosters) {
          const team = r?.team ?? {};
          const teamId = String(team.id ?? "");
          const teamAbbr = team.abbreviation ?? "";
          const teamName = team.displayName ?? team.name ?? "";
          const list = Array.isArray(r?.roster) ? r.roster : [];
          for (const p of list) {
            const athlete = p?.athlete ?? {};
            const aid = String(athlete.id ?? "");
            if (!aid) continue;
            const perPlayerLs: any[] = Array.isArray(p?.linescores) ? p.linescores : [];
            let runs = 0, wickets = 0, sixes = 0;
            for (const period of perPlayerLs) {
              const inner: any[] = Array.isArray(period?.linescores) ? period.linescores : [];
              for (const node of inner) {
                const cats: any[] = node?.statistics?.categories ?? [];
                for (const c of cats) {
                  for (const s of c?.stats ?? []) {
                    const n = Number(s?.value);
                    if (!Number.isFinite(n)) continue;
                    if (s.name === "runs" && (nodeIsBatting(node))) runs += n;
                    else if (s.name === "wickets") wickets += n;
                    else if (s.name === "sixes") sixes += n;
                  }
                }
              }
            }
            const v = data.metric === "runs" ? runs : data.metric === "wickets" ? wickets : sixes;
            if (v <= 0) continue;
            const existing = agg.get(aid);
            const headshot = athlete?.headshot?.href ?? athlete?.headshot ?? null;
            if (existing) existing.value += v;
            else agg.set(aid, {
              name: athlete.displayName ?? athlete.fullName ?? "",
              teamId, teamAbbr, teamName,
              headshot: typeof headshot === "string" ? headshot : null,
              value: v,
            });
          }
        }
      }
    }

    const leaders: IplLeader[] = Array.from(agg.entries())
      .map(([aid, v]) => ({
        athleteId: aid,
        athleteName: v.name,
        teamId: v.teamId,
        teamAbbr: v.teamAbbr,
        teamName: v.teamName,
        headshot: v.headshot,
        value: v.value,
        displayValue: String(v.value),
        rank: 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((l, i) => ({ ...l, rank: i + 1 }));

    const out = { leaders, year: data.year };
    cache.set(ck, { at: Date.now(), ttl: 5 * 60_000, data: out });
    return out;
  });

// ─── Playoff brackets ────────────────────────────────
// Extract the IPL playoff stage (Qualifier 1, Eliminator, Qualifier 2, Final)
// from a given season by classifying match descriptions.
export type IplBracketMatch = {
  stage: "Qualifier 1" | "Eliminator" | "Qualifier 2" | "Final";
  match: IplMatchLite | null;
};

function classifyStage(desc: string): IplBracketMatch["stage"] | null {
  const d = desc.toLowerCase();
  if (/\bfinal\b/.test(d) && !/qualifier|eliminator/.test(d)) return "Final";
  if (/qualifier\s*1|1st\s*qualifier/.test(d)) return "Qualifier 1";
  if (/qualifier\s*2|2nd\s*qualifier/.test(d)) return "Qualifier 2";
  if (/eliminator/.test(d)) return "Eliminator";
  return null;
}

export const getIplPlayoffs = createServerFn({ method: "GET" })
  .inputValidator((d: { year?: number | "current" }) => ({ year: d.year ?? "current" as const }))
  .handler(async ({ data }) => {
    const id = resolveSeasonId(data.year);
    const ck = `__ipl_playoffs__${id}`;
    const hit = cache.get(ck);
    if (hit && Date.now() - hit.at < hit.ttl)
      return hit.data as { year: typeof data.year; bracket: IplBracketMatch[] };

    let matches: IplMatchLite[] = [];
    try {
      const raw = (await apiGet(`/${id}/scoreboard`, 60_000)) as any;
      matches = (raw?.events ?? []).map(mapMatch);
    } catch {
      return { year: data.year, bracket: [] as IplBracketMatch[] };
    }

    const slots: IplBracketMatch["stage"][] = ["Qualifier 1", "Eliminator", "Qualifier 2", "Final"];
    const bracket: IplBracketMatch[] = slots.map((stage) => ({ stage, match: null }));
    for (const m of matches) {
      const stage = classifyStage(m.description ?? "");
      if (!stage) continue;
      const slot = bracket.find((b) => b.stage === stage);
      if (slot && !slot.match) slot.match = m;
    }
    const out = { year: data.year, bracket };
    cache.set(ck, { at: Date.now(), ttl: 5 * 60_000, data: out });
    return out;
  });


// Distinguish a batting-side stat node from a bowling-side one so "runs"
// only counts runs scored (not runs conceded).
function nodeIsBatting(node: any): boolean {
  const cats: any[] = node?.statistics?.categories ?? [];
  for (const c of cats) {
    for (const s of c?.stats ?? []) {
      if (s.name === "ballsFaced" || s.name === "batted" || s.name === "notouts") return true;
      if (s.name === "ballsBowled" || s.name === "oversBowled" || s.name === "wickets") return false;
    }
  }
  return false;
}
