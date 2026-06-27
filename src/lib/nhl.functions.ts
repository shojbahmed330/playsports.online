import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

const SITE = "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl";
const CORE = "https://site.web.api.espn.com/apis/common/v3/sports/hockey/nhl";
const STATS_BYATHLETE =
  "https://site.web.api.espn.com/apis/common/v3/sports/hockey/nhl/statistics/byathlete";

type CacheEntry = { at: number; ttl: number; data: unknown };
const cache = new Map<string, CacheEntry>();

async function get(url: string, ttlMs: number): Promise<unknown> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;
  const res = await fetch(url, { headers: { "user-agent": "lovable-nhl/1.0" } });
  if (!res.ok) throw new Error(`ESPN ${res.status} ${url}`);
  const json = await res.json();
  cache.set(url, { at: Date.now(), ttl: ttlMs, data: json });
  return json;
}

function setEdge(hasLive: boolean) {
  try {
    setResponseHeader(
      "Cache-Control",
      hasLive
        ? "public, s-maxage=20, stale-while-revalidate=60"
        : "public, s-maxage=120, stale-while-revalidate=300",
    );
  } catch {}
}

// ───────── DTOs ─────────
export type NhlTeam = {
  id: string;
  name: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  color: string | null;
  alt: string | null;
  location: string;
  record: string | null;
  venue: string | null;
  conference: string | null;
  division: string | null;
  standingSummary: string | null;
};

export type NhlRosterPlayer = {
  id: string;
  name: string;
  jersey: string | null;
  position: string | null;
  height: string | null;
  weight: string | null;
  age: number | null;
  headshot: string | null;
  experience: string | null;
};

export type NhlScheduleGame = {
  id: string;
  startTs: number;
  status: "pre" | "in" | "post";
  statusDetail: string;
  opponent: { id: string; abbr: string; name: string; logo: string | null };
  homeAway: "home" | "away";
  result: string | null;
  venue: string | null;
};

export type NhlTeamLeader = {
  category: string;
  displayValue: string;
  athleteId: string | null;
  athleteName: string;
  headshot: string | null;
  position: string | null;
};

export type NhlInjury = {
  athleteId: string | null;
  athleteName: string;
  position: string | null;
  status: string;
  type: string | null;
  detail: string | null;
  date: string | null;
  headshot: string | null;
};

export type NhlLeaderEntry = {
  rank: number;
  athleteId: string;
  athleteName: string;
  teamAbbr: string | null;
  teamLogo: string | null;
  value: string;
  position: string | null;
  headshot: string | null;
};

export type NhlLeaderCategory = {
  key: string;
  label: string;
  group: "offensive" | "defensive" | "general";
  entries: NhlLeaderEntry[];
};

export type NhlAthlete = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  jersey: string | null;
  position: string | null;
  age: number | null;
  height: string | null;
  weight: string | null;
  birthDate: string | null;
  birthplace: string | null;
  experience: string | null;
  college: string | null;
  team: { id: string; name: string; abbr: string; logo: string | null } | null;
  headshot: string | null;
  status: string | null;
  draft: string | null;
};

export type NhlCareerRow = {
  season: string;
  team: string;
  stats: Record<string, string>;
};
export type NhlCareer = {
  headers: string[];
  rows: NhlCareerRow[];
};

export type NhlStandingRow = {
  teamId: string;
  team: string;
  shortName: string;
  abbr: string;
  logo: string | null;
  seed: number | null;
  wins: number;
  losses: number;
  pct: number | null;
  gamesBack: string | null;
  streak: string | null;
  last10: string | null;
  home: string | null;
  away: string | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  diff: number | null;
  playoffPct: string | null;
};
export type NhlDivision = { name: string; rows: NhlStandingRow[] };
export type NhlConference = { name: string; abbr: string; divisions: NhlDivision[] };

// Game summary
export type NhlLinescoreTeam = {
  id: string;
  abbr: string;
  name: string;
  shortName: string;
  logo: string | null;
  color: string | null;
  score: number | null;
  record: string | null;
  winner: boolean | null;
  periods: (number | null)[];
};

export type NhlBoxRow = {
  athleteId: string;
  name: string;
  pos: string | null;
  starter: boolean;
  stats: Record<string, string>;
};
export type NhlBoxGroup = {
  teamId: string;
  teamAbbr: string;
  teamLogo: string | null;
  headers: string[];
  rows: NhlBoxRow[];
  totals: Record<string, string>;
};

export type NhlScoringPlay = {
  id: string;
  period: string;
  clock: string;
  text: string;
  awayScore: number | null;
  homeScore: number | null;
  teamAbbr: string | null;
};

export type NhlPlay = {
  id: string;
  period: string;
  periodNumber: number;
  clock: string;
  text: string;
  type: string | null;
  scoring: boolean;
  awayScore: number | null;
  homeScore: number | null;
  athleteId: string | null;
  athleteName: string | null;
  teamAbbr: string | null;
};

export type NhlGameSummary = {
  id: string;
  status: "pre" | "in" | "post";
  statusDetail: string;
  shortDetail: string;
  startTs: number;
  venue: { name: string | null; city: string | null; capacity: number | null; indoor: boolean | null };
  broadcast: string | null;
  attendance: number | null;
  odds: { provider: string | null; details: string | null; overUnder: number | null } | null;
  home: NhlLinescoreTeam;
  away: NhlLinescoreTeam;
  periodCount: number;
  scoringPlays: NhlScoringPlay[];
  boxscore: NhlBoxGroup[];
  leaders: Array<{ teamAbbr: string; name: string; athleteId: string; headshot: string | null; displayValue: string; label: string }>;
  plays: NhlPlay[];
};

// ───────── Scoreboard (pass-through with edge cache) ─────────
export const getNhlScoreboard = createServerFn({ method: "GET" })
  .inputValidator((d: { yyyymmdd?: string }) => d)
  .handler(async ({ data }) => {
    try {
      const q = data.yyyymmdd ? `?dates=${data.yyyymmdd}` : "";
      const raw = (await get(`${SITE}/scoreboard${q}`, 30_000)) as any;
      const events: any[] = raw?.events ?? [];
      const games = events.map((e) => mapEvent(e));
      const hasLive = games.some((g) => g.status === "in");
      setEdge(hasLive);
      games.sort((a, b) => a.startTs - b.startTs);
      const day = raw?.day?.date ?? data.yyyymmdd ?? new Date().toISOString().slice(0, 10);
      return { games, day, error: null as string | null };
    } catch (e) {
      return { games: [] as ReturnType<typeof mapEvent>[], day: "", error: e instanceof Error ? e.message : "Unknown" };
    }
  });

function mapEvent(e: any) {
  const comp = e?.competitions?.[0] ?? {};
  const competitors: any[] = comp.competitors ?? [];
  const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0] ?? {};
  const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1] ?? {};
  const state = e?.status?.type?.state ?? comp?.status?.type?.state ?? "pre";
  function team(c: any) {
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
  const broadcast =
    comp?.broadcasts?.[0]?.names?.join(", ") ??
    comp?.geoBroadcasts?.[0]?.media?.shortName ??
    null;
  return {
    id: String(e.id ?? comp.id ?? ""),
    startTs: e.date ? new Date(e.date).getTime() : 0,
    status: (state === "in" || state === "post") ? state as "in" | "post" : "pre" as "pre",
    statusDetail: e?.status?.type?.detail ?? e?.status?.type?.description ?? "",
    period: e?.status?.period ?? null,
    clock: e?.status?.displayClock ?? null,
    shortDetail: e?.status?.type?.shortDetail ?? "",
    venue: comp?.venue?.fullName ?? null,
    home: team(home),
    away: team(away),
    broadcast,
    league: "NHL",
  };
}

// ───────── All teams ─────────
export const getNhlTeams = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const raw = (await get(`${SITE}/teams`, 6 * 60 * 60_000)) as any;
      const list = raw?.sports?.[0]?.leagues?.[0]?.teams ?? [];
      const teams: NhlTeam[] = list.map((s: any) => {
        const t = s?.team ?? {};
        return {
          id: String(t.id ?? ""),
          name: t.displayName ?? "",
          shortName: t.shortDisplayName ?? t.name ?? "",
          abbr: t.abbreviation ?? "",
          logo: t.logos?.[0]?.href ?? null,
          color: t.color ? `#${t.color}` : null,
          alt: t.alternateColor ? `#${t.alternateColor}` : null,
          location: t.location ?? "",
          record: null,
          venue: null,
          conference: null,
          division: null,
          standingSummary: null,
        };
      });
      teams.sort((a: NhlTeam, b: NhlTeam) => a.name.localeCompare(b.name));
      return { teams, error: null as string | null };
    } catch (e) {
      return { teams: [] as NhlTeam[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });

// ───────── Team detail + schedule + roster ─────────
export const getNhlTeam = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const [teamRaw, scheduleRaw, rosterRaw, injuriesRaw] = await Promise.all([
        get(`${SITE}/teams/${data.id}`, 60 * 60_000) as Promise<any>,
        get(`${SITE}/teams/${data.id}/schedule`, 10 * 60_000) as Promise<any>,
        get(`${SITE}/teams/${data.id}/roster`, 6 * 60 * 60_000) as Promise<any>,
        get(`${SITE}/teams/${data.id}/injuries`, 30 * 60_000).catch(() => null) as Promise<any>,
      ]);
      const t = teamRaw?.team ?? {};
      const team: NhlTeam = {
        id: String(t.id ?? data.id),
        name: t.displayName ?? "",
        shortName: t.shortDisplayName ?? "",
        abbr: t.abbreviation ?? "",
        logo: t.logos?.[0]?.href ?? null,
        color: t.color ? `#${t.color}` : null,
        alt: t.alternateColor ? `#${t.alternateColor}` : null,
        location: t.location ?? "",
        record: t.record?.items?.[0]?.summary ?? null,
        venue: t.franchise?.venue?.fullName ?? null,
        conference: t.groups?.parent?.parent?.name ?? null,
        division: t.groups?.parent?.name ?? t.groups?.name ?? null,
        standingSummary: t.standingSummary ?? null,
      };

      const leadersRaw: any[] = t?.leaders ?? [];
      const leaders: NhlTeamLeader[] = [];
      for (const cat of leadersRaw) {
        const top = cat?.leaders?.[0];
        if (!top) continue;
        leaders.push({
          category: cat.displayName ?? cat.name ?? "",
          displayValue: top.displayValue ?? "",
          athleteId: top.athlete?.id ? String(top.athlete.id) : null,
          athleteName: top.athlete?.displayName ?? top.athlete?.shortName ?? "",
          headshot: top.athlete?.headshot?.href ?? null,
          position: top.athlete?.position?.abbreviation ?? null,
        });
      }

      const injuriesList: any[] = injuriesRaw?.injuries ?? [];
      const injuries: NhlInjury[] = [];
      for (const group of injuriesList) {
        const items: any[] = group?.injuries ?? (Array.isArray(group) ? group : []);
        for (const inj of items) {
          const a = inj.athlete ?? {};
          injuries.push({
            athleteId: a.id ? String(a.id) : null,
            athleteName: a.displayName ?? a.fullName ?? "",
            position: a.position?.abbreviation ?? null,
            status: inj.status ?? inj.type?.description ?? "—",
            type: inj.type?.description ?? null,
            detail: inj.details?.detail ?? inj.shortComment ?? inj.longComment ?? null,
            date: inj.date ?? null,
            headshot: a.headshot?.href ?? null,
          });
        }
      }

      const evs: any[] = scheduleRaw?.events ?? [];
      const schedule: NhlScheduleGame[] = evs.map((e: any) => {
        const comp = e?.competitions?.[0] ?? {};
        const home = (comp.competitors ?? []).find((c: any) => c.homeAway === "home") ?? {};
        const away = (comp.competitors ?? []).find((c: any) => c.homeAway === "away") ?? {};
        const isHome = String(home?.team?.id ?? "") === String(data.id);
        const opp = isHome ? away : home;
        const state = e?.status?.type?.state ?? "pre";
        const hs = home?.score ? Number(home.score) : null;
        const as = away?.score ? Number(away.score) : null;
        let result: string | null = null;
        if (state === "post" && hs != null && as != null) {
          const win = (isHome ? hs > as : as > hs);
          result = `${win ? "W" : "L"} ${isHome ? hs : as}-${isHome ? as : hs}`;
        }
        return {
          id: String(e.id ?? ""),
          startTs: e.date ? new Date(e.date).getTime() : 0,
          status: (state === "in" || state === "post") ? state as any : "pre" as const,
          statusDetail: e?.status?.type?.shortDetail ?? "",
          opponent: {
            id: String(opp?.team?.id ?? ""),
            abbr: opp?.team?.abbreviation ?? "",
            name: opp?.team?.displayName ?? opp?.team?.name ?? "",
            logo: opp?.team?.logos?.[0]?.href ?? opp?.team?.logo ?? null,
          },
          homeAway: isHome ? "home" as const : "away" as const,
          result,
          venue: comp?.venue?.fullName ?? null,
        };
      }).sort((a: NhlScheduleGame, b: NhlScheduleGame) => a.startTs - b.startTs);

      const groups: any[] = rosterRaw?.athletes ?? [];
      const roster: NhlRosterPlayer[] = [];
      for (const g of groups) {
        const items: any[] = g?.items ?? [];
        for (const a of items) {
          roster.push({
            id: String(a.id ?? ""),
            name: a.displayName ?? a.fullName ?? "",
            jersey: a.jersey ?? null,
            position: a.position?.abbreviation ?? a.position?.name ?? (g.position ?? null),
            height: a.displayHeight ?? null,
            weight: a.displayWeight ?? null,
            age: typeof a.age === "number" ? a.age : null,
            headshot: a.headshot?.href ?? null,
            experience: a.experience?.years != null ? `${a.experience.years} yrs` : null,
          });
        }
      }

      return { team, schedule, roster, leaders, injuries, error: null as string | null };
    } catch (e) {
      return {
        team: null as NhlTeam | null,
        schedule: [] as NhlScheduleGame[],
        roster: [] as NhlRosterPlayer[],
        leaders: [] as NhlTeamLeader[],
        injuries: [] as NhlInjury[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── Leaders ─────────
// ESPN NHL stat keys live under `offensive`, `defensive`, and `goaltending`.
// We map `goaltending` into the `general` slot so the existing UI keeps working.
const OFFENSIVE: Array<{ key: string; label: string; sortDir?: "asc" | "desc" }> = [
  { key: "points", label: "Points" },
  { key: "goals", label: "Goals" },
  { key: "assists", label: "Assists" },
  { key: "powerPlayGoals", label: "Power-Play Goals" },
  { key: "shotsTotal", label: "Shots on Goal" },
  { key: "gameWinningGoals", label: "Game-Winning Goals" },
  { key: "shootingPct", label: "Shooting %" },
];
const DEFENSIVE: Array<{ key: string; label: string; sortDir?: "asc" | "desc" }> = [
  { key: "plusMinus", label: "Plus / Minus" },
  { key: "hits", label: "Hits" },
  { key: "blockedShots", label: "Blocked Shots" },
  { key: "takeaways", label: "Takeaways" },
  { key: "penaltyMinutes", label: "Penalty Minutes" },
];
const GENERAL: Array<{ key: string; label: string; sortDir?: "asc" | "desc" }> = [
  { key: "wins", label: "Goalie Wins" },
  { key: "savePct", label: "Save %" },
  { key: "goalsAgainstAverage", label: "GAA", sortDir: "asc" },
  { key: "shutouts", label: "Shutouts" },
  { key: "saves", label: "Saves" },
];

async function fetchNhlLeaderCategory(
  season: number,
  group: "offensive" | "defensive" | "general",
  key: string,
  sortDir: "asc" | "desc",
  label: string,
): Promise<NhlLeaderCategory | null> {
  try {
    const url = `${STATS_BYATHLETE}?season=${season}&seasontype=2&category=${group}&sort=${group}.${key}:${sortDir}&limit=25`;
    const raw = (await get(url, 60 * 60_000)) as any;
    const athletes: any[] = raw?.athletes ?? [];
    if (!athletes.length) return null;
    const meta = (raw?.categories ?? []).find((c: any) => c?.name === group);
    const idx: number = meta?.names?.indexOf?.(key) ?? -1;
    const entries: NhlLeaderEntry[] = athletes.map((row: any, i: number) => {
      const a = row?.athlete ?? {};
      const cat = (row?.categories ?? []).find((c: any) => c?.name === group);
      const value = idx >= 0 ? (cat?.totals?.[idx] ?? String(cat?.values?.[idx] ?? "")) : "";
      return {
        rank: i + 1,
        athleteId: String(a?.id ?? ""),
        athleteName: a?.displayName ?? a?.shortName ?? "",
        teamAbbr: a?.teamShortName ?? null,
        teamLogo: a?.teamLogos?.[0]?.href ?? null,
        value: String(value ?? ""),
        position: a?.position?.abbreviation ?? null,
        headshot: a?.headshot?.href ?? null,
      };
    });
    return { key, label, group, entries };
  } catch {
    return null;
  }
}

async function buildNhlLeadersForSeason(season: number) {
  const [off, def, gen] = await Promise.all([
    Promise.all(OFFENSIVE.map((c) => fetchNhlLeaderCategory(season, "offensive", c.key, c.sortDir ?? "desc", c.label))),
    Promise.all(DEFENSIVE.map((c) => fetchNhlLeaderCategory(season, "defensive", c.key, c.sortDir ?? "desc", c.label))),
    Promise.all(GENERAL.map((c) => fetchNhlLeaderCategory(season, "general", c.key, c.sortDir ?? "desc", c.label))),
  ]);
  return {
    offensive: off.filter((c): c is NhlLeaderCategory => !!c && c.entries.length > 0),
    defensive: def.filter((c): c is NhlLeaderCategory => !!c && c.entries.length > 0),
    general: gen.filter((c): c is NhlLeaderCategory => !!c && c.entries.length > 0),
  };
}

export const getNhlLeaders = createServerFn({ method: "GET" })
  .inputValidator((d: { season?: number }) => d)
  .handler(async ({ data }) => {
    let requested: number;
    try {
      const { currentSeason } = await import("@/lib/tournament-config");
      requested = data.season ?? currentSeason("nhl");
    } catch {
      requested = data.season ?? new Date().getFullYear();
    }
    try {
      let used = requested;
      let res = await buildNhlLeadersForSeason(used);
      if (!res.offensive.length && !res.defensive.length && !res.general.length) {
        used = requested - 1;
        res = await buildNhlLeadersForSeason(used);
      }
      return {
        season: used,
        requestedSeason: requested,
        offensive: res.offensive,
        defensive: res.defensive,
        general: res.general,
        error: null as string | null,
      };
    } catch (e) {
      return {
        season: requested,
        requestedSeason: requested,
        offensive: [] as NhlLeaderCategory[],
        defensive: [] as NhlLeaderCategory[],
        general: [] as NhlLeaderCategory[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── Athlete ─────────
export const getNhlAthlete = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const [bioRaw, statsRaw] = await Promise.all([
        get(`${CORE}/athletes/${data.id}`, 6 * 60 * 60_000) as Promise<any>,
        get(`${CORE}/athletes/${data.id}/stats`, 60 * 60_000).catch(() => null) as Promise<any>,
      ]);
      const a = bioRaw?.athlete ?? bioRaw ?? {};
      const team = a?.team ?? null;
      const athlete: NhlAthlete = {
        id: String(a.id ?? data.id),
        name: a.displayName ?? a.fullName ?? "",
        firstName: a.firstName ?? "",
        lastName: a.lastName ?? "",
        jersey: a.jersey ?? null,
        position: a.position?.abbreviation ?? a.position?.name ?? null,
        age: typeof a.age === "number" ? a.age : null,
        height: a.displayHeight ?? null,
        weight: a.displayWeight ?? null,
        birthDate: a.dateOfBirth ?? null,
        birthplace: [a.birthPlace?.city, a.birthPlace?.state, a.birthPlace?.country].filter(Boolean).join(", ") || null,
        experience: a.displayExperience ?? (a.experience?.years != null ? `${a.experience.years} yrs` : null),
        college: a.college?.name ?? null,
        team: team ? {
          id: String(team.id ?? ""),
          name: team.displayName ?? team.name ?? "",
          abbr: team.abbreviation ?? "",
          logo: team.logos?.[0]?.href ?? team.logo ?? null,
        } : null,
        headshot: a.headshot?.href ?? null,
        status: a.status?.name ?? null,
        draft: a.draft?.displayText ?? null,
      };

      const categories: any[] = statsRaw?.categories ?? [];
      const pick = categories[0];
      let career: NhlCareer = { headers: [], rows: [] };
      if (pick) {
        const labels: string[] = pick.labels ?? pick.names ?? [];
        const headers: string[] = labels.slice(0, 12);
        const statSets: any[] = pick.statistics ?? pick.totals ?? [];
        const rows: NhlCareerRow[] = [];
        for (const s of statSets) {
          const seasonName = s?.season?.displayName ?? s?.season?.year ?? s?.displayName ?? "";
          if (!seasonName) continue;
          const teamName = s?.team?.abbreviation ?? s?.teamShortName ?? "—";
          const stats: Record<string, string> = {};
          const vals: any[] = s?.stats ?? s?.values ?? [];
          headers.forEach((h, i) => {
            const v = vals[i];
            stats[h] = v != null ? String(v) : "—";
          });
          rows.push({ season: String(seasonName), team: String(teamName), stats });
        }
        career = { headers, rows: rows.reverse() };
      }

      return { athlete, career, error: null as string | null };
    } catch (e) {
      return {
        athlete: null as NhlAthlete | null,
        career: { headers: [], rows: [] } as NhlCareer,
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── Standings Pro ─────────
function rowFromEntry(e: any): NhlStandingRow {
  const stats: any[] = e?.stats ?? [];
  const find = (k: string) =>
    stats.find((s: any) => s?.name === k || s?.shortDisplayName === k || s?.type === k);
  const num = (k: string): number | null => {
    const s = find(k);
    return s && typeof s.value === "number" ? s.value : null;
  };
  const str = (k: string): string | null => {
    const s = find(k);
    return s?.displayValue ?? null;
  };
  const t = e?.team ?? {};
  return {
    teamId: String(t.id ?? ""),
    team: t.displayName ?? t.name ?? "",
    shortName: t.shortDisplayName ?? t.name ?? "",
    abbr: t.abbreviation ?? "",
    logo: t.logos?.[0]?.href ?? t.logo ?? null,
    seed: num("playoffSeed"),
    wins: num("wins") ?? 0,
    losses: num("losses") ?? 0,
    pct: num("winPercent"),
    gamesBack: str("gamesBehind"),
    streak: str("streak"),
    last10: str("Last Ten Games") ?? str("lastTenGames"),
    home: str("Home") ?? str("home"),
    away: str("Road") ?? str("Away") ?? str("road"),
    pointsFor: num("avgPointsFor") ?? num("pointsFor"),
    pointsAgainst: num("avgPointsAgainst") ?? num("pointsAgainst"),
    diff: num("pointDifferential") ?? num("differential") ?? num("avgPointDifferential"),
    playoffPct: str("playoffPercent"),
  };
}

export const getNhlStandingsPro = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const url = "https://site.web.api.espn.com/apis/v2/sports/hockey/nhl/standings?level=3";
      const raw = (await get(url, 30 * 60_000)) as any;
      const conferences: NhlConference[] = [];
      for (const conf of raw?.children ?? []) {
        const divisions: NhlDivision[] = [];
        for (const div of conf?.children ?? []) {
          const entries = div?.standings?.entries ?? [];
          const rows = entries.map(rowFromEntry);
          rows.sort((a: NhlStandingRow, b: NhlStandingRow) => (b.pct ?? 0) - (a.pct ?? 0));
          divisions.push({ name: div.name ?? "Division", rows });
        }
        // Fallback: some shapes only have entries at conference level
        if (!divisions.length && conf?.standings?.entries?.length) {
          const rows = conf.standings.entries.map(rowFromEntry);
          rows.sort((a: NhlStandingRow, b: NhlStandingRow) => (b.pct ?? 0) - (a.pct ?? 0));
          divisions.push({ name: conf.name ?? "Conference", rows });
        }
        conferences.push({
          name: conf.name ?? "Conference",
          abbr: conf.abbreviation ?? "",
          divisions,
        });
      }
      return { conferences, error: null as string | null };
    } catch (e) {
      return { conferences: [] as NhlConference[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });

// ───────── Game Summary ─────────
function pickPeriods(team: any): (number | null)[] {
  const linescores: any[] = team?.linescores ?? [];
  return linescores.map((l) => (typeof l?.value === "number" ? l.value : l?.value != null ? Number(l.value) : null));
}

export const getNhlGame = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const raw = (await get(`${SITE}/summary?event=${encodeURIComponent(data.id)}`, 15_000)) as any;
      const header = raw?.header ?? {};
      const comp = header?.competitions?.[0] ?? {};
      const competitors: any[] = comp?.competitors ?? [];
      const homeC = competitors.find((c) => c.homeAway === "home") ?? competitors[0] ?? {};
      const awayC = competitors.find((c) => c.homeAway === "away") ?? competitors[1] ?? {};

      const state = comp?.status?.type?.state ?? "pre";
      const status: "pre" | "in" | "post" = state === "in" ? "in" : state === "post" ? "post" : "pre";
      const hasLive = status === "in";
      setEdge(hasLive);

      function buildTeam(c: any): NhlLinescoreTeam {
        const t = c?.team ?? {};
        return {
          id: String(t.id ?? ""),
          abbr: t.abbreviation ?? "",
          name: t.displayName ?? t.name ?? "",
          shortName: t.shortDisplayName ?? t.name ?? "",
          logo: t.logos?.[0]?.href ?? t.logo ?? null,
          color: t.color ? `#${t.color}` : null,
          score: c?.score != null ? Number(c.score) : null,
          record: (c?.records ?? []).find?.((r: any) => r?.type === "total")?.summary ?? c?.records?.[0]?.summary ?? null,
          winner: typeof c?.winner === "boolean" ? c.winner : null,
          periods: pickPeriods(c),
        };
      }
      const home = buildTeam(homeC);
      const away = buildTeam(awayC);
      const periodCount = Math.max(home.periods.length, away.periods.length, 4);

      const scoringRaw: any[] = raw?.scoringPlays ?? [];
      const scoringPlays: NhlScoringPlay[] = scoringRaw.map((p) => ({
        id: String(p?.id ?? `${p?.period?.number}-${p?.sequenceNumber}`),
        period: p?.period?.displayValue ?? (p?.period?.number ? `P${p.period.number}` : ""),
        clock: p?.clock?.displayValue ?? "",
        text: p?.text ?? "",
        awayScore: p?.awayScore != null ? Number(p.awayScore) : null,
        homeScore: p?.homeScore != null ? Number(p.homeScore) : null,
        teamAbbr: p?.team?.abbreviation ?? null,
      }));

      // Boxscore — NHL shape: boxscore.players[] -> { team, statistics: [{ names, athletes:[{athlete, stats, starter}], totals }] }
      const boxscoreTeams: any[] = raw?.boxscore?.players ?? [];
      const box: NhlBoxGroup[] = [];
      for (const t of boxscoreTeams) {
        const team = t?.team ?? {};
        const groups: any[] = t?.statistics ?? [];
        // NHL usually has one group per team
        for (const g of groups) {
          const headers: string[] = (g?.names ?? g?.labels ?? []).slice(0, 14);
          const athletesRaw: any[] = g?.athletes ?? [];
          const rows: NhlBoxRow[] = athletesRaw.filter((a) => a?.athlete?.id).map((a) => {
            const stats: string[] = a?.stats ?? [];
            const map: Record<string, string> = {};
            headers.forEach((h, i) => { map[h] = stats[i] ?? "—"; });
            return {
              athleteId: String(a.athlete.id),
              name: a.athlete.displayName ?? a.athlete.fullName ?? "",
              pos: a.athlete.position?.abbreviation ?? a.position?.abbreviation ?? null,
              starter: !!a.starter,
              stats: map,
            };
          });
          const totalsArr: string[] = g?.totals ?? [];
          const totals: Record<string, string> = {};
          headers.forEach((h, i) => { totals[h] = totalsArr[i] ?? ""; });
          box.push({
            teamId: String(team.id ?? ""),
            teamAbbr: team.abbreviation ?? "",
            teamLogo: team.logos?.[0]?.href ?? team.logo ?? null,
            headers,
            rows,
            totals,
          });
        }
      }

      const leadersRaw: any[] = raw?.leaders ?? comp?.leaders ?? [];
      const leaders: NhlGameSummary["leaders"] = [];
      for (const teamBlock of leadersRaw) {
        const tAbbr = teamBlock?.team?.abbreviation ?? "";
        const cats: any[] = teamBlock?.leaders ?? [];
        for (const c of cats) {
          const top = c?.leaders?.[0];
          if (!top?.athlete) continue;
          leaders.push({
            teamAbbr: tAbbr,
            name: top.athlete.displayName ?? "",
            athleteId: String(top.athlete.id ?? ""),
            headshot: top.athlete.headshot?.href ?? null,
            displayValue: top.displayValue ?? "",
            label: c?.shortDisplayName ?? c?.displayName ?? "",
          });
        }
      }

      const venue = {
        name: raw?.gameInfo?.venue?.fullName ?? comp?.venue?.fullName ?? null,
        city: raw?.gameInfo?.venue?.address?.city ?? null,
        capacity: raw?.gameInfo?.venue?.capacity ?? null,
        indoor: raw?.gameInfo?.venue?.indoor ?? null,
      };
      const oddsRaw = raw?.pickcenter?.[0] ?? comp?.odds?.[0] ?? null;
      const odds = oddsRaw ? {
        provider: oddsRaw?.provider?.name ?? null,
        details: oddsRaw?.details ?? null,
        overUnder: typeof oddsRaw?.overUnder === "number" ? oddsRaw.overUnder : null,
      } : null;
      const broadcast = (comp?.broadcasts ?? []).map((b: any) => (b?.names ?? [b?.media?.shortName]).filter(Boolean).join("/")).filter(Boolean).join(" · ") || null;
      const attendance = typeof comp?.attendance === "number" ? comp.attendance : null;

      const playsRaw: any[] = raw?.plays ?? [];
      const plays: NhlPlay[] = playsRaw.map((p) => {
        const part = p?.participants ?? [];
        const ath = part[0]?.athlete;
        return {
          id: String(p?.id ?? `${p?.period?.number}-${p?.sequenceNumber}`),
          period: p?.period?.displayValue ?? "",
          periodNumber: p?.period?.number ?? 0,
          clock: p?.clock?.displayValue ?? "",
          text: p?.text ?? "",
          type: p?.type?.text ?? p?.type?.type ?? null,
          scoring: !!p?.scoringPlay,
          awayScore: p?.awayScore != null ? Number(p.awayScore) : null,
          homeScore: p?.homeScore != null ? Number(p.homeScore) : null,
          athleteId: ath?.id ? String(ath.id) : null,
          athleteName: ath?.displayName ?? null,
          teamAbbr: p?.team?.abbreviation ?? null,
        };
      });

      const summary: NhlGameSummary = {
        id: String(header?.id ?? data.id),
        status,
        statusDetail: comp?.status?.type?.detail ?? comp?.status?.type?.description ?? "",
        shortDetail: comp?.status?.type?.shortDetail ?? "",
        startTs: header?.competitions?.[0]?.date ? new Date(header.competitions[0].date).getTime() : 0,
        venue,
        broadcast,
        attendance,
        odds,
        home,
        away,
        periodCount,
        scoringPlays,
        boxscore: box,
        leaders,
        plays,
      };

      return { summary, error: null as string | null };
    } catch (e) {
      return {
        summary: null as NhlGameSummary | null,
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });
