import { createServerFn } from "@tanstack/react-start";
import { isCuratedLeague, BILATERAL_SERIES_IDS } from "./cricket-leagues";

// ESPN's public cricket API. Cricket is structured per-series:
//   /cricket/{seriesId}/scoreboard
//   /cricket/{seriesId}/summary?event={eventId}
//   /cricket/{seriesId}/news
// No public ICC rankings or per-team roster endpoint — we derive squads
// and recent form from event data itself.

const BASE = "https://site.api.espn.com/apis/site/v2/sports/cricket";


type CacheEntry = { at: number; ttl: number; data: unknown };
const cache = new Map<string, CacheEntry>();

async function apiGet(path: string, ttlMs: number): Promise<unknown> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;
  const res = await fetch(`${BASE}${path}`, {
    headers: { "user-agent": "lovable-sports-archive/1.0" },
  });
  if (!res.ok) throw new Error(`ESPN cricket ${res.status} for ${path}`);
  const json = await res.json();
  cache.set(path, { at: Date.now(), ttl: ttlMs, data: json });
  return json;
}

// ───────── DTOs ─────────

export type CricketInnings = {
  period: number;       // 1..4 (Tests have up to 4)
  runs: number;
  wickets: number;
  overs: number;        // 18.4 etc
  isBatting: boolean;
  description: string;  // "complete" / "live" / "declared"
};

export type CricketTeam = {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  color: string | null;
  countryCode: string | null;
  /** Compact innings string ESPN provides, e.g. "161/5 (18/20 ov, target 156)" */
  scoreSummary: string | null;
  winner: boolean | null;
  innings: CricketInnings[];
  /** Sum of runs across innings — handy for sort/display fallback */
  totalRuns: number;
};

export type CricketMatch = {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueAbbr: string;
  /** "league" = curated franchise/tournament (IPL, BBL, T20WC…); "bilateral" = international tour (NZ v ENG…) */
  kind: "league" | "bilateral";
  startTs: number;            // ms
  status: "pre" | "in" | "post";
  statusDetail: string;       // "Stumps · Day 2" / "Live · 12.3 ov" / "FT"
  shortDetail: string;
  description: string;        // "Final, T20I at Ahmedabad"
  format: "T20" | "ODI" | "Test" | "T10" | "List A" | "FC" | string;
  venue: string | null;
  city: string | null;
  country: string | null;
  broadcast: string | null;
  isNeutralSite: boolean;
  home: CricketTeam;
  away: CricketTeam;
  /** Toss / result blurb */
  note: string | null;
};


export type CricketNewsItem = {
  id: string;
  headline: string;
  description: string;
  publishedAt: string;
  image: string | null;
  link: string;
};

// ───────── mappers ─────────

function mapInnings(linescores: any[] | undefined): CricketInnings[] {
  if (!Array.isArray(linescores)) return [];
  return linescores
    .filter((l) => l && (l.runs != null || l.wickets != null))
    .map((l) => ({
      period: Number(l.period ?? 0),
      runs: Number(l.runs ?? 0),
      wickets: Number(l.wickets ?? 0),
      overs: Number(l.overs ?? 0),
      isBatting: Boolean(l.isBatting),
      description: String(l.description ?? ""),
    }));
}

function mapTeam(c: any): CricketTeam {
  const t = c?.team ?? {};
  const innings = mapInnings(c?.linescores);
  return {
    id: String(t.id ?? ""),
    name: t.displayName ?? t.name ?? "",
    shortName: t.shortDisplayName ?? t.abbreviation ?? t.name ?? "",
    abbr: t.abbreviation ?? "",
    logo: t.logo ?? t.logos?.[0]?.href ?? null,
    color: t.color ? (String(t.color).startsWith("#") ? t.color : `#${t.color}`) : null,
    countryCode: t.countryCode ?? null,
    scoreSummary: typeof c?.score === "string" ? c.score : null,
    winner: c?.winner === "true" || c?.winner === true ? true : c?.winner === false ? false : null,
    innings,
    totalRuns: innings.reduce((s, i) => s + (i.runs || 0), 0),
  };
}

function mapMatch(e: any, league: { id: string; name: string; abbr: string }): CricketMatch {
  const comp = e?.competitions?.[0] ?? {};
  const competitors: any[] = comp.competitors ?? [];
  const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0] ?? {};
  const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1] ?? {};
  const stateRaw = e?.status?.type?.state ?? comp?.status?.type?.state ?? "pre";
  const completed = e?.status?.type?.completed ?? comp?.status?.type?.completed;
  let status: CricketMatch["status"] = "pre";
  if (completed) status = "post";
  else if (stateRaw === "in" || stateRaw === "post") status = stateRaw as CricketMatch["status"];

  const broadcast =
    comp?.broadcasts?.[0]?.names?.join(", ") ??
    comp?.geoBroadcasts?.[0]?.media?.shortName ??
    null;

  const venue = comp?.venue?.fullName ?? null;
  const city = comp?.venue?.address?.city ?? null;
  const country = comp?.venue?.address?.country ?? null;

  // Note: ESPN puts result/toss in status.type.description or comp.notes
  const note =
    comp?.notes?.[0]?.headline ??
    e?.status?.type?.description ??
    null;

  return {
    id: String(e.id ?? comp.id ?? ""),
    leagueId: league.id,
    leagueName: league.name,
    leagueAbbr: league.abbr,
    kind: isCuratedLeague(league.id) ? "league" : "bilateral",
    startTs: e.date ? new Date(e.date).getTime() : 0,

    status,
    statusDetail: e?.status?.type?.detail ?? e?.status?.type?.description ?? "",
    shortDetail: e?.status?.type?.shortDetail ?? "",
    description: e?.description ?? comp?.description ?? "",
    format: comp?.class?.eventType ?? comp?.class?.generalClassCard ?? "",
    venue,
    city,
    country,
    broadcast,
    isNeutralSite: Boolean(comp?.neutralSite),
    home: mapTeam(home),
    away: mapTeam(away),
    note,
  };
}

// ───────── server functions ─────────

// Single-series scoreboard
export const getCricketScoreboard = createServerFn({ method: "GET" })
  .inputValidator((d: { leagueId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(`/${data.leagueId}/scoreboard`, 30_000)) as any;
      const leagueMeta = raw?.leagues?.[0] ?? {};
      const league = {
        id: String(leagueMeta.id ?? data.leagueId),
        name: leagueMeta.name ?? "",
        abbr: leagueMeta.abbreviation ?? "",
      };
      const events: any[] = raw?.events ?? [];
      const matches: CricketMatch[] = events.map((e) => mapMatch(e, league));
      matches.sort((a, b) => a.startTs - b.startTs);
      return { league, matches, error: null as string | null };
    } catch (e) {
      return {
        league: { id: data.leagueId, name: "", abbr: "" },
        matches: [] as CricketMatch[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// Multi-series aggregator for the homepage / hub.
// Always merges in ESPN's global cricket scoreboard so we never show stale
// data when a curated series id has rolled over to a new season.
export const getMultiCricketToday = createServerFn({ method: "GET" })
  .inputValidator((d: { leagueIds: string[] }) => d)
  .handler(async ({ data }) => {
    const seenIds = new Set<string>();
    const all: CricketMatch[] = [];

    // 1) Global scoreboard (covers live + soon + recent across all series).
    try {
      const raw = (await apiGet(`/scoreboard`, 30_000)) as any;
      const events: any[] = raw?.events ?? [];
      for (const e of events) {
        const lm = e?.league ?? e?.leagues?.[0] ?? raw?.leagues?.[0] ?? {};
        const league = {
          id: String(lm.id ?? "global"),
          name: lm.name ?? "Cricket",
          abbr: lm.abbreviation ?? "",
        };
        const m = mapMatch(e, league);
        if (!m.id || seenIds.has(m.id)) continue;
        seenIds.add(m.id);
        all.push(m);
      }
    } catch {
      /* fall through to curated */
    }

    // 2) Curated series + a capped set of active bilateral tours.
    // Cloudflare Workers cap outbound subrequests (~50/invocation); 491 in
    // parallel hangs the hub, so we fan out in bounded batches.
    const MAX_BILATERAL = 30;
    const seriesToFetch = Array.from(
      new Set([...data.leagueIds, ...BILATERAL_SERIES_IDS.slice(0, MAX_BILATERAL)]),
    );

    const CONCURRENCY = 8;
    const results: CricketMatch[][] = [];
    for (let i = 0; i < seriesToFetch.length; i += CONCURRENCY) {
      const batch = seriesToFetch.slice(i, i + CONCURRENCY);
      const part = await Promise.all(
        batch.map(async (id) => {
          try {
            const raw = (await apiGet(`/${id}/scoreboard`, 30_000)) as any;
            const leagueMeta = raw?.leagues?.[0] ?? {};
            const league = {
              id: String(leagueMeta.id ?? id),
              name: leagueMeta.name ?? "",
              abbr: leagueMeta.abbreviation ?? "",
            };
            const events: any[] = raw?.events ?? [];
            return events.map((e) => mapMatch(e, league));
          } catch {
            return [] as CricketMatch[];
          }
        }),
      );
      results.push(...part);
    }
    for (const list of results) {
      for (const m of list) {
        if (!m.id || seenIds.has(m.id)) continue;
        seenIds.add(m.id);
        all.push(m);
      }
    }

    all.sort((a, b) => a.startTs - b.startTs);
    return { matches: all };
  });

// Per-match detail (full scorecard + rosters)
export type CricketBatter = {
  id: string;
  name: string;
  shortName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  dismissal: string | null;
  notOut: boolean;
};
export type CricketBowler = {
  id: string;
  name: string;
  shortName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
};
export type CricketInningsDetail = {
  period: number;
  battingTeamId: string;
  battingTeamName: string;
  runs: number;
  wickets: number;
  overs: number;
  extras: number | null;
  batters: CricketBatter[];
  bowlers: CricketBowler[];
  fallOfWickets: { wicket: number; score: number; player: string; over: number | null }[];
};

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Flatten ESPN's nested `statistics.categories[].stats[]` into a name→value map. */
function flattenStats(node: any): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  const cats: any[] = node?.statistics?.categories ?? [];
  for (const c of cats) {
    for (const s of c?.stats ?? []) {
      if (!s?.name) continue;
      const raw = s.value ?? s.displayValue;
      const nn = Number(raw);
      out[s.name] = Number.isFinite(nn) ? nn : String(raw ?? "");
    }
  }
  return out;
}
function nVal(stats: Record<string, number | string>, key: string): number {
  const v = stats[key];
  return typeof v === "number" ? v : Number(v) || 0;
}
function sVal(stats: Record<string, number | string>, key: string): string {
  const v = stats[key];
  return v == null ? "" : String(v);
}

export const getCricketMatchDetail = createServerFn({ method: "GET" })
  .inputValidator((d: { leagueId: string; eventId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(
        `/${data.leagueId}/summary?event=${data.eventId}`,
        20_000,
      )) as any;

      // Build the base match dto
      const evt = raw?.header ?? {};
      const leagueMeta = raw?.header?.league ?? raw?.leagues?.[0] ?? {};
      const league = {
        id: String(leagueMeta.id ?? data.leagueId),
        name: leagueMeta.name ?? "",
        abbr: leagueMeta.abbreviation ?? "",
      };

      // header has competitions[0].competitors
      const comp = evt?.competitions?.[0] ?? {};
      const competitors: any[] = comp.competitors ?? [];
      const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0] ?? {};
      const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1] ?? {};

      const stateRaw = evt?.status?.type?.state ?? "pre";
      const completed = evt?.status?.type?.completed;
      let status: CricketMatch["status"] = "pre";
      if (completed) status = "post";
      else if (stateRaw === "in" || stateRaw === "post") status = stateRaw as CricketMatch["status"];

      const note =
        raw?.notes?.[0]?.headline ??
        evt?.status?.type?.description ??
        null;

      const baseMatch: CricketMatch = {
        id: String(evt.id ?? data.eventId),
        leagueId: league.id,
        leagueName: league.name,
        leagueAbbr: league.abbr,
        kind: isCuratedLeague(league.id) ? "league" : "bilateral",
        startTs: comp?.date ? new Date(comp.date).getTime() : 0,

        status,
        statusDetail: evt?.status?.type?.detail ?? "",
        shortDetail: evt?.status?.type?.shortDetail ?? "",
        description: comp?.description ?? "",
        format: comp?.class?.eventType ?? "",
        venue: raw?.gameInfo?.venue?.fullName ?? comp?.venue?.fullName ?? null,
        city: raw?.gameInfo?.venue?.address?.city ?? null,
        country: raw?.gameInfo?.venue?.address?.country ?? null,
        broadcast: comp?.broadcasts?.[0]?.names?.join(", ") ?? null,
        isNeutralSite: Boolean(comp?.neutralSite),
        home: mapTeam(home),
        away: mapTeam(away),
        note,
      };

      // Innings detail — ESPN nests per-player stats inside
      //   roster[i].linescores[periodIdx].linescores[*].statistics.categories[*].stats[*]
      // We flatten per (team, period) and classify batter vs bowler by stat presence.
      type PerPlayer = {
        athlete: any;
        stats: Record<string, number | string>;
        node: any;
      };
      type PeriodBucket = {
        period: number;
        byTeam: Map<string, { teamName: string; players: PerPlayer[] }>;
      };
      const periodMap = new Map<number, PeriodBucket>();
      const rosters: any[] = Array.isArray(raw?.rosters) ? raw.rosters : [];

      for (const r of rosters) {
        const teamId = String(r?.team?.id ?? "");
        const teamName = r?.team?.displayName ?? r?.team?.name ?? "";
        const list = Array.isArray(r?.roster) ? r.roster : [];
        for (const p of list) {
          const athlete = p?.athlete ?? {};
          const perPlayerLs: any[] = Array.isArray(p?.linescores) ? p.linescores : [];
          for (const periodEntry of perPlayerLs) {
            const period = num(periodEntry?.period) || 1;
            const inner: any[] = Array.isArray(periodEntry?.linescores) ? periodEntry.linescores : [];
            for (const node of inner) {
              const stats = flattenStats(node);
              if (!Object.keys(stats).length) continue;
              let bucket = periodMap.get(period);
              if (!bucket) {
                bucket = { period, byTeam: new Map() };
                periodMap.set(period, bucket);
              }
              let team = bucket.byTeam.get(teamId);
              if (!team) {
                team = { teamName, players: [] };
                bucket.byTeam.set(teamId, team);
              }
              team.players.push({ athlete, stats, node });
            }
          }
        }
      }

      const innings: CricketInningsDetail[] = [];
      const sortedPeriods = Array.from(periodMap.values()).sort((a, b) => a.period - b.period);
      for (const bucket of sortedPeriods) {
        // Batting team = whichever side has players with `batted === 1` or `ballsFaced > 0`.
        let battingTeamId = "";
        for (const [tid, t] of bucket.byTeam) {
          if (t.players.some((p) => nVal(p.stats, "batted") > 0 || nVal(p.stats, "ballsFaced") > 0 || nVal(p.stats, "outs") + nVal(p.stats, "notouts") > 0)) {
            battingTeamId = tid;
            break;
          }
        }
        if (!battingTeamId) battingTeamId = bucket.byTeam.keys().next().value ?? "";

        const batSide = bucket.byTeam.get(battingTeamId);
        const battingTeamName = batSide?.teamName ?? "";
        const batters: CricketBatter[] = [];
        if (batSide) {
          for (const p of batSide.players) {
            const batted = nVal(p.stats, "batted");
            const balls = nVal(p.stats, "ballsFaced");
            const runs = nVal(p.stats, "runs");
            const notouts = nVal(p.stats, "notouts");
            const outs = nVal(p.stats, "outs");
            if (!batted && balls === 0 && runs === 0 && !notouts && !outs) continue;
            const sr = nVal(p.stats, "strikeRate");
            const dismissalText: string | null =
              p.node?.batting?.outDetails?.shortText ??
              p.node?.batting?.outDetails?.details?.shortText ??
              null;
            batters.push({
              id: String(p.athlete.id ?? ""),
              name: p.athlete.displayName ?? p.athlete.fullName ?? "",
              shortName: p.athlete.shortName || p.athlete.lastName || p.athlete.displayName || "",
              runs,
              balls,
              fours: nVal(p.stats, "fours"),
              sixes: nVal(p.stats, "sixes"),
              strikeRate: sr || (balls > 0 ? Number(((runs * 100) / balls).toFixed(2)) : 0),
              dismissal: dismissalText,
              notOut: notouts > 0 || (batted > 0 && outs === 0),
            });
          }
        }

        const bowlers: CricketBowler[] = [];
        for (const [tid, t] of bucket.byTeam) {
          if (tid === battingTeamId) continue;
          for (const p of t.players) {
            const overs = nVal(p.stats, "overs");
            const wickets = nVal(p.stats, "wickets");
            const conceded = nVal(p.stats, "conceded");
            const maidens = nVal(p.stats, "maidens");
            const inningsBowled = nVal(p.stats, "inningsBowled");
            if (overs === 0 && wickets === 0 && conceded === 0 && !inningsBowled) continue;
            const econ = nVal(p.stats, "economyRate");
            bowlers.push({
              id: String(p.athlete.id ?? ""),
              name: p.athlete.displayName ?? p.athlete.fullName ?? "",
              shortName: p.athlete.shortName || p.athlete.lastName || p.athlete.displayName || "",
              overs,
              maidens,
              runs: conceded,
              wickets,
              economy: econ || (overs > 0 ? Number((conceded / overs).toFixed(2)) : 0),
            });
          }
        }

        // Totals — prefer the team-line for this period when available
        const teamComp = competitors.find((c: any) => String(c?.team?.id ?? "") === battingTeamId);
        const line = (teamComp?.linescores ?? []).find((l: any) => num(l.period) === bucket.period);
        innings.push({
          period: bucket.period,
          battingTeamId,
          battingTeamName,
          runs: line ? num(line.runs) : batters.reduce((acc, b) => acc + b.runs, 0),
          wickets: line ? num(line.wickets) : batters.filter((b) => !b.notOut).length,
          overs: line ? num(line.overs) : 0,
          extras: null,
          batters,
          bowlers,
          fallOfWickets: [],
        });
        // silence unused helper warning
        void sVal;
      }


      // Commentary / scoring plays (recent first; cap to 20)
      const commentaryRaw: any[] = Array.isArray(raw?.commentary)
        ? raw.commentary
        : Array.isArray(raw?.scoringPlays)
        ? raw.scoringPlays
        : [];
      const commentary = commentaryRaw.slice(0, 30).map((p: any) => ({
        text: p?.text ?? p?.shortText ?? "",
        period: num(p?.period?.number ?? p?.period),
        scoreValue: num(p?.scoreValue),
        time: p?.clock?.displayValue ?? p?.time ?? "",
      }));

      return {
        match: baseMatch,
        innings,
        commentary,
        error: null as string | null,
      };
    } catch (e) {
      return {
        match: null as CricketMatch | null,
        innings: [] as CricketInningsDetail[],
        commentary: [] as { text: string; period: number; scoreValue: number; time: string }[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// News
export const getCricketNews = createServerFn({ method: "GET" })
  .inputValidator((d: { leagueId?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const path = data.leagueId ? `/${data.leagueId}/news` : `/8048/news`;
      const raw = (await apiGet(path, 30 * 60_000)) as any;
      const articles: any[] = raw?.articles ?? [];
      const items: CricketNewsItem[] = articles.slice(0, 18).map((a: any) => ({
        id: String(a.id ?? a.headline),
        headline: a.headline ?? "",
        description: a.description ?? "",
        publishedAt: a.published ?? "",
        image: a.images?.[0]?.url ?? null,
        link: a.links?.web?.href ?? a.links?.mobile?.href ?? "",
      }));
      return { items, error: null as string | null };
    } catch (e) {
      return {
        items: [] as CricketNewsItem[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ═══════════════════════════════════════════════════════════════
// Batch 1 — extended endpoints
// ═══════════════════════════════════════════════════════════════

import rankingsJson from "@/data/cricket/rankings.json";
import { CRICKET_LEAGUES, CRICKET_LEAGUE_BY_ID } from "./cricket-leagues";

// ───────── Series list / detail ─────────

export type CricketSeriesSummary = {
  id: string;
  slug: string;
  label: string;
  longName: string;
  emoji: string;
  format: string;
  group: string;
  tagline: string;
  liveCount: number;
  upcomingCount: number;
  nextStartTs: number | null;
};

export const getCricketSeriesList = createServerFn({ method: "GET" })
  .handler(async () => {
    const results = await Promise.all(
      CRICKET_LEAGUES.map(async (l) => {
        let live = 0;
        let upcoming = 0;
        let next: number | null = null;
        try {
          const raw = (await apiGet(`/${l.id}/scoreboard`, 5 * 60_000)) as any;
          const events: any[] = raw?.events ?? [];
          const now = Date.now();
          for (const e of events) {
            const state = e?.status?.type?.state;
            const ts = e?.date ? new Date(e.date).getTime() : 0;
            if (state === "in") live++;
            else if (state === "pre" && ts > now) {
              upcoming++;
              if (next == null || ts < next) next = ts;
            }
          }
        } catch { /* ignore */ }
        const summary: CricketSeriesSummary = {
          id: l.id, slug: l.slug, label: l.label, longName: l.longName,
          emoji: l.emoji, format: l.format, group: l.group, tagline: l.tagline,
          liveCount: live, upcomingCount: upcoming, nextStartTs: next,
        };
        return summary;
      }),
    );
    return { series: results };
  });

export type CricketSeriesDetail = {
  league: { id: string; name: string; abbr: string; meta: typeof CRICKET_LEAGUES[number] | null };
  matches: CricketMatch[];
  standings: { teamId: string; team: string; abbr: string; logo: string | null; played: number; won: number; lost: number; pts: number }[];
  topScorers: { name: string; team: string; runs: number }[];
  topWicketTakers: { name: string; team: string; wickets: number }[];
  error: string | null;
};

export const getCricketSeriesDetail = createServerFn({ method: "GET" })
  .inputValidator((d: { leagueId: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await apiGet(`/${data.leagueId}/scoreboard`, 60_000)) as any;
      const leagueMeta = raw?.leagues?.[0] ?? {};
      const league = {
        id: String(leagueMeta.id ?? data.leagueId),
        name: leagueMeta.name ?? "",
        abbr: leagueMeta.abbreviation ?? "",
        meta: CRICKET_LEAGUE_BY_ID[data.leagueId] ?? null,
      };
      const events: any[] = raw?.events ?? [];
      const matches = events.map((e) => mapMatch(e, league)).sort((a, b) => a.startTs - b.startTs);

      // Derive simple standings from completed matches
      const tbl = new Map<string, { teamId: string; team: string; abbr: string; logo: string | null; played: number; won: number; lost: number; pts: number }>();
      for (const m of matches) {
        if (m.status !== "post") continue;
        for (const t of [m.home, m.away]) {
          const row = tbl.get(t.id) ?? { teamId: t.id, team: t.name, abbr: t.abbr, logo: t.logo, played: 0, won: 0, lost: 0, pts: 0 };
          row.played++;
          if (t.winner === true) { row.won++; row.pts += 2; }
          else if (t.winner === false) row.lost++;
          tbl.set(t.id, row);
        }
      }
      const standings = Array.from(tbl.values()).sort((a, b) => b.pts - a.pts || b.won - a.won);

      return {
        league, matches, standings,
        topScorers: [] as CricketSeriesDetail["topScorers"],
        topWicketTakers: [] as CricketSeriesDetail["topWicketTakers"],
        error: null as string | null,
      };
    } catch (e) {
      return {
        league: { id: data.leagueId, name: "", abbr: "", meta: CRICKET_LEAGUE_BY_ID[data.leagueId] ?? null },
        matches: [], standings: [], topScorers: [], topWicketTakers: [],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── Teams ─────────

export type CricketTeamSummary = {
  id: string;
  name: string;
  abbr: string;
  logo: string | null;
  color: string | null;
  leagueId: string;
  leagueLabel: string;
};

export const getCricketTeamsForLeague = createServerFn({ method: "GET" })
  .inputValidator((d: { leagueId: string }) => d)
  .handler(async ({ data }) => {
    const seen = new Map<string, CricketTeamSummary>();
    try {
      const raw = (await apiGet(`/${data.leagueId}/scoreboard`, 10 * 60_000)) as any;
      const leagueMeta = raw?.leagues?.[0] ?? {};
      const leagueLabel = leagueMeta.abbreviation ?? leagueMeta.name ?? data.leagueId;
      const events: any[] = raw?.events ?? [];
      for (const e of events) {
        const comp = e?.competitions?.[0] ?? {};
        for (const c of comp.competitors ?? []) {
          const t = c?.team ?? {};
          const id = String(t.id ?? "");
          if (!id || seen.has(id)) continue;
          seen.set(id, {
            id,
            name: t.displayName ?? t.name ?? "",
            abbr: t.abbreviation ?? "",
            logo: t.logo ?? t.logos?.[0]?.href ?? null,
            color: t.color ? (String(t.color).startsWith("#") ? t.color : `#${t.color}`) : null,
            leagueId: data.leagueId,
            leagueLabel,
          });
        }
      }
    } catch { /* swallow */ }
    return { teams: Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name)) };
  });

// ───────── Player (best-effort: ESPN athlete summary) ─────────

export type CricketCareerStat = {
  format: string;       // "Test" / "ODI" / "T20I" / "IPL"
  matches: number | null;
  runs: number | null;
  battingAvg: number | null;
  strikeRate: number | null;
  hundreds: number | null;
  fifties: number | null;
  highScore: string | null;
  wickets: number | null;
  bowlingAvg: number | null;
  economy: number | null;
  bestBowling: string | null;
};

export type CricketPlayerProfile = {
  id: string;
  name: string;
  shortName: string;
  headshot: string | null;
  team: string | null;
  teamLogo: string | null;
  country: string | null;
  flag: string | null;
  position: string | null;
  batStyle: string | null;
  bowlStyle: string | null;
  dob: string | null;
  age: number | null;
  birthPlace: string | null;
  jersey: string | null;
  description: string | null;
  career: CricketCareerStat[];
  error: string | null;
};

function numOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}


function parseAthleteStats(raw: any): CricketCareerStat[] {
  // ESPN shapes vary. Try a few well-known shapes; fall back to empty.
  const out: CricketCareerStat[] = [];
  const splits: any[] = raw?.athlete?.statistics?.splits
    ?? raw?.statistics?.splits
    ?? raw?.athlete?.careerStats
    ?? raw?.careerStats
    ?? [];
  for (const s of splits) {
    const stats = s?.stats ?? s?.values ?? {};
    const get = (k: string) =>
      Array.isArray(stats)
        ? num(stats.find((x: any) => x?.name === k || x?.abbreviation === k)?.value)
        : num(stats?.[k]);
    out.push({
      format: s?.displayName ?? s?.name ?? s?.type ?? "—",
      matches: get("matches") ?? get("M") ?? get("games"),
      runs: get("runs") ?? get("R"),
      battingAvg: get("battingAverage") ?? get("Ave") ?? get("avg"),
      strikeRate: get("battingStrikeRate") ?? get("SR") ?? get("strikeRate"),
      hundreds: get("hundreds") ?? get("100s"),
      fifties: get("fifties") ?? get("50s"),
      highScore: (Array.isArray(stats)
        ? stats.find((x: any) => x?.name === "highScore" || x?.abbreviation === "HS")?.displayValue
        : stats?.highScore) ?? null,
      wickets: get("wickets") ?? get("W"),
      bowlingAvg: get("bowlingAverage") ?? get("bowlAvg"),
      economy: get("economy") ?? get("Econ"),
      bestBowling: (Array.isArray(stats)
        ? stats.find((x: any) => x?.name === "bestBowling" || x?.abbreviation === "BBI")?.displayValue
        : stats?.bestBowling) ?? null,
    });
  }
  return out;
}

function ageFromDob(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export const getCricketPlayer = createServerFn({ method: "GET" })
  .inputValidator((d: { athleteId: string; leagueId?: string }) => d)
  .handler(async ({ data }) => {
    try {
      // ESPN's working public athlete endpoint (cricket): site.web.api common/v3
      const url = `https://site.web.api.espn.com/apis/common/v3/sports/cricket/athletes/${data.athleteId}`;
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) {
        return {
          profile: null as CricketPlayerProfile | null,
          error: `ESPN ${res.status}`,
        };
      }
      const raw = (await res.json()) as any;
      const a = raw?.athlete ?? raw ?? {};
      const team = a?.team ?? {};
      const bat = Array.isArray(a.batStyle) ? a.batStyle[0]?.description : a.batStyle?.description ?? a.batStyle;
      const bowl = Array.isArray(a.bowlStyle) ? a.bowlStyle[0]?.description : a.bowlStyle?.description ?? a.bowlStyle;
      // displayDOB is dd/mm/yyyy
      let dob: string | null = null;
      if (typeof a.displayDOB === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(a.displayDOB)) {
        const [dd, mm, yy] = a.displayDOB.split("/");
        dob = `${yy}-${mm}-${dd}`;
      } else if (a.dateOfBirth) {
        dob = String(a.dateOfBirth);
      }
      // Stats endpoint (often empty for cricket, but try)
      let career: CricketCareerStat[] = [];
      try {
        const sres = await fetch(`https://site.web.api.espn.com/apis/common/v3/sports/cricket/athletes/${data.athleteId}/stats`);
        if (sres.ok) {
          const sjson = await sres.json();
          career = parseAthleteStats(sjson);
        }
      } catch { /* ignore */ }

      const profile: CricketPlayerProfile = {
        id: String(a.id ?? data.athleteId),
        name: a.displayName ?? a.fullName ?? "",
        shortName: a.shortName ?? a.lastName ?? "",
        headshot: a.headshot?.href ?? null,
        team: team.displayName ?? team.name ?? team.location ?? null,
        teamLogo: team.logos?.[0]?.href ?? team.logo ?? null,
        country: team.displayName ?? team.location ?? a.citizenship ?? null,
        flag: a.flag?.href ?? null,
        position: a.position?.displayName ?? a.position?.name ?? null,
        batStyle: bat ?? null,
        bowlStyle: bowl ?? null,
        dob,
        age: typeof a.age === "number" ? a.age : ageFromDob(dob),
        birthPlace: [a.birthPlace?.city, a.birthPlace?.country].filter(Boolean).join(", ") || null,
        jersey: a.jersey ?? null,
        description: a.description ?? a.bio ?? null,
        career,
        error: null,
      };
      return { profile };
    } catch (e) {
      return {
        profile: null as CricketPlayerProfile | null,
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });



// ───────── Rankings (bundled fallback) ─────────

export type CricketRankings = typeof rankingsJson;

export const getCricketRankings = createServerFn({ method: "GET" })
  .handler(async () => {
    return { rankings: rankingsJson as CricketRankings };
  });

// ───────── Bilateral / international tours ─────────
// Groups uncurated ESPN tour series (e.g. "England in New Zealand 2026")
// into tour buckets derived from the global cricket scoreboard.

export type BilateralTour = {
  id: string;          // ESPN leagueId
  name: string;        // "England tour of New Zealand" — best-guess label
  abbr: string;
  format: string;      // T20I / ODI / Test (most common in the tour)
  teams: { id: string; name: string; abbr: string; logo: string | null; flag: string | null }[];
  liveCount: number;
  upcomingCount: number;
  finishedCount: number;
  nextStartTs: number | null;
  lastStartTs: number | null;
};

function deriveTourName(matches: CricketMatch[]): string {
  // Prefer ESPN-provided league name if it doesn't look like a series id
  const lname = matches[0]?.leagueName?.trim();
  if (lname && lname.length > 3 && !/^\d+$/.test(lname)) return lname;
  // Fallback — derive from teams
  const teamSet = new Set<string>();
  for (const m of matches) {
    if (m.home.name) teamSet.add(m.home.name);
    if (m.away.name) teamSet.add(m.away.name);
  }
  const arr = Array.from(teamSet);
  if (arr.length === 2) return `${arr[0]} vs ${arr[1]}`;
  if (arr.length > 2) return `${arr.slice(0, 3).join(", ")} tri-series`;
  return matches[0]?.description || "International series";
}

export const getBilateralSeriesList = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const raw = (await apiGet(`/scoreboard`, 5 * 60_000)) as any;
      const events: any[] = raw?.events ?? [];
      const tours = new Map<string, CricketMatch[]>();
      for (const e of events) {
        const lm = e?.league ?? e?.leagues?.[0] ?? raw?.leagues?.[0] ?? {};
        const league = {
          id: String(lm.id ?? "global"),
          name: lm.name ?? "Cricket",
          abbr: lm.abbreviation ?? "",
        };
        if (isCuratedLeague(league.id)) continue;
        const m = mapMatch(e, league);
        const arr = tours.get(league.id) ?? [];
        arr.push(m);
        tours.set(league.id, arr);
      }

      const now = Date.now();
      const result: BilateralTour[] = [];
      for (const [id, ms] of tours) {
        ms.sort((a, b) => a.startTs - b.startTs);
        const teamMap = new Map<string, BilateralTour["teams"][number]>();
        for (const m of ms) {
          for (const t of [m.home, m.away]) {
            if (!t.id) continue;
            if (!teamMap.has(t.id)) {
              teamMap.set(t.id, {
                id: t.id, name: t.name, abbr: t.abbr, logo: t.logo, flag: t.logo,
              });
            }
          }
        }
        const fmtCounts: Record<string, number> = {};
        for (const m of ms) {
          const f = (m.format || "").toUpperCase();
          fmtCounts[f] = (fmtCounts[f] ?? 0) + 1;
        }
        const fmt = Object.entries(fmtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
        const upcoming = ms.filter((m) => m.status === "pre" && m.startTs > now);
        const live = ms.filter((m) => m.status === "in");
        const finished = ms.filter((m) => m.status === "post");
        result.push({
          id,
          name: deriveTourName(ms),
          abbr: ms[0]?.leagueAbbr ?? "",
          format: fmt,
          teams: Array.from(teamMap.values()),
          liveCount: live.length,
          upcomingCount: upcoming.length,
          finishedCount: finished.length,
          nextStartTs: upcoming[0]?.startTs ?? null,
          lastStartTs: finished[finished.length - 1]?.startTs ?? null,
        });
      }
      // Sort: live first, then by next upcoming
      result.sort((a, b) => {
        if (a.liveCount !== b.liveCount) return b.liveCount - a.liveCount;
        const an = a.nextStartTs ?? Number.POSITIVE_INFINITY;
        const bn = b.nextStartTs ?? Number.POSITIVE_INFINITY;
        return an - bn;
      });
      return { tours: result, error: null as string | null };
    } catch (e) {
      return { tours: [] as BilateralTour[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });


