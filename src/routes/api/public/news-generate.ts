// Protected generator for the /news section.
//
// POST /api/public/news-generate with header `x-news-secret` matching
// NEWS_ADMIN_SECRET. GET accepts `?offset=N&force=1` with the same header.
// Generates one recap per call (AI + Supabase upsert) so it stays inside the
// serverless timeout, then reports the next offset. Existing recaps are
// skipped unless `force` is true.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { listSeedCandidates } from "@/lib/news-auto.server";

const CANDIDATES = listSeedCandidates();

function authorized(request: Request): boolean {
  const secret = process.env.NEWS_ADMIN_SECRET;
  if (!secret) return false;
  return request.headers.get("x-news-secret") === secret;
}

async function generate(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let offset = 0;
  let force = false;
  if (request.method === "GET") {
    const url = new URL(request.url);
    offset = Number(url.searchParams.get("offset") ?? 0);
    force = url.searchParams.get("force") === "1";
  } else {
    try {
      const body = (await request.json()) as { offset?: number; force?: boolean };
      offset = Number(body.offset ?? 0);
      force = body.force === true;
    } catch {
      offset = 0;
    }
  }

  offset = Math.min(Math.max(Number(offset) || 0, 0), CANDIDATES.length - 1);
  const candidate = CANDIDATES[offset];
  if (!candidate) {
    return Response.json({ error: "No candidates", total: CANDIDATES.length }, { status: 404 });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (!force) {
    const { data: existing } = await supabaseAdmin
      .from("match_recaps")
      .select("id, slug")
      .eq("sport", candidate.sport)
      .eq("match_key", candidate.match_key)
      .maybeSingle();
    if (existing) {
      return Response.json({
        skipped: true,
        slug: existing.slug,
        offset,
        total: CANDIDATES.length,
        next: offset + 1,
      });
    }
  }

  try {
    const { buildRecapWithAi, saveRecap } = await import("@/lib/match-recaps.generate.server");
    const recap = await buildRecapWithAi(candidate);
    await saveRecap(candidate, recap);
    return Response.json({
      skipped: false,
      slug: candidate.slug,
      headline: recap.headline,
      offset,
      total: CANDIDATES.length,
      next: offset + 1,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : String(error),
        slug: candidate.slug,
        offset,
        total: CANDIDATES.length,
        next: offset,
      },
      { status: 502 },
    );
  }
}

export const Route = createFileRoute("/api/public/news-generate")({
  server: {
    handlers: {
      GET: ({ request }) => generate(request),
      POST: ({ request }) => generate(request),
    },
  },
});
