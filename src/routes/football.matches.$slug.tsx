import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getMatchBySlug, findHighlightUrl, listMatchSlugs } from "@/lib/seo/entities";
import { slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, sportsEvent, faqPage, ldScript } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/football/matches/$slug")({
  loader: ({ params }) => {
    const m = getMatchBySlug(params.slug);
    if (!m) throw notFound();
    const highlight = findHighlightUrl(m.home_team, m.away_team);
    return { match: m, highlight };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Match not found" }, { name: "robots", content: "noindex" }] };
    }
    const { match: m } = loaderData;
    const path = `/football/matches/${params.slug}`;
    const winner =
      m.home_score > m.away_score ? m.home_team : m.away_score > m.home_score ? m.away_team : "Draw";
    const title = `${m.home_team} ${m.home_score}–${m.away_score} ${m.away_team} — FIFA World Cup ${m.tournament_year} Match Result | PlaySports`;
    const desc = `${m.home_team} vs ${m.away_team} at the ${m.tournament_year} FIFA World Cup${m.round ? ` (${m.round})` : ""}. Final score ${m.home_score}–${m.away_score}${m.stadium ? `, played at ${m.stadium}${m.city ? ", " + m.city : ""}` : ""}. ${winner === "Draw" ? "Match ended in a draw." : `${winner} won.`}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          sportsEvent({
            name: `${m.home_team} vs ${m.away_team}`,
            path,
            sport: "Football",
            startDate: m.match_date,
            homeTeam: m.home_team,
            awayTeam: m.away_team,
            location: m.stadium ? `${m.stadium}${m.city ? ", " + m.city : ""}` : undefined,
            status: "ended",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: `World Cup ${m.tournament_year}`, path: `/archive/football_wc/${m.tournament_year}` },
            { name: `${m.home_team} vs ${m.away_team}`, path },
          ]),
        ),
        ldScript(
          faqPage([
            { q: `Who won ${m.home_team} vs ${m.away_team}?`, a: `${winner === "Draw" ? `The match ended ${m.home_score}–${m.away_score} — a draw.` : `${winner} won ${m.home_score}–${m.away_score}.`}` },
            { q: `When was ${m.home_team} vs ${m.away_team} played?`, a: `The match was played on ${m.match_date ?? `during the ${m.tournament_year} FIFA World Cup`}${m.round ? ` in the ${m.round}` : ""}.` },
            { q: `Where was ${m.home_team} vs ${m.away_team} played?`, a: m.stadium ? `The match was played at ${m.stadium}${m.city ? " in " + m.city : ""}.` : `Venue details for this match are not on record.` },
          ]),
        ),
      ],
    };
  },
  component: MatchSlugPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Match not found.</div>,
});

function MatchSlugPage() {
  const { match: m, highlight } = Route.useLoaderData();
  const ytId = highlight?.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)?.[1];
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> /{" "}
        <Link to="/archive/$sport/$year" params={{ sport: "football_wc", year: String(m.tournament_year) }} className="hover:underline">World Cup {m.tournament_year}</Link>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        {m.home_team} {m.home_score}–{m.away_score} {m.away_team}
      </h1>
      <p className="text-muted-foreground mb-6">
        FIFA World Cup {m.tournament_year}{m.round ? ` · ${m.round}` : ""}
        {m.match_date ? ` · ${m.match_date}` : ""}
        {m.stadium ? ` · ${m.stadium}${m.city ? ", " + m.city : ""}` : ""}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <TeamCard team={m.home_team} score={m.home_score} />
        <TeamCard team={m.away_team} score={m.away_score} />
      </div>

      {ytId && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Match Highlights</h2>
          <div className="aspect-video overflow-hidden rounded-lg border">
            <iframe
              className="h-full w-full"
              loading="lazy"
              src={`https://www.youtube.com/embed/${ytId}`}
              title={`${m.home_team} vs ${m.away_team} highlights`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <AdSlot slot="in_content" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Frequently asked</h2>
        <div className="space-y-3">
          {[
            { q: `Who won ${m.home_team} vs ${m.away_team}?`, a: m.home_score === m.away_score ? `The match ended ${m.home_score}–${m.away_score} — a draw.` : `${m.home_score > m.away_score ? m.home_team : m.away_team} won ${m.home_score}–${m.away_score}.` },
            { q: `When was the match played?`, a: `${m.match_date ?? `During the ${m.tournament_year} FIFA World Cup`}${m.round ? ` in the ${m.round}` : ""}.` },
            { q: `Where was it played?`, a: m.stadium ? `${m.stadium}${m.city ? " in " + m.city : ""}.` : `Venue not on record.` },
          ].map((f) => (
            <details key={f.q} className="rounded-lg border px-4 py-3">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Related matches from World Cup {m.tournament_year}</h2>
        <div className="flex flex-wrap gap-2">
          {listMatchSlugs()
            .filter((x) => x.tournament_year === m.tournament_year && x.slug !== m.slug)
            .slice(0, 12)
            .map((x) => (
              <Link
                key={x.slug}
                to="/football/matches/$slug"
                params={{ slug: x.slug }}
                className="px-3 py-1 rounded-full bg-muted text-xs hover:bg-accent"
              >
                {x.home_team} vs {x.away_team}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

function TeamCard({ team, score }: { team: string; score: number }) {
  return (
    <Link
      to="/football/teams/$slug"
      params={{ slug: slugify(team) }}
      className="rounded-lg border p-4 text-center hover:bg-accent"
    >
      <div className="text-sm text-muted-foreground">{team}</div>
      <div className="text-4xl font-bold">{score}</div>
    </Link>
  );
}
