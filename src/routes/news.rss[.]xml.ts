import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listNewsRecaps } from "@/lib/news.server";
import { buildNewsRss } from "@/lib/news-feed";

export const Route = createFileRoute("/news/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const articles = await listNewsRecaps(50);
        const xml = buildNewsRss(articles);
        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=600, s-maxage=600",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
