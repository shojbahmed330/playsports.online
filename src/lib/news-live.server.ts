// Server-only current-news recaps built from recent ESPN scoreboards.
// Cached in memory for 10 minutes; failures fall back to the archive recaps.
import type { NewsArticle } from "./news.server";
import { buildRecapArticle, type SeedCandidate } from "./news-auto.server";
import { fetchSportGamesOnDate } from "./espn.functions";
import { fetchMultiCricketToday } from "./cricket.functions";
import { CRICKET_LEAGUES } from "./cricket-leagues";

const SOCCER_LEAGUES = [
  { path: "soccer/eng.1", label: "Premier League" },
  { path: "soccer/esp.1", label: "La Liga" },
  { path: "soccer/ita.1", label: "Serie A" },
  { path: "soccer/ger.1", label: "Bundesliga" },
  { path: "soccer/fra.1", label: "Ligue 1" },
  { path: "soccer/uefa.champions", label: "Champions League" },
];

const TTL_MS = 10 * 60_000;
const WINDOW_MS = 4 * 24 * 60 * 60_000;

let cache: { at: number; items: NewsArticle[] } | null = null;
let inflight: Promise<NewsArticle[]> | null = null;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function dayKey(offsetDays: number): string {
  return new Date(Date.now() - offsetDays * 86_400_000).toISOString().slice(0, 10).replace(/-/g, "");
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function buildLiveRecaps(): Promise<NewsArticle[]> {
  const now = Date.now();
  const dates = [0, 1].map(dayKey);
  const footballTasks = dates.flatMap((date) =>
    SOCCER_LEAGUES.map(async (league) => {
      const games = await withTimeout(fetchSportGamesOnDate(league.path, date, league.label), 5_000, []);
      const candidates: SeedCandidate[] = [];
      for (const game of games) {
        if (game.status !== "post") continue;
        if (game.home.score == null || game.away.score == null) continue;
        if (now - game.startTs > WINDOW_MS) continue;
        const matchDate = new Date(game.startTs).toISOString().slice(0, 10);
        candidates.push({
          sport: "football",
          match_key: String(game.id),
          slug: `current-football-${slugify(game.home.name)}-vs-${slugify(game.away.name)}-${matchDate}`,
          home_team: game.home.name,
          away_team: game.away.name,
          home_score: game.home.score,
          away_score: game.away.score,
          match_date: matchDate,
          tournament: league.label,
          context: [game.venue ? `Venue: ${game.venue}` : null, "Competition: " + league.label]
            .filter(Boolean)
            .join(". "),
          matchPath: `/football/match/${game.id}`,
          recent: true,
        });
      }
      return candidates.map(buildRecapArticle);
    }),
  );

  const cricketTask = withTimeout(
    fetchMultiCricketToday({ leagueIds: CRICKET_LEAGUES.map((l) => l.id) }),
    8_000,
    [],
  ).then((matches) => {
    const candidates: SeedCandidate[] = [];
    for (const match of matches) {
      if (match.status !== "post") continue;
      if (now - match.startTs > WINDOW_MS) continue;
      const result = match.result?.marginText ?? match.note ?? null;
      const matchDate = new Date(match.startTs).toISOString().slice(0, 10);
      candidates.push({
        sport: "cricket",
        match_key: match.id,
        slug: `current-cricket-${slugify(match.home.name)}-vs-${slugify(match.away.name)}-${matchDate}`,
        home_team: match.home.name,
        away_team: match.away.name,
        home_score: null,
        away_score: null,
        match_date: matchDate,
        tournament: `${match.leagueName}${match.format ? ` (${match.format})` : ""}`,
        context: [
          match.venue ? `Venue: ${match.venue}` : null,
          result ? `Result: ${result}` : null,
        ]
          .filter(Boolean)
          .join(". "),
        matchPath: `/cricket/match/${match.id}?leagueId=${match.leagueId}`,
        recent: true,
      });
    }
    return candidates.map(buildRecapArticle);
  });

  const settled = await Promise.allSettled([...footballTasks, cricketTask]);
  const items: NewsArticle[] = [];
  const seen = new Set<string>();
  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    for (const article of result.value) {
      if (seen.has(article.slug)) continue;
      seen.add(article.slug);
      items.push(article);
    }
  }
  return items.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function listLiveRecaps(): Promise<NewsArticle[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items;
  if (inflight) return inflight;
  inflight = buildLiveRecaps()
    .then((items) => {
      cache = { at: Date.now(), items };
      return items;
    })
    .catch(() => [])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export async function getLiveRecap(slug: string): Promise<NewsArticle | null> {
  const items = await listLiveRecaps();
  return items.find((article) => article.slug === slug) ?? null;
}
