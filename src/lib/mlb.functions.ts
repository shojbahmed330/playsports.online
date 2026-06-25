import { createServerFn } from "@tanstack/react-start";

const SITE = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb";
const CORE = "https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb";

type CacheEntry = { at: number; ttl: number; data: unknown };
const cache = new Map<string, CacheEntry>();

async function get(url: string, ttlMs: number): Promise<unknown> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.data;
  const res = await fetch(url, { headers: { "user-agent": "lovable-mlb/1.0" } });
  if (!res.ok) throw new Error(`ESPN ${res.status} ${url}`);
  const json = await res.json();
  cache.set(url, { at: Date.now(), ttl: ttlMs, data: json });
  return json;
}

// ───────── DTOs ─────────
export type MlbTeam = {
  id: string;
  name: string;          // "Los Angeles Dodgers"
  shortName: string;     // "Dodgers"
  abbr: string;
  logo: string | null;
  color: string | null;
  alt: string | null;
  location: string;
  record: string | null;
  venue: string | null;
  division: string | null;
  standingSummary: string | null;
};

export type MlbTeamStat = { name: string; abbr: string; value: string };
export type MlbTeamLeader = {
  category: string;
  displayValue: string;
  athleteId: string | null;
  athleteName: string;
  headshot: string | null;
  position: string | null;
};
export type MlbInjury = {
  athleteId: string | null;
  athleteName: string;
  position: string | null;
  status: string;
  type: string | null;
  detail: string | null;
  date: string | null;
  headshot: string | null;
};
export type MlbRosterPlayer = {
  id: string;
  name: string;
  jersey: string | null;
  position: string | null;
  bats: string | null;
  throws: string | null;
  age: number | null;
  headshot: string | null;
};

export type MlbScheduleGame = {
  id: string;
  startTs: number;
  status: "pre" | "in" | "post";
  statusDetail: string;
  opponent: { id: string; abbr: string; name: string; logo: string | null };
  homeAway: "home" | "away";
  result: string | null;       // "W 6-3"
  venue: string | null;
};

export type MlbLeaderEntry = {
  rank: number;
  athleteId: string;
  athleteName: string;
  teamAbbr: string | null;
  teamLogo: string | null;
  value: string;       // formatted display
  position: string | null;
  headshot: string | null;
};

export type MlbLeaderCategory = {
  key: string;          // "homeRuns"
  label: string;        // "Home Runs"
  group: "batting" | "pitching";
  entries: MlbLeaderEntry[];
};

export type MlbAthlete = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  jersey: string | null;
  position: string | null;
  bats: string | null;
  throws: string | null;
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
};

export type MlbCareerRow = {
  season: string;        // "2024"
  team: string;
  stats: Record<string, string>;  // label -> value
};

export type MlbCareer = {
  group: "batting" | "pitching" | "fielding" | "unknown";
  headers: string[];     // ["AVG", "HR", "RBI", ...]
  rows: MlbCareerRow[];
};

// ───────── Teams ─────────
export const getMlbTeams = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const raw = (await get(`${SITE}/teams`, 6 * 60 * 60_000)) as any;
      const sports = raw?.sports?.[0]?.leagues?.[0]?.teams ?? [];
      const teams: MlbTeam[] = sports.map((s: any) => {
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
          division: null,
        };
      });
      teams.sort((a, b) => a.name.localeCompare(b.name));
      return { teams, error: null as string | null };
    } catch (e) {
      return { teams: [] as MlbTeam[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });

// ───────── Team detail + schedule + roster ─────────
export const getMlbTeam = createServerFn({ method: "GET" })
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
      const team: MlbTeam = {
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
        division: t.groups?.parent?.name ?? null,
        standingSummary: t.standingSummary ?? null,
      };

      // Team season statistics from record items
      const recItems: any[] = t?.record?.items ?? [];
      const overall = recItems.find((r: any) => r.type === "total") ?? recItems[0];
      const stats: MlbTeamStat[] = (overall?.stats ?? []).map((s: any) => ({
        name: s.name ?? s.displayName ?? "",
        abbr: s.abbreviation ?? s.shortDisplayName ?? s.name ?? "",
        value: s.displayValue ?? String(s.value ?? ""),
      })).filter((s: MlbTeamStat) => s.abbr && s.value);

      // Leaders
      const leadersRaw: any[] = t?.leaders ?? [];
      const leaders: MlbTeamLeader[] = [];
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

      // Injuries
      const injuriesList: any[] = injuriesRaw?.injuries ?? [];
      const injuries: MlbInjury[] = [];
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
      const schedule: MlbScheduleGame[] = evs.map((e: any) => {
        const comp = e?.competitions?.[0] ?? {};
        const home = (comp.competitors ?? []).find((c: any) => c.homeAway === "home") ?? {};
        const away = (comp.competitors ?? []).find((c: any) => c.homeAway === "away") ?? {};
        const isHome = String(home?.team?.id ?? "") === String(data.id);
        const opp = isHome ? away : home;
        const state = e?.status?.type?.state ?? "pre";
        const homeScore = home?.score ? Number(home.score) : null;
        const awayScore = away?.score ? Number(away.score) : null;
        let result: string | null = null;
        if (state === "post" && homeScore != null && awayScore != null) {
          const win = (isHome ? homeScore > awayScore : awayScore > homeScore);
          result = `${win ? "W" : "L"} ${isHome ? homeScore : awayScore}-${isHome ? awayScore : homeScore}`;
        }
        return {
          id: String(e.id ?? ""),
          startTs: e.date ? new Date(e.date).getTime() : 0,
          status: (state === "in" || state === "post") ? state : "pre",
          statusDetail: e?.status?.type?.shortDetail ?? "",
          opponent: {
            id: String(opp?.team?.id ?? ""),
            abbr: opp?.team?.abbreviation ?? "",
            name: opp?.team?.displayName ?? opp?.team?.name ?? "",
            logo: opp?.team?.logos?.[0]?.href ?? opp?.team?.logo ?? null,
          },
          homeAway: isHome ? ("home" as const) : ("away" as const),
          result,
          venue: comp?.venue?.fullName ?? null,
        };
      }).sort((a: MlbScheduleGame, b: MlbScheduleGame) => a.startTs - b.startTs);

      const groups: any[] = rosterRaw?.athletes ?? [];
      const roster: MlbRosterPlayer[] = [];
      for (const g of groups) {
        const items: any[] = g?.items ?? [];
        for (const a of items) {
          roster.push({
            id: String(a.id ?? ""),
            name: a.displayName ?? a.fullName ?? "",
            jersey: a.jersey ?? null,
            position: a.position?.abbreviation ?? a.position?.name ?? (g.position ?? null),
            bats: a.bats?.abbreviation ?? null,
            throws: a.throws?.abbreviation ?? null,
            age: typeof a.age === "number" ? a.age : null,
            headshot: a.headshot?.href ?? null,
          });
        }
      }

      return { team, schedule, roster, stats, leaders, injuries, error: null as string | null };
    } catch (e) {
      return {
        team: null as MlbTeam | null,
        schedule: [] as MlbScheduleGame[],
        roster: [] as MlbRosterPlayer[],
        stats: [] as MlbTeamStat[],
        leaders: [] as MlbTeamLeader[],
        injuries: [] as MlbInjury[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── Leaders (batting + pitching) ─────────
const BATTING_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "homeRuns", label: "Home Runs" },
  { key: "RBIs", label: "RBI" },
  { key: "battingAverage", label: "Batting Average" },
  { key: "hits", label: "Hits" },
  { key: "runs", label: "Runs" },
  { key: "stolenBases", label: "Stolen Bases" },
  { key: "onBasePercentage", label: "On-Base %" },
  { key: "sluggingPercentage", label: "Slugging %" },
  { key: "OPS", label: "OPS" },
  { key: "doubles", label: "Doubles" },
  { key: "triples", label: "Triples" },
  { key: "walks", label: "Walks" },
  { key: "totalBases", label: "Total Bases" },
];
const PITCHING_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "wins", label: "Wins" },
  { key: "strikeouts", label: "Strikeouts" },
  { key: "ERA", label: "ERA" },
  { key: "WHIP", label: "WHIP" },
  { key: "saves", label: "Saves" },
  { key: "inningsPitched", label: "Innings Pitched" },
  { key: "holds", label: "Holds" },
  { key: "completeGames", label: "Complete Games" },
  { key: "shutouts", label: "Shutouts" },
  { key: "qualityStarts", label: "Quality Starts" },
];

export const getMlbLeaders = createServerFn({ method: "GET" })
  .inputValidator((d: { season?: number }) => d)
  .handler(async ({ data }) => {
    try {
      const season = data.season ?? new Date().getFullYear();
      const raw = (await get(`${SITE}/leaders?season=${season}`, 60 * 60_000)) as any;
      const all: any[] = raw?.leaders?.categories ?? raw?.categories ?? [];

      const byKey = new Map<string, any>();
      for (const c of all) byKey.set(c?.name ?? c?.shortDisplayName ?? "", c);

      function build(group: "batting" | "pitching", list: Array<{ key: string; label: string }>): MlbLeaderCategory[] {
        return list.map(({ key, label }) => {
          const c = byKey.get(key);
          const leaders: any[] = c?.leaders ?? [];
          const entries: MlbLeaderEntry[] = leaders.slice(0, 10).map((l: any, i: number) => {
            const ath = l?.athlete ?? {};
            const team = ath?.team ?? l?.team ?? {};
            return {
              rank: i + 1,
              athleteId: String(ath?.id ?? ""),
              athleteName: ath?.displayName ?? ath?.fullName ?? "",
              teamAbbr: team?.abbreviation ?? null,
              teamLogo: team?.logos?.[0]?.href ?? team?.logo ?? null,
              value: l?.displayValue ?? String(l?.value ?? ""),
              position: ath?.position?.abbreviation ?? null,
              headshot: ath?.headshot?.href ?? null,
            };
          });
          return { key, label, group, entries };
        }).filter((c) => c.entries.length > 0);
      }

      return {
        season,
        batting: build("batting", BATTING_CATEGORIES),
        pitching: build("pitching", PITCHING_CATEGORIES),
        error: null as string | null,
      };
    } catch (e) {
      return {
        season: data.season ?? new Date().getFullYear(),
        batting: [] as MlbLeaderCategory[],
        pitching: [] as MlbLeaderCategory[],
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── Athlete bio + career ─────────
export const getMlbAthlete = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    try {
      const [bioRaw, statsRaw] = await Promise.all([
        get(`${CORE}/athletes/${data.id}`, 6 * 60 * 60_000) as Promise<any>,
        get(`${CORE}/athletes/${data.id}/stats`, 60 * 60_000) as Promise<any>,
      ]);
      const a = bioRaw?.athlete ?? bioRaw ?? {};
      const team = a?.team ?? null;
      const athlete: MlbAthlete = {
        id: String(a.id ?? data.id),
        name: a.displayName ?? a.fullName ?? "",
        firstName: a.firstName ?? "",
        lastName: a.lastName ?? "",
        jersey: a.jersey ?? null,
        position: a.position?.abbreviation ?? a.position?.name ?? null,
        bats: a.bats?.displayValue ?? a.bats?.abbreviation ?? null,
        throws: a.throws?.displayValue ?? a.throws?.abbreviation ?? null,
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
      };

      // Career stats: parse the "categories" tree
      const categories: any[] = statsRaw?.categories ?? [];
      // Prefer batting unless player is a pitcher
      const wantPitching = (athlete.position ?? "").toUpperCase().startsWith("P");
      const pick = categories.find((c) => (c?.name ?? "").toLowerCase().includes(wantPitching ? "pitch" : "batt"))
        ?? categories[0];
      let career: MlbCareer = { group: "unknown", headers: [], rows: [] };
      if (pick) {
        const labels: string[] = pick.labels ?? pick.names ?? [];
        const headersFull: string[] = labels.slice(0, 12);
        // statistics typically has season-by-season rows under "splitCategories" or "statistics"
        const statSets: any[] = pick.statistics ?? pick.totals ?? [];
        const rows: MlbCareerRow[] = [];
        for (const s of statSets) {
          const seasonName = s?.season?.displayName ?? s?.season?.year ?? s?.displayName ?? "";
          if (!seasonName) continue;
          const teamName = s?.team?.abbreviation ?? s?.teamShortName ?? "—";
          const stats: Record<string, string> = {};
          const vals: any[] = s?.stats ?? s?.values ?? [];
          headersFull.forEach((h, i) => {
            const v = vals[i];
            stats[h] = v != null ? String(v) : "—";
          });
          rows.push({ season: String(seasonName), team: String(teamName), stats });
        }
        career = {
          group: wantPitching ? "pitching" : "batting",
          headers: headersFull,
          rows: rows.reverse(),
        };
      }

      return { athlete, career, error: null as string | null };
    } catch (e) {
      return {
        athlete: null as MlbAthlete | null,
        career: { group: "unknown", headers: [], rows: [] } as MlbCareer,
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── Game Summary (Live Boxscore) ─────────
export type MlbLinescoreTeam = {
  id: string;
  abbr: string;
  name: string;
  shortName: string;
  logo: string | null;
  color: string | null;
  score: number | null;
  hits: number | null;
  errors: number | null;
  record: string | null;
  winner: boolean | null;
  innings: (number | null)[];
};

export type MlbBoxRow = {
  athleteId: string;
  name: string;
  pos: string | null;
  stats: Record<string, string>;
};
export type MlbBoxGroup = {
  teamId: string;
  teamAbbr: string;
  teamLogo: string | null;
  group: "batting" | "pitching" | "fielding";
  headers: string[];
  rows: MlbBoxRow[];
  totals: Record<string, string>;
};

export type MlbScoringPlay = {
  id: string;
  inning: string;        // "Top 5th"
  text: string;
  awayScore: number | null;
  homeScore: number | null;
  teamAbbr: string | null;
};

export type MlbProbable = {
  athleteId: string | null;
  name: string;
  headshot: string | null;
  summary: string | null;  // "5-3, 3.21 ERA"
  teamAbbr: string | null;
};

export type MlbGameSummary = {
  id: string;
  status: "pre" | "in" | "post";
  statusDetail: string;
  shortDetail: string;
  startTs: number;
  venue: { name: string | null; city: string | null; capacity: number | null; indoor: boolean | null };
  weather: { condition: string | null; temperature: number | null } | null;
  broadcast: string | null;
  odds: { provider: string | null; details: string | null; overUnder: number | null } | null;
  attendance: number | null;
  home: MlbLinescoreTeam;
  away: MlbLinescoreTeam;
  inningCount: number;
  scoringPlays: MlbScoringPlay[];
  boxscore: MlbBoxGroup[];
  probables: { home: MlbProbable | null; away: MlbProbable | null };
  leaders: Array<{ teamAbbr: string; name: string; athleteId: string; headshot: string | null; displayValue: string; label: string }>;
};

function pickInnings(team: any): (number | null)[] {
  const linescores: any[] = team?.linescores ?? [];
  return linescores.map((l) => (typeof l?.value === "number" ? l.value : l?.value != null ? Number(l.value) : null));
}

function pickStat(team: any, key: string): number | null {
  const stats: any[] = team?.statistics ?? [];
  const s = stats.find((x) => (x?.name ?? "").toLowerCase() === key.toLowerCase() || (x?.abbreviation ?? "").toLowerCase() === key.toLowerCase());
  if (!s) return null;
  const v = s?.displayValue ?? s?.value;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const getMlbGame = createServerFn({ method: "GET" })
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

      function buildTeam(c: any): MlbLinescoreTeam {
        const t = c?.team ?? {};
        return {
          id: String(t.id ?? ""),
          abbr: t.abbreviation ?? "",
          name: t.displayName ?? t.name ?? "",
          shortName: t.shortDisplayName ?? t.name ?? "",
          logo: t.logos?.[0]?.href ?? t.logo ?? null,
          color: t.color ? `#${t.color}` : null,
          score: c?.score != null ? Number(c.score) : null,
          hits: pickStat(c, "hits"),
          errors: pickStat(c, "errors"),
          record: (c?.record ?? []).find?.((r: any) => r?.type === "total")?.displayValue ?? c?.records?.[0]?.summary ?? null,
          winner: typeof c?.winner === "boolean" ? c.winner : null,
          innings: pickInnings(c),
        };
      }
      const home = buildTeam(homeC);
      const away = buildTeam(awayC);
      const inningCount = Math.max(home.innings.length, away.innings.length, 9);

      // Scoring plays
      const scoringRaw: any[] = raw?.scoringPlays ?? [];
      const scoringPlays: MlbScoringPlay[] = scoringRaw.map((p) => ({
        id: String(p?.id ?? `${p?.period?.number}-${p?.sequenceNumber}`),
        inning: p?.period?.displayValue ?? (p?.period?.number ? `Inning ${p.period.number}` : ""),
        text: p?.text ?? "",
        awayScore: p?.awayScore != null ? Number(p.awayScore) : null,
        homeScore: p?.homeScore != null ? Number(p.homeScore) : null,
        teamAbbr: p?.team?.abbreviation ?? null,
      }));

      // Boxscore — players array per team contains groups
      const boxscoreTeams: any[] = raw?.boxscore?.players ?? [];
      const box: MlbBoxGroup[] = [];
      for (const t of boxscoreTeams) {
        const team = t?.team ?? {};
        const groups: any[] = t?.statistics ?? [];
        for (const g of groups) {
          const groupName = (g?.name ?? g?.type ?? "").toLowerCase();
          const group: "batting" | "pitching" | "fielding" =
            groupName.includes("pitch") ? "pitching"
            : groupName.includes("field") ? "fielding"
            : "batting";
          const headers: string[] = (g?.labels ?? g?.descriptions ?? []).slice(0, 12);
          const athletesRaw: any[] = g?.athletes ?? [];
          const rows: MlbBoxRow[] = athletesRaw.filter((a) => a?.athlete?.id).map((a) => {
            const stats: string[] = a?.stats ?? [];
            const map: Record<string, string> = {};
            headers.forEach((h, i) => { map[h] = stats[i] ?? "—"; });
            return {
              athleteId: String(a.athlete.id),
              name: a.athlete.displayName ?? a.athlete.fullName ?? "",
              pos: a.athlete.position?.abbreviation ?? a.position?.abbreviation ?? null,
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
            group,
            headers,
            rows,
            totals,
          });
        }
      }

      // Probables
      function probableFrom(c: any): MlbProbable | null {
        const p = c?.probables?.[0] ?? c?.probableStarter ?? null;
        if (!p) return null;
        const ath = p?.athlete ?? p ?? {};
        return {
          athleteId: ath?.id ? String(ath.id) : null,
          name: ath?.displayName ?? ath?.fullName ?? "",
          headshot: ath?.headshot?.href ?? null,
          summary: p?.statistics?.[0]?.displayValue ?? p?.statusAbbreviation ?? p?.note ?? null,
          teamAbbr: c?.team?.abbreviation ?? null,
        };
      }

      // Game leaders
      const leadersRaw: any[] = raw?.leaders ?? comp?.leaders ?? [];
      const leaders: MlbGameSummary["leaders"] = [];
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

      // Venue + weather + odds
      const venue = {
        name: raw?.gameInfo?.venue?.fullName ?? comp?.venue?.fullName ?? null,
        city: raw?.gameInfo?.venue?.address?.city ?? null,
        capacity: raw?.gameInfo?.venue?.capacity ?? null,
        indoor: raw?.gameInfo?.venue?.indoor ?? null,
      };
      const weatherRaw = raw?.gameInfo?.weather ?? raw?.weather;
      const weather = weatherRaw ? {
        condition: weatherRaw?.displayValue ?? weatherRaw?.conditionId ?? null,
        temperature: typeof weatherRaw?.temperature === "number" ? weatherRaw.temperature : null,
      } : null;
      const oddsRaw = raw?.pickcenter?.[0] ?? comp?.odds?.[0] ?? null;
      const odds = oddsRaw ? {
        provider: oddsRaw?.provider?.name ?? null,
        details: oddsRaw?.details ?? null,
        overUnder: typeof oddsRaw?.overUnder === "number" ? oddsRaw.overUnder : null,
      } : null;
      const broadcast = (comp?.broadcasts ?? []).map((b: any) => (b?.names ?? [b?.media?.shortName]).filter(Boolean).join("/")).filter(Boolean).join(" · ") || null;
      const attendance = typeof comp?.attendance === "number" ? comp.attendance : null;

      const summary: MlbGameSummary = {
        id: String(header?.id ?? data.id),
        status,
        statusDetail: comp?.status?.type?.detail ?? comp?.status?.type?.description ?? "",
        shortDetail: comp?.status?.type?.shortDetail ?? "",
        startTs: header?.competitions?.[0]?.date ? new Date(header.competitions[0].date).getTime() : 0,
        venue,
        weather,
        broadcast,
        odds,
        attendance,
        home,
        away,
        inningCount,
        scoringPlays,
        boxscore: box,
        probables: { home: probableFrom(homeC), away: probableFrom(awayC) },
        leaders,
      };

      return { summary, error: null as string | null };
    } catch (e) {
      return {
        summary: null as MlbGameSummary | null,
        error: e instanceof Error ? e.message : "Unknown",
      };
    }
  });

// ───────── STANDINGS PRO ─────────
export type MlbStandingRow = {
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
  divisionGamesBack: string | null;
  streak: string | null;
  last10: string | null;
  home: string | null;
  away: string | null;
  runsFor: number | null;
  runsAgainst: number | null;
  runDiff: number | null;
  playoffPct: string | null;
  divisionPct: string | null;
  wildCardPct: string | null;
  magicDivision: number | null;
  magicWildcard: number | null;
};
export type MlbDivision = { name: string; rows: MlbStandingRow[] };
export type MlbLeague = { name: string; abbr: string; divisions: MlbDivision[] };

function rowFromEntry(e: any): MlbStandingRow {
  const stats: any[] = e?.stats ?? [];
  const find = (k: string) =>
    stats.find((s: any) => s?.name === k || s?.shortDisplayName === k);
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
    divisionGamesBack: str("divisionGamesBehind"),
    streak: str("streak"),
    last10: str("Last Ten Games") ?? str("lastTenGames"),
    home: str("Home") ?? str("home"),
    away: str("Road") ?? str("Away") ?? str("road"),
    runsFor: num("pointsFor"),
    runsAgainst: num("pointsAgainst"),
    runDiff: num("pointDifferential") ?? num("differential"),
    playoffPct: str("playoffPercent"),
    divisionPct: str("divisionPercent"),
    wildCardPct: str("wildCardPercent"),
    magicDivision: num("magicNumberDivision"),
    magicWildcard: num("magicNumberWildcard"),
  };
}

export const getMlbStandingsPro = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const url = "https://site.web.api.espn.com/apis/v2/sports/baseball/mlb/standings?level=3";
      const raw = (await get(url, 30 * 60_000)) as any;
      const leagues: MlbLeague[] = [];
      for (const lg of raw?.children ?? []) {
        const divisions: MlbDivision[] = [];
        for (const div of lg?.children ?? []) {
          const entries = div?.standings?.entries ?? [];
          const rows = entries.map(rowFromEntry);
          rows.sort((a: MlbStandingRow, b: MlbStandingRow) =>
            (b.pct ?? 0) - (a.pct ?? 0));
          divisions.push({ name: div.name ?? "Division", rows });
        }
        leagues.push({
          name: lg.name ?? "League",
          abbr: lg.abbreviation ?? "",
          divisions,
        });
      }
      return { leagues, error: null as string | null };
    } catch (e) {
      return { leagues: [] as MlbLeague[], error: e instanceof Error ? e.message : "Unknown" };
    }
  });
