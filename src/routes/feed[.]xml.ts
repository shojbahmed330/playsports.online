import { createFileRoute } from "@tanstack/react-router";

const SITE = "https://allsportslive.lovable.app";

function esc(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const items = [
          { t: "FIFA World Cup 2026 — Knockout Bracket & Live Fixtures", l: `${SITE}/football`, d: "Group standings, official R32 matrix, predicted R16→Final paths." },
          { t: "Cricket — Live Series, IPL & Player Profiles", l: `${SITE}/cricket`, d: "Bilateral tours, IPL, full Test/ODI/T20I career stats." },
          { t: "MLB — Leaders, Standings & Postseason", l: `${SITE}/mlb`, d: "23-category leaderboards, win probability charts, news." },
          { t: "NBA Hub", l: `${SITE}/nba`, d: "Live scores, standings, players." },
          { t: "NHL Hub", l: `${SITE}/nhl`, d: "Live scores and standings." },
          { t: "MLS / Soccer", l: `${SITE}/mls`, d: "Today's slate and standings." },
        ];
        const now = new Date().toUTCString();
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>AllSportsLive — Top Stories</title>
<link>${SITE}</link>
<description>Live scores, World Cup coverage, and player stats across football, cricket, MLB, NBA, NHL, and MLS.</description>
<language>en-us</language>
<lastBuildDate>${now}</lastBuildDate>
<atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${items.map((i) => `<item>
  <title>${esc(i.t)}</title>
  <link>${i.l}</link>
  <guid isPermaLink="true">${i.l}</guid>
  <description>${esc(i.d)}</description>
  <pubDate>${now}</pubDate>
</item>`).join("\n")}
</channel></rss>`;
        return new Response(xml, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=3600, s-maxage=21600",
          },
        });
      },
    },
  },
});
