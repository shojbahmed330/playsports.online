import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  getTournament,
  getLeaderboard,
  computeLeaderboard,
  TOURNAMENTS,
  LEADERBOARDS,
} from "@/lib/seo/leaderboards";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, itemList, ldScript, collectionPage } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/tournaments/$tournament/$leaderboard")({
  loader: ({ params }) => {
    const t = getTournament(params.tournament);
    const b = getLeaderboard(params.leaderboard);
    if (!t || !b) throw notFound();
    const rows = computeLeaderboard(t.slug, b.slug, 50);
    if (rows.length === 0) throw notFound(); // thin-content guard
    return { tournament: t, board: b, rows };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Leaderboard not found" }, { name: "robots", content: "noindex" }] };
    }
    const { tournament, board, rows } = loaderData;
    const path = `/tournaments/${params.tournament}/${params.leaderboard}`;
    const title = `${tournament.name} ${board.name} — Full List | PlaySports`;
    const leader = rows[0];
    const desc = `${tournament.name} ${board.name.toLowerCase()} leaderboard. ${leader.name} leads with ${leader.count} ${board.metric.toLowerCase()}. Full ranked list with players, teams and totals.`;
    const faq = [
      {
        q: `Who has the most ${board.metric.toLowerCase()} in ${tournament.name}?`,
        a: `${leader.name} (${leader.team}) leads with ${leader.count} ${board.metric.toLowerCase()}.`,
      },
      {
        q: `How many players are on this ${board.name.toLowerCase()} list?`,
        a: `${rows.length} players are ranked on the ${tournament.name} ${board.name.toLowerCase()} leaderboard.`,
      },
      {
        q: `When was this leaderboard last updated?`,
        a: `Rankings reflect final data from ${tournament.year ?? "every completed World Cup"} and are updated as new matches are played.`,
      },
    ];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(collectionPage({ name: title, description: desc, path })),
        ldScript(
          itemList({
            name: `${tournament.name} ${board.name}`,
            path,
            items: rows.slice(0, 20).map((r) => ({
              name: `${r.name} — ${r.count} ${board.metric.toLowerCase()}`,
              path: `/football/players/${r.slug}`,
            })),
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Tournaments", path: "/football" },
            { name: tournament.name, path: `/tournaments/${tournament.slug}/top-scorers` },
            { name: board.name, path },
          ]),
        ),
        ldScript(faqPage(faq)),
      ],
    };
  },
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { tournament, board, rows } = Route.useLoaderData();
  const leader = rows[0];
  const others = LEADERBOARDS.filter((l) => l.slug !== board.slug);
  const otherTournaments = TOURNAMENTS.filter((t) => t.slug !== tournament.slug);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        {" / "}
        <Link to="/football" className="hover:underline">Football</Link>
        {" / "}
        <span>{tournament.name}</span>
        {" / "}
        <span className="text-foreground">{board.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {tournament.name} {board.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        Complete ranked list of the {tournament.name.toLowerCase()} {board.name.toLowerCase()}
        {tournament.year ? ` from ${tournament.year}` : " across every edition since 1930"}.
        {" "}Leader: <strong>{leader.name}</strong> ({leader.team}) with <strong>{leader.count}</strong>{" "}
        {board.metric.toLowerCase()}. {rows.length} players ranked.
      </p>

      <div className="my-6"><AdSlot slot="in_content" /></div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-right">{board.metric}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: typeof rows[number]) => (
              <tr key={r.pid} className="border-t border-border hover:bg-muted/30">
                <td className="px-3 py-2 tabular-nums">{r.rank}</td>
                <td className="px-3 py-2">
                  <Link to="/football/players/$slug" params={{ slug: r.slug }} className="hover:underline">
                    {r.name}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.team}</td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Explore more</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {others.map((l) => (
            <Link
              key={l.slug}
              to="/tournaments/$tournament/$leaderboard"
              params={{ tournament: tournament.slug, leaderboard: l.slug }}
              className="rounded-md border border-border px-3 py-2 hover:bg-muted/50"
            >
              {tournament.name} — {l.name}
            </Link>
          ))}
          {otherTournaments.slice(0, 4).map((t) => (
            <Link
              key={t.slug}
              to="/tournaments/$tournament/$leaderboard"
              params={{ tournament: t.slug, leaderboard: board.slug }}
              className="rounded-md border border-border px-3 py-2 hover:bg-muted/50"
            >
              {t.name} — {board.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 prose prose-sm dark:prose-invert max-w-none">
        <h2>Frequently asked</h2>
        <h3>Who has the most {board.metric.toLowerCase()} in {tournament.name}?</h3>
        <p>
          {leader.name} of {leader.team} leads the {tournament.name.toLowerCase()}{" "}
          {board.name.toLowerCase()} list with {leader.count} {board.metric.toLowerCase()}.
        </p>
        <h3>How is this leaderboard compiled?</h3>
        <p>
          Data is aggregated from PlaySports' World Cup dataset spanning 1930 to 2022, plus
          live 2026 fixtures as they complete. {board.name} are counted per-player, per-tournament,
          with penalties and own goals classified separately for goal totals.
        </p>
      </section>
    </main>
  );
}
