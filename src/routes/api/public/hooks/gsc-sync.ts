import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/gsc-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: any = {};
        try { body = await request.json(); } catch {}

        try {
          const { runGscSync } = await import("@/lib/gsc-sync.server");
          return Response.json(await runGscSync(body?.days));
        } catch (e: any) {
          return Response.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
        }
      },
    },
  },
});
