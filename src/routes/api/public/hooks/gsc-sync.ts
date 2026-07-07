import { createFileRoute } from "@tanstack/react-router";

function formatSyncError(e: any) {
  const message = String(e?.message ?? e);
  if (message.includes("Could not find the table 'public.seo_sync_runs' in the schema cache")) {
    return "SEO sync table is missing from this deployment's backend schema cache. The Lovable deployment is healthy; redeploy/sync the custom-domain deployment or point the domain to Lovable.";
  }
  return message;
}

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
          return Response.json({ ok: false, error: formatSyncError(e) }, { status: 500 });
        }
      },
    },
  },
});
