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
      const [teamRaw, scheduleRaw, rosterRaw] = await Promise.all([
        get(`${SITE}/teams/${data.id}`, 60 * 60_000) as Promise<any>,
        get(`${SITE}/teams/${data.id}/schedule`, 10 * 60_000) as Promise<any>,
        get(`${SITE}/teams/${data.id}/roster`, 6 * 60 * 60_000) as Promise<any>,
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
      };

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

      return { team, schedule, roster, error: null as string | null };
    } catch (e) {
      return {
        team: null as MlbTeam | null,
        schedule: [] as MlbScheduleGame[],
        roster: [] as MlbRosterPlayer[],
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
  { key: "OPS", label: "OPS" },
];
const PITCHING_CATEGORIES: Array<{ key: string; label: string }> = [
  { key: "wins", label: "Wins" },
  { key: "strikeouts", label: "Strikeouts" },
  { key: "ERA", label: "ERA" },
  { key: "WHIP", label: "WHIP" },
  { key: "saves", label: "Saves" },
  { key: "inningsPitched", label: "Innings Pitched" },
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
