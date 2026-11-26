// Static catalogue generated from the 491 ESPN cricket series IDs in
// `cricket-leagues.ts`. Regenerate with `npm run catalogue:cricket` (or
// `node scripts/generate-cricket-catalogue.mjs`) before a release.
//
// The app must fetch only the series that are live or near a match. Fetching
// all 491 IDs on every request is what caused the site to silently drop the
// current India–New Zealand and Bangladesh–South Africa tours.

import catalogueData from "@/data/cricket/series-catalogue.json";

export type CricketCatalogueSeries = {
  id: string;
  label: string;
  leagueName: string | null;
  leagueAbbr: string | null;
  format: string | null;
  live: boolean;
  nextEventAt: string | null;
  nextEventName: string | null;
  nextEventTeams: string[];
  lastEventAt: string | null;
  lastEventName: string | null;
  eventCount: number;
  updatedAt: string;
  error?: string;
};

type CatalogueFile = {
  generatedAt: string;
  source: string;
  series: CricketCatalogueSeries[];
};

const CATALOGUE = catalogueData as CatalogueFile;
const BY_ID = new Map(CATALOGUE.series.map((series) => [series.id, series]));

const DAY_MS = 86_400_000;

export function getCatalogueGeneratedAt(): string {
  return CATALOGUE.generatedAt;
}

export function listCatalogueSeries(): CricketCatalogueSeries[] {
  return CATALOGUE.series;
}

export function getCatalogueSeries(id: string): CricketCatalogueSeries | null {
  return BY_ID.get(String(id)) ?? null;
}

export function getCatalogueSeriesLabel(id: string): string | null {
  return BY_ID.get(String(id))?.label ?? null;
}

/**
 * IDs to fetch for the live/today screens: anything live, or with a next
 * event inside the scoreboard window (default 2 days back, 7 days ahead).
 */
export function getRelevantSeriesIds(
  now = Date.now(),
  beforeDays = 2,
  afterDays = 7,
): string[] {
  const from = now - beforeDays * DAY_MS;
  const to = now + afterDays * DAY_MS;
  return CATALOGUE.series
    .filter((series) => {
      if (series.live) return true;
      if (!series.nextEventAt) return false;
      const ts = Date.parse(series.nextEventAt);
      return Number.isFinite(ts) && ts >= from && ts <= to;
    })
    .map((series) => series.id);
}

/**
 * IDs for the series hub: wider window so "recent results" and next week's
 * tours still appear. The hub should never need more than this.
 */
export function getSeriesHubIds(now = Date.now()): string[] {
  return getRelevantSeriesIds(now, 21, 30);
}
