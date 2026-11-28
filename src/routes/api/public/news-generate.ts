// Protected generator for the /news section.
//
// POST /api/public/news-generate with header `x-news-secret` matching
// NEWS_ADMIN_SECRET. GET accepts `?offset=N&force=1` with the same header.
// Generates one recap per call (AI + Supabase upsert) so it stays inside the
// serverless timeout, then reports the next offset. Existing recaps are
// skipped unless `force` is true.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listMatchSlugs } from "@/lib/seo/entities";
import { listCricketHighlights } from "@/lib/seo/cricket-entities";

type Candidate = {
  sport: "football" | "cricket";
  match_key: string;
  slug: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  match_date: string | null;
  tournament: string | null;
  context?: string;
};

const FEATURED_FOOTBALL = new Set([
  "argentina-vs-saudi-arabia-2022-11-22",
  "germany-vs-japan-2022-11-23",
  "japan-vs-spain-2022-12-01",
  "cameroon-vs-brazil-2022-12-02",
  "portugal-vs-spain-2018-06-15",
  "south-korea-vs-germany-2018-06-27",
  "spain-vs-netherlands-2014-06-13",
  "germany-vs-portugal-2014-06-16",
]);

const FEATURED_CRICKET = new Set([
  "2024-icc-t20-world-cup-final-india-vs-south-africa",
  "2023-icc-cricket-world-cup-final-india-vs-australia",
  "2022-icc-t20-world-cup-final-england-vs-pakistan",
  "2021-icc-t20-world-cup-final-australia-vs-new-zealand",
  "2019-icc-cricket-world-cup-final-england-vs-new-zealand",
  "2017-icc-champions-trophy-final-pakistan-vs-india",
  "2015-icc-cricket-world-cup-final-australia-vs-new-zealand",
  "2013-icc-champions-trophy-final-india-vs-england",
  "2011-icc-cricket-world-cup-final-india-vs-sri-lanka",
  "2007-icc-t20-world-cup-final-india-vs-pakistan",
  "2005-ashes-2nd-test-england-vs-australia-edgbaston",
  "2001-vvs-laxman-281-india-vs-australia-kolkata",
]);

function footballCandidates(): Candidate[] {
  return listMatchSlugs()
    .filter((m) => FEATURED_FOOTBALL.has(m.slug))
    .map((m) => ({
      sport: "football" as const,
      match_key: m.slug,
      slug: m.slug,
      home_team: m.home_team,
      away_team: m.away_team,
      home_score: m.home_score,
      away_score: m.away_score,
      match_date: m.match_date ?? null,
      tournament: `FIFA World Cup ${m.tournament_year}${m.round ? ` — ${m.round}` : ""}`,
      context: [m.stadium ? `Venue: ${m.stadium}${m.city ? `, ${m.city}` : ""}` : null]
        .filter(Boolean)
        .join(". "),
    }));
}

function cricketCandidates(): Candidate[] {
  return listCricketHighlights()
    .filter((h) => FEATURED_CRICKET.has(h.slug))
    .map((h) => ({
      sport: "cricket" as const,
      match_key: h.slug,
      slug: h.slug,
      home_team: h.teamA,
      away_team: h.teamB,
      home_score: null,
      away_score: null,
      match_date: h.date ?? null,
      tournament: `${h.tournament}${h.stage ? ` — ${h.stage}` : ""} (${h.format.toUpperCase()})`,
      context: [h.venue ? `Venue: ${h.venue}` : null, h.result ? `Result: ${h.result}` : null]
        .filter(Boolean)
        .join(". "),
    }));
}

const CANDIDATES = [...footballCandidates(), ...cricketCandidates()];

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
