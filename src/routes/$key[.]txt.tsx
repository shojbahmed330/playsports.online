// Dynamic IndexNow key verification at /<key>.txt.
//
// IndexNow requires the key served as plain text at that exact URL. The
// `[.]` segment escapes the literal dot so this route resolves to any
// `/{key}.txt` — we return the key body only when the slug exactly matches
// INDEXNOW_KEY, otherwise 404.
//
// See: https://www.indexnow.org/documentation
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/$key.txt")({
  server: {
    handlers: {
      GET: async ({ params }) => {
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
