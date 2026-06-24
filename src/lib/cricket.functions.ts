import { createServerFn } from "@tanstack/react-start";

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

    // 2) Curated series — fills gaps and tags league nicely.
    const results = await Promise.all(
      data.leagueIds.map(async (id) => {
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
function pickStat(stats: any[] | undefined, keys: string[]): number {
  if (!Array.isArray(stats)) return 0;
  for (const k of keys) {
    const s = stats.find((x: any) => x?.name === k || x?.abbreviation === k);
    if (s) return num(s.value ?? s.displayValue);
  }
  return 0;
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

      // Innings detail comes from raw.rosters[].roster (batting + bowling)
      // and raw.scoringPlays / raw.commentary. ESPN's shape isn't documented;
      // we defensively extract what we find.
      const innings: CricketInningsDetail[] = [];
      const rosters: any[] = Array.isArray(raw?.rosters) ? raw.rosters : [];

      for (const r of rosters) {
        const teamId = String(r?.team?.id ?? "");
        const teamName = r?.team?.displayName ?? r?.team?.name ?? "";
        const period = num(r?.period) || innings.length + 1;
        const batters: CricketBatter[] = [];
        const bowlers: CricketBowler[] = [];

        const list = Array.isArray(r?.roster) ? r.roster : [];
        for (const p of list) {
          const athlete = p?.athlete ?? {};
          const stats: any[] = p?.stats ?? [];
          const battingStats = p?.batting ?? stats;
          const bowlingStats = p?.bowling ?? stats;

          const runs = pickStat(battingStats, ["runs", "R"]);
          const balls = pickStat(battingStats, ["ballsFaced", "balls", "BF"]);
          const fours = pickStat(battingStats, ["fours", "4s"]);
          const sixes = pickStat(battingStats, ["sixes", "6s"]);
          const dismissal = p?.dismissalText ?? p?.dismissal ?? null;
          const isBatter = balls > 0 || runs > 0 || !!dismissal;

          if (isBatter) {
            batters.push({
              id: String(athlete.id ?? ""),
              name: athlete.displayName ?? athlete.fullName ?? "",
              shortName: athlete.shortName ?? athlete.lastName ?? athlete.displayName ?? "",
              runs,
              balls,
              fours,
              sixes,
              strikeRate: balls > 0 ? Number(((runs * 100) / balls).toFixed(2)) : 0,
              dismissal,
              notOut: !dismissal && (runs > 0 || balls > 0),
            });
          }

          const oversBowled = pickStat(bowlingStats, ["overs", "O"]);
          const wickets = pickStat(bowlingStats, ["wickets", "W"]);
          const runsConceded = pickStat(bowlingStats, ["conceded", "runs", "R"]);
          const maidens = pickStat(bowlingStats, ["maidens", "M"]);
          if (oversBowled > 0 || wickets > 0) {
            bowlers.push({
              id: String(athlete.id ?? ""),
              name: athlete.displayName ?? athlete.fullName ?? "",
              shortName: athlete.shortName ?? athlete.lastName ?? athlete.displayName ?? "",
              overs: oversBowled,
              maidens,
              runs: runsConceded,
              wickets,
              economy: oversBowled > 0 ? Number((runsConceded / oversBowled).toFixed(2)) : 0,
            });
          }
        }

        // Totals — pull from team line for this period if available
        const teamComp = competitors.find((c: any) => String(c?.team?.id ?? "") === teamId);
        const line = (teamComp?.linescores ?? []).find((l: any) => num(l.period) === period);
        innings.push({
          period,
          battingTeamId: teamId,
          battingTeamName: teamName,
          runs: line ? num(line.runs) : batters.reduce((s, b) => s + b.runs, 0),
          wickets: line ? num(line.wickets) : 0,
          overs: line ? num(line.overs) : 0,
          extras: null,
          batters,
          bowlers,
          fallOfWickets: [],
        });
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
