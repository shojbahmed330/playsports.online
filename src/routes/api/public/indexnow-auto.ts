// Auto IndexNow ping — cron-friendly endpoint.
//
// POST with header `x-indexnow-secret` matching INDEXNOW_PING_SECRET.
// No body required. Picks a curated set of high-value URLs (hubs +
// recently-updated matches + live pages) and pings Bing/Yandex/Seznam.
//
// Designed to be called by pg_cron on a daily/hourly schedule.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { pingIndexNow } from "@/lib/seo/indexnow.server";
import { listMatchSlugs } from "@/lib/seo/entities";
import { KEYWORD_TARGETS } from "@/lib/seo/keyword-map";

function collectPaths(): string[] {
  const paths = new Set<string>();

  // Top-level hubs
  ["/", "/football", "/cricket", "/mlb", "/nba", "/nhl", "/mls", "/live/today"].forEach((p) => paths.add(p));
  ["football", "cricket", "mlb", "nba", "nhl", "mls"].forEach((s) => paths.add(`/live/${s}`));

  // Programmatic keyword targets (high SEO value)
  KEYWORD_TARGETS.slice(0, 200).forEach((k) => paths.add(k.url));

  // Recently-active matches (within last 14 days) — likely to have
  // updated stats/lineups/results, so notify search engines fast.
  const now = Date.now();
  const WINDOW_MS = 14 * 24 * 3600 * 1000;
  try {
    for (const m of listMatchSlugs()) {
      const d = m.match_date ? Date.parse(m.match_date) : NaN;
      if (!Number.isNaN(d) && Math.abs(now - d) < WINDOW_MS) {
        paths.add(`/football/matches/${m.slug}`);
      }
    }
  } catch {
    /* fall through — hubs alone still ping */
  }

  // IndexNow limits ~10k URLs per request; cap to keep pings snappy.
  return Array.from(paths).slice(0, 500);
}

export const Route = createFileRoute("/api/public/indexnow-auto")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.INDEXNOW_PING_SECRET;
        if (!expected || request.headers.get("x-indexnow-secret") !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const paths = collectPaths();
        const result = await pingIndexNow(paths);
        return new Response(
          JSON.stringify({ ...result, pinged: paths.length }),
          {
            status: result.ok ? 200 : 502,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
