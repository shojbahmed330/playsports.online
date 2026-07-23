// Path-based sitemap parts served at /sitemap-{part}.xml.
//
// Why this exists: Google Search Console frequently skips sitemap-index
// children that use `?query=` parameters (only the first entry gets read).
// Path-based URLs like /sitemap-core.xml are fetched reliably, so the
// index at /sitemap.xml now points here for every part.
//
// All logic is shared with /sitemap.xml — this file is a thin adapter.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import {
  entriesForPart,
  renderUrlset,
  isValidSitemapPart,
  type SitemapPart,
} from "./sitemap[.]xml";

const SITEMAP_CACHE_CONTROL = "no-cache, no-store, must-revalidate";

export const Route = createFileRoute("/sitemap-{$part}.xml")({
  server: {
    handlers: {
      HEAD: async () => {
        return new Response(null, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": SITEMAP_CACHE_CONTROL,
          },
        });
      },
      GET: async ({ params }) => {
        const today = new Date().toISOString().slice(0, 10);
        const part = (params as Record<string, string>).part ?? (params as Record<string, string>)["part.xml"];

        if (!isValidSitemapPart(part)) {
          return new Response("Sitemap part not found", { status: 404 });
        }

        const entries = await entriesForPart(part as SitemapPart);
        const xml = renderUrlset(entries, today);

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": SITEMAP_CACHE_CONTROL,
            "X-Sitemap-Type": "urlset",
            "X-Sitemap-Part": part,
          },
        });
      },
    },
  },
});
