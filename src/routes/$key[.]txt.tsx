// IndexNow key verification at /<key>.txt.
//
// IndexNow requires the key served as plain text at that exact URL. This
// route's path param parses as `key.txt`, so the generated route matches any
// single-segment path. That makes it the de-facto catch-all: non-`.txt`
// requests get the branded 404 page instead of the framework's plain-text
// "Not Found".
//
// See: https://www.indexnow.org/documentation
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { renderNotFoundPage } from "@/lib/error-page";

export const Route = createFileRoute("/$key.txt")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const pathname = new URL(request.url).pathname;
        if (!pathname.toLowerCase().endsWith(".txt")) {
          return new Response(renderNotFoundPage(), {
            status: 404,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
              "Cache-Control": "no-store",
              "X-Robots-Tag": "noindex, follow",
            },
          });
        }

        const key = process.env.INDEXNOW_KEY;
        const requested = (params as unknown as { "key.txt": string })["key.txt"];
        if (!key || requested !== key) {
          return new Response("Not Found", { status: 404 });
        }
        return new Response(key, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
