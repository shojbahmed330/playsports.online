// IndexNow verification key file. Bing/Yandex fetch this URL to confirm
// that the app owns the key it sends in each IndexNow ping.
//
// The path is /api/public/indexnow-key.txt — pass this exact URL as
// `keyLocation` in the IndexNow payload. To use the classic root path
// (`/{key}.txt`), copy the key into public/<key>.txt as a static file.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/api/public/indexnow-key.txt")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env.INDEXNOW_KEY;
        if (!key) {
          return new Response("INDEXNOW_KEY not configured", { status: 404 });
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
