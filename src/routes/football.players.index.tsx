import { createFileRoute, Link } from "@tanstack/react-router";
import { listPlayers } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/football/players/")({
  loader: () => {
    const players = listPlayers()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    return { players };
  },
  head: ({ loaderData }) => {
    const path = "/football/players";
    const title = "All FIFA World Cup Players — A–Z Index | PlaySports";
    const desc =
      "Complete A–Z index of every FIFA World Cup goalscorer from 1930 to today. Browse all players by name and open career goal-by-goal stats.";
    const players = loaderData?.players ?? [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          collectionPage({
            name: "FIFA World Cup Players",
            description: desc,
            path,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Players", path },
          ]),
        ),
        ldScript(
          itemList({
            name: "FIFA World Cup players",
            path,
            items: players.slice(0, 100).map((p) => ({
              name: p.name,
              path: `/football/players/${p.slug}`,
            })),
          }),
        ),
      ],
    };
  },
  component: withHubLinks(FootballPlayersIndex, {
    sport: "football",
    currentPath: "/football/players",
  }),
});

function FootballPlayersIndex() {
  const { players } = Route.useLoaderData();
  type P = (typeof players)[number];
  const groups = new Map<string, P[]>();
  for (const p of players) {
    const letter = (p.name[0] ?? "#").toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const letters = Array.from(groups.keys()).sort();

  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      <nav className="text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link to="/football" className="hover:underline">
          Football
        </Link>{" "}
        <span aria-hidden="true">/</span> <span>Players</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">All FIFA World Cup Players</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Every goalscorer in FIFA World Cup history — {players.length} players. Tap any name for
        career goals, tournaments and stats.
      </p>

      {players.length === 0 ? (
        <EmptyState
          title="No players available"
          description="The World Cup player index is empty right now."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-1 mb-6 sticky top-16 bg-background/80 backdrop-blur py-2 z-10">
            {letters.map((L) => (
              <a
                key={L}
                href={`#letter-${L}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded bg-muted px-2 text-xs font-mono hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {L}
              </a>
            ))}
          </div>

          {letters.map((L) => (
            <section key={L} id={`letter-${L}`} className="mb-6">
              <h2 className="text-lg font-bold mb-2 border-b pb-1">{L}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                {groups.get(L)!.map((p) => (
                  <li key={p.slug} className="text-sm">
                    <Link
                      to="/football/players/$slug"
                      params={{ slug: p.slug }}
                      className="inline-flex min-h-11 items-center hover:underline hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {p.name}
                    </Link>{" "}
                    <span className="text-xs text-muted-foreground">· {p.team}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
