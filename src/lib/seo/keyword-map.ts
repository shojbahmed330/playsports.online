// Phase 2.2 — Keyword → URL registry. Single source of truth for long-tail
// SEO targets. Used by sitemap (priority weighting), internal linking, and
// the admin dashboard.
//
// Sport tags let us filter Popular Searches per hub — a Cricket hub shows
// cricket queries, an NBA hub shows NBA queries, etc.

export type KeywordSport =
  | "football"
  | "cricket"
  | "ipl"
  | "nba"
  | "mlb"
  | "nhl"
  | "mls"
  | "multi";

export type KeywordTarget = {
  keyword: string;
  url: string;
  volume: number; // Semrush est. monthly US searches
  kdi: number; // Keyword difficulty 0-100
  pattern:
    | "player-stat"
    | "tournament-leaderboard"
    | "h2h-highlight"
    | "live-hub"
    | "guide"
    | "sport-hub"
    | "champions-list"
    | "season-landing"
    | "records";
  intent: "informational" | "transactional" | "navigational";
  sport: KeywordSport;
};

export const KEYWORD_TARGETS: KeywordTarget[] = [
  // ── Football / FIFA World Cup ────────────────────────────────────────
  { keyword: "messi world cup goals", url: "/football/players/lionel-messi/world-cup-goals", volume: 140, kdi: 42, pattern: "player-stat", intent: "informational", sport: "football" },
  { keyword: "ronaldo world cup goals", url: "/football/players/cristiano-ronaldo/world-cup-goals", volume: 170, kdi: 30, pattern: "player-stat", intent: "informational", sport: "football" },
  { keyword: "mbappe world cup goals", url: "/football/players/kylian-mbappe/world-cup-goals", volume: 90, kdi: 25, pattern: "player-stat", intent: "informational", sport: "football" },
  { keyword: "neymar world cup goals", url: "/football/players/neymar/world-cup-goals", volume: 70, kdi: 25, pattern: "player-stat", intent: "informational", sport: "football" },

  { keyword: "fifa world cup all time top scorers", url: "/tournaments/fifa-world-cup-all-time/top-scorers", volume: 30, kdi: 0, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },
  { keyword: "fifa world cup 2022 top scorers", url: "/tournaments/fifa-world-cup-2022/top-scorers", volume: 200, kdi: 15, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },
  { keyword: "fifa world cup 2018 top scorers", url: "/tournaments/fifa-world-cup-2018/top-scorers", volume: 150, kdi: 15, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },
  { keyword: "world cup 2022 yellow cards", url: "/tournaments/fifa-world-cup-2022/yellow-cards", volume: 90, kdi: 10, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },
  { keyword: "world cup 2022 red cards", url: "/tournaments/fifa-world-cup-2022/red-cards", volume: 90, kdi: 10, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },
  { keyword: "world cup 2018 red cards", url: "/tournaments/fifa-world-cup-2018/red-cards", volume: 50, kdi: 10, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },
  { keyword: "world cup all time yellow cards", url: "/tournaments/fifa-world-cup-all-time/yellow-cards", volume: 40, kdi: 10, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },
  { keyword: "world cup all time red cards", url: "/tournaments/fifa-world-cup-all-time/red-cards", volume: 40, kdi: 10, pattern: "tournament-leaderboard", intent: "informational", sport: "football" },

  { keyword: "top scorers 2022 season", url: "/football/top-scorers/2022", volume: 320, kdi: 25, pattern: "season-landing", intent: "informational", sport: "football" },
  { keyword: "football tournaments 2026", url: "/football/tournaments/2026", volume: 590, kdi: 30, pattern: "season-landing", intent: "informational", sport: "football" },

  { keyword: "today live football matches", url: "/live/football", volume: 60, kdi: 20, pattern: "live-hub", intent: "transactional", sport: "football" },
  { keyword: "live sports today", url: "/live/today", volume: 9900, kdi: 60, pattern: "live-hub", intent: "transactional", sport: "multi" },

  { keyword: "how fifa world cup knockouts work", url: "/guides/how-fifa-world-cup-knockouts-work", volume: 100, kdi: 5, pattern: "guide", intent: "informational", sport: "football" },
  { keyword: "how many teams in fifa world cup 2026", url: "/guides/how-many-teams-fifa-world-cup-2026", volume: 4400, kdi: 25, pattern: "guide", intent: "informational", sport: "football" },
  { keyword: "fifa world cup 2026 format", url: "/guides/fifa-world-cup-2026-format", volume: 1600, kdi: 30, pattern: "guide", intent: "informational", sport: "football" },

  // ── NBA ──────────────────────────────────────────────────────────────
  { keyword: "nba scores today", url: "/nba/scores", volume: 74000, kdi: 55, pattern: "live-hub", intent: "transactional", sport: "nba" },
  { keyword: "nba standings", url: "/nba/standings", volume: 60500, kdi: 50, pattern: "sport-hub", intent: "informational", sport: "nba" },
  { keyword: "nba stat leaders", url: "/nba/leaders", volume: 4400, kdi: 40, pattern: "sport-hub", intent: "informational", sport: "nba" },
  { keyword: "nba champions list all time", url: "/nba/champions", volume: 2900, kdi: 35, pattern: "champions-list", intent: "informational", sport: "nba" },
  { keyword: "nba finals history", url: "/nba/history", volume: 1600, kdi: 30, pattern: "records", intent: "informational", sport: "nba" },
  { keyword: "nba finals 2024", url: "/nba/finals/2024", volume: 5400, kdi: 40, pattern: "season-landing", intent: "informational", sport: "nba" },
  { keyword: "nba finals 2023", url: "/nba/finals/2023", volume: 2400, kdi: 30, pattern: "season-landing", intent: "informational", sport: "nba" },
  { keyword: "nba finals 2022", url: "/nba/finals/2022", volume: 1300, kdi: 25, pattern: "season-landing", intent: "informational", sport: "nba" },

  // ── MLB ──────────────────────────────────────────────────────────────
  { keyword: "mlb scores today", url: "/mlb/scores", volume: 90500, kdi: 55, pattern: "live-hub", intent: "transactional", sport: "mlb" },
  { keyword: "mlb standings", url: "/mlb/standings", volume: 74000, kdi: 50, pattern: "sport-hub", intent: "informational", sport: "mlb" },
  { keyword: "mlb postseason bracket", url: "/mlb/postseason", volume: 8100, kdi: 40, pattern: "sport-hub", intent: "informational", sport: "mlb" },
  { keyword: "world series champions list", url: "/mlb/champions", volume: 5400, kdi: 35, pattern: "champions-list", intent: "informational", sport: "mlb" },
  { keyword: "world series 2024", url: "/mlb/world-series/2024", volume: 40500, kdi: 45, pattern: "season-landing", intent: "informational", sport: "mlb" },
  { keyword: "world series 2023", url: "/mlb/world-series/2023", volume: 6600, kdi: 30, pattern: "season-landing", intent: "informational", sport: "mlb" },
  { keyword: "world series 2022", url: "/mlb/world-series/2022", volume: 3600, kdi: 25, pattern: "season-landing", intent: "informational", sport: "mlb" },
  { keyword: "mlb history records", url: "/mlb/history", volume: 1900, kdi: 30, pattern: "records", intent: "informational", sport: "mlb" },

  // ── NHL ──────────────────────────────────────────────────────────────
  { keyword: "nhl scores today", url: "/nhl/scores", volume: 60500, kdi: 55, pattern: "live-hub", intent: "transactional", sport: "nhl" },
  { keyword: "nhl standings", url: "/nhl/standings", volume: 49500, kdi: 50, pattern: "sport-hub", intent: "informational", sport: "nhl" },
  { keyword: "nhl stat leaders", url: "/nhl/leaders", volume: 3600, kdi: 40, pattern: "sport-hub", intent: "informational", sport: "nhl" },
  { keyword: "stanley cup champions list", url: "/nhl/champions", volume: 4400, kdi: 35, pattern: "champions-list", intent: "informational", sport: "nhl" },
  { keyword: "stanley cup 2024", url: "/nhl/stanley-cup/2024", volume: 14800, kdi: 40, pattern: "season-landing", intent: "informational", sport: "nhl" },
  { keyword: "stanley cup 2023", url: "/nhl/stanley-cup/2023", volume: 3600, kdi: 30, pattern: "season-landing", intent: "informational", sport: "nhl" },
  { keyword: "nhl history records", url: "/nhl/history", volume: 1300, kdi: 30, pattern: "records", intent: "informational", sport: "nhl" },

  // ── MLS ──────────────────────────────────────────────────────────────
  { keyword: "mls scores today", url: "/mls/scores", volume: 12100, kdi: 45, pattern: "live-hub", intent: "transactional", sport: "mls" },
  { keyword: "mls standings", url: "/mls/standings", volume: 22200, kdi: 45, pattern: "sport-hub", intent: "informational", sport: "mls" },
  { keyword: "mls top scorers", url: "/mls/leaders", volume: 3600, kdi: 35, pattern: "sport-hub", intent: "informational", sport: "mls" },
  { keyword: "mls cup champions list", url: "/mls/champions", volume: 1900, kdi: 30, pattern: "champions-list", intent: "informational", sport: "mls" },
  { keyword: "mls cup 2024", url: "/mls/cup/2024", volume: 4400, kdi: 35, pattern: "season-landing", intent: "informational", sport: "mls" },
  { keyword: "mls cup 2023", url: "/mls/cup/2023", volume: 1600, kdi: 30, pattern: "season-landing", intent: "informational", sport: "mls" },
  { keyword: "mls history records", url: "/mls/history", volume: 720, kdi: 25, pattern: "records", intent: "informational", sport: "mls" },

  // ── Cricket ──────────────────────────────────────────────────────────
  { keyword: "cricket scores live", url: "/cricket/scores", volume: 165000, kdi: 65, pattern: "live-hub", intent: "transactional", sport: "cricket" },
  { keyword: "icc rankings", url: "/cricket/rankings", volume: 33100, kdi: 50, pattern: "sport-hub", intent: "informational", sport: "cricket" },
  { keyword: "cricket records", url: "/cricket/records", volume: 8100, kdi: 40, pattern: "records", intent: "informational", sport: "cricket" },
  { keyword: "cricket world cup history", url: "/cricket/history", volume: 4400, kdi: 35, pattern: "records", intent: "informational", sport: "cricket" },
  { keyword: "cricket players list", url: "/cricket/players", volume: 5400, kdi: 45, pattern: "sport-hub", intent: "informational", sport: "cricket" },
  { keyword: "cricket highlights today", url: "/cricket/highlights", volume: 27100, kdi: 55, pattern: "live-hub", intent: "transactional", sport: "cricket" },
  { keyword: "live cricket today", url: "/live/cricket", volume: 90500, kdi: 60, pattern: "live-hub", intent: "transactional", sport: "cricket" },

  // ── IPL ──────────────────────────────────────────────────────────────
  { keyword: "ipl scores today", url: "/cricket/ipl/scores", volume: 90500, kdi: 60, pattern: "live-hub", intent: "transactional", sport: "ipl" },
  { keyword: "ipl points table", url: "/cricket/ipl/standings", volume: 165000, kdi: 65, pattern: "sport-hub", intent: "informational", sport: "ipl" },
  { keyword: "ipl orange cap", url: "/cricket/ipl/players", volume: 22200, kdi: 45, pattern: "sport-hub", intent: "informational", sport: "ipl" },
  { keyword: "ipl records all time", url: "/cricket/ipl/records", volume: 8100, kdi: 40, pattern: "records", intent: "informational", sport: "ipl" },
  { keyword: "ipl champions list", url: "/cricket/ipl/history", volume: 4400, kdi: 35, pattern: "champions-list", intent: "informational", sport: "ipl" },
  { keyword: "ipl teams 2025", url: "/cricket/ipl/teams", volume: 12100, kdi: 45, pattern: "sport-hub", intent: "informational", sport: "ipl" },

  // ── Multi-sport live ─────────────────────────────────────────────────
  { keyword: "live nba tonight", url: "/live/nba", volume: 1900, kdi: 35, pattern: "live-hub", intent: "transactional", sport: "nba" },
  { keyword: "live mlb games", url: "/live/mlb", volume: 2400, kdi: 35, pattern: "live-hub", intent: "transactional", sport: "mlb" },
  { keyword: "live nhl tonight", url: "/live/nhl", volume: 1600, kdi: 35, pattern: "live-hub", intent: "transactional", sport: "nhl" },
  { keyword: "live mls today", url: "/live/mls", volume: 880, kdi: 30, pattern: "live-hub", intent: "transactional", sport: "mls" },
];

export function targetsByPattern(p: KeywordTarget["pattern"]): KeywordTarget[] {
  return KEYWORD_TARGETS.filter((t) => t.pattern === p);
}

export function targetsBySport(sport: KeywordSport): KeywordTarget[] {
  return KEYWORD_TARGETS.filter((t) => t.sport === sport);
}

export function popularTargets(limit = 8): KeywordTarget[] {
  return [...KEYWORD_TARGETS].sort((a, b) => b.volume - a.volume).slice(0, limit);
}

export function popularTargetsBySport(sport: KeywordSport, limit = 8): KeywordTarget[] {
  const scoped = KEYWORD_TARGETS.filter((t) => t.sport === sport || t.sport === "multi");
  return scoped.sort((a, b) => b.volume - a.volume).slice(0, limit);
}

/** Sitemap priority derived from search volume. */
export function priorityFromVolume(v: number): string {
  if (v >= 1000) return "0.9";
  if (v >= 200) return "0.8";
  if (v >= 50) return "0.7";
  return "0.6";
}
