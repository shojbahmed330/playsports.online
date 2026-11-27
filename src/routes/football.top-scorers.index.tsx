import { createFileRoute, Link } from "@tanstack/react-router";
import { listTopScorerYears } from "@/lib/seo/programmatic-pages";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/football/top-scorers/")({
  head: () => {
    const path = "/football/top-scorers";
    const title = "FIFA World Cup Top Scorers — Every Tournament | PlaySports";
    const desc =
      "Complete top-scorers rankings for every FIFA World Cup, plus the all-time list. Goals, penalties, and record holders from 1930 to today.";
    const years = listTopScorerYears();
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
            name: "FIFA World Cup Top Scorers",
            description: desc,
            path,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Top Scorers", path },
          ]),
        ),
        ldScript(
          itemList({
            name: "World Cup top scorers by tournament",
            path,
            items: [
              { name: "All-time top scorers", path: `${path}/all-time` },
              ...years.map((y) => ({ name: `${y} top scorers`, path: `${path}/${y}` })),
            ],
          }),
        ),
      ],
    };
  },
  component: withHubLinks(TopScorersIndex, {
    sport: "football",
    currentPath: "/football/top-scorers",
  }),
});

function TopScorersIndex() {
  const years = listTopScorerYears();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-20">
      <nav className="mb-3 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:underline">
          Home
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <Link to="/football" className="hover:underline">
          Football
        </Link>{" "}
        <span aria-hidden="true">/</span> Top Scorers
      </nav>
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">FIFA World Cup Top Scorers</h1>
      <p className="mb-6 text-muted-foreground">
        Every tournament&apos;s leading goalscorers, plus the all-time list across World Cup
        history.
      </p>

      <Link
        to="/football/top-scorers/$year"
        params={{ year: "all-time" }}
        className="mb-6 flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/5 p-5 hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gold">Featured</div>
          <div className="mt-1 text-lg font-bold">All-Time World Cup Top Scorers</div>
          <div className="text-sm text-muted-foreground">
            Every player&apos;s combined World Cup goal tally from 1930 to today.
          </div>
        </div>
        <span aria-hidden className="text-gold">
          →
        </span>
      </Link>

      <h2 className="mb-3 text-lg font-semibold">Browse by tournament</h2>
      {years.length === 0 ? (
        <EmptyState
          title="No tournament lists available"
          description="Yearly top-scorer pages will appear once the dataset is populated."
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {years.map((y) => (
            <Link
              key={y}
              to="/football/top-scorers/$year"
              params={{ year: String(y) }}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-semibold hover:border-gold hover:bg-gold/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {y}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
