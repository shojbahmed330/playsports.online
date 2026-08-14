import { createFileRoute } from "@tanstack/react-router";

const robots = `# PlaySports — robots.txt
# https://www.playsports.online
# Phase 1.2 — AI-friendly crawler policy
# Last reviewed: 2026-08-14

User-agent: *
Allow: /

# Private / user-scoped surfaces
Disallow: /admin
Disallow: /admin/
Disallow: /auth
Disallow: /auth/
Disallow: /mine
Disallow: /mine/
Disallow: /premium
Disallow: /premium/

# Internal API + server routes
Disallow: /api/

# Query-string variants
Disallow: /*?utm_*
Disallow: /*?ref=
Disallow: /*?fbclid=
Disallow: /*?gclid=

Sitemap: https://www.playsports.online/sitemap.xml
`;

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(robots, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
