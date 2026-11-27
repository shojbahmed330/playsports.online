import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, faqPage, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

const HUBS = {
  football: { name: "Football", link: "/football" as const },
  cricket: { name: "Cricket", link: "/cricket" as const },
  mlb: { name: "MLB", link: "/mlb" as const },
  nba: { name: "NBA", link: "/nba" as const },
  nhl: { name: "NHL", link: "/nhl" as const },
  mls: { name: "MLS", link: "/mls" as const },
} as const;

export const Route = createFileRoute("/live/$sport")({
  loader: ({ params }) => {
    const hub = HUBS[params.sport as keyof typeof HUBS];
    if (!hub) throw notFound();
    return { hub };
  },
  head: ({ params, loaderData }) => {
    const hub = loaderData?.hub;
    if (!hub) {
      return {
        meta: [{ title: "Live — Sport not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const path = `/live/${params.sport}`;
    const title = `Live ${hub.name} Matches Today — Scores & Fixtures | PlaySports`;
    const desc = `Watch live ${hub.name.toLowerCase()} matches happening right now. Real-time scores, fixtures for today, kick-off times, and match centre links — updated every minute.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(collectionPage({ name: title, description: desc, path })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Live", path: "/live/today" },
            { name: hub.name, path },
          ]),
        ),
        ldScript(
          faqPage([
            {
              q: `What live ${hub.name.toLowerCase()} matches are on today?`,
              a: `See the full list of live ${hub.name.toLowerCase()} matches, kick-off times and current scores on the ${hub.name} live hub.`,
            },
            {
              q: `How often are scores updated?`,
              a: `Live scores refresh every minute; goals, cards, and match status update in near real time.`,
            },
          ]),
        ),
      ],
    };
  },
  component: LiveSportHub,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <EmptyState
        title="Sport not found"
        description="This live hub does not exist. Browse all live sports today instead."
        action={
          <Link
            to="/live/today"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Live sports today
          </Link>
        }
      />
    </div>
  ),
});

function LiveSportHub() {
  const { hub } = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to="/live/today"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Live
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground" aria-current="page">
          {hub.name}
        </span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Live {hub.name} Matches Today</h1>
      <p className="text-muted-foreground mb-6">
        Live scores, in-progress matches and today's fixtures for {hub.name.toLowerCase()}. Scores
        refresh automatically. Tap any match for the full match centre.
      </p>
      <div className="rounded-2xl border border-border bg-card/40 p-8 text-center">
        <p className="mb-4 text-muted-foreground">
          Live scores, fixtures and the full match list are on the {hub.name} hub.
        </p>
        <Link
          to={hub.link}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open the {hub.name} hub{" "}
          <span className="ml-1" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
      <section className="mt-10 prose prose-sm dark:prose-invert max-w-none">
        <h2>About live {hub.name.toLowerCase()} on PlaySports</h2>
        <p>
          PlaySports aggregates live {hub.name.toLowerCase()} fixtures from official league feeds
          the moment they kick off. You'll see the current score, match minute, goalscorers and card
          events without refreshing. Click any match to open a full match centre with lineups,
          momentum, head-to-head history and highlights when available.
        </p>
        <p>
          Looking for a different sport? Try <Link to="/live/today">all live sports today</Link> for
          a cross-sport view.
        </p>
      </section>
    </main>
  );
}
