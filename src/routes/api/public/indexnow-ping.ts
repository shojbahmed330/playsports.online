// Public IndexNow ping endpoint.
//
// POST with JSON body { paths: string[] } and header `x-indexnow-secret`
// matching the INDEXNOW_PING_SECRET env value. Pings Bing/Yandex/Seznam
// with the given URLs. Use from cron (recommended after content deploys)
// or manual admin tooling.
//
// Google ignores IndexNow but crawls the sitemap on its own schedule.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { pingIndexNow } from "@/lib/seo/indexnow.server";

export const Route = createFileRoute("/api/public/indexnow-ping")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-indexnow-secret");
        const expected = process.env.INDEXNOW_PING_SECRET;
        if (!expected || secret !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const paths =
          body && typeof body === "object" && Array.isArray((body as { paths?: unknown }).paths)
            ? ((body as { paths: unknown[] }).paths.filter(
                (p): p is string => typeof p === "string" && p.length > 0,
              ))
            : null;
        if (!paths || paths.length === 0) {
          return new Response("paths[] required", { status: 400 });
        }
        if (paths.length > 10000) {
          return new Response("Max 10,000 URLs per ping", { status: 413 });
        }
        const result = await pingIndexNow(paths);
        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 502,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
