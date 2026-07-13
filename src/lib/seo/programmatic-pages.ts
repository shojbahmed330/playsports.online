// Programmatic long-tail SEO pages derived from existing WC datasets.
// Zero external data — safe in SSR loaders.
import goalsData from "@/data/wc_goals.json";
import goals2026 from "@/data/wc_2026_goals.json";
import groupMatches from "@/data/wc_group_matches.json";
import { CHAMPIONS_OVERRIDE } from "@/lib/champions";
import { slugify } from "./programmatic";

type Goal = {
  pid: string;
  name: string;
  team: string;
  pteam?: string;
  year: number;
  og?: boolean;
  pen?: boolean;
  pos?: string;
};
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
};

const GOALS = goalsData as Goal[];
const GROUPS = groupMatches as Record<string, Match[]>;

// ============ TOP SCORERS ============

export type TopScorer = {
  name: string;
  team: string;
  goals: number;
  penalties: number;
  ownGoals: number;
};

let _yearsWithGoals: number[] | null = null;
export function listTopScorerYears(): number[] {
  if (_yearsWithGoals) return _yearsWithGoals;
  const s = new Set<number>();
  GOALS.forEach((g) => s.add(g.year));
  _yearsWithGoals = Array.from(s).sort((a, b) => b - a);
  return _yearsWithGoals;
}

export function topScorersForYear(year: number, limit = 25): TopScorer[] {
  const goals = GOALS.filter((g) => g.year === year && !g.og);
  const map = new Map<string, TopScorer>();
  for (const g of goals) {
    const cur = map.get(g.name) ?? { name: g.name, team: g.team, goals: 0, penalties: 0, ownGoals: 0 };
    cur.goals++;
    if (g.pen) cur.penalties++;
    map.set(g.name, cur);
  }
  return Array.from(map.values())
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function topScorersAllTime(limit = 50): TopScorer[] {
  const map = new Map<string, TopScorer>();
  for (const g of GOALS) {
    if (g.og) continue;
    const cur = map.get(g.name) ?? { name: g.name, team: g.team, goals: 0, penalties: 0, ownGoals: 0 };
    cur.goals++;
    if (g.pen) cur.penalties++;
    map.set(g.name, cur);
  }
  return Array.from(map.values())
    .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// ============ TEAM CAMPAIGNS (team × year) ============

export type CampaignSlug = { slug: string; team: string; year: number };
export type CampaignSummary = {
  team: string;
  year: number;
  matches: Match[];
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  draws: number;
  losses: number;
  finalPosition: string | null; // "Champion" | "Runner-up" | "Semi-finalist" | ...
  topScorers: Array<{ name: string; goals: number }>;
  scorers: Array<{ name: string; year: number; team: string }>;
};

let _campaignSlugs: CampaignSlug[] | null = null;
/** All (team, year) combos where the team actually played WC matches on record. */
export function listCampaignSlugs(): CampaignSlug[] {
  if (_campaignSlugs) return _campaignSlugs;
  const seen = new Set<string>();
  const out: CampaignSlug[] = [];
  for (const [yearStr, arr] of Object.entries(GROUPS)) {
    const year = Number(yearStr);
    for (const m of arr) {
      for (const team of [m.home_team, m.away_team]) {
        const slug = `${slugify(team)}-world-cup-${year}`;
        if (seen.has(slug)) continue;
        seen.add(slug);
        out.push({ slug, team, year });
      }
    }
  }
  // stable sort — newest year first, then team A-Z
  out.sort((a, b) => b.year - a.year || a.team.localeCompare(b.team));
  _campaignSlugs = out;
  return out;
}

export function parseCampaignSlug(slug: string): CampaignSlug | null {
  return listCampaignSlugs().find((c) => c.slug === slug) ?? null;
}

function inferFinalPosition(team: string, year: number, matches: Match[]): string | null {
  const champ = CHAMPIONS_OVERRIDE.find((c) => c.sport === "football_wc" && c.season === year);
  if (champ?.champion === team) return "Champion";
  if (champ?.runnerUp === team) return "Runner-up";
  // Look at furthest round reached from match data
  const rounds = new Set(matches.map((m) => (m.round ?? "").toLowerCase()));
  if (rounds.has("final") || Array.from(rounds).some((r) => r.includes("final") && !r.includes("semi") && !r.includes("quarter") && !r.includes("third"))) {
    return "Finalist";
  }
  if (Array.from(rounds).some((r) => r.includes("third"))) return "Fourth Place";
  if (Array.from(rounds).some((r) => r.includes("semi"))) return "Semi-finalist";
  if (Array.from(rounds).some((r) => r.includes("quarter"))) return "Quarter-finalist";
  if (Array.from(rounds).some((r) => r.includes("round of 16") || r === "round of 16")) return "Round of 16";
  return "Group Stage";
}

export function getCampaignSummary(slug: string): CampaignSummary | null {
  const parsed = parseCampaignSlug(slug);
  if (!parsed) return null;
  const { team, year } = parsed;
  const arr = (GROUPS[String(year)] ?? []) as Match[];
  const matches = arr.filter((m) => m.home_team === team || m.away_team === team);
  if (!matches.length) return null;
  let gf = 0, ga = 0, w = 0, d = 0, l = 0;
  for (const m of matches) {
    const isHome = m.home_team === team;
    const my = isHome ? m.home_score : m.away_score;
    const op = isHome ? m.away_score : m.home_score;
    gf += my; ga += op;
    if (my > op) w++;
    else if (my < op) l++;
    else d++;
  }
  const scorers = GOALS.filter((g) => g.year === year && g.team === team && !g.og);
  const scMap = new Map<string, number>();
  for (const s of scorers) scMap.set(s.name, (scMap.get(s.name) ?? 0) + 1);
  const topScorers = Array.from(scMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, goals]) => ({ name, goals }));
  return {
    team,
    year,
    matches: matches.sort((a, b) => (a.match_date ?? "").localeCompare(b.match_date ?? "")),
    goalsFor: gf,
    goalsAgainst: ga,
    wins: w,
    draws: d,
    losses: l,
    finalPosition: inferFinalPosition(team, year, matches),
    topScorers,
    scorers: scorers.map((s) => ({ name: s.name, year: s.year, team: s.team })),
  };
}

/** URL helpers for sitemap. */
export function programmaticTopScorerUrls() {
  const years = listTopScorerYears();
  return [
    { path: "/football/top-scorers", changefreq: "monthly" as const, priority: "0.75" },
    { path: "/football/top-scorers/all-time", changefreq: "monthly" as const, priority: "0.8" },
    ...years.map((y) => ({
      path: `/football/top-scorers/${y}`,
      changefreq: "yearly" as const,
      priority: "0.75",
    })),
  ];
}

export function programmaticCampaignUrls() {
  return [
    { path: "/football/campaigns", changefreq: "monthly" as const, priority: "0.7" },
    ...listCampaignSlugs().map((c) => ({
      path: `/football/campaigns/${c.slug}`,
      changefreq: "yearly" as const,
      priority: "0.65",
    })),
  ];
}
