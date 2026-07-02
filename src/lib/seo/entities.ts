// Slug-based entity registry for Phase 2.1 SEO landing pages.
// Pure functions built on existing JSON datasets — safe in loaders (SSR).

import groupMatches from "@/data/wc_group_matches.json";
import r32Schedule from "@/data/wc2026_r32_schedule.json";
import highlights from "@/data/wc2026_highlights.json";
import { slugify } from "@/lib/seo/programmatic";

type Match = {
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  home_score_pen?: number | null;
  away_score_pen?: number | null;
  match_date?: string;
  tournament_year: number;
  round?: string;
  stadium?: string;
  city?: string;
  video_url?: string | null;
};

const GROUPS = groupMatches as Record<string, Match[]>;
const HIGHLIGHTS = highlights as Record<string, string>;

// -------------------- MATCHES (historical) --------------------
export type MatchEntity = Match & { slug: string };

let _matches: MatchEntity[] | null = null;
function buildMatches(): MatchEntity[] {
  if (_matches) return _matches;
  const seen = new Set<string>();
  const out: MatchEntity[] = [];
  for (const arr of Object.values(GROUPS)) {
    for (const m of arr) {
      const date = (m.match_date ?? String(m.tournament_year)).slice(0, 10);
      const base = `${slugify(m.home_team)}-vs-${slugify(m.away_team)}-${date}`;
      let slug = base;
      let n = 2;
      while (seen.has(slug)) slug = `${base}-${n++}`;
      seen.add(slug);
      out.push({ ...m, slug });
    }
  }
  _matches = out;
  return out;
}

export function listMatchSlugs(): MatchEntity[] {
  return buildMatches();
}

export function getMatchBySlug(slug: string): MatchEntity | null {
  return buildMatches().find((m) => m.slug === slug) ?? null;
}

/** Find highlight video URL for a match (order-insensitive alias lookup). */
export function findHighlightUrl(home: string, away: string): string | null {
  const norm = (s: string) => s.toLowerCase().trim();
  const keys = [`${norm(home)}|${norm(away)}`, `${norm(away)}|${norm(home)}`];
  for (const k of keys) {
    if (HIGHLIGHTS[k]) return HIGHLIGHTS[k];
  }
  return null;
}

// -------------------- HIGHLIGHTS --------------------
export type HighlightEntity = {
  slug: string;
  teamA: string;
  teamB: string;
  videoUrl: string;
  youtubeId: string | null;
};

function ytId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

let _highlights: HighlightEntity[] | null = null;
export function listHighlights(): HighlightEntity[] {
  if (_highlights) return _highlights;
  const bySlug = new Map<string, HighlightEntity>();
  for (const [key, url] of Object.entries(HIGHLIGHTS)) {
    const [a, b] = key.split("|");
    if (!a || !b) continue;
    const slug = `${slugify(a)}-vs-${slugify(b)}`;
    if (bySlug.has(slug)) continue;
    bySlug.set(slug, {
      slug,
      teamA: titleCase(a),
      teamB: titleCase(b),
      videoUrl: url,
      youtubeId: ytId(url),
    });
  }
  _highlights = Array.from(bySlug.values());
  return _highlights;
}

export function getHighlightBySlug(slug: string): HighlightEntity | null {
  return listHighlights().find((h) => h.slug === slug) ?? null;
}

// -------------------- TOURNAMENT STAGES (2026) --------------------
type R32Row = { slot: number; matchNo: number; dateISO: string; stadium?: string; city?: string };
const R32 = r32Schedule as R32Row[];

export const WC2026_STAGES = [
  { slug: "group-stage", name: "Group Stage", matchRange: [1, 72] as [number, number], startDate: "2026-06-11", endDate: "2026-06-27" },
  { slug: "round-of-32", name: "Round of 32", matchRange: [73, 88] as [number, number], startDate: "2026-06-28", endDate: "2026-07-03" },
  { slug: "round-of-16", name: "Round of 16", matchRange: [89, 96] as [number, number], startDate: "2026-07-04", endDate: "2026-07-07" },
  { slug: "quarter-finals", name: "Quarter-finals", matchRange: [97, 100] as [number, number], startDate: "2026-07-09", endDate: "2026-07-11" },
  { slug: "semi-finals", name: "Semi-finals", matchRange: [101, 102] as [number, number], startDate: "2026-07-14", endDate: "2026-07-15" },
  { slug: "third-place", name: "Third-place Play-off", matchRange: [103, 103] as [number, number], startDate: "2026-07-18", endDate: "2026-07-18" },
  { slug: "final", name: "Final", matchRange: [104, 104] as [number, number], startDate: "2026-07-19", endDate: "2026-07-19" },
];

export type StageEntity = (typeof WC2026_STAGES)[number] & { matches: Array<{ matchNo: number; dateISO?: string; stadium?: string; city?: string }> };

export function listStageSlugs(): string[] {
  return WC2026_STAGES.map((s) => s.slug);
}

export function getStageBySlug(slug: string): StageEntity | null {
  const stage = WC2026_STAGES.find((s) => s.slug === slug);
  if (!stage) return null;
  const [lo, hi] = stage.matchRange;
  const matches: StageEntity["matches"] = [];
  for (let n = lo; n <= hi; n++) {
    const r32 = R32.find((r) => r.matchNo === n);
    matches.push({ matchNo: n, dateISO: r32?.dateISO, stadium: r32?.stadium, city: r32?.city });
  }
  return { ...stage, matches };
}

/** Return a match slug URL if the historical entity exists, else null. */
export function findMatchSlug(home: string, away: string, year: number, dateISO?: string): string | null {
  const list = buildMatches();
  const m = list.find(
    (x) =>
      x.tournament_year === year &&
      ((x.home_team === home && x.away_team === away) || (x.home_team === away && x.away_team === home)) &&
      (!dateISO || x.match_date?.slice(0, 10) === dateISO.slice(0, 10)),
  );
  return m?.slug ?? null;
}
