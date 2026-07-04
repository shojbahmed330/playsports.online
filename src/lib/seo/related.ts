/**
 * Phase 2.3 — Internal-linking recommendation engine.
 *
 * Pure, deterministic "You might also like" generators shared across all
 * sports. Same input → same ordered output → same HTML on every crawl,
 * which is the stable SEO signal we want.
 *
 * All functions:
 *   - Take the current entity + optional cap (default 8)
 *   - Return `RelatedLink[]` ready to feed into <RelatedLinks> or
 *     <EntityLinkCloud>
 *   - Never throw; return `[]` when data is missing so pages don't crash
 *   - Use only local JSON registries (safe in SSR loaders)
 */

import {
  listMatchSlugs,
  listHighlights,
  WC2026_STAGES,
  type MatchEntity,
  type HighlightEntity,
} from "./entities";
import { listMlbTeams, listWorldSeries, listMlbPlayers } from "./mlb-entities";
import { listNbaTeams, listNbaFinals, listNbaPlayers } from "./nba-entities";
import { listNhlTeams, listStanleyCups, listNhlPlayers } from "./nhl-entities";
import { listMlsTeams, listMlsCups, listMlsPlayers } from "./mls-entities";
import {
  listCricketTeams,
  listCricketPlayers,
  listCricketTournaments,
} from "./cricket-entities";
import { listTeams, slugify } from "./programmatic";
import { listCampaignSlugs } from "./programmatic-pages";

export type RelatedLink = { label: string; href: string; hint?: string };

const DEFAULT_CAP = 8;

function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.max(0, n));
}

function dedupeByHref(links: RelatedLink[]): RelatedLink[] {
  const seen = new Set<string>();
  const out: RelatedLink[] = [];
  for (const l of links) {
    if (seen.has(l.href)) continue;
    seen.add(l.href);
    out.push(l);
  }
  return out;
}

function ringNeighbors<T>(full: T[], selfIdx: number, radius: number): T[] {
  if (selfIdx < 0 || full.length <= 1) return [];
  const out: T[] = [];
  for (let step = 1; step <= Math.min(radius, full.length - 1); step++) {
    out.push(full[(selfIdx + step) % full.length]);
    out.push(full[(selfIdx - step + full.length) % full.length]);
  }
  return out;
}

// =====================================================================
// FOOTBALL
// =====================================================================

/** Matches related to `match`: same year → same team pair → nearby dates. */
export function relatedMatches(
  match: Pick<MatchEntity, "slug" | "home_team" | "away_team" | "tournament_year" | "match_date">,
  cap = DEFAULT_CAP,
): RelatedLink[] {
  const all = listMatchSlugs().filter((m) => m.slug !== match.slug);
  const full = listMatchSlugs();
  const selfIdx = full.findIndex((m) => m.slug === match.slug);
  const ring: MatchEntity[] = [];
  if (selfIdx !== -1 && full.length > 1) {
    for (let step = 1; step <= Math.min(cap, full.length - 1); step++) {
      ring.push(full[(selfIdx + step) % full.length]);
      ring.push(full[(selfIdx - step + full.length) % full.length]);
    }
  }
  const sameYear = all.filter((m) => m.tournament_year === match.tournament_year);
  const sameTeamPair = all.filter(
    (m) =>
      (m.home_team === match.home_team && m.away_team === match.away_team) ||
      (m.home_team === match.away_team && m.away_team === match.home_team),
  );
  const dateScore = (m: MatchEntity) => {
    if (!match.match_date || !m.match_date) return Number.MAX_SAFE_INTEGER;
    return Math.abs(Date.parse(m.match_date) - Date.parse(match.match_date));
  };
  const nearby = [...all].sort((a, b) => dateScore(a) - dateScore(b));
  const ordered = [...ring, ...sameTeamPair, ...sameYear, ...nearby];
  return dedupeByHref(
    ordered.map((m) => ({
      label: `${m.home_team} vs ${m.away_team} — ${m.tournament_year}`,
      href: `/football/matches/${m.slug}`,
      hint: m.round,
    })),
  ).slice(0, cap);
}

/** Highlights: same match → same team → other highlights. */
export function relatedHighlights(
  highlight: Pick<HighlightEntity, "slug" | "teamA" | "teamB">,
  cap = DEFAULT_CAP,
): RelatedLink[] {
  const all = listHighlights().filter((h) => h.slug !== highlight.slug);
  const full = listHighlights();
  const selfIdx = full.findIndex((h) => h.slug === highlight.slug);
  const ring: HighlightEntity[] = [];
  if (selfIdx !== -1 && full.length > 1) {
    for (let step = 1; step <= Math.min(cap, full.length - 1); step++) {
      ring.push(full[(selfIdx + step) % full.length]);
      ring.push(full[(selfIdx - step + full.length) % full.length]);
    }
  }
  const sameTeams = all.filter(
    (h) =>
      h.teamA === highlight.teamA ||
      h.teamB === highlight.teamA ||
      h.teamA === highlight.teamB ||
      h.teamB === highlight.teamB,
  );
  const others = all.filter((h) => !sameTeams.includes(h));
  return dedupeByHref(
    [...ring, ...sameTeams, ...others].map((h) => ({
      label: `${h.teamA} vs ${h.teamB} — highlights`,
      href: `/highlights/${h.slug}`,
    })),
  ).slice(0, cap);
}

/** Tournament stages: previous + next in same edition + same stage prior editions. */
export function relatedTournamentStages(
  stageSlug: string,
  cap = DEFAULT_CAP,
): RelatedLink[] {
  const idx = WC2026_STAGES.findIndex((s) => s.slug === stageSlug);
  if (idx === -1) return [];
  const links: RelatedLink[] = [];
  const prev = WC2026_STAGES[idx - 1];
  const next = WC2026_STAGES[idx + 1];
  if (prev)
    links.push({
      label: `Previous stage: ${prev.name}`,
      href: `/tournaments/fifa-world-cup-2026/${prev.slug}`,
    });
  if (next)
    links.push({
      label: `Next stage: ${next.name}`,
      href: `/tournaments/fifa-world-cup-2026/${next.slug}`,
    });
  links.push({
    label: "Tournament hub — FIFA World Cup 2026",
    href: "/football",
    hint: "All stages, teams, top scorers",
  });
  for (const s of WC2026_STAGES) {
    if (s.slug !== stageSlug)
      links.push({
        label: `${s.name} — 2026`,
        href: `/tournaments/fifa-world-cup-2026/${s.slug}`,
      });
  }
  return dedupeByHref(links).slice(0, cap);
}

/** Team-year World Cup campaigns: same team + same year + nearby campaign pages. */
export function relatedCampaigns(campaignSlug: string, cap = 12): RelatedLink[] {
  const all = listCampaignSlugs();
  const current = all.find((c) => c.slug === campaignSlug);
  if (!current) return [];
  const selfIdx = all.findIndex((c) => c.slug === campaignSlug);
  const sameTeam = all.filter((c) => c.team === current.team && c.slug !== campaignSlug);
  const sameYear = all.filter((c) => c.year === current.year && c.slug !== campaignSlug);
  const nearby = ringNeighbors(all, selfIdx, 8).filter((c) => c.slug !== campaignSlug);
  const links: RelatedLink[] = [
    { label: "All World Cup campaigns", href: "/football/campaigns", hint: "browse every team and year" },
    { label: `${current.team} team profile`, href: `/football/teams/${slugify(current.team)}` },
    { label: `${current.year} World Cup archive`, href: `/archive/football_wc/${current.year}` },
    { label: `${current.year} top scorers`, href: `/football/top-scorers/${current.year}` },
  ];
  for (const c of [...nearby, ...sameTeam, ...sameYear]) {
    links.push({
      label: `${c.team} at the ${c.year} World Cup`,
      href: `/football/campaigns/${c.slug}`,
      hint: c.team === current.team ? "same nation" : c.year === current.year ? "same tournament" : undefined,
    });
  }
  return dedupeByHref(links).slice(0, cap);
}

/** Football team hub links (per-team programmatic pages). */
export function relatedForFootballTeam(teamName: string, cap = DEFAULT_CAP): RelatedLink[] {
  const slug = slugify(teamName);
  const teams = listTeams();
  const selfIdx = teams.findIndex((t) => t.slug === slug);
  const nearbyTeams = ringNeighbors(teams, selfIdx, cap).filter((t) => t.slug !== slug);
  const latestCampaign = listCampaignSlugs()
    .filter((c) => slugify(c.team) === slug)
    .sort((a, b) => b.year - a.year)[0];
  const links: RelatedLink[] = [
    { label: `${teamName} — squad & profile`, href: `/football/teams/${slug}` },
    { label: "All top scorers by tournament", href: "/football/top-scorers" },
    { label: "All-time World Cup top scorers", href: "/football/top-scorers/all-time" },
    { label: "Football hub", href: "/football" },
  ];
  if (latestCampaign) {
    links.push({
      label: `${teamName} World Cup campaigns`,
      href: `/football/campaigns/${latestCampaign.slug}`,
      hint: `latest: ${latestCampaign.year}`,
    });
  }
  for (const t of nearbyTeams) {
    links.push({ label: `${t.name} — team profile`, href: `/football/teams/${t.slug}` });
  }
  return dedupeByHref(links).slice(0, cap);
}

/** Football player hub links. */
export function relatedForFootballPlayer(
  playerSlug: string,
  countryTeam?: string,
  cap = DEFAULT_CAP,
): RelatedLink[] {
  const links: RelatedLink[] = [
    { label: "Career profile", href: `/football/players/${playerSlug}` },
    { label: "World Cup goals breakdown", href: `/football/players/${playerSlug}/world-cup-goals` },
    { label: "World Cup cards breakdown", href: `/football/players/${playerSlug}/world-cup-cards` },
    { label: "FIFA World Cup players hub", href: "/players" },
  ];
  if (countryTeam) {
    const t = slugify(countryTeam);
    links.push({ label: `${countryTeam} — national team`, href: `/football/teams/${t}` });
    links.push({ label: `${countryTeam} World Cup history`, href: `/football/campaigns/${t}-world-cup-2022` });
  }
  links.push({ label: "All-time World Cup top scorers", href: "/football/top-scorers/all-time" });
  return dedupeByHref(links).slice(0, cap);
}

// =====================================================================
// MLB / NBA / NHL / MLS (US leagues, uniform shape)
// =====================================================================

type LeagueKey = "mlb" | "nba" | "nhl" | "mls";

const LEAGUE_CHAMPION_PATH: Record<LeagueKey, string> = {
  mlb: "/mlb/world-series",
  nba: "/nba/finals",
  nhl: "/nhl/stanley-cup",
  mls: "/mls/cup",
};

function leagueTeamsIndex(sport: LeagueKey) {
  switch (sport) {
    case "mlb": return listMlbTeams();
    case "nba": return listNbaTeams();
    case "nhl": return listNhlTeams();
    case "mls": return listMlsTeams();
  }
}

function leaguePlayersIndex(sport: LeagueKey) {
  switch (sport) {
    case "mlb": return listMlbPlayers();
    case "nba": return listNbaPlayers();
    case "nhl": return listNhlPlayers();
    case "mls": return listMlsPlayers();
  }
}

function leagueChampionshipEditions(sport: LeagueKey) {
  switch (sport) {
    case "mlb": return listWorldSeries();
    case "nba": return listNbaFinals();
    case "nhl": return listStanleyCups();
    case "mls": return listMlsCups();
  }
}

/** Related links for a team page in MLB/NBA/NHL/MLS. */
export function relatedForLeagueTeam(
  sport: LeagueKey,
  teamSlug: string,
  cap = DEFAULT_CAP,
): RelatedLink[] {
  const teams = leagueTeamsIndex(sport) as Array<{ slug: string; name: string; abbr?: string }>;
  const self = teams.find((t) => t.slug === teamSlug);
  const others = teams.filter((t) => t.slug !== teamSlug);
  const links: RelatedLink[] = [];
  if (self) {
    links.push({ label: `${self.name} — team history`, href: `/${sport}/team-history/${teamSlug}` });
    links.push({ label: `${self.name} — current roster`, href: `/${sport}/teams/${teamSlug}` });
  }
  links.push({ label: `${sport.toUpperCase()} champions timeline`, href: `/${sport}/champions` });
  links.push({ label: `${sport.toUpperCase()} standings`, href: `/${sport}/standings` });
  links.push({ label: `${sport.toUpperCase()} scores`, href: `/${sport}/scores` });
  const selfIdx = teams.findIndex((t) => t.slug === teamSlug);
  const ordered = [...ringNeighbors(teams, selfIdx, cap), ...others];
  for (const t of take(ordered, cap)) {
    links.push({ label: `${t.name} — roster`, href: `/${sport}/teams/${t.slug}` });
    links.push({ label: `${t.name} — history`, href: `/${sport}/team-history/${t.slug}` });
  }
  return dedupeByHref(links).slice(0, cap);
}

/** Related links for a championship edition (World Series 2022, NBA Finals 2019, etc.). */
export function relatedForLeagueChampionship(
  sport: LeagueKey,
  year: number,
  cap = DEFAULT_CAP,
): RelatedLink[] {
  const editions = leagueChampionshipEditions(sport) as Array<{ year: number; champion?: string }>;
  const sorted = [...editions].sort((a, b) => b.year - a.year);
  const prev = sorted.find((e) => e.year < year);
  const next = [...sorted].reverse().find((e) => e.year > year);
  const base = LEAGUE_CHAMPION_PATH[sport];
  const links: RelatedLink[] = [];
  if (prev) links.push({ label: `${prev.year} — previous edition`, href: `${base}/${prev.year}` });
  if (next) links.push({ label: `${next.year} — next edition`, href: `${base}/${next.year}` });
  links.push({ label: `${sport.toUpperCase()} champions — all-time`, href: `/${sport}/champions` });
  const others = sorted.filter((e) => e.year !== year);
  for (const e of take(others, cap)) {
    links.push({ label: `${e.year}${e.champion ? ` — ${e.champion}` : ""}`, href: `${base}/${e.year}` });
  }
  return dedupeByHref(links).slice(0, cap);
}

/** Related links for a league player page. */
export function relatedForLeaguePlayer(
  sport: LeagueKey,
  playerSlug: string,
  teamSlug?: string,
  cap = DEFAULT_CAP,
): RelatedLink[] {
  const players = leaguePlayersIndex(sport) as Array<{ slug: string; name: string; team?: string; teamSlug?: string }>;
  const others = players.filter((p) => p.slug !== playerSlug);
  const links: RelatedLink[] = [];
  if (teamSlug) {
    links.push({ label: `Team page`, href: `/${sport}/teams/${teamSlug}` });
    links.push({ label: `Team history`, href: `/${sport}/team-history/${teamSlug}` });
  }
  if (sport !== "mlb") {
    links.push({ label: `${sport.toUpperCase()} leaders`, href: `/${sport}/leaders` });
  } else {
    links.push({ label: "MLB players hub", href: "/mlb/players" });
  }
  links.push({ label: `${sport.toUpperCase()} champions`, href: `/${sport}/champions` });
  for (const p of take(others, cap)) {
    links.push({ label: `${p.name}`, href: `/${sport}/players/${p.slug}` });
  }
  return dedupeByHref(links).slice(0, cap);
}

// =====================================================================
// CRICKET
// =====================================================================

export function relatedForCricketTeam(teamSlug: string, cap = DEFAULT_CAP): RelatedLink[] {
  const teams = listCricketTeams();
  const self = teams.find((t) => t.slug === teamSlug);
  const others = teams.filter((t) => t.slug !== teamSlug);
  const links: RelatedLink[] = [];
  if (self) {
    links.push({ label: `${self.name} — team history`, href: `/cricket/team-history/${teamSlug}` });
    links.push({ label: `${self.name} — profile`, href: `/cricket/teams/${teamSlug}` });
  }
  links.push({ label: "Cricket teams — all", href: "/cricket/teams" });
  links.push({ label: "Cricket rankings", href: "/cricket/rankings" });
  links.push({ label: "Cricket records", href: "/cricket/records" });
  for (const t of take(others, cap)) {
    links.push({ label: `${t.name}`, href: `/cricket/teams/${t.slug}` });
  }
  return dedupeByHref(links).slice(0, cap);
}

export function relatedForCricketPlayer(playerSlug: string, cap = DEFAULT_CAP): RelatedLink[] {
  const players = listCricketPlayers().filter((p) => p.slug !== playerSlug);
  const links: RelatedLink[] = [
    { label: "All cricket players", href: "/cricket/players" },
    { label: "Cricket rankings", href: "/cricket/rankings" },
    { label: "Cricket records", href: "/cricket/records" },
  ];
  for (const p of take(players, cap)) {
    links.push({ label: p.name, href: `/cricket/players/${p.slug}` });
  }
  return dedupeByHref(links).slice(0, cap);
}

export function relatedForCricketTournament(tournamentSlug: string, cap = DEFAULT_CAP): RelatedLink[] {
  const all = listCricketTournaments().filter((t) => t.slug !== tournamentSlug);
  const links: RelatedLink[] = [
    { label: "All cricket tournaments", href: "/cricket/tournaments" },
    { label: "Cricket history", href: "/cricket/history" },
  ];
  for (const t of take(all, cap)) {
    links.push({ label: t.longName ?? t.label, href: `/cricket/tournaments/${t.slug}` });
  }
  return dedupeByHref(links).slice(0, cap);
}
