import { describe, expect, it } from "vitest";
import { buildNewsRss, pickRelatedNews, recapMatchPath, type NewsFeedItem } from "@/lib/news-feed";

const base: NewsFeedItem = {
  slug: "brazil-2-1-argentina",
  headline: "Brazil edge Argentina in a classic",
  summary: "A late winner settled it.",
  sport: "football",
  updatedAt: "2026-11-27T10:00:00Z",
};

describe("news RSS feed", () => {
  it("builds a valid RSS document with absolute links", () => {
    const xml = buildNewsRss([base], { generatedAt: new Date("2026-11-27T12:00:00Z") });

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<title>PlaySports — Match recaps &amp; analysis</title>");
    expect(xml).toContain("<link>https://www.playsports.online/news</link>");
    expect(xml).toContain("<link>https://www.playsports.online/news/brazil-2-1-argentina</link>");
    expect(xml).toContain("<pubDate>Fri, 27 Nov 2026 10:00:00 GMT</pubDate>");
    expect(xml).toContain("<lastBuildDate>Fri, 27 Nov 2026 12:00:00 GMT</lastBuildDate>");
    expect(xml).toContain("<category>football</category>");
  });

  it("escapes XML-sensitive characters in stored text", () => {
    const xml = buildNewsRss([
      {
        ...base,
        headline: `Q&A: "Big" win <script>`,
        summary: "Tom & Jerry's derby",
      },
    ]);

    expect(xml).not.toContain("<script>");
    expect(xml).toContain("Q&amp;A: &quot;Big&quot; win &lt;script&gt;");
    expect(xml).toContain("Tom &amp; Jerry&apos;s derby");
  });

  it("keeps an empty feed valid", () => {
    const xml = buildNewsRss([]);
    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});

describe("recap match links", () => {
  it("maps football and cricket recaps back to their match page", () => {
    expect(recapMatchPath("football", "brazil-vs-argentina-1982-07-02")).toBe(
      "/football/matches/brazil-vs-argentina-1982-07-02",
    );
    expect(recapMatchPath("cricket", "india-vs-pakistan-2025-02-23")).toBe(
      "/cricket/highlights/india-vs-pakistan-2025-02-23",
    );
  });

  it("returns null when there is no match page for the sport", () => {
    expect(recapMatchPath("mlb", "world-series-2004")).toBeNull();
    expect(recapMatchPath("football", null)).toBeNull();
  });
});

describe("related news", () => {
  const all: NewsFeedItem[] = [
    { ...base, slug: "a", sport: "football", updatedAt: "2026-11-27T10:00:00Z" },
    { ...base, slug: "b", sport: "cricket", updatedAt: "2026-11-27T12:00:00Z" },
    { ...base, slug: "c", sport: "football", updatedAt: "2026-11-26T10:00:00Z" },
    { ...base, slug: "d", sport: "cricket", updatedAt: "2026-11-25T10:00:00Z" },
  ];

  it("excludes the current article and prefers the same sport", () => {
    const related = pickRelatedNews("b", "cricket", all, 2);
    expect(related.map((r) => r.slug)).toEqual(["d", "a"]);
  });

  it("returns an empty list when nothing else is published", () => {
    expect(pickRelatedNews("a", "football", [all[0]], 3)).toEqual([]);
  });
});
