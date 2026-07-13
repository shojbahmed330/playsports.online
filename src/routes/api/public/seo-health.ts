// Public SEO health endpoint. GET returns a small JSON report so
// external monitors (uptime robots, Cloudflare workers, admin tooling)
// can confirm indexing surfaces are wired without exposing secrets.
//
// Never returns the raw INDEXNOW_KEY / secret values — only booleans and
// derived URLs. Bypasses auth by living under /api/public/*, but is
// read-only and non-sensitive by design.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const HOST = "www.playsports.online";
const ORIGIN = `https://${HOST}`;

export const Route = createFileRoute("/api/public/seo-health")({
  server: {
    handlers: {
      GET: async () => {
        const indexNowKey = process.env.INDEXNOW_KEY;
        const indexNowPingSecret = process.env.INDEXNOW_PING_SECRET;

        const body = {
          ok: Boolean(indexNowKey && indexNowPingSecret),
          checkedAt: new Date().toISOString(),
          sitemap: `${ORIGIN}/sitemap.xml`,
          robots: `${ORIGIN}/robots.txt`,
          indexNow: {
            keyConfigured: Boolean(indexNowKey),
            pingSecretConfigured: Boolean(indexNowPingSecret),
            keyFile: indexNowKey ? `${ORIGIN}/${indexNowKey}.txt` : null,
            pingEndpoint: `${ORIGIN}/api/public/indexnow-ping`,
          },
        };

        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
