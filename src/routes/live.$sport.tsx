import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, faqPage, ldScript } from "@/lib/seo/jsonld";

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
    return { hub, sport: params.sport };
  },
  head: ({ params, loaderData }) => {
    const hub = loaderData?.hub;
    if (!hub) {
      return { meta: [{ title: "Live — Sport not found" }, { name: "robots", content: "noindex" }] };
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
            { q: `What live ${hub.name.toLowerCase()} matches are on today?`, a: `See the full list of live ${hub.name.toLowerCase()} matches, kick-off times and current scores on the ${hub.name} live hub.` },
            { q: `How often are scores updated?`, a: `Live scores refresh every minute; goals, cards, and match status update in near real time.` },
          ]),
        ),
      ],
    };
  },
  component: LiveSportHub,
});

function LiveSportHub() {
  const { hub, sport } = Route.useLoaderData();
  if (!hub) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Sport not found</h1>
        <p className="text-muted-foreground">
          Try <Link to="/live/today" className="underline">live sports today</Link>.
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        {" / "}
        <Link to="/live/today" className="hover:underline">Live</Link>
        {" / "}
        <span className="text-foreground">{hub.name}</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        Live {hub.name} Matches Today
      </h1>
      <p className="text-muted-foreground mb-6">
        Live scores, in-progress matches and today's fixtures for {hub.name.toLowerCase()}. Scores
        refresh automatically. Tap any match for the full match centre.
      </p>
      <div className="rounded-lg border border-border p-8 text-center">
        <p className="mb-4 text-muted-foreground">Live matches load from the {hub.name} hub.</p>
        <Link
          to={hub.link}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium hover:opacity-90"
        >
          Open {hub.name} live scores →
        </Link>
      </div>
      <section className="mt-10 prose prose-sm dark:prose-invert max-w-none">
        <h2>About live {hub.name.toLowerCase()} on PlaySports</h2>
        <p>
          PlaySports aggregates live {hub.name.toLowerCase()} fixtures from official league feeds
          the moment they kick off. You'll see the current score, match minute, goalscorers and
          card events without refreshing. Click any match to open a full match centre with lineups,
          momentum, head-to-head history and highlights when available.
        </p>
        <p>
          Looking for a different sport? Try <Link to="/live/today">all live sports today</Link>{" "}
          for a cross-sport view.
        </p>
      </section>
    </main>
  );
}
