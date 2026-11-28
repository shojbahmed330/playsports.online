import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { isCuratedLeague, BILATERAL_SERIES_IDS } from "./cricket-leagues";
import {
  getCatalogueSeriesLabel,
  getRelevantSeriesIds,
  getSeriesHubIds,
} from "./cricket-catalogue";

function setEdgeCache(hasLive: boolean) {
  try {
    setResponseHeader(
      "Cache-Control",
      hasLive
        ? "public, s-maxage=20, stale-while-revalidate=60"
        : "public, s-maxage=120, stale-while-revalidate=300",
    );
  } catch {}
}


// ESPN's public cricket API. Cricket is structured per-series:
//   /cricket/{seriesId}/scoreboard
//   /cricket/{seriesId}/summary?event={eventId}
//   /cricket/{seriesId}/news
// No public ICC rankings or per-team roster endpoint â€” we derive squads
// and recent form from event data itself.

const BASE = "https://site.api.espn.com/apis/site/v2/sports/cricket";


import { cachedFetch } from "@/lib/sports-cache";

async function apiGet(path: string, ttlMs: number): Promise<unknown> {
  return cachedFetch<unknown>(
    { key: `espn:cricket:${path}`, sport: "cricket", category: "raw", ttlMs },
    async () => {
      const res = await fetch(`${BASE}${path}`, {
        headers: { "user-agent": "lovable-sports-archive/1.0" },
      });
      if (!res.ok) throw new Error(`ESPN cricket ${res.status} for ${path}`);
      return res.json();
    },
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ DTOs â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CricketInnings = {
  period: number;       // 1..4 (Tests have up to 4)
  runs: number;
  wickets: number;
  overs: number;        // 18.4 etc
  isBatting: boolean;
  description: string;  // "complete" / "live" / "declared"
};

/** Parsed representation of ESPN's compact score string. */
export type ParsedScoreInnings = {
  runs: number;
  wickets: number;       // 0..10 (10 = all out)
  overs: number | null;  // may not be present in the summary string
  declared: boolean;
  allOut: boolean;       // wickets===10 OR "all out" in the string
};
export type ParsedScore = {
  innings: ParsedScoreInnings[];
  totalRuns: number;
  didNotBat: boolean;    // "DNB", "Yet to bat"
  raw: string | null;
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
  /** Sum of runs across innings â€” handy for sort/display fallback */
  totalRuns: number;
  /** Parsed from `scoreSummary` â€” trustworthy top-line (never fabricates /0). */
  parsedScore: ParsedScore;
};

/** Human-readable result derived from ESPN status/note fields (post matches only). */
export type CricketResult = {
  kind: "runs" | "wickets" | "innings" | "dls" | "tie" | "no-result" | "abandoned" | "draw" | "unknown";
  winnerAbbr: string | null;
  marginText: string; // "England won by 10 wickets" / "No result" / ...
};

export type CricketMatch = {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueAbbr: string;
  /** "league" = curated franchise/tournament (IPL, BBL, T20WCâ€¦); "bilateral" = international tour (NZ v ENGâ€¦) */
  kind: "league" | "bilateral";
  startTs: number;            // ms
  status: "pre" | "in" | "post";
  statusDetail: string;       // "Stumps Â· Day 2" / "Live Â· 12.3 ov" / "FT"
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
  /** Derived result summary (post matches only). */
  result: CricketResult | null;
  /** True when the feed reports a completed match but has no numeric scores at all. */
  dataIncomplete: boolean;
};



export type CricketNewsItem = {
  id: string;
  headline: string;
  description: string;
  publishedAt: string;
  image: string | null;
  link: string;
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ mappers â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Parse ESPN's compact score string into structured innings.
 * Examples:
 *  "172"              â†’ 1 innings, allOut unknown â†’ treated as allOut when no /w
 *  "172/8"            â†’ 1 innings, 172 for 8
 *  "172/8d"           â†’ 1 innings, declared
 *  "45/0"             â†’ 1 innings, 45 for 0
 *  "172 all out"      â†’ 1 innings, allOut=true, wickets=10
 *  "172 & 210/4d"     â†’ 2 innings (Tests)
 *  "DNB" / ""         â†’ didNotBat=true
 */
export function parseScoreSummary(input: string | null | undefined): ParsedScore {
  const raw = (input ?? "").trim();
  if (!raw || /^(dnb|yet to bat|â€”|-)$/i.test(raw)) {
    return { innings: [], totalRuns: 0, didNotBat: true, raw: raw || null };
  }
  const parts = raw.split(/\s*&\s*/);
  const innings: ParsedScoreInnings[] = [];
  for (const part of parts) {
    // Strip trailing overs like "(48.3 ov)" or "(18/20 ov, target 156)"
    const core = part.replace(/\s*\(.*$/, "").trim();
    // "172 all out" / "172 a.o."
    const allOutMatch = /^(\d+)\s*(?:all\s*out|a\.?o\.?)$/i.exec(core);
    if (allOutMatch) {
      innings.push({
        runs: Number(allOutMatch[1]),
        wickets: 10,
        overs: null,
        declared: false,
        allOut: true,
      });
      continue;
    }
    // "172/8" or "172/8d"
    const rw = /^(\d+)\s*\/\s*(\d+)(d)?/i.exec(core);
    if (rw) {
      const wickets = Number(rw[2]);
      innings.push({
        runs: Number(rw[1]),
        wickets,
        overs: null,
        declared: Boolean(rw[3]),
        allOut: wickets >= 10,
      });
      continue;
    }
    // Bare "172" â†’ in cricket a bare number in a completed match means all out.
    const bare = /^(\d+)$/.exec(core);
    if (bare) {
      innings.push({
        runs: Number(bare[1]),
        wickets: 10,
        overs: null,
        declared: false,
        allOut: true,
      });
      continue;
    }
    // Unparseable â†’ keep going but don't invent numbers
  }
  const totalRuns = innings.reduce((s, i) => s + i.runs, 0);
  return { innings, totalRuns, didNotBat: innings.length === 0, raw };
}

/** Merge linescore innings with parsed summary â€” parsed summary always wins. */
function mergeInnings(fromLinescore: CricketInnings[], parsed: ParsedScore): CricketInnings[] {
  const nonEmpty = fromLinescore.filter((l) => l.runs > 0 || l.wickets > 0 || l.overs > 0);
  if (parsed.innings.length > 0) {
    return parsed.innings.map((p, i) => {
      const match = nonEmpty.find((ls) => ls.runs === p.runs) ?? nonEmpty[i] ?? null;
      return {
        period: match?.period ?? i + 1,
        runs: p.runs,
        wickets: p.wickets,
        overs: p.overs ?? match?.overs ?? 0,
        isBatting: match?.isBatting ?? false,
        description: p.declared ? "declared" : p.allOut ? "all out" : "",
      };
    });
  }
  return nonEmpty;
}



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
  const rawInnings = mapInnings(c?.linescores);
  const scoreSummary = typeof c?.score === "string" ? c.score : null;
  const parsedScore = parseScoreSummary(scoreSummary);
  const innings = mergeInnings(rawInnings, parsedScore);
  return {
    id: String(t.id ?? ""),
    name: t.displayName ?? t.name ?? "",
    shortName: t.shortDisplayName ?? t.abbreviation ?? t.name ?? "",
    abbr: t.abbreviation ?? "",
    logo: t.logo ?? t.logos?.[0]?.href ?? null,
    color: t.color ? (String(t.color).startsWith("#") ? t.color : `#${t.color}`) : null,
    countryCode: t.countryCode ?? null,
    scoreSummary,
    winner: c?.winner === "true" || c?.winner === true ? true : c?.winner === false ? false : null,
    innings,
    totalRuns: innings.length > 0 ? innings.reduce((s, i) => s + (i.runs || 0), 0) : parsedScore.totalRuns,
    parsedScore,
  };
}

/**
 * Extract a human-readable result summary from ESPN's status description / notes.
 * Returns null for non-completed matches.
 */
export function deriveResult(args: {
  status: CricketMatch["status"];
  home: { abbr: string; name: string; winner: boolean | null };
  away: { abbr: string; name: string; winner: boolean | null };
  note: string | null;
  statusDescription: string | null;
}): CricketResult | null {
  if (args.status !== "post") return null;
  const text = [args.note, args.statusDescription].filter(Boolean).join(" Â· ").trim();
  const winnerTeam = args.home.winner === true ? args.home : args.away.winner === true ? args.away : null;
  const winnerAbbr = winnerTeam?.abbr || null;
  const lower = text.toLowerCase();

  if (!text) {
    return { kind: "unknown", winnerAbbr, marginText: winnerTeam ? `${winnerTeam.name} won` : "Result" };
  }
  if (/no\s*result/i.test(text)) return { kind: "no-result", winnerAbbr: null, marginText: "No result" };
  if (/abandon/i.test(text)) return { kind: "abandoned", winnerAbbr: null, marginText: "Match abandoned" };
  if (/^match\s+tied|tied$/i.test(text) || /\btied\b/i.test(text)) {
    return { kind: "tie", winnerAbbr: null, marginText: "Match tied" };
  }
  if (/\bdraw(n)?\b/i.test(text)) return { kind: "draw", winnerAbbr: null, marginText: "Match drawn" };

  const wkts = /won by (\d+)\s*wicket/i.exec(text);
  if (wkts) {
    return { kind: "wickets", winnerAbbr, marginText: text };
  }
  const runs = /won by (\d+)\s*run/i.exec(text);
  if (runs) {
    return { kind: "runs", winnerAbbr, marginText: text };
  }
  const innings = /won by an? innings/i.exec(text);
  if (innings) {
    return { kind: "innings", winnerAbbr, marginText: text };
  }
  if (/dls|duckworth/i.test(lower)) {
    return { kind: "dls", winnerAbbr, marginText: text };
  }
  return { kind: "unknown", winnerAbbr, marginText: text };
}

function computeDataIncomplete(status: CricketMatch["status"], home: CricketTeam, away: CricketTeam): boolean {
  if (status !== "post") return false;
  const empty = (t: CricketTeam) => t.innings.length === 0 && t.parsedScore.innings.length === 0;
  return empty(home) && empty(away);
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

  const homeTeam = mapTeam(home);
  const awayTeam = mapTeam(away);
  const result = deriveResult({
    status,
    home: { abbr: homeTeam.abbr, name: homeTeam.name, winner: homeTeam.winner },
    away: { abbr: awayTeam.abbr, name: awayTeam.name, winner: awayTeam.winner },
    note,
    statusDescription: e?.status?.type?.description ?? null,
  });

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
    home: homeTeam,
    away: awayTeam,
    note,
    result,
    dataIncomplete: computeDataIncomplete(status, homeTeam, awayTeam),
  };
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€ server functions â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    // Fan out curated leagues + only the bilateral series that are live or
    // near a match (from the generated catalogue). Fetching the first 30 IDs
    // in file order missed every current tour once those old England tours
    // finished; the catalogue keeps this list date-aware.
    const catalogueIds = getRelevantSeriesIds();
    const fallbackIds =
      catalogueIds.length > 0 ? catalogueIds : BILATERAL_SERIES_IDS.slice(0, 30);
    const seriesToFetch = Array.from(
      new Set([...data.leagueIds, ...fallbackIds]),
    );

    const CONCURRENCY = 16;
    const seriesTask = (async () => {
      const out: CricketMatch[][] = [];
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
        out.push(...part);
      }
      return out;
    })();

    const seriesLists = await seriesTask;

    for (const list of seriesLists) {
      for (const m of list) {
        if (!m.id || seenIds.has(m.id)) continue;
        seenIds.add(m.id);
        all.push(m);
      }
    }

    all.sort((a, b) => a.startTs - b.startTs);
    setEdgeCache(all.some((m) => m.status === "in"));
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

/** Flatten ESPN's nested `statistics.categories[].stats[]` into a nameâ†’value map. */
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
        10_000,
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

      const homeTeamMapped = mapTeam(home);
      const awayTeamMapped = mapTeam(away);
      const detailResult = deriveResult({
        status,
        home: { abbr: homeTeamMapped.abbr, name: homeTeamMapped.name, winner: homeTeamMapped.winner },
        away: { abbr: awayTeamMapped.abbr, name: awayTeamMapped.name, winner: awayTeamMapped.winner },
        note,
        statusDescription: evt?.status?.type?.description ?? null,
      });
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
        home: homeTeamMapped,
        away: awayTeamMapped,
        note,
        result: detailResult,
        dataIncomplete: computeDataIncomplete(status, homeTeamMapped, awayTeamMapped),
      };


      // Innings detail â€” ESPN nests per-player stats inside
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
            const batNode =
              p.node?.statistics?.batting ??
              p.node?.batting ??
              null;
            const od = batNode?.outDetails ?? null;
            const card: string = String(od?.dismissalCard ?? "").toLowerCase();
            const bowlerName: string =
              od?.bowler?.displayName ?? od?.bowler?.lastName ?? "";
            const fielderNames: string[] = Array.isArray(od?.fielders)
              ? od.fielders
                  .map((f: any) => f?.displayName ?? f?.lastName ?? "")
                  .filter(Boolean)
              : [];
            const buildFromCard = (): string | null => {
              if (!card) return null;
              if (card === "bowled") return bowlerName ? `b ${bowlerName}` : "bowled";
              if (card === "lbw") return bowlerName ? `lbw b ${bowlerName}` : "lbw";
              if (card === "caught" || card === "caughtfielder")
                return `c ${fielderNames[0] ?? "fielder"}${bowlerName ? ` b ${bowlerName}` : ""}`;
              if (card === "caughtkeeper" || card === "caught behind")
                return `c â€ ${fielderNames[0] ?? "wk"}${bowlerName ? ` b ${bowlerName}` : ""}`;
              if (card === "caught and bowled" || card === "caughtandbowled" || card === "caught & bowled")
                return bowlerName ? `c & b ${bowlerName}` : "c & b";
              if (card === "stumped") return `st â€ ${fielderNames[0] ?? "wk"}${bowlerName ? ` b ${bowlerName}` : ""}`;
              if (card === "run out" || card === "runout")
                return `run out${fielderNames.length ? ` (${fielderNames.join("/")})` : ""}`;
              if (card === "hit wicket" || card === "hitwicket")
                return bowlerName ? `hit wkt b ${bowlerName}` : "hit wicket";
              if (card === "retired hurt" || card === "retiredhurt") return "retired hurt";
              if (card === "retired not out") return "retired not out";
              if (card === "obstructing the field") return "obstructing the field";
              if (card === "handled the ball") return "handled the ball";
              if (card === "timed out" || card === "timedout") return "timed out";
              if (card === "hit the ball twice") return "hit the ball twice";
              return card;
            };
            const raw =
              od?.shortText ??
              od?.details?.shortText ??
              od?.text ??
              null;
            const cleaned = typeof raw === "string" ? raw.trim() : raw;
            const dismissalText: string | null =
              (cleaned && cleaned.length > 0 ? cleaned : null) ?? buildFromCard();
            const isNotOut =
              notouts > 0 ||
              (batted > 0 && outs === 0 && !dismissalText) ||
              card === "not out" ||
              card === "notout";
            batters.push({
              id: String(p.athlete.id ?? ""),
              name: p.athlete.displayName ?? p.athlete.fullName ?? "",
              shortName: p.athlete.shortName || p.athlete.lastName || p.athlete.displayName || "",
              runs,
              balls,
              fours: nVal(p.stats, "fours"),
              sixes: nVal(p.stats, "sixes"),
              strikeRate: sr || (balls > 0 ? Number(((runs * 100) / balls).toFixed(2)) : 0),
              dismissal: isNotOut ? "not out" : dismissalText,
              notOut: isNotOut,
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

        // Totals â€” prefer the team-line for this period when available
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Batch 1 â€” extended endpoints
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import rankingsJson from "@/data/cricket/rankings.json";
import { CRICKET_LEAGUES, CRICKET_LEAGUE_BY_ID } from "./cricket-leagues";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ Series list / detail â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ Teams â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ Player (best-effort: ESPN athlete summary) â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      format: s?.displayName ?? s?.name ?? s?.type ?? "â€”",
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

// Scrape ESPNcricinfo Statsguru "Career averages" tables â€” free, unlimited, no key.
// One row per format (Test=1, ODI=2, T20I=3) Ã— type (batting/bowling).
const STATSGURU_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36";

async function fetchStatsguruRow(
  playerId: string,
  cls: number,
  type: "batting" | "bowling",
): Promise<Record<string, string> | null> {
  const url = `https://stats.espncricinfo.com/ci/engine/player/${playerId}.html?class=${cls};template=results;type=${type}`;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": STATSGURU_UA,
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const tableRe = /<table[^>]*class="engineTable"[^>]*>([\s\S]*?)<\/table>/g;
    let m: RegExpExecArray | null;
    while ((m = tableRe.exec(html))) {
      const body = m[1];
      if (!/Career averages/i.test(body)) continue;
      const rows = [...body.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((r) =>
        [...r[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) =>
          c[1]
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/\s+/g, " ")
            .trim(),
        ),
      );
      if (rows.length < 2) return null;
      const header = rows[0];
      const data = rows[1];
      const obj: Record<string, string> = {};
      header.forEach((h, i) => { if (h) obj[h] = data[i] ?? ""; });
      return obj;
    }
  } catch { /* ignore */ }
  return null;
}

async function fetchStatsguruCareer(playerId: string): Promise<CricketCareerStat[]> {
  if (!/^\d+$/.test(playerId)) return [];
  const FORMATS = [
    { cls: 1, label: "Test" },
    { cls: 2, label: "ODI" },
    { cls: 3, label: "T20I" },
  ] as const;
  const tasks = FORMATS.flatMap((f) => [
    fetchStatsguruRow(playerId, f.cls, "batting").then((row) => ({ fmt: f.label, type: "batting" as const, row })),
    fetchStatsguruRow(playerId, f.cls, "bowling").then((row) => ({ fmt: f.label, type: "bowling" as const, row })),
  ]);
  const results = await Promise.all(tasks);
  const byFmt = new Map<string, CricketCareerStat>();
  for (const r of results) {
    if (!r.row) continue;
    const cur = byFmt.get(r.fmt) ?? {
      format: r.fmt,
      matches: null, runs: null, battingAvg: null, strikeRate: null,
      hundreds: null, fifties: null, highScore: null,
      wickets: null, bowlingAvg: null, economy: null, bestBowling: null,
    };
    const row = r.row;
    if (r.type === "batting") {
      cur.matches = numOrNull(row["Mat"]) ?? cur.matches;
      cur.runs = numOrNull(row["Runs"]);
      cur.battingAvg = numOrNull(row["Ave"]);
      cur.strikeRate = numOrNull(row["SR"]);
      cur.hundreds = numOrNull(row["100"]);
      cur.fifties = numOrNull(row["50"]);
      cur.highScore = row["HS"] || null;
    } else {
      if (cur.matches == null) cur.matches = numOrNull(row["Mat"]);
      cur.wickets = numOrNull(row["Wkts"]);
      cur.bowlingAvg = numOrNull(row["Ave"]);
      cur.economy = numOrNull(row["Econ"]);
      cur.bestBowling = row["BBI"] || row["BBM"] || null;
    }
    byFmt.set(r.fmt, cur);
  }
  const order = ["Test", "ODI", "T20I"];
  return [...byFmt.values()]
    .filter((c) => c.runs != null || c.wickets != null || (c.matches != null && c.matches > 0))
    .sort((a, b) => order.indexOf(a.format) - order.indexOf(b.format));
}

export async function fetchCricketPlayer(athleteId: string): Promise<{
  profile: CricketPlayerProfile | null;
  error: string | null;
}> {
  try {
    const url = `https://site.web.api.espn.com/apis/common/v3/sports/cricket/athletes/${athleteId}`;
    const [bioRes, career] = await Promise.all([
      fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(15_000) }),
      Promise.race([
        fetchStatsguruCareer(athleteId),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Career stats timed out")), 15_000),
        ),
      ]).catch(() => []),
    ]);
    if (!bioRes.ok) {
      return { profile: null, error: `ESPN ${bioRes.status}` };
    }
    const raw = (await bioRes.json()) as any;
    const a = raw?.athlete ?? raw ?? {};
    const team = a?.team ?? {};
    const bat = Array.isArray(a.batStyle) ? a.batStyle[0]?.description : a.batStyle?.description ?? a.batStyle;
    const bowl = Array.isArray(a.bowlStyle) ? a.bowlStyle[0]?.description : a.bowlStyle?.description ?? a.bowlStyle;
    let dob: string | null = null;
    if (typeof a.displayDOB === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(a.displayDOB)) {
      const [dd, mm, yy] = a.displayDOB.split("/");
      dob = `${yy}-${mm}-${dd}`;
    } else if (a.dateOfBirth) {
      dob = String(a.dateOfBirth);
    }
    const profile: CricketPlayerProfile = {
      id: String(a.id ?? athleteId),
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
    return { profile, error: null };
  } catch (e) {
    return { profile: null, error: e instanceof Error ? e.message : "Unknown" };
  }
}

export const getCricketPlayer = createServerFn({ method: "GET" })
  .inputValidator((d: { athleteId: string; leagueId?: string }) => d)
  .handler(async ({ data }) => fetchCricketPlayer(data.athleteId));

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ Athlete search (name â†’ id) â”€â”€â”€â”€â”€â”€â”€â”€â”€

const athleteSearchCache = new Map<string, { at: number; id: string | null }>();

export async function findCricketAthleteByName(rawName: string): Promise<string | null> {
  const name = rawName?.trim();
  if (!name) return null;
  const key = `v2:${name.toLowerCase()}`;
  const hit = athleteSearchCache.get(key);
  if (hit && Date.now() - hit.at < 24 * 60 * 60_000) {
    return hit.id;
  }

  async function tryUrl(url: string): Promise<string | null> {
    try {
      const r = await fetch(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(8_000),
      });
      if (!r.ok) return null;
      const j: any = await r.json();
      const found: string[] = [];
      const seen = new Set<unknown>();
      const walk = (node: any, parentSport?: string) => {
        if (!node || typeof node !== "object" || seen.has(node)) return;
        seen.add(node);
        const sport = String(node.sport ?? node.sportSlug ?? parentSport ?? "").toLowerCase();
        const type = String(node.type ?? node.kind ?? "").toLowerCase();
        const uid = typeof node.uid === "string" ? node.uid : "";
        const looksLikeAthlete =
          type.includes("player") ||
          type.includes("athlete") ||
          /~a:\d+/.test(uid);
        const uidId = uid.match(/~a:(\d+)/)?.[1] ?? null;
        const rawId = uidId ?? node.id ?? null;
        if (looksLikeAthlete && rawId && (!sport || sport.includes("cricket"))) {
          found.push(String(rawId));
        }
        for (const k of Object.keys(node)) {
          const v = (node as any)[k];
          if (Array.isArray(v)) v.forEach((x) => walk(x, sport || parentSport));
          else if (v && typeof v === "object") walk(v, sport || parentSport);
        }
      };
      walk(j);
      return found[0] ?? null;
    } catch {
      return null;
    }
  }

  const q = encodeURIComponent(name);
  const urls = [
    `https://site.web.api.espn.com/apis/search/v2?query=${q}&type=player&sport=cricket&limit=5`,
    `https://site.web.api.espn.com/apis/search/v2?query=${q}&type=player&limit=10`,
    `https://site.web.api.espn.com/apis/common/v3/search?query=${q}&limit=10`,
  ];
  let id: string | null = null;
  for (const u of urls) {
    id = await tryUrl(u);
    if (id) break;
  }
  if (id) athleteSearchCache.set(key, { at: Date.now(), id });
  return id;
}

export const findCricketAthlete = createServerFn({ method: "GET" })
  .inputValidator((d: { name: string }) => d)
  .handler(async ({ data }) => ({ athleteId: await findCricketAthleteByName(data.name) }));

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ Rankings (bundled fallback) â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type CricketRankings = typeof rankingsJson;

export const getCricketRankings = createServerFn({ method: "GET" })
  .handler(async () => {
    return { rankings: rankingsJson as CricketRankings };
  });

// â”€â”€â”€â”€â”€â”€â”€â”€â”€ Bilateral / international tours â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Groups uncurated ESPN tour series (e.g. "England in New Zealand 2026")
// into tour buckets derived from the global cricket scoreboard.

export type BilateralTour = {
  id: string;          // ESPN leagueId
  name: string;        // "England tour of New Zealand" â€” best-guess label
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
  // Fallback â€” derive from teams
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
      // ESPN has no working global cricket scoreboard (it returns 404), so
      // build the hub from the date-aware catalogue instead of a dead call.
      const ids = getSeriesHubIds();
      const CONCURRENCY = 8;
      const tours = new Map<string, CricketMatch[]>();

      for (let i = 0; i < ids.length; i += CONCURRENCY) {
        const batch = ids.slice(i, i + CONCURRENCY);
        const payloads = await Promise.all(
          batch.map(async (id) => {
            try {
              return { id, raw: (await apiGet(`/${id}/scoreboard`, 5 * 60_000)) as any };
            } catch {
              return { id, raw: null as any };
            }
          }),
        );
        for (const { id, raw } of payloads) {
          if (!raw || isCuratedLeague(id)) continue;
          const lm = raw?.leagues?.[0] ?? {};
          const league = {
            id,
            name: getCatalogueSeriesLabel(id) ?? lm.name ?? "Cricket",
            abbr: lm.abbreviation ?? "",
          };
          for (const e of raw?.events ?? []) {
            const m = mapMatch(e, league);
            const arr = tours.get(id) ?? [];
            arr.push(m);
            tours.set(id, arr);
          }
        }
      }

      const now = Date.now();
      const result: BilateralTour[] = [];
      const seenTourKeys = new Set<string>();
      for (const [id, ms] of tours) {
        ms.sort((a, b) => a.startTs - b.startTs);
        // ESPN exposes both a parent tour and its sub-series with the same
        // next event. Dedupe by the next match so the hub shows one card.
        const nextMatch =
          ms.find((m) => m.status === "in") ??
          ms.find((m) => m.status === "pre" && m.startTs > now) ??
          ms[ms.length - 1];
        const tourKey = nextMatch
          ? `${nextMatch.home.id}-${nextMatch.away.id}-${nextMatch.startTs}`
          : id;
        if (seenTourKeys.has(tourKey)) continue;
        seenTourKeys.add(tourKey);
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
          name: getCatalogueSeriesLabel(id) ?? deriveTourName(ms),
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


