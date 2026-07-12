import { createServerFn } from "@tanstack/react-start";
import type { H2HMatch } from "./head-to-head.functions";

/**
 * Competition-scoped head-to-head. Uses the ESPN team schedule endpoint for a
 * specific soccer league (e.g. `uefa.euro`, `esp.1`). Because ESPN's schedule
 * endpoint only returns the CURRENT season by default, we also loop the last
 * N seasons via the `?season=YYYY` query, which is what widens the historical
 * window for tournaments (WC, Euro, Copa) and multi-year league runs.
 *
 * Callers pass `league = comp.espnLeague`. `seasons` is optional; when omitted
 * we scan the last 8 seasons for leagues / all known editions for tournaments.
 */

type EspnScore = number | string | { value?: number; displayValue?: string } | null | undefined;
type EspnEvent = {
  id?: string;
  date?: string;
  name?: string;
  competitions?: Array<{
    id?: string;
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
  season?: { year?: number };
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

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function fetchTeamId(league: string, teamName: string): Promise<string | null> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams?limit=500`;
  const j = await jget<{ sports?: Array<{ leagues?: Array<{ teams?: Array<{ team?: { id?: string; displayName?: string; shortDisplayName?: string; nickname?: string; name?: string; abbreviation?: string; location?: string } }> }> }> }>(url);
  const teams = j?.sports?.[0]?.leagues?.[0]?.teams ?? [];
  const norm = normalize(teamName);
  const hit = teams.find((t) => {
    const tt = t.team ?? {};
    const names = [tt.displayName, tt.shortDisplayName, tt.nickname, tt.name, tt.location, tt.abbreviation]
      .filter(Boolean)
      .map((x) => normalize(String(x)));
    if (names.includes(norm)) return true;
    // Partial match on displayName (e.g. "Athletic Club" vs "Athletic Bilbao").
    if (tt.displayName && normalize(tt.displayName).includes(norm)) return true;
    if (tt.name && normalize(tt.name).includes(norm)) return true;
    return false;
  });
  return hit?.team?.id ?? null;
}

function defaultSeasonsFor(): number[] {
  const y = new Date().getUTCFullYear();
  // last 8 seasons — covers La Liga runs + several recent tournament editions.
  return [y, y - 1, y - 2, y - 3, y - 4, y - 5, y - 6, y - 7];
}

export const getCompHeadToHead = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => {
    const o = (d ?? {}) as { league?: string; teamA?: string; teamB?: string; seasons?: number[] };
    return {
      league: (o.league ?? "").trim(),
      teamA: (o.teamA ?? "").trim(),
      teamB: (o.teamB ?? "").trim(),
      seasons: Array.isArray(o.seasons) ? o.seasons.filter((s) => Number.isFinite(s)) : undefined,
    };
  })
  .handler(async ({ data }): Promise<{ matches: H2HMatch[]; error: string | null; teamAId: string | null; teamBId: string | null }> => {
    if (!data.league || !data.teamA || !data.teamB) {
      return { matches: [], error: "Missing league or team.", teamAId: null, teamBId: null };
    }
    try {
      const [teamAId, teamBId] = await Promise.all([
        fetchTeamId(data.league, data.teamA),
        fetchTeamId(data.league, data.teamB),
      ]);
      if (!teamAId) {
        return { matches: [], error: `Team not found in this competition: ${data.teamA}`, teamAId: null, teamBId };
      }

      const seasons = data.seasons?.length ? data.seasons : defaultSeasonsFor();
      // Also try current-schedule (no season param) — it returns the "in-season" event set.
      const urls = [
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${data.league}/teams/${teamAId}/schedule`,
        ...seasons.map(
          (s) =>
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${data.league}/teams/${teamAId}/schedule?season=${s}`,
        ),
      ];

      const results = await Promise.all(urls.map((u) => jget<{ events?: EspnEvent[] }>(u)));
      const allEvents: EspnEvent[] = results.flatMap((r) => r?.events ?? []);

      // Dedupe events by id/date, then pick H2H meetings.
      const seenIds = new Set<string>();
      const nB = normalize(data.teamB);
      const nA = normalize(data.teamA);
      const matches: H2HMatch[] = [];
      for (const ev of allEvents) {
        const evId = String(ev.id ?? ev.competitions?.[0]?.id ?? `${ev.date}`);
        if (seenIds.has(evId)) continue;
        seenIds.add(evId);
        if (!isCompleted(ev)) continue;
        const m = extract(ev);
        if (!m) continue;
        const h = normalize(m.home);
        const a = normalize(m.away);
        const isPair =
          (h === nA && a === nB) ||
          (h === nB && a === nA) ||
          (h.includes(nA) && a.includes(nB)) ||
          (h.includes(nB) && a.includes(nA));
        if (isPair) matches.push(m);
      }

      matches.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
      return { matches, error: null, teamAId, teamBId };
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : "Unknown", teamAId: null, teamBId: null };
    }
  });
