import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://allsportslive.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Static, indexable routes. Excludes /admin and /auth (disallowed via robots.txt)
// and dynamic-only layout shells. Dynamic IDs (matches/games/teams/series) are
// fetched at runtime from ESPN and not enumerable here — search engines discover
// them via internal links from the hub pages below.
const STATIC_ROUTES: SitemapEntry[] = [
  { path: "/", changefreq: "hourly", priority: "1.0" },
  { path: "/players", changefreq: "daily", priority: "0.8" },

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

  // Other sports
  { path: "/nba", changefreq: "hourly", priority: "0.8" },
  { path: "/nhl", changefreq: "hourly", priority: "0.8" },
  { path: "/mls", changefreq: "hourly", priority: "0.8" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);
        const urls = STATIC_ROUTES.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
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
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
