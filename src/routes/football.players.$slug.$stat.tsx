import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getPlayerStatHistory } from "@/lib/seo/leaderboards";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, athlete, ldScript } from "@/lib/seo/jsonld";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForFootballPlayer } from "@/lib/seo/related";

const STATS = {
  "world-cup-goals": { name: "World Cup Goals", metric: "goals" as const },
  "world-cup-cards": { name: "World Cup Cards", metric: "cards" as const },
} as const;

type StatSlug = keyof typeof STATS;

export const Route = createFileRoute("/football/players/$slug/$stat")({
  loader: ({ params }) => {
    const meta = STATS[params.stat as StatSlug];
    if (!meta) throw notFound();
    const hist = getPlayerStatHistory(params.slug);
    if (!hist) throw notFound();
    return { hist, meta, statSlug: params.stat };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Player stat not found" }, { name: "robots", content: "noindex" }] };
    }
    const { hist, meta } = loaderData;
    const path = `/football/players/${params.slug}/${params.stat}`;
    const total = meta.metric === "goals" ? hist.totals.goals : hist.totals.yellows + hist.totals.reds;
    const title = `${hist.name} ${meta.name} — ${total} in ${hist.rows.length} tournaments | PlaySports`;
    const desc =
      meta.metric === "goals"
        ? `How many World Cup goals does ${hist.name} have? ${hist.totals.goals} total (${hist.totals.penalties} penalties). Year-by-year breakdown from ${hist.rows[0].year} to ${hist.rows[hist.rows.length - 1].year}.`
        : `${hist.name} World Cup disciplinary record: ${hist.totals.yellows} yellow cards, ${hist.totals.reds} red cards across ${hist.rows.length} tournaments.`;
    const faq = buildFaq(hist, meta);
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
        ldScript(athlete({ name: hist.name, path, sport: "Football", team: hist.team })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Players", path: "/players" },
            { name: hist.name, path: `/football/players/${params.slug}` },
            { name: meta.name, path },
          ]),
        ),
        ldScript(faqPage(faq)),
      ],
    };
  },
  component: PlayerStatPage,
});

function buildFaq(hist: NonNullable<ReturnType<typeof getPlayerStatHistory>>, meta: (typeof STATS)[StatSlug]) {
  if (meta.metric === "goals") {
    const faqs = [
      {
        q: `How many World Cup goals does ${hist.name} have?`,
        a: `${hist.name} has scored ${hist.totals.goals} World Cup goals in ${hist.rows.length} tournaments, including ${hist.totals.penalties} from the penalty spot.`,
      },
    ];
    for (const r of hist.rows) {
      faqs.push({
        q: `How many goals did ${hist.name} score in the ${r.year} World Cup?`,
        a: `${hist.name} scored ${r.goals} goal${r.goals === 1 ? "" : "s"} at the ${r.year} FIFA World Cup for ${r.team}.`,
      });
    }
    return faqs.slice(0, 8);
  }
  return [
    {
      q: `How many yellow cards has ${hist.name} received in the World Cup?`,
      a: `${hist.name} has ${hist.totals.yellows} World Cup yellow card${hist.totals.yellows === 1 ? "" : "s"}.`,
    },
    {
      q: `Has ${hist.name} ever been sent off in a World Cup match?`,
      a: hist.totals.reds > 0
        ? `Yes — ${hist.name} received ${hist.totals.reds} red card${hist.totals.reds === 1 ? "" : "s"} across their World Cup career.`
        : `No — ${hist.name} has never been shown a red card in a World Cup match.`,
    },
  ];
}

function PlayerStatPage() {
  const { hist, meta, statSlug } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const isGoals = meta.metric === "goals";
  const total = isGoals ? hist.totals.goals : hist.totals.yellows + hist.totals.reds;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        {" / "}
        <Link to="/football" className="hover:underline">Football</Link>
        {" / "}
        <Link to="/football/players/$slug" params={{ slug }} className="hover:underline">
          {hist.name}
        </Link>
        {" / "}
        <span className="text-foreground">{meta.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {hist.name} — {meta.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        {hist.name} playing for {hist.team}: <strong>{total}</strong>{" "}
        {isGoals ? "World Cup goals" : "World Cup cards"} across {hist.rows.length} tournaments
        {isGoals && hist.totals.penalties > 0 ? ` (${hist.totals.penalties} from penalties)` : ""}.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Team</th>
              {isGoals ? (
                <>
                  <th className="px-3 py-2 text-right">Goals</th>
                  <th className="px-3 py-2 text-right">Penalties</th>
                  <th className="px-3 py-2 text-right">Own Goals</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-2 text-right">Yellow</th>
                  <th className="px-3 py-2 text-right">Red</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {hist.rows.map((r: typeof hist.rows[number]) => (
              <tr key={r.year} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{r.year}</td>
                <td className="px-3 py-2">{r.team}</td>
                {isGoals ? (
                  <>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{r.goals}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.penalties}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.ownGoals}</td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 text-right tabular-nums">{r.yellows}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.reds}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30 font-semibold">
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2">—</td>
              {isGoals ? (
                <>
                  <td className="px-3 py-2 text-right tabular-nums">{hist.totals.goals}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{hist.totals.penalties}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{hist.totals.ownGoals}</td>
                </>
              ) : (
                <>
                  <td className="px-3 py-2 text-right tabular-nums">{hist.totals.yellows}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{hist.totals.reds}</td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      <section className="mt-10 prose prose-sm dark:prose-invert max-w-none">
        <h2>About {hist.name}'s World Cup record</h2>
        <p>
          Across {hist.rows.length} FIFA World Cup tournaments from {hist.rows[0].year} to{" "}
          {hist.rows[hist.rows.length - 1].year}, {hist.name} has represented {hist.team}. This page
          tracks their tournament-by-tournament {isGoals ? "goal-scoring output" : "disciplinary record"},
          compiled from PlaySports' historical dataset covering every World Cup match since 1930.
        </p>
        <p>
          <Link to="/football/players/$slug" params={{ slug }}>← Back to {hist.name}'s profile</Link>
          {" · "}
          <Link to="/tournaments/$tournament/$leaderboard" params={{ tournament: "fifa-world-cup-all-time", leaderboard: isGoals ? "top-scorers" : "yellow-cards" }}>
            All-time {isGoals ? "top scorers" : "card leaders"}
          </Link>
        </p>
      </section>

      <RelatedLinks
        title={`More World Cup stats for ${hist.name}`}
        links={relatedForFootballPlayer(slug, hist.team, 10).filter((l) => l.href !== `/football/players/${slug}/${statSlug}`)}
      />
    </main>
  );
}
