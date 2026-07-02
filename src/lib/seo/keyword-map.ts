// Phase 2.2 — Keyword → URL registry. Single source of truth for long-tail
// SEO targets. Used by sitemap (priority weighting), internal linking, and
// the admin dashboard.

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
    | "sport-hub";
  intent: "informational" | "transactional" | "navigational";
};

export const KEYWORD_TARGETS: KeywordTarget[] = [
  // ── Player deep-dive stats ────────────────────────────────────────────
  { keyword: "messi world cup goals", url: "/football/players/lionel-messi/world-cup-goals", volume: 140, kdi: 42, pattern: "player-stat", intent: "informational" },
  { keyword: "ronaldo world cup goals", url: "/football/players/cristiano-ronaldo/world-cup-goals", volume: 170, kdi: 30, pattern: "player-stat", intent: "informational" },
  { keyword: "mbappe world cup goals", url: "/football/players/kylian-mbappe/world-cup-goals", volume: 90, kdi: 25, pattern: "player-stat", intent: "informational" },
  { keyword: "neymar world cup goals", url: "/football/players/neymar/world-cup-goals", volume: 70, kdi: 25, pattern: "player-stat", intent: "informational" },

  // ── Tournament leaderboards ──────────────────────────────────────────
  { keyword: "fifa world cup all time top scorers", url: "/tournaments/fifa-world-cup-all-time/top-scorers", volume: 30, kdi: 0, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "fifa world cup 2022 top scorers", url: "/tournaments/fifa-world-cup-2022/top-scorers", volume: 200, kdi: 15, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "fifa world cup 2018 top scorers", url: "/tournaments/fifa-world-cup-2018/top-scorers", volume: 150, kdi: 15, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "fifa world cup 2026 top scorers", url: "/tournaments/fifa-world-cup-2026/top-scorers", volume: 100, kdi: 30, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "world cup 2022 yellow cards", url: "/tournaments/fifa-world-cup-2022/yellow-cards", volume: 90, kdi: 10, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "world cup 2022 red cards", url: "/tournaments/fifa-world-cup-2022/red-cards", volume: 90, kdi: 10, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "world cup 2018 red cards", url: "/tournaments/fifa-world-cup-2018/red-cards", volume: 50, kdi: 10, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "world cup all time yellow cards", url: "/tournaments/fifa-world-cup-all-time/yellow-cards", volume: 40, kdi: 10, pattern: "tournament-leaderboard", intent: "informational" },
  { keyword: "world cup all time red cards", url: "/tournaments/fifa-world-cup-all-time/red-cards", volume: 40, kdi: 10, pattern: "tournament-leaderboard", intent: "informational" },

  // ── Live hubs ────────────────────────────────────────────────────────
  { keyword: "today live football matches", url: "/live/football", volume: 60, kdi: 20, pattern: "live-hub", intent: "transactional" },
  { keyword: "live sports today", url: "/live/today", volume: 9900, kdi: 60, pattern: "live-hub", intent: "transactional" },

  // ── Guides (evergreen) ───────────────────────────────────────────────
  { keyword: "how fifa world cup knockouts work", url: "/guides/how-fifa-world-cup-knockouts-work", volume: 100, kdi: 5, pattern: "guide", intent: "informational" },
  { keyword: "how many teams in fifa world cup 2026", url: "/guides/how-many-teams-fifa-world-cup-2026", volume: 4400, kdi: 25, pattern: "guide", intent: "informational" },
  { keyword: "fifa world cup 2026 format", url: "/guides/fifa-world-cup-2026-format", volume: 1600, kdi: 30, pattern: "guide", intent: "informational" },
];

export function targetsByPattern(p: KeywordTarget["pattern"]): KeywordTarget[] {
  return KEYWORD_TARGETS.filter((t) => t.pattern === p);
}

export function popularTargets(limit = 8): KeywordTarget[] {
  return [...KEYWORD_TARGETS].sort((a, b) => b.volume - a.volume).slice(0, limit);
}

/** Sitemap priority derived from search volume. */
export function priorityFromVolume(v: number): string {
  if (v >= 1000) return "0.9";
  if (v >= 200) return "0.8";
  if (v >= 50) return "0.7";
  return "0.6";
}
