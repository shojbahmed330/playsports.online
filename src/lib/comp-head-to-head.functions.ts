import { createServerFn } from "@tanstack/react-start";
import type { H2HMatch } from "./head-to-head.functions";

/**
 * Competition-scoped head-to-head using the ESPN team schedule endpoint for a
 * specific soccer league (e.g. `uefa.euro`, `esp.1`). Filters returned events
 * to matches between the two team names, restricted to that league only.
 */

type EspnScore = number | string | { value?: number; displayValue?: string } | null | undefined;
type EspnEvent = {
  date?: string;
  name?: string;
  competitions?: Array<{
    status?: { type?: { completed?: boolean; state?: string } };
    competitors?: Array<{
      id?: string;
      homeAway?: string;
      score?: EspnScore;
      team?: { id?: string; displayName?: string; abbreviation?: string };
    }>;
  }>;
  status?: { type?: { completed?: boolean; state?: string } };
  league?: { name?: string };
};

const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 30 * 60 * 1000;

async function jget<T>(url: string): Promise<T | null> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < TTL) return hit.data as T;
  try {
    const r = await fetch(url, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    const j = (await r.json()) as T;
    cache.set(url, { at: Date.now(), data: j });
    return j;
  } catch {
    return null;
  }
}

function parseScore(s: EspnScore): number | null {
  if (s == null) return null;
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  if (typeof s === "string") {
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof s === "object") {
    if (typeof s.value === "number" && Number.isFinite(s.value)) return s.value;
    if (typeof s.displayValue === "string") {
      const n = Number(s.displayValue);
      return Number.isFinite(n) ? n : null;
    }
  }
  return null;
}

function isCompleted(ev: EspnEvent): boolean {
  const st = ev.competitions?.[0]?.status?.type ?? ev.status?.type;
  return st?.completed === true || st?.state === "post";
}

function extract(ev: EspnEvent): H2HMatch | null {
  const comp = ev.competitions?.[0];
  if (!comp?.competitors || comp.competitors.length < 2) return null;
  const home = comp.competitors.find((c) => c.homeAway === "home") ?? comp.competitors[0];
  const away = comp.competitors.find((c) => c.homeAway === "away") ?? comp.competitors[1];
  return {
    date: ev.date ?? "",
    home: home.team?.displayName ?? "",
    away: away.team?.displayName ?? "",
    homeScore: parseScore(home.score),
    awayScore: parseScore(away.score),
    competition: ev.league?.name ?? ev.name ?? "",
  };
}

async function fetchTeamId(league: string, teamName: string): Promise<string | null> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams?limit=200`;
  const j = await jget<{ sports?: Array<{ leagues?: Array<{ teams?: Array<{ team?: { id?: string; displayName?: string; shortDisplayName?: string; name?: string; abbreviation?: string } }> }> }> }>(url);
  const teams = j?.sports?.[0]?.leagues?.[0]?.teams ?? [];
  const norm = teamName.trim().toLowerCase();
  const hit = teams.find((t) => {
    const tt = t.team ?? {};
    return (
      tt.displayName?.toLowerCase() === norm ||
      tt.shortDisplayName?.toLowerCase() === norm ||
      tt.name?.toLowerCase() === norm ||
      tt.abbreviation?.toLowerCase() === norm
    );
  });
  return hit?.team?.id ?? null;
}

export const getCompHeadToHead = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const o = (d ?? {}) as { league?: string; teamA?: string; teamB?: string };
    return {
      league: (o.league ?? "").trim(),
      teamA: (o.teamA ?? "").trim(),
      teamB: (o.teamB ?? "").trim(),
    };
  })
  .handler(async ({ data }): Promise<{ matches: H2HMatch[]; error: string | null }> => {
    if (!data.league || !data.teamA || !data.teamB) {
      return { matches: [], error: "Missing league or team." };
    }
    try {
      const teamAId = await fetchTeamId(data.league, data.teamA);
      if (!teamAId) return { matches: [], error: `Team not found in this competition: ${data.teamA}` };
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${data.league}/teams/${teamAId}/schedule`;
      const j = await jget<{ events?: EspnEvent[] }>(url);
      const matches = (j?.events ?? [])
        .filter(isCompleted)
        .map(extract)
        .filter((m): m is H2HMatch => !!m);
      const nA = data.teamA.toLowerCase();
      const nB = data.teamB.toLowerCase();
      const h2h = matches
        .filter((m) => {
          const h = m.home.toLowerCase();
          const a = m.away.toLowerCase();
          return (h === nA && a === nB) || (h === nB && a === nA);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { matches: h2h, error: null };
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : "Unknown" };
    }
  });
