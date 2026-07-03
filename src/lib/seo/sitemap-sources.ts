// Enumerable content sources for sitemap generation.
// Every helper is defensive: on failure it returns an empty array so a
// single upstream outage never breaks sitemap.xml.

import r32Schedule from "@/data/wc2026_r32_schedule.json";
import { getMlbTeams } from "@/lib/mlb.functions";
import { getNbaTeams } from "@/lib/nba.functions";
import { getNhlTeams } from "@/lib/nhl.functions";
import { getMlsTeams } from "@/lib/mls.functions";
import { getBilateralSeriesList, getCricketSeriesList } from "@/lib/cricket.functions";
import { getIplTeams } from "@/lib/ipl.functions";
import {
  listCricketHighlights,
  listCricketPlayers,
  listCricketRecordCategories,
  listCricketTeams,
  listCricketTournaments,
} from "@/lib/seo/cricket-entities";
import { listMlbPlayers, listMlbRecordCategories, listMlbTeams, listWorldSeriesYears } from "@/lib/seo/mlb-entities";
import { listMlsCupYears, listMlsPlayers, listMlsTeams } from "@/lib/seo/mls-entities";
import { listNbaFinalsYears, listNbaPlayers, listNbaTeams } from "@/lib/seo/nba-entities";
import { listNhlPlayers, listNhlTeams, listStanleyCupYears } from "@/lib/seo/nhl-entities";

export interface DynamicUrl {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

type R32Row = { slot: number; matchNo: number; dateISO: string; stadium?: string; city?: string };
const R32 = r32Schedule as R32Row[];

/**
 * FIFA World Cup 2026 — every match 1..104.
 *  - 1..72: group stage (12 groups × 6 matches)
 *  - 73..88: Round of 32 (dates from R32 schedule)
 *  - 89..96: Round of 16 (Jul 4–7 2026)
 *  - 97..100: Quarter-finals (Jul 9–11)
 *  - 101..102: Semi-finals (Jul 14–15)
 *  - 103: Third-place (Jul 18)
 *  - 104: Final (Jul 19)
 */
export function wc2026MatchUrls(): DynamicUrl[] {
  const dateFor = (matchNo: number): string => {
    const r32 = R32.find((r) => r.matchNo === matchNo);
    if (r32) return r32.dateISO.slice(0, 10);
    // Group stage evenly spread across 2026-06-11..2026-06-27 (17 days, ~4-5 matches/day)
    if (matchNo >= 1 && matchNo <= 72) {
      const dayOffset = Math.min(16, Math.floor((matchNo - 1) / 5));
      const d = new Date(Date.UTC(2026, 5, 11 + dayOffset));
      return d.toISOString().slice(0, 10);
    }
    // Knockout dates (approximate — refined by loader when match plays)
    if (matchNo >= 89 && matchNo <= 96) return `2026-07-0${matchNo - 88}`.slice(0, 10); // R16
    if (matchNo >= 97 && matchNo <= 100) return `2026-07-${9 + (matchNo - 97)}`; // QF
    if (matchNo === 101 || matchNo === 102) return `2026-07-${14 + (matchNo - 101)}`;
    if (matchNo === 103) return "2026-07-18";
    if (matchNo === 104) return "2026-07-19";
    return "2026-06-11";
  };

  const urls: DynamicUrl[] = [];
  for (let n = 1; n <= 104; n++) {
    const priority = n === 104 ? "0.95" : n >= 97 ? "0.9" : n >= 89 ? "0.85" : n >= 73 ? "0.8" : "0.7";
    urls.push({
      path: `/football/match/${n}`,
      lastmod: dateFor(n),
      changefreq: "daily",
      priority,
    });
  }
  return urls;
}

async function safeCall<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[sitemap] ${label} failed:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

function pluckIds(list: readonly { id?: string | number | null }[]): string[] {
  const out: string[] = [];
  for (const item of list) {
    if (item?.id != null && item.id !== "") out.push(String(item.id));
  }
  return out;
}

export async function mlbTeamUrls(): Promise<DynamicUrl[]> {
  const res = await safeCall(() => getMlbTeams(), { teams: [], error: null }, "getMlbTeams");
  return pluckIds(res.teams).map((id) => ({ path: `/mlb/team/${id}`, changefreq: "weekly" as const, priority: "0.7" }));
}

export async function nbaTeamUrls(): Promise<DynamicUrl[]> {
  const res = await safeCall(() => getNbaTeams(), { teams: [], error: null }, "getNbaTeams");
  return pluckIds(res.teams).map((id) => ({ path: `/nba/team/${id}`, changefreq: "weekly" as const, priority: "0.7" }));
}

export async function nhlTeamUrls(): Promise<DynamicUrl[]> {
  const res = await safeCall(() => getNhlTeams(), { teams: [], error: null }, "getNhlTeams");
  return pluckIds(res.teams).map((id) => ({ path: `/nhl/team/${id}`, changefreq: "weekly" as const, priority: "0.7" }));
}

export async function mlsTeamUrls(): Promise<DynamicUrl[]> {
  const res = await safeCall(() => getMlsTeams(), { teams: [], error: null }, "getMlsTeams");
  return pluckIds(res.teams).map((id) => ({ path: `/mls/team/${id}`, changefreq: "weekly" as const, priority: "0.7" }));
}

export async function iplTeamUrls(): Promise<DynamicUrl[]> {
  const res = await safeCall(() => getIplTeams(), { teams: [] }, "getIplTeams");
  return pluckIds(res.teams).map((id) => ({
    path: `/cricket/ipl/teams/${id}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  }));
}

export async function cricketSeriesUrls(): Promise<DynamicUrl[]> {
  const bilateral = await safeCall(
    () => getBilateralSeriesList(),
    { tours: [], error: null as string | null },
    "getBilateralSeriesList",
  );
  const generic = await safeCall(
    () => getCricketSeriesList(),
    { series: [] as Array<{ id: string | number }> },
    "getCricketSeriesList",
  );
  const ids = new Set<string>();
  for (const t of bilateral.tours) if (t?.id) ids.add(String(t.id));
  for (const s of generic.series) if (s?.id != null) ids.add(String(s.id));
  return Array.from(ids).map((id) => ({
    path: `/cricket/series/${id}`,
    changefreq: "daily" as const,
    priority: "0.6",
  }));
}

// Phase 2.1 (cricket) — SSR SEO landing pages.
export function cricketSeoTeamUrls(): DynamicUrl[] {
  return listCricketTeams().map((t) => ({
    path: `/cricket/teams/${t.slug}`,
    changefreq: "weekly" as const,
    priority: t.isFranchise ? "0.75" : "0.7",
  }));
}

export function cricketSeoPlayerUrls(): DynamicUrl[] {
  return listCricketPlayers().map((p) => ({
    path: `/cricket/players/${p.slug}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  }));
}

export function cricketSeoTournamentUrls(): DynamicUrl[] {
  return listCricketTournaments().map((t) => ({
    path: `/cricket/tournaments/${t.slug}`,
    changefreq: "daily" as const,
    priority: "0.8",
  }));
}

export function cricketSeoRecordUrls(): DynamicUrl[] {
  return listCricketRecordCategories().map((c) => ({
    path: `/cricket/records/${c.id}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  }));
}

export function cricketSeoHighlightUrls(): DynamicUrl[] {
  return listCricketHighlights().map((h) => ({
    path: `/cricket/highlights/${h.slug}`,
    lastmod: h.date,
    changefreq: "monthly" as const,
    priority: "0.75",
  }));
}

// Phase 2.1 (mlb) — SSR SEO landing pages.
export function mlbSeoTeamUrls(): DynamicUrl[] {
  return listMlbTeams().map((t) => ({
    path: `/mlb/teams/${t.slug}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  }));
}

export function mlbSeoPlayerUrls(): DynamicUrl[] {
  return listMlbPlayers().map((p) => ({
    path: `/mlb/players/${p.slug}`,
    changefreq: "monthly" as const,
    priority: "0.65",
  }));
}

export function mlbSeoWorldSeriesUrls(): DynamicUrl[] {
  return listWorldSeriesYears().map((year) => ({
    path: `/mlb/world-series/${year}`,
    changefreq: "yearly" as const,
    priority: "0.75",
  }));
}

export function mlbSeoRecordUrls(): DynamicUrl[] {
  return listMlbRecordCategories().map((c) => ({
    path: `/mlb/records/${c.slug}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  }));
}

// Phase 2.1 (nhl) — SSR SEO landing pages.
export function nhlSeoTeamUrls(): DynamicUrl[] {
  return listNhlTeams().map((t) => ({
    path: `/nhl/teams/${t.slug}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  }));
}

export function nhlSeoPlayerUrls(): DynamicUrl[] {
  return listNhlPlayers().map((p) => ({
    path: `/nhl/players/${p.slug}`,
    changefreq: "monthly" as const,
    priority: "0.65",
  }));
}

export function nhlSeoStanleyCupUrls(): DynamicUrl[] {
  return listStanleyCupYears().map((year) => ({
    path: `/nhl/stanley-cup/${year}`,
    changefreq: "yearly" as const,
    priority: "0.75",
  }));
}

// Phase 2.1 (mls) — SSR SEO landing pages.
export function mlsSeoTeamUrls(): DynamicUrl[] {
  return listMlsTeams().map((t) => ({
    path: `/mls/teams/${t.slug}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  }));
}

export function mlsSeoPlayerUrls(): DynamicUrl[] {
  return listMlsPlayers().map((p) => ({
    path: `/mls/players/${p.slug}`,
    changefreq: "monthly" as const,
    priority: "0.65",
  }));
}

export function mlsSeoCupUrls(): DynamicUrl[] {
  return listMlsCupYears().map((year) => ({
    path: `/mls/cup/${year}`,
    changefreq: "yearly" as const,
    priority: "0.75",
  }));
}

// Phase 2.1 (nba) — SSR SEO landing pages.
export function nbaSeoTeamUrls(): DynamicUrl[] {
  return listNbaTeams().map((t) => ({
    path: `/nba/teams/${t.slug}`,
    changefreq: "weekly" as const,
    priority: "0.8",
  }));
}

export function nbaSeoPlayerUrls(): DynamicUrl[] {
  return listNbaPlayers().map((p) => ({
    path: `/nba/players/${p.slug}`,
    changefreq: "monthly" as const,
    priority: "0.65",
  }));
}

export function nbaSeoFinalsUrls(): DynamicUrl[] {
  return listNbaFinalsYears().map((year) => ({
    path: `/nba/finals/${year}`,
    changefreq: "yearly" as const,
    priority: "0.75",
  }));
}






