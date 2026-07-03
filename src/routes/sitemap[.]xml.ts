import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listTeams, listPlayers, listH2H, listArchives } from "@/lib/seo/programmatic";
import { listMatchSlugs, listHighlights, WC2026_STAGES } from "@/lib/seo/entities";
import { listLeaderboardUrls } from "@/lib/seo/leaderboards";
import { listGuides } from "@/content/guides";
import { KEYWORD_TARGETS, priorityFromVolume } from "@/lib/seo/keyword-map";
import {
  wc2026MatchUrls,
  mlbTeamUrls,
  nbaTeamUrls,
  nhlTeamUrls,
  mlsTeamUrls,
  iplTeamUrls,
  cricketSeriesUrls,
  cricketSeoTeamUrls,
  cricketSeoPlayerUrls,
  cricketSeoTournamentUrls,
  cricketSeoRecordUrls,
  cricketSeoHighlightUrls,
  mlbSeoTeamUrls,
  mlbSeoPlayerUrls,
  mlbSeoWorldSeriesUrls,
  mlbSeoRecordUrls,
  type DynamicUrl,
} from "@/lib/seo/sitemap-sources";

const BASE_URL = "https://www.playsports.online";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Static, indexable routes. Excludes /admin, /auth, /mine, /premium and other
// user-scoped pages. Dynamic $id / $slug routes are enumerated below from
// their real data sources.
const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "hourly", priority: "1.0" },
  { path: "/players", changefreq: "daily", priority: "0.8" },

  // Trust / info
  { path: "/about", changefreq: "monthly", priority: "0.4" },
  { path: "/contact", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy", changefreq: "monthly", priority: "0.3" },
  { path: "/terms", changefreq: "monthly", priority: "0.3" },
  { path: "/cookies", changefreq: "monthly", priority: "0.3" },
  { path: "/disclaimer", changefreq: "monthly", priority: "0.3" },

  // Football / FIFA World Cup
  { path: "/football", changefreq: "hourly", priority: "0.9" },

  // Cricket
  { path: "/cricket", changefreq: "hourly", priority: "0.9" },
  { path: "/cricket/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/cricket/series", changefreq: "daily", priority: "0.7" },
  { path: "/cricket/teams", changefreq: "weekly", priority: "0.6" },
  { path: "/cricket/players", changefreq: "weekly", priority: "0.7" },
  { path: "/cricket/rankings", changefreq: "daily", priority: "0.7" },
  { path: "/cricket/records", changefreq: "weekly", priority: "0.6" },
  { path: "/cricket/history", changefreq: "monthly", priority: "0.5" },

  // IPL
  { path: "/cricket/ipl", changefreq: "daily", priority: "0.8" },
  { path: "/cricket/ipl/scores", changefreq: "hourly", priority: "0.7" },
  { path: "/cricket/ipl/standings", changefreq: "daily", priority: "0.7" },
  { path: "/cricket/ipl/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/cricket/ipl/players", changefreq: "weekly", priority: "0.7" },
  { path: "/cricket/ipl/records", changefreq: "weekly", priority: "0.6" },
  { path: "/cricket/ipl/history", changefreq: "monthly", priority: "0.5" },

  // MLB
  { path: "/mlb", changefreq: "hourly", priority: "0.9" },
  { path: "/mlb/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/mlb/standings", changefreq: "daily", priority: "0.8" },
  { path: "/mlb/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/mlb/players", changefreq: "daily", priority: "0.8" },
  { path: "/mlb/news", changefreq: "hourly", priority: "0.7" },
  { path: "/mlb/postseason", changefreq: "daily", priority: "0.7" },
  { path: "/mlb/history", changefreq: "monthly", priority: "0.5" },

  // NBA
  { path: "/nba", changefreq: "hourly", priority: "0.9" },
  { path: "/nba/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/nba/standings", changefreq: "daily", priority: "0.8" },
  { path: "/nba/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/nba/leaders", changefreq: "daily", priority: "0.8" },
  { path: "/nba/news", changefreq: "hourly", priority: "0.7" },
  { path: "/nba/history", changefreq: "monthly", priority: "0.5" },

  // NHL
  { path: "/nhl", changefreq: "hourly", priority: "0.9" },
  { path: "/nhl/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/nhl/standings", changefreq: "daily", priority: "0.8" },
  { path: "/nhl/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/nhl/leaders", changefreq: "daily", priority: "0.8" },
  { path: "/nhl/news", changefreq: "hourly", priority: "0.7" },
  { path: "/nhl/history", changefreq: "monthly", priority: "0.5" },

  // MLS / Soccer
  { path: "/mls", changefreq: "hourly", priority: "0.9" },
  { path: "/mls/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/mls/standings", changefreq: "daily", priority: "0.8" },
  { path: "/mls/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/mls/leaders", changefreq: "daily", priority: "0.8" },
  { path: "/mls/news", changefreq: "hourly", priority: "0.7" },
  { path: "/mls/history", changefreq: "monthly", priority: "0.5" },
];

/** XML-escape a value going inside an element body (loc, lastmod, etc). */
function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Build a canonical absolute URL for a sitemap entry. Path segments are
 * URL-encoded to keep unusual slugs valid, then XML-escaped for the body.
 */
function absoluteLoc(path: string): string {
  const encoded = path
    .split("/")
    .map((seg) => (seg ? encodeURIComponent(seg) : seg))
    .join("/");
  return xmlEscape(`${BASE_URL}${encoded}`);
}

function dedupe(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Map<string, SitemapEntry>();
  for (const e of entries) {
    // First writer wins so hand-curated STATIC_ROUTES keep their priority.
    if (!seen.has(e.path)) seen.set(e.path, e);
  }
  return Array.from(seen.values());
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);

        // Fetch every enumerable source in parallel. Each helper is safe:
        // a failing upstream yields an empty array, never a rejected promise.
        const [mlbTeams, nbaTeams, nhlTeams, mlsTeams, iplTeams, cricketSeries] = await Promise.all([
          mlbTeamUrls(),
          nbaTeamUrls(),
          nhlTeamUrls(),
          mlsTeamUrls(),
          iplTeamUrls(),
          cricketSeriesUrls(),
        ]);

        const programmatic: DynamicUrl[] = [
          ...wc2026MatchUrls(),
          // Phase 2.1 canonical football landing pages
          ...listMatchSlugs().map((m) => ({
            path: `/football/matches/${m.slug}`,
            lastmod: m.match_date?.slice(0, 10),
            changefreq: "yearly" as const,
            priority: "0.6",
          })),
          ...listTeams().map((t) => ({
            path: `/football/teams/${t.slug}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          ...listPlayers().map((p) => ({
            path: `/football/players/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
          ...listHighlights().map((h) => ({
            path: `/highlights/${h.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
          // Phase 2.1 canonical cricket landing pages
          ...cricketSeoTeamUrls(),
          ...cricketSeoPlayerUrls(),
          ...cricketSeoTournamentUrls(),
          ...cricketSeoRecordUrls(),
          ...cricketSeoHighlightUrls(),
          { path: "/cricket/highlights", changefreq: "weekly", priority: "0.75" },
          // Phase 2.1 canonical MLB landing pages
          ...mlbSeoTeamUrls(),
          ...mlbSeoPlayerUrls(),
          ...mlbSeoWorldSeriesUrls(),
          ...mlbSeoRecordUrls(),
          ...WC2026_STAGES.map((s) => ({
            path: `/tournaments/fifa-world-cup-2026/${s.slug}`,
            changefreq: "daily" as const,
            priority: "0.8",
          })),
          // Phase 2.2 — Tournament leaderboards (top-scorers / yellow-cards / red-cards)
          ...listLeaderboardUrls().map((u) => ({
            path: `/tournaments/${u.tournament}/${u.leaderboard}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          // Phase 2.2 — Evergreen guides
          ...listGuides().map((g) => ({
            path: `/guides/${g.slug}`,
            lastmod: g.updated,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
          // Phase 2.2 — Live hubs
          { path: "/live/today", changefreq: "always" as const, priority: "0.8" },
          ...["football", "cricket", "mlb", "nba", "nhl", "mls"].map((s) => ({
            path: `/live/${s}`,
            changefreq: "always" as const,
            priority: "0.7",
          })),
          // Phase 2.2 — Keyword-target priority boost (overrides earlier entries via dedupe first-writer)
          ...KEYWORD_TARGETS.map((k) => ({
            path: k.url,
            changefreq: "weekly" as const,
            priority: priorityFromVolume(k.volume),
          })),
          // Legacy multi-sport landing pages (redirect for football_wc)
          ...listTeams().map((t) => ({
            path: `/team/${t.sport}/${t.slug}`,
            changefreq: "weekly" as const,
            priority: "0.5",
          })),
          ...listPlayers().map((p) => ({
            path: `/player/${p.sport}/${p.slug}`,
            changefreq: "monthly" as const,
            priority: "0.4",
          })),
          ...listH2H().map((h) => ({
            path: `/vs/${h.sport}/${h.slug}`,
            changefreq: "monthly" as const,
            priority: "0.5",
          })),
          ...listArchives().map((a) => ({
            path: `/archive/${a.sport}/${a.year}`,
            changefreq: "yearly" as const,
            priority: "0.6",
          })),
          ...mlbTeams,
          ...nbaTeams,
          ...nhlTeams,
          ...mlsTeams,
          ...iplTeams,
          ...cricketSeries,
        ];

        const all = dedupe([...STATIC_ROUTES, ...programmatic]);

        const urls = all.map((e) =>
          [
            `  <url>`,
            `    <loc>${absoluteLoc(e.path)}</loc>`,
            `    <lastmod>${e.lastmod ?? today}</lastmod>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Fresh for 1h at the edge, stale-while-revalidate for 6h.
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600",
            "X-Robots-Tag": "noindex",
            "X-Sitemap-Url-Count": String(all.length),
          },
        });
      },
    },
  },
});
