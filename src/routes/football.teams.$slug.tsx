import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findTeam, teamStats, listTeams, slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, sportsTeam, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";

export const Route = createFileRoute("/football/teams/$slug")({
  loader: async ({ params }) => {
    const team = findTeam("football_wc", params.slug);
    if (!team) throw notFound();
    const aiFaqs = await readCachedFaqs("football_team", params.slug);
    return { team, stats: teamStats(team.name), aiFaqs };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Team not found" }, { name: "robots", content: "noindex" }] };
    }
    const { team, stats, aiFaqs } = loaderData;
    const path = `/football/teams/${params.slug}`;
    const title = `${team.name} — FIFA World Cup History, Stats & Top Scorers | PlaySports`;
    const desc = `${team.name} at the FIFA World Cup: ${stats.matchesPlayed} matches, ${stats.w}W-${stats.d}D-${stats.l}L, ${stats.goalsTotal} goals. Appearances, top scorers, recent results.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "profile" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(sportsTeam({ name: team.name, path, sport: "Football", league: "FIFA World Cup" })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Teams", path: "/football" },
            { name: team.name, path },
          ]),
        ),
        ldScript(
          itemList({
            name: `${team.name} top World Cup scorers`,
            path,
            items: stats.topScorers.slice(0, 10).map((p: { name: string; goals: number }) => ({
              name: `${p.name} (${p.goals} goals)`,
              path: `/football/players/${slugify(p.name)}`,
            })),
          }),
        ),
        ldScript(
          faqPage([
            { q: `How many World Cup matches has ${team.name} played?`, a: `${team.name} has played ${stats.matchesPlayed} FIFA World Cup matches across ${stats.years.length} tournament appearances (${stats.w}W-${stats.d}D-${stats.l}L).` },
            { q: `Who is ${team.name}'s all-time top World Cup scorer?`, a: stats.topScorers[0] ? `${stats.topScorers[0].name} leads with ${stats.topScorers[0].goals} World Cup goals for ${team.name}.` : `${team.name} does not have a recorded leading World Cup scorer yet.` },
            { q: `How many World Cup goals has ${team.name} scored?`, a: `${team.name} has scored ${stats.gf} goals and conceded ${stats.ga}.` },
            { q: `When did ${team.name} appear at the World Cup?`, a: stats.years.length ? `${team.name} appeared in ${stats.years.join(", ")}.` : `No World Cup appearances on record.` },
          ]),
        ),
      ],
    };
  },
  component: FootballTeamPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Team not found.</div>,
});

function FootballTeamPage() {
  const { team, stats } = Route.useLoaderData();
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> /{" "}
        <span>{team.name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{team.name} — FIFA World Cup</h1>
      <p className="text-muted-foreground mb-6">
        {stats.matchesPlayed} matches played across {stats.years.length} tournaments.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Played" value={stats.matchesPlayed} />
        <Stat label="Wins" value={stats.w} />
        <Stat label="Draws" value={stats.d} />
        <Stat label="Losses" value={stats.l} />
        <Stat label="Goals (GF-GA)" value={`${stats.gf}-${stats.ga}`} />
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Top Scorers for {team.name}</h2>
        <ul className="divide-y rounded-lg border">
          {stats.topScorers.map((p: { name: string; goals: number }) => (
            <li key={p.name} className="flex justify-between px-4 py-2">
              <Link
                to="/football/players/$slug"
                params={{ slug: slugify(p.name) }}
                className="hover:underline"
              >
                {p.name}
              </Link>
              <span className="font-mono">{p.goals}</span>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="in_content" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Recent World Cup Matches</h2>
        <ul className="space-y-2">
          {stats.recentMatches.map((m: { match_date?: string; round?: string; home_team: string; home_score: number; away_score: number; away_team: string }, i: number) => (
            <li key={i} className="flex justify-between border rounded px-3 py-2 text-sm">
              <span>{m.match_date} · {m.round}</span>
              <span className="font-medium">
                {m.home_team} {m.home_score}–{m.away_score} {m.away_team}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Tournament Appearances</h2>
        <div className="flex flex-wrap gap-2">
          {stats.years.map((y: number) => (
            <Link
              key={y}
              to="/archive/$sport/$year"
              params={{ sport: "football_wc", year: String(y) }}
              className="px-3 py-1 rounded-full bg-muted text-sm hover:bg-accent"
            >
              {y}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Frequently asked about {team.name}</h2>
        <div className="space-y-3">
          {[
            { q: `How many World Cup matches has ${team.name} played?`, a: `${team.name} has played ${stats.matchesPlayed} FIFA World Cup matches across ${stats.years.length} tournaments (${stats.w}W-${stats.d}D-${stats.l}L).` },
            { q: `Who is ${team.name}'s all-time top World Cup scorer?`, a: stats.topScorers[0] ? `${stats.topScorers[0].name} leads with ${stats.topScorers[0].goals} goals.` : `Not on record.` },
            { q: `How many World Cup goals has ${team.name} scored?`, a: `${stats.gf} goals scored, ${stats.ga} conceded.` },
          ].map((f) => (
            <details key={f.q} className="rounded-lg border px-4 py-3">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Explore more teams</h2>
        <div className="flex flex-wrap gap-2">
          {listTeams()
            .filter((t) => t.slug !== team.slug)
            .slice(0, 20)
            .map((t) => (
              <Link
                key={t.slug}
                to="/football/teams/$slug"
                params={{ slug: t.slug }}
                className="px-3 py-1 rounded-full bg-muted text-xs hover:bg-accent"
              >
                {t.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
