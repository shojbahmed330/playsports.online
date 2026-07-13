import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listTeams, listPlayers, listH2H, listArchives, listCountryYears, listPlayerYears } from "@/lib/seo/programmatic";
import { COMPETITIONS } from "@/lib/competitions";
import { COMPETITION_EDITIONS } from "@/data/competition-editions";
import { WC_TOURNAMENTS } from "@/data/wc_tournaments";
import { programmaticCampaignUrls, programmaticTopScorerUrls } from "@/lib/seo/programmatic-pages";
import {
  mlbProgrammaticUrls,
  nbaProgrammaticUrls,
  nhlProgrammaticUrls,
  mlsProgrammaticUrls,
  cricketProgrammaticUrls,
} from "@/lib/seo/multisport-programmatic";
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
  nhlSeoTeamUrls,
  nhlSeoPlayerUrls,
  nhlSeoStanleyCupUrls,
  mlsSeoTeamUrls,
  mlsSeoPlayerUrls,
  mlsSeoCupUrls,
  nbaSeoTeamUrls,
  nbaSeoPlayerUrls,
  nbaSeoFinalsUrls,
} from "@/lib/seo/sitemap-sources";

const BASE_URL = "https://www.playsports.online";
const BASE_SITEMAP_PARTS = ["core", "cricket", "us-sports", "hockey-soccer", "legacy"] as const;
// Keep football sitemap chunks intentionally small. Google Search Console was
// fetching 1–2 but failing 3–6 when chunks had ~900 URLs each, so split into
// safer 250-URL files.
const FOOTBALL_CHUNK_SIZE = 50;

type BaseSitemapPart = (typeof BASE_SITEMAP_PARTS)[number];
type FootballChunkPart = `football-${number}`;
type SitemapPart = BaseSitemapPart | "football" | FootballChunkPart;

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
  { path: "/football/players", changefreq: "weekly", priority: "0.8" },
  { path: "/football/countries", changefreq: "weekly", priority: "0.8" },
  { path: "/football/venues", changefreq: "monthly", priority: "0.7" },
  { path: "/football/records/top-scorers-all-time", changefreq: "weekly", priority: "0.7" },
  { path: "/football/records/iconic-records", changefreq: "monthly", priority: "0.6" },
  { path: "/football/records/2026-tournament", changefreq: "daily", priority: "0.7" },
  { path: "/football/records/tournament-totals", changefreq: "monthly", priority: "0.6" },
  { path: "/search", changefreq: "monthly", priority: "0.5" },


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
  { path: "/mlb/champions", changefreq: "monthly", priority: "0.6" },
  { path: "/mlb/history", changefreq: "monthly", priority: "0.5" },

  // NBA
  { path: "/nba", changefreq: "hourly", priority: "0.9" },
  { path: "/nba/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/nba/standings", changefreq: "daily", priority: "0.8" },
  { path: "/nba/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/nba/leaders", changefreq: "daily", priority: "0.8" },
  { path: "/nba/news", changefreq: "hourly", priority: "0.7" },
  { path: "/nba/champions", changefreq: "monthly", priority: "0.6" },
  { path: "/nba/history", changefreq: "monthly", priority: "0.5" },

  // NHL
  { path: "/nhl", changefreq: "hourly", priority: "0.9" },
  { path: "/nhl/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/nhl/standings", changefreq: "daily", priority: "0.8" },
  { path: "/nhl/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/nhl/leaders", changefreq: "daily", priority: "0.8" },
  { path: "/nhl/news", changefreq: "hourly", priority: "0.7" },
  { path: "/nhl/champions", changefreq: "monthly", priority: "0.6" },
  { path: "/nhl/history", changefreq: "monthly", priority: "0.5" },

  // MLS / Soccer
  { path: "/mls", changefreq: "hourly", priority: "0.9" },
  { path: "/mls/scores", changefreq: "hourly", priority: "0.8" },
  { path: "/mls/standings", changefreq: "daily", priority: "0.8" },
  { path: "/mls/teams", changefreq: "weekly", priority: "0.7" },
  { path: "/mls/leaders", changefreq: "daily", priority: "0.8" },
  { path: "/mls/news", changefreq: "hourly", priority: "0.7" },
  { path: "/mls/champions", changefreq: "monthly", priority: "0.6" },
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

/**
 * Validate a lastmod value. Google Search Console rejects anything that is
 * not W3C datetime (YYYY-MM-DD or full ISO 8601) with "Invalid date".
 * Falls back to `today` when the value is missing, malformed, or not a real
 * date (e.g. "1930", "2026-13-40", or a non-ISO string).
 */
function safeLastmod(value: string | undefined, today: string): string {
  if (!value) return today;
  const iso = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return today;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return today;
  return iso;
}

function renderUrlset(entries: SitemapEntry[], today: string): string {
  const urls = dedupe(entries).map((e) =>
    [
      `  <url>`,
      `    <loc>${absoluteLoc(e.path)}</loc>`,
      `    <lastmod>${safeLastmod(e.lastmod, today)}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

function renderSitemapIndex(today: string, parts: string[] = rootSitemapParts()): string {
  const sitemaps = parts.map((part) =>
    [`  <sitemap>`, `    <loc>${xmlEscape(`${BASE_URL}/sitemap.xml?part=${part}`)}</loc>`, `    <lastmod>${today}</lastmod>`, `  </sitemap>`].join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...sitemaps,
    `</sitemapindex>`,
  ].join("\n");
}

function competitionSitemapEntries(): SitemapEntry[] {
  const out: SitemapEntry[] = [];
  const sections = ["", "/scores", "/fixtures", "/standings", "/history", "/records", "/teams", "/players"] as const;
  const recordCats = ["top-scorers-all-time", "most-titles", "most-appearances", "records-and-firsts"] as const;
  for (const c of COMPETITIONS) {
    if (c.slug === "world-cup") continue; // WC has bespoke routes already in the sitemap.
    for (const s of sections) {
      out.push({
        path: `/football/${c.slug}${s}`,
        changefreq: s === "/scores" || s === "" ? "hourly" : "weekly",
        priority: s === "" ? "0.85" : "0.7",
      });
    }
    for (const cat of recordCats) {
      out.push({ path: `/football/${c.slug}/records/${cat}`, changefreq: "weekly", priority: "0.6" });
    }
    for (const e of COMPETITION_EDITIONS[c.slug] ?? []) {
      out.push({ path: `/football/${c.slug}/history/${e.year}`, changefreq: "monthly", priority: "0.65" });
    }
  }
  return out;
}

function footballSitemapEntries(): SitemapEntry[] {
  return [
    ...wc2026MatchUrls(),
    ...listMatchSlugs().map((m) => {
      // lastmod = page-modified date, NOT the match/event date.
      // Historical dates (e.g. 1930) are flagged "Invalid date" by Google.
      // Only use match_date when it's recent (last ~2 years); otherwise fall
      // back to today via safeLastmod (undefined lastmod).
      const iso = m.match_date?.slice(0, 10);
      const isRecent = iso ? Date.now() - Date.parse(iso) < 2 * 365 * 24 * 3600 * 1000 : false;
      return {
        path: `/football/matches/${m.slug}`,
        lastmod: isRecent ? iso : undefined,
        changefreq: "yearly" as const,
        priority: "0.6",
      };
    }),
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
    ...WC_TOURNAMENTS.map((t) => ({
      path: `/football/tournaments/${t.year}`,
      changefreq: "monthly" as const,
      priority: "0.75",
    })),
    ...listCountryYears().map((cy) => ({
      path: `/football/countries/${cy.countrySlug}/world-cup-${cy.year}`,
      changefreq: "yearly" as const,
      priority: "0.65",
    })),
    ...listPlayerYears().map((py) => ({
      path: `/football/players/${py.playerSlug}/world-cup-${py.year}`,
      changefreq: "yearly" as const,
      priority: "0.55",
    })),
    ...listHighlights().map((h) => ({
      path: `/highlights/${h.slug}`,
      changefreq: "monthly" as const,
      priority: "0.6",
    })),
    ...programmaticTopScorerUrls(),
    ...programmaticCampaignUrls(),
    ...listLeaderboardUrls().map((u) => ({
      path: `/tournaments/${u.tournament}/${u.leaderboard}`,
      changefreq: "weekly" as const,
      priority: "0.7",
    })),
    ...competitionSitemapEntries(),
  ];
}

function footballChunkCount(): number {
  return Math.max(1, Math.ceil(dedupe(footballSitemapEntries()).length / FOOTBALL_CHUNK_SIZE));
}

function footballChunkParts(): FootballChunkPart[] {
  return Array.from({ length: footballChunkCount() }, (_, i) => `football-${i + 1}` as FootballChunkPart);
}

function rootSitemapParts(): string[] {
  return ["core", ...footballChunkParts(), "cricket", "us-sports", "hockey-soccer", "legacy"];
}

function isFootballChunkPart(part: string): part is FootballChunkPart {
  return /^football-[1-9]\d*$/.test(part);
}

function isValidSitemapPart(part: string): part is SitemapPart {
  if (part === "football") return true;
  if ((BASE_SITEMAP_PARTS as readonly string[]).includes(part)) return true;
  if (!isFootballChunkPart(part)) return false;
  const chunkNumber = Number(part.replace("football-", ""));
  return chunkNumber >= 1 && chunkNumber <= footballChunkCount();
}

async function entriesForPart(part: SitemapPart): Promise<SitemapEntry[]> {
  if (isFootballChunkPart(part)) {
    const entries = dedupe(footballSitemapEntries());
    const chunkNumber = Number(part.replace("football-", ""));
    const start = (chunkNumber - 1) * FOOTBALL_CHUNK_SIZE;
    return entries.slice(start, start + FOOTBALL_CHUNK_SIZE);
  }

  switch (part) {
    case "core":
      return [
        ...STATIC_ROUTES,
        ...WC2026_STAGES.map((s) => ({
          path: `/tournaments/fifa-world-cup-2026/${s.slug}`,
          changefreq: "daily" as const,
          priority: "0.8",
        })),
        ...listGuides().map((g) => ({
          path: `/guides/${g.slug}`,
          lastmod: g.updated,
          changefreq: "monthly" as const,
          priority: "0.7",
        })),
        { path: "/live/today", changefreq: "always" as const, priority: "0.8" },
        ...["football", "cricket", "mlb", "nba", "nhl", "mls"].map((s) => ({
          path: `/live/${s}`,
          changefreq: "always" as const,
          priority: "0.7",
        })),
        ...KEYWORD_TARGETS.map((k) => ({
          path: k.url,
          changefreq: "weekly" as const,
          priority: priorityFromVolume(k.volume),
        })),
      ];
    case "football":
      return footballSitemapEntries();
    case "cricket": {
      const [iplTeams, cricketSeries] = await Promise.all([iplTeamUrls(), cricketSeriesUrls()]);
      return [
        ...cricketSeoTeamUrls(),
        ...cricketSeoPlayerUrls(),
        ...cricketSeoTournamentUrls(),
        ...cricketSeoRecordUrls(),
        ...cricketSeoHighlightUrls(),
        { path: "/cricket/highlights", changefreq: "weekly", priority: "0.75" },
        ...cricketProgrammaticUrls(),
        ...iplTeams,
        ...cricketSeries,
      ];
    }
    case "us-sports": {
      const [mlbTeams, nbaTeams] = await Promise.all([mlbTeamUrls(), nbaTeamUrls()]);
      return [
        ...mlbSeoTeamUrls(),
        ...mlbSeoPlayerUrls(),
        ...mlbSeoWorldSeriesUrls(),
        ...mlbSeoRecordUrls(),
        ...nbaSeoTeamUrls(),
        ...nbaSeoPlayerUrls(),
        ...nbaSeoFinalsUrls(),
        ...mlbProgrammaticUrls(),
        ...nbaProgrammaticUrls(),
        ...mlbTeams,
        ...nbaTeams,
      ];
    }
    case "hockey-soccer": {
      const [nhlTeams, mlsTeams] = await Promise.all([nhlTeamUrls(), mlsTeamUrls()]);
      return [
        ...nhlSeoTeamUrls(),
        ...nhlSeoPlayerUrls(),
        ...nhlSeoStanleyCupUrls(),
        ...mlsSeoTeamUrls(),
        ...mlsSeoPlayerUrls(),
        ...mlsSeoCupUrls(),
        ...nhlProgrammaticUrls(),
        ...mlsProgrammaticUrls(),
        ...nhlTeams,
        ...mlsTeams,
      ];
    }
    case "legacy":
      return [
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
      ];
  }
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      HEAD: async () => {
        return new Response(null, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600",
          },
        });
      },
      GET: async ({ request }) => {
        const today = new Date().toISOString().slice(0, 10);
        const url = new URL(request.url);
        const part = url.searchParams.get("part");

        if (!part) {
          return new Response(renderSitemapIndex(today), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600",
              "X-Sitemap-Type": "index",
            },
          });
        }

        if (!isValidSitemapPart(part)) {
          return new Response("Sitemap part not found", { status: 404 });
        }

        if (part === "football") {
          return new Response(renderSitemapIndex(today, footballChunkParts()), {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600",
              "X-Sitemap-Type": "index",
              "X-Sitemap-Part": part,
            },
          });
        }

        const entries = await entriesForPart(part as SitemapPart);
        const xml = renderUrlset(entries, today);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Fresh for 1h at the edge, stale-while-revalidate for 6h.
            "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=21600",
            "X-Sitemap-Type": "urlset",
            "X-Sitemap-Part": part,
            "X-Sitemap-Url-Count": String(dedupe(entries).length),
          },
        });
      },
    },
  },
});
