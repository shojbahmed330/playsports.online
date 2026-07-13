/**
 * Scheduled sync endpoint. Called by pg_cron (or Vercel Cron) every 15 min.
 *
 * Behavior:
 *   - Iterates `SPORTS` registry (or a single sport when `?sport=` given).
 *   - Fetches each warmup URL, writing fresh data to `sports_data_cache`.
 *   - Skips URLs whose row is `is_archived = true` (frozen historical data).
 *   - Returns a summary per sport.
 *
 * Auth: any request from pg_cron carries the Supabase `apikey` header (anon
 * key). We only check the header is present — the endpoint is idempotent,
 * writes only public sports data, and does not accept payloads that could
 * be abused. The prefix `/api/public/*` bypasses the app auth layer by design.
 */
import { createFileRoute } from "@tanstack/react-router";
import { SPORTS, type SportRegistryEntry } from "@/lib/sports-registry";

async function warmSport(entry: SportRegistryEntry) {
  const { cachedFetch } = await import("@/lib/sports-cache");
  const results: { url: string; ok: boolean; error?: string }[] = [];

  for (const url of entry.warmup) {
    try {
      // Force refetch by using a zero TTL — cachedFetch still writes back
      // the fresh payload with the DEFAULT TTL derived from `ttlMs`.
      await cachedFetch(
        {
          key: `espn:${entry.id}:warmup:${url}`,
          sport: entry.id,
          category: "warmup",
          ttlMs: 15 * 60 * 1000,
        },
        async () => {
          const res = await fetch(url, {
            headers: { "user-agent": "playsports-cron/1.0" },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        },
      );
      results.push({ url, ok: true });
    } catch (err) {
      results.push({ url, ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return { sport: entry.id, results };
}

export const Route = createFileRoute("/api/public/sync-sports")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Cheap health/status check
        const url = new URL(request.url);
        if (url.searchParams.get("ping") === "1") {
          return Response.json({ ok: true, ts: new Date().toISOString() });
        }
        return handleSync(request);
      },
      POST: async ({ request }) => handleSync(request),
    },
  },
});

async function handleSync(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Minimal auth: require the apikey header pg_cron sends. In the published
  // deployment this route bypasses app auth entirely; we only guard against
  // fully anonymous browser hits.
  const apikey = request.headers.get("apikey");
  if (!apikey) {
    return new Response("Missing apikey header", { status: 401 });
  }

  const sportId = url.searchParams.get("sport");
  const targets = sportId && sportId !== "all"
    ? SPORTS.filter((s) => s.id === sportId)
    : SPORTS;

  if (targets.length === 0) {
    return Response.json({ ok: false, error: `Unknown sport '${sportId}'` }, { status: 400 });
  }

  const startedAt = Date.now();
  const summary = [];
  for (const entry of targets) {
    summary.push(await warmSport(entry));
  }

  return Response.json({
    ok: true,
    durationMs: Date.now() - startedAt,
    sports: summary,
  });
}
