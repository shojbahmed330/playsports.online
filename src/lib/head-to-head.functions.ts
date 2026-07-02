// Head-to-head + team form via ESPN public API. No key required.
import { createServerFn } from "@tanstack/react-start";

export type H2HMatch = {
  date: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  competition: string;
};

export type FormResult = "W" | "D" | "L";

export type TeamFormEntry = {
  date: string;
  opponent: string;
  home: boolean;
  scoreFor: number | null;
  scoreAgainst: number | null;
  result: FormResult | null;
  competition: string;
};

const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 15 * 60 * 1000;

async function jget<T>(url: string): Promise<T | null> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;
  try {
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    const j = (await r.json()) as T;
    cache.set(url, { at: Date.now(), data: j });
    return j;
  } catch { return null; }
}

type EspnEvent = {
  date?: string;
  name?: string;
  competitions?: Array<{
    competitors?: Array<{
      id?: string;
      homeAway?: string;
      score?: string | number;
      team?: { id?: string; displayName?: string; abbreviation?: string };
    }>;
  }>;
  league?: { name?: string };
};

function extractMatch(ev: EspnEvent): H2HMatch | null {
  const comp = ev.competitions?.[0];
  if (!comp?.competitors || comp.competitors.length < 2) return null;
  const home = comp.competitors.find((c) => c.homeAway === "home") ?? comp.competitors[0];
  const away = comp.competitors.find((c) => c.homeAway === "away") ?? comp.competitors[1];
  return {
    date: ev.date ?? "",
    home: home.team?.displayName ?? "",
    away: away.team?.displayName ?? "",
    homeScore: home.score != null ? Number(home.score) : null,
    awayScore: away.score != null ? Number(away.score) : null,
    competition: ev.league?.name ?? ev.name ?? "",
  };
}

// ESPN team schedule endpoint — returns recent + upcoming fixtures.
export const getTeamForm = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const o = (d ?? {}) as { teamId?: number | string; teamName?: string };
    return { teamId: o.teamId ? String(o.teamId) : "", teamName: o.teamName ?? "" };
  })
  .handler(async ({ data }): Promise<TeamFormEntry[]> => {
    if (!data.teamId) return [];
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${data.teamId}/schedule`;
    const j = await jget<{ events?: EspnEvent[] }>(url);
    if (!j?.events) return [];
    const now = Date.now();
    const past = j.events
      .filter((e) => e.date && new Date(e.date).getTime() < now)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 5);
    return past.map((e): TeamFormEntry => {
      const m = extractMatch(e);
      if (!m) return { date: e.date ?? "", opponent: "", home: false, scoreFor: null, scoreAgainst: null, result: null, competition: "" };
      const isHome = m.home.toLowerCase() === data.teamName.toLowerCase();
      const scoreFor = isHome ? m.homeScore : m.awayScore;
      const scoreAgainst = isHome ? m.awayScore : m.homeScore;
      let result: FormResult | null = null;
      if (scoreFor != null && scoreAgainst != null) {
        result = scoreFor > scoreAgainst ? "W" : scoreFor < scoreAgainst ? "L" : "D";
      }
      return {
        date: m.date,
        opponent: isHome ? m.away : m.home,
        home: isHome,
        scoreFor, scoreAgainst, result,
        competition: m.competition,
      };
    });
  });

// Simple H2H: fetch both teams' recent schedules and intersect by opponent name.
export const getHeadToHead = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const o = (d ?? {}) as { homeId?: string | number; awayId?: string | number; homeName?: string; awayName?: string };
    return {
      homeId: o.homeId ? String(o.homeId) : "",
      awayId: o.awayId ? String(o.awayId) : "",
      homeName: (o.homeName ?? "").toLowerCase(),
      awayName: (o.awayName ?? "").toLowerCase(),
    };
  })
  .handler(async ({ data }): Promise<H2HMatch[]> => {
    if (!data.homeId || !data.awayName) return [];
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${data.homeId}/schedule`;
    const j = await jget<{ events?: EspnEvent[] }>(url);
    if (!j?.events) return [];
    const matches = j.events.map(extractMatch).filter((m): m is H2HMatch => !!m);
    const h2h = matches.filter((m) => {
      const h = m.home.toLowerCase(), a = m.away.toLowerCase();
      return (h === data.homeName && a === data.awayName) ||
             (h === data.awayName && a === data.homeName);
    });
    return h2h
      .filter((m) => m.homeScore != null && m.awayScore != null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  });
