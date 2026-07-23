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
// Keep football split into very small category files so Google Search Console
// does not intermittently mark large generated football sitemaps as Unknown.
// The base category URL remains valid as page 1 for older submissions.
const FOOTBALL_CHUNK_SIZE = 25;
const FOOTBALL_SITEMAP_CATEGORIES = [
  "matches",
  "teams",
  "players",
  "countries",
  "records",
  "competitions",
] as const;

type BaseSitemapPart = (typeof BASE_SITEMAP_PARTS)[number];
type FootballSitemapCategory = (typeof FOOTBALL_SITEMAP_CATEGORIES)[number];
type FootballSitemapPart = `football-${FootballSitemapCategory}` | `football-${FootballSitemapCategory}-${number}`;
type SitemapPart = BaseSitemapPart | "football" | FootballSitemapPart;

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
 * Validate an authoritative page-level lastmod value. Omit missing or malformed
 * dates instead of substituting build/request time, which Google treats as a
 * weak freshness signal and can make generated sitemaps noisier in GSC.
 */
function safeLastmod(value: string | undefined): string | null {
  if (!value) return null;
  const iso = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso) return null;
  return iso;
}

function renderUrlset(entries: SitemapEntry[], _today?: string): string {
  const urls = dedupe(entries).map((e) => {
    const lastmod = safeLastmod(e.lastmod);
    return [
      `  <url>`,
      `    <loc>${absoluteLoc(e.path)}</loc>`,
      lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

function renderSitemapIndex(_today?: string, parts: string[] = rootSitemapParts()): string {
  const sitemaps = parts.map((part) =>
    [`  <sitemap>`, `    <loc>${xmlEscape(`${BASE_URL}/sitemap-${part}.xml`)}</loc>`, `  </sitemap>`].join("\n"),
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

function footballMatchSitemapEntries(): SitemapEntry[] {
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
  ];
}

function footballTeamSitemapEntries(): SitemapEntry[] {
  return listTeams().map((t) => ({
    path: `/football/teams/${t.slug}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  }));
}

function footballPlayerSitemapEntries(): SitemapEntry[] {
  return [
    ...listPlayers().map((p) => ({
      path: `/football/players/${p.slug}`,
      changefreq: "monthly" as const,
      priority: "0.6",
    })),
    ...listPlayerYears().map((py) => ({
      path: `/football/players/${py.playerSlug}/world-cup-${py.year}`,
      changefreq: "yearly" as const,
      priority: "0.55",
    })),
  ];
}

function footballCountrySitemapEntries(): SitemapEntry[] {
  return [
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
  ];
}

function footballRecordSitemapEntries(): SitemapEntry[] {
  return [
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
  ];
}

function footballSitemapEntries(): SitemapEntry[] {
  return [
    ...footballMatchSitemapEntries(),
    ...footballTeamSitemapEntries(),
    ...footballPlayerSitemapEntries(),
    ...footballCountrySitemapEntries(),
    ...footballRecordSitemapEntries(),
    ...competitionSitemapEntries(),
  ];
}

function chunkEntries(entries: SitemapEntry[], size: number): SitemapEntry[][] {
  const unique = dedupe(entries);
  const chunks: SitemapEntry[][] = [];
  for (let i = 0; i < unique.length; i += size) chunks.push(unique.slice(i, i + size));
  return chunks.length ? chunks : [[]];
}

function footballCategoryEntries(category: FootballSitemapCategory): SitemapEntry[] {
  switch (category) {
    case "matches":
      return footballMatchSitemapEntries();
    case "teams":
      return footballTeamSitemapEntries();
    case "players":
      return footballPlayerSitemapEntries();
    case "countries":
      return footballCountrySitemapEntries();
    case "records":
      return footballRecordSitemapEntries();
    case "competitions":
      return competitionSitemapEntries();
  }
}

function footballPartName(category: FootballSitemapCategory, page: number): FootballSitemapPart {
  return page === 1 ? `football-${category}` : `football-${category}-${page}`;
}

function footballSitemapParts(): FootballSitemapPart[] {
  return FOOTBALL_SITEMAP_CATEGORIES.flatMap((category) => {
    const chunks = chunkEntries(footballCategoryEntries(category), FOOTBALL_CHUNK_SIZE);
    return chunks.map((_, index) => footballPartName(category, index + 1));
  });
}

function parseFootballSitemapPart(part: string): { category: FootballSitemapCategory; page: number } | null {
  if (!part.startsWith("football-")) return null;
  const suffix = part.slice("football-".length);
  const numbered = suffix.match(/^(.*)-(\d+)$/);
  const category = (numbered ? numbered[1] : suffix) as FootballSitemapCategory;
  if (!(FOOTBALL_SITEMAP_CATEGORIES as readonly string[]).includes(category)) return null;
  const page = numbered ? Number(numbered[2]) : 1;
  if (!Number.isInteger(page) || page < 1) return null;
  return { category, page };
}

function rootSitemapParts(): string[] {
  return ["core", ...footballSitemapParts(), "cricket", "us-sports", "hockey-soccer", "legacy"];
}

function isFootballSitemapPart(part: string): part is FootballSitemapPart {
  return footballSitemapParts().includes(part as FootballSitemapPart);
}

function isValidSitemapPart(part: string): part is SitemapPart {
  if (part === "football") return true;
  if ((BASE_SITEMAP_PARTS as readonly string[]).includes(part)) return true;
  return isFootballSitemapPart(part);
}

async function entriesForPart(part: SitemapPart): Promise<SitemapEntry[]> {
  const footballPart = parseFootballSitemapPart(part);
  if (footballPart) {
    const chunks = chunkEntries(footballCategoryEntries(footballPart.category), FOOTBALL_CHUNK_SIZE);
    return chunks[footballPart.page - 1] ?? [];
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
      ];
    }
    case "hockey-soccer": {
      return [
        ...nhlSeoTeamUrls(),
        ...nhlSeoPlayerUrls(),
        ...nhlSeoStanleyCupUrls(),
        ...mlsSeoTeamUrls(),
        ...mlsSeoPlayerUrls(),
        ...mlsSeoCupUrls(),
        ...nhlProgrammaticUrls(),
        ...mlsProgrammaticUrls(),
      ];
    }
    case "legacy":
      return [
        // Legacy /team/$sport/$slug and /player/$sport/$slug 301 to canonical
        // /football/teams/$slug and /football/players/$slug — excluded from
        // sitemap to avoid "Page with redirect" in GSC.
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

  return [];
}

// Re-exported so the path-based `/sitemap-{part}.xml` route can share the
// exact same logic — Google Search Console reliably fetches path-based
// sitemap URLs but often skips `?query=` variants in a sitemap index.
export {
  entriesForPart,
  renderUrlset,
  renderSitemapIndex,
  isValidSitemapPart,
  isFootballSitemapPart,
  footballSitemapParts,
  rootSitemapParts,
};
export type { SitemapPart };


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
