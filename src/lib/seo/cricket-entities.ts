// Phase 2.1 — Cricket SSR SEO entity registry.
// Pure aggregators over bundled JSON — safe in loaders (SSR).

import rankingsData from "@/data/cricket/rankings.json";
import recordsData from "@/data/cricket/records.json";
import historyData from "@/data/cricket/history.json";
import iplFranchisesData from "@/data/cricket/ipl/franchises.json";
import iplHistoryData from "@/data/cricket/ipl/history.json";
import iplRecordsData from "@/data/cricket/ipl/records.json";
import highlightsData from "@/data/cricket/highlights.json";
import { CRICKET_LEAGUES, type CricketLeague } from "@/lib/cricket-leagues";
import { slugify } from "@/lib/seo/programmatic";

// --------------- Types ---------------
export type CricketTeamEntity = {
  slug: string;
  name: string;
  code?: string;
  flag?: string;
  logo?: string;
  isFranchise: boolean;
  formats: Array<{ format: "t20i" | "odi" | "test"; rank: number; rating: number }>;
  franchise?: {
    short: string;
    city: string;
    founded: number;
    homeGround: string;
    captain: string;
    headCoach: string;
    titles: number;
    titleYears: number[];
    primary: string;
  };
  faqs: Array<{ q: string; a: string }>;
};

export type CricketPlayerEntity = {
  slug: string;
  name: string;
  country?: string;
  flag?: string;
  records: Array<{ category: string; metric: string; value: string; extra?: string }>;
  faqs: Array<{ q: string; a: string }>;
};

export type CricketTournamentEntity = CricketLeague & {
  history?: {
    label: string;
    format: string;
    emoji: string;
    champions: Array<{ year: number; champion: string; runnerUp: string; host?: string; venue?: string; result?: string }>;
    topRuns?: Array<{ player: string; country: string; matches: number; runs: number; avg: number; hundreds?: number }>;
    topWickets?: Array<{ player: string; country: string; matches: number; wickets: number; avg: number }>;
  };
  latestChampion?: string;
  totalEditions?: number;
};

export type CricketRecordCategory = {
  id: string;
  title: string;
  format: string;
  metric: string;
  rows: Array<{ player: string; team: string; flag: string; value: number | string; extra?: string }>;
};

// --------------- Rankings index ---------------
type RankRow = { rank: number; team: string; code: string; flag: string; rating: number; trend?: number };
const RANKINGS = rankingsData as { teams: Record<"t20i" | "odi" | "test", RankRow[]> };

// --------------- Records ---------------
const RECORDS = recordsData as { updatedAt: string; categories: CricketRecordCategory[] };

// --------------- IPL franchises ---------------
type Franchise = {
  id: string;
  name: string;
  short: string;
  city: string;
  founded: number;
  homeGround: string;
  captain: string;
  headCoach: string;
  titles: number;
  titleYears: number[];
  primary: string;
  logo: string;
};
const IPL = iplFranchisesData as Franchise[];

// --------------- History ---------------
type HistoryBlock = CricketTournamentEntity["history"];
const HISTORY = historyData as Record<string, HistoryBlock>;

const IPL_HISTORY = iplHistoryData as Array<{
  year: number;
  champion: string;
  runnerUp: string;
  finalVenue: string;
  finalScore: string;
  mom: string;
  orangeCap: { player: string; team: string; runs: number };
  purpleCap: { player: string; team: string; wickets: number };
}>;

const IPL_RECORDS = iplRecordsData as unknown as Record<
  string,
  Array<{ label: string; player?: string; team?: string; value: string; context?: string }>
>;

// =============== TEAMS ===============
let _teams: CricketTeamEntity[] | null = null;
function buildTeams(): CricketTeamEntity[] {
  if (_teams) return _teams;
  const map = new Map<string, CricketTeamEntity>();

  // International teams — from rankings across 3 formats
  const formats: Array<"t20i" | "odi" | "test"> = ["t20i", "odi", "test"];
  for (const fmt of formats) {
    for (const row of RANKINGS.teams[fmt]) {
      const slug = slugify(row.team);
      const existing = map.get(slug);
      const entry = existing ?? {
        slug,
        name: row.team,
        code: row.code,
        flag: row.flag,
        isFranchise: false,
        formats: [],
        faqs: [],
      };
      entry.formats.push({ format: fmt, rank: row.rank, rating: row.rating });
      map.set(slug, entry);
    }
  }

  // IPL franchises — separate slugs
  for (const f of IPL) {
    const slug = slugify(f.name);
    map.set(slug, {
      slug,
      name: f.name,
      code: f.short,
      logo: f.logo,
      isFranchise: true,
      formats: [],
      franchise: {
        short: f.short,
        city: f.city,
        founded: f.founded,
        homeGround: f.homeGround,
        captain: f.captain,
        headCoach: f.headCoach,
        titles: f.titles,
        titleYears: f.titleYears ?? [],
        primary: f.primary,
      },
      faqs: [],
    });
  }

  // Build FAQs
  for (const t of map.values()) {
    const faqs: Array<{ q: string; a: string }> = [];
    if (t.isFranchise && t.franchise) {
      const fr = t.franchise;
      faqs.push({
        q: `How many IPL titles has ${t.name} won?`,
        a: `${t.name} has won ${fr.titles} IPL title${fr.titles === 1 ? "" : "s"}${fr.titleYears.length ? ` (${fr.titleYears.join(", ")})` : ""}.`,
      });
      faqs.push({
        q: `Who is the captain of ${t.name}?`,
        a: `${fr.captain} currently captains ${t.name}, with ${fr.headCoach} as head coach.`,
      });
      faqs.push({
        q: `Where does ${t.name} play home games?`,
        a: `${t.name} plays home matches at ${fr.homeGround} in ${fr.city}. The franchise was founded in ${fr.founded}.`,
      });
    } else {
      const best = t.formats.slice().sort((a, b) => a.rank - b.rank)[0];
      if (best) {
        faqs.push({
          q: `What is ${t.name}'s current ICC ranking?`,
          a: `${t.name} is ranked #${best.rank} in the ICC ${best.format.toUpperCase()} team rankings with a rating of ${best.rating}.`,
        });
      }
      const formatsList = t.formats
        .map((f) => `#${f.rank} in ${f.format.toUpperCase()}`)
        .join(", ");
      if (formatsList) {
        faqs.push({
          q: `Where does ${t.name} rank across formats?`,
          a: `${t.name} is currently ${formatsList}.`,
        });
      }
    }
    t.faqs = faqs;
  }

  _teams = Array.from(map.values());
  return _teams;
}

export function listCricketTeams(): CricketTeamEntity[] {
  return buildTeams();
}

export function getCricketTeamBySlug(slug: string): CricketTeamEntity | null {
  return buildTeams().find((t) => t.slug === slug) ?? null;
}

// =============== PLAYERS ===============
let _players: CricketPlayerEntity[] | null = null;
function buildPlayers(): CricketPlayerEntity[] {
  if (_players) return _players;
  const map = new Map<string, CricketPlayerEntity>();

  // From cricket records (international)
  for (const cat of RECORDS.categories) {
    for (const row of cat.rows) {
      const slug = slugify(row.player);
      const existing = map.get(slug) ?? {
        slug,
        name: row.player,
        country: row.team,
        flag: row.flag,
        records: [],
        faqs: [],
      };
      existing.records.push({
        category: cat.title,
        metric: cat.metric,
        value: String(row.value),
        extra: row.extra,
      });
      map.set(slug, existing);
    }
  }

  // From tournament history topRuns / topWickets
  for (const [tournamentSlug, block] of Object.entries(HISTORY)) {
    if (!block) continue;
    const tName = block.label;
    for (const r of block.topRuns ?? []) {
      const slug = slugify(r.player);
      const existing = map.get(slug) ?? {
        slug,
        name: r.player,
        country: r.country,
        records: [],
        faqs: [],
      };
      existing.records.push({
        category: `${tName} — Top Run Scorer`,
        metric: "Runs",
        value: String(r.runs),
        extra: `${r.matches} matches, avg ${r.avg}${r.hundreds ? `, ${r.hundreds} × 100s` : ""}`,
      });
      map.set(slug, existing);
      void tournamentSlug;
    }
    for (const w of block.topWickets ?? []) {
      const slug = slugify(w.player);
      const existing = map.get(slug) ?? {
        slug,
        name: w.player,
        country: w.country,
        records: [],
        faqs: [],
      };
      existing.records.push({
        category: `${tName} — Top Wicket Taker`,
        metric: "Wickets",
        value: String(w.wickets),
        extra: `${w.matches} matches, avg ${w.avg}`,
      });
      map.set(slug, existing);
    }
  }

  // From IPL records (batting, bowling, fielding, partnerships, captaincy, team → skip team category)
  for (const [group, rows] of Object.entries(IPL_RECORDS)) {
    if (group === "team") continue;
    for (const r of rows) {
      if (!r.player || r.player.includes(",") || r.player.includes("&")) continue; // skip partnership pairs
      const slug = slugify(r.player);
      const existing = map.get(slug) ?? {
        slug,
        name: r.player,
        records: [],
        faqs: [],
      };
      existing.records.push({
        category: `IPL — ${r.label}`,
        metric: group,
        value: r.value,
        extra: r.context,
      });
      map.set(slug, existing);
    }
  }

  // Build FAQs
  for (const p of map.values()) {
    const faqs: Array<{ q: string; a: string }> = [];
    const first = p.records[0];
    if (first) {
      faqs.push({
        q: `What records does ${p.name} hold?`,
        a: `${p.name} holds records including ${p.records
          .slice(0, 3)
          .map((r) => `${r.category}: ${r.value}`)
          .join("; ")}.`,
      });
    }
    if (p.country) {
      faqs.push({
        q: `Which country does ${p.name} play for?`,
        a: `${p.name} plays for ${p.country}.`,
      });
    }
    faqs.push({
      q: `How many career records does ${p.name} appear in on PlaySports?`,
      a: `${p.name} appears in ${p.records.length} historical cricket record entr${p.records.length === 1 ? "y" : "ies"} across international and franchise cricket.`,
    });
    p.faqs = faqs;
  }

  _players = Array.from(map.values());
  return _players;
}

export function listCricketPlayers(): CricketPlayerEntity[] {
  return buildPlayers();
}

export function getCricketPlayerBySlug(slug: string): CricketPlayerEntity | null {
  return buildPlayers().find((p) => p.slug === slug) ?? null;
}

// =============== TOURNAMENTS ===============
export function listCricketTournaments(): CricketTournamentEntity[] {
  return CRICKET_LEAGUES.map((l) => {
    const history = HISTORY[l.slug];
    const latest = history?.champions?.[history.champions.length - 1];
    return {
      ...l,
      history,
      latestChampion: latest?.champion,
      totalEditions: history?.champions?.length,
    };
  });
}

export function getCricketTournamentBySlug(slug: string): CricketTournamentEntity | null {
  return listCricketTournaments().find((t) => t.slug === slug) ?? null;
}

// =============== RECORD CATEGORIES ===============
export function listCricketRecordCategories(): CricketRecordCategory[] {
  return RECORDS.categories;
}

export function getCricketRecordCategory(id: string): CricketRecordCategory | null {
  return RECORDS.categories.find((c) => c.id === id) ?? null;
}

// =============== IPL edition helper (for tournament page) ===============
export function getIplEditions() {
  return IPL_HISTORY;
}

// =============== HIGHLIGHTS ===============
export type CricketHighlightEntity = {
  slug: string;
  teamA: string;
  teamB: string;
  tournament: string;
  stage: string;
  venue: string;
  date: string;
  format: "test" | "odi" | "t20i" | "t20";
  result: string;
  youtubeId: string | null;
  videoUrl: string;
};

const HIGHLIGHTS = highlightsData as CricketHighlightEntity[];

export function listCricketHighlights(): CricketHighlightEntity[] {
  return HIGHLIGHTS;
}

export function getCricketHighlightBySlug(slug: string): CricketHighlightEntity | null {
  return HIGHLIGHTS.find((h) => h.slug === slug) ?? null;
}

