// Dynamic IndexNow key verification.
//
// IndexNow requires the key be served as plain text at
// https://<host>/<key>.txt. Rather than shipping a static file for every
// rotation, this route matches any `/<slug>.txt` request and returns the
// key body only when the slug exactly matches INDEXNOW_KEY.
//
// See: https://www.indexnow.org/documentation
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/$key")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params.key;
        if (!raw.endsWith(".txt")) {
          return new Response("Not Found", { status: 404 });
        }
        const requested = raw.slice(0, -".txt".length);
        const key = process.env.INDEXNOW_KEY;
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
