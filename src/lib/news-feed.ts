// Pure builders for the news RSS feed and related-article links.
import type { NewsSummary } from "./news.server";

const SITE_URL = "https://www.playsports.online";
const FEED_TITLE = "PlaySports — Match recaps & analysis";
const FEED_DESCRIPTION =
  "Data-grounded cricket and football match recaps, results and analysis from PlaySports.";

export type NewsFeedItem = Pick<
  NewsSummary,
  "slug" | "headline" | "summary" | "sport" | "updatedAt"
>;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rssDate(value: string | Date, fallback: Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return (Number.isNaN(date.getTime()) ? fallback : date).toUTCString();
}

export function buildNewsRss(
  items: NewsFeedItem[],
  options: { siteUrl?: string; generatedAt?: Date } = {},
): string {
  const site = (options.siteUrl ?? SITE_URL).replace(/\/$/, "");
  const now = options.generatedAt ?? new Date();

  const entries = items.map((item) => {
    const link = `${site}/news/${encodeURIComponent(item.slug)}`;
    return [
      "    <item>",
      `      <title>${escapeXml(item.headline)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <description>${escapeXml(item.summary)}</description>`,
      `      <pubDate>${rssDate(item.updatedAt, now)}</pubDate>`,
      `      <category>${escapeXml(item.sport)}</category>`,
      "    </item>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(FEED_TITLE)}</title>`,
    `    <link>${escapeXml(`${site}/news`)}</link>`,
    `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
    "    <language>en</language>",
    `    <lastBuildDate>${rssDate(now, now)}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(`${site}/news/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    ...entries,
    "  </channel>",
    "</rss>",
  ].join("\n");
}

/**
 * The entity page a recap belongs to. Only sports with a real match/highlight
 * page get a link; other recaps stay on /news to avoid dead ends.
 */
export function recapMatchPath(
  sport: string,
  matchKey: string | null | undefined,
): string | null {
  if (!matchKey) return null;
  if (sport === "football") return `/football/matches/${encodeURIComponent(matchKey)}`;
  if (sport === "cricket") return `/cricket/highlights/${encodeURIComponent(matchKey)}`;
  return null;
}

/** Other recaps for the article footer: same sport first, then newest. */
export function pickRelatedNews(
  currentSlug: string,
  currentSport: string,
  all: NewsFeedItem[],
  limit = 6,
): NewsFeedItem[] {
  const rank = (item: NewsFeedItem) => (item.sport === currentSport ? 0 : 1);
  return all
    .filter((item) => item.slug !== currentSlug)
    .sort((a, b) => {
      const bySport = rank(a) - rank(b);
      if (bySport !== 0) return bySport;
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    })
    .slice(0, Math.max(limit, 0));
}
