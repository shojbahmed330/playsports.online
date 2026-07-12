import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findPlayer, playerStats, listPlayers, slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, athlete, faqPage, ldScript } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForFootballPlayer } from "@/lib/seo/related";

export const Route = createFileRoute("/football/players/$slug")({
  loader: async ({ params }) => {
    const p = findPlayer("football_wc", params.slug);
    if (!p) throw notFound();
    const aiFaqs = await readCachedFaqs("football_player", params.slug);
    return { player: p, stats: playerStats(p.name), aiFaqs };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Player not found" }, { name: "robots", content: "noindex" }] };
    }
    const { player, stats, aiFaqs } = loaderData;
    const path = `/football/players/${params.slug}`;
    const title = `${player.name} (${player.team}) — World Cup Goals & Career Stats | PlaySports`;
    const desc = `${player.name} World Cup record: ${stats.goalsTotal} goals over ${stats.years.length} tournaments for ${player.team}. Goal-by-goal breakdown, penalty record, career timeline.`;
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
        ldScript(athlete({ name: player.name, path, sport: "Football", team: player.team })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Players", path: "/players" },
            { name: player.name, path },
          ]),
        ),
        ldScript(
          faqPage(
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  { q: `How many World Cup goals has ${player.name} scored?`, a: `${player.name} has scored ${stats.goalsTotal} World Cup goal${stats.goalsTotal === 1 ? "" : "s"}${stats.pen > 0 ? `, including ${stats.pen} from the penalty spot` : ""}.` },
                  { q: `Which country does ${player.name} play for?`, a: `${player.name} represents ${player.team}.` },
                  { q: `In which World Cups has ${player.name} played?`, a: stats.years.length ? `${player.name} appeared in ${stats.years.join(", ")}.` : `Not on record.` },
                ],
          ),
        ),
      ],
    };
  },
  component: FootballPlayerPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Player not found.</div>,
});

function FootballPlayerPage() {
  const { player, stats, aiFaqs } = Route.useLoaderData();
  const related = listPlayers()
    .filter((p) => p.team === player.team && p.slug !== player.slug)
    .slice(0, 12);
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> /{" "}
        <Link to="/players" className="hover:underline">Players</Link> /{" "}
        <span>{player.name}</span>
      </nav>

      <h1 className="text-3xl font-bold">{player.name}</h1>
      <p className="text-muted-foreground mb-6">
        <Link
          to="/football/teams/$slug"
          params={{ slug: slugify(player.team) }}
          className="hover:underline"
        >
          {player.team}
        </Link>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Goals" value={stats.goalsTotal} />
        <Stat label="Tournaments" value={stats.years.length} />
        <Stat label="Penalties" value={stats.pen} />
        <Stat label="Own goals" value={stats.og} />
      </div>

      <section className="mt-4">
        <h2 className="text-xl font-semibold mb-3">Goals by Tournament</h2>
        <ul className="divide-y rounded-lg border">
          {stats.byYear.map((y: { year: number; goals: number }) => (
            <li key={y.year} className="flex justify-between px-4 py-2">
              <Link
                to="/football/players/$slug/world-cup-{$year}"
                params={{ slug: player.slug, year: String(y.year) }}
                className="hover:underline"
              >
                World Cup {y.year}
              </Link>
              <span className="font-mono">{y.goals} goal{y.goals === 1 ? "" : "s"}</span>
            </li>
          ))}

        </ul>
      </section>

      <AdSlot slot="in_content" />

      <section className="mt-8 prose dark:prose-invert max-w-none">
        <h2>About {player.name} at the World Cup</h2>
        <p>
          {player.name} represented {player.team} at the FIFA World Cup, scoring {stats.goalsTotal} goal
          {stats.goalsTotal === 1 ? "" : "s"} across {stats.years.length} tournament appearance
          {stats.years.length === 1 ? "" : "s"}
          {stats.years.length ? ` (${stats.years.join(", ")})` : ""}.
          {stats.pen > 0 ? ` ${stats.pen} came from the penalty spot.` : ""}
        </p>
      </section>

      <FaqSection
        title={`Frequently asked about ${player.name}`}
        items={
          aiFaqs && aiFaqs.length
            ? aiFaqs
            : [
                { q: `How many World Cup goals has ${player.name} scored?`, a: `${stats.goalsTotal} goal${stats.goalsTotal === 1 ? "" : "s"}${stats.pen > 0 ? `, including ${stats.pen} penalties` : ""}.` },
                { q: `Which country does ${player.name} play for?`, a: `${player.team}.` },
                { q: `In which World Cups has ${player.name} played?`, a: stats.years.length ? stats.years.join(", ") : `Not on record.` },
              ]
        }
      />

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Other {player.team} players</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                to="/football/players/$slug"
                params={{ slug: p.slug }}
                className="px-3 py-1 rounded-full bg-muted text-xs hover:bg-accent"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <RelatedLinks
        title={`More World Cup stats for ${player.name}`}
        links={relatedForFootballPlayer(player.slug, player.team, 10)}
      />
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
