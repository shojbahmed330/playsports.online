// Server-only fallback recaps built from the static match archive.
// These keep /news populated even before any AI recap lands in Supabase, and
// are used only when the database has no article with the same slug.
import type { NewsArticle, NewsSummary } from "./news.server";
import { listMatchSlugs } from "@/lib/seo/entities";
import { listCricketHighlights } from "@/lib/seo/cricket-entities";

export type SeedCandidate = {
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

export function listSeedCandidates(): SeedCandidate[] {
  const football = listMatchSlugs()
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

  const cricket = listCricketHighlights()
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

  return [...football, ...cricket];
}

function venueOf(candidate: SeedCandidate): string | null {
  const match = candidate.context?.match(/Venue: ([^.]+)/);
  return match ? match[1].trim() : null;
}

function resultOf(candidate: SeedCandidate): string | null {
  const match = candidate.context?.match(/Result: ([^.]+)/);
  return match ? match[1].trim() : null;
}

function buildArticle(candidate: SeedCandidate): NewsArticle {
  const score =
    candidate.home_score != null && candidate.away_score != null
      ? `${candidate.home_score}-${candidate.away_score}`
      : null;
  const result = resultOf(candidate);
  const venue = venueOf(candidate);
  const date = candidate.match_date ?? null;
  const tournament = candidate.tournament ?? "the competition";

  const headline =
    candidate.sport === "football" && score
      ? `${candidate.home_team} ${score} ${candidate.away_team}: ${tournament} recap`
      : `${candidate.home_team} vs ${candidate.away_team}: ${tournament} recap`;

  const outcome =
    result ??
    (candidate.sport === "football" && score
      ? candidate.home_score! > candidate.away_score!
        ? `${candidate.home_team} won ${score}`
        : candidate.home_score! < candidate.away_score!
          ? `${candidate.away_team} won ${score}`
          : `the match finished ${score}`
      : "the match produced a memorable result");

  const summary = `${outcome}. ${candidate.home_team} and ${candidate.away_team} met in ${tournament}${date ? ` on ${date}` : ""}${venue ? ` at ${venue}` : ""}, a fixture that still shapes how both teams are remembered.`;

  const factLines = [
    `- **Match:** ${candidate.home_team} vs ${candidate.away_team}`,
    score ? `- **Score:** ${score}` : null,
    date ? `- **Date:** ${date}` : null,
    venue ? `- **Venue:** ${venue}` : null,
    `- **Competition:** ${tournament}`,
  ]
    .filter(Boolean)
    .join("\n");

  const fullArticle = `## Match overview

${summary}

${factLines}

## The result

${outcome}. The scoreline is the headline fact of this fixture, and it is the part of the record that matters most when the match is revisited. ${candidate.sport === "football" ? "Group-stage points and goal difference can decide a tournament, so every result carries context beyond the ninety minutes." : "Tournament finals and classic Test matches are remembered for the result first, then for the passages of play that produced it."}

## Context

${tournament}${date ? ` in ${date}` : ""} brought ${candidate.home_team} and ${candidate.away_team} together with plenty at stake. ${venue ? `The match was played at ${venue}.` : ""} This recap sticks to the confirmed result and match facts; player-level detail is only added when it is present in the verified scorecard.

## What it means

Results like this are part of the archive that makes ${tournament} worth following. They explain why the fixture remains relevant years later and why the two teams' paths are still compared. For the latest tables, fixtures and player numbers, use the football and cricket hubs.`;

  return {
    slug: candidate.slug,
    headline,
    summary,
    sport: candidate.sport,
    tournament: candidate.tournament,
    homeTeam: candidate.home_team,
    awayTeam: candidate.away_team,
    homeScore: candidate.home_score,
    awayScore: candidate.away_score,
    matchDate: candidate.match_date,
    updatedAt: candidate.match_date ? `${candidate.match_date}T12:00:00.000Z` : "2026-01-01T12:00:00.000Z",
    heroImage: null,
    fullArticle,
    metaDescription: summary.slice(0, 158),
    keyMoments: [],
    matchKey: candidate.match_key,
  };
}

const AUTO_RECAPS = listSeedCandidates().map(buildArticle);
const AUTO_BY_SLUG = new Map(AUTO_RECAPS.map((article) => [article.slug, article]));

export function listAutoRecaps(): NewsSummary[] {
  return AUTO_RECAPS.map(({ fullArticle: _full, metaDescription: _meta, keyMoments: _km, matchKey: _mk, ...summary }) => summary);
}

export function getAutoRecap(slug: string): NewsArticle | null {
  return AUTO_BY_SLUG.get(slug) ?? null;
}

export function findAutoRecapForMatch(sport: string, matchKey: string): NewsArticle | null {
  return AUTO_RECAPS.find((a) => a.sport === sport && a.matchKey === matchKey) ?? null;
}
