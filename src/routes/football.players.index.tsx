import { createFileRoute, Link } from "@tanstack/react-router";
import { listPlayers } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/football/players/")({
  loader: () => {
    const players = listPlayers()
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
    return { players };
  },
  head: () => {
    const path = "/football/players";
    const title = "All FIFA World Cup Players — A–Z Index | PlaySports";
    const desc =
      "Complete A–Z index of every FIFA World Cup goalscorer from 1930 to today. Browse all players by name and open career goal-by-goal stats.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Players", path },
          ]),
        ),
      ],
    };
  },
  component: FootballPlayersIndex,
});

function FootballPlayersIndex() {
  const { players } = Route.useLoaderData();
  const groups = new Map<string, typeof players>();
  for (const p of players) {
    const letter = (p.name[0] ?? "#").toUpperCase();
    const key = /[A-Z]/.test(letter) ? letter : "#";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  const letters = Array.from(groups.keys()).sort();

  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> /{" "}
        <span>Players</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">All FIFA World Cup Players</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Every goalscorer in FIFA World Cup history — {players.length} players.
        Tap any name for career goals, tournaments and stats.
      </p>

      <div className="flex flex-wrap gap-1 mb-6 sticky top-0 bg-background/80 backdrop-blur py-2 z-10">
        {letters.map((L) => (
          <a
            key={L}
            href={`#letter-${L}`}
            className="px-2 py-1 text-xs font-mono rounded bg-muted hover:bg-accent"
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
                  className="hover:underline hover:text-primary"
                >
                  {p.name}
                </Link>{" "}
                <span className="text-xs text-muted-foreground">· {p.team}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
