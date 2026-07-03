import { createFileRoute, Link } from "@tanstack/react-router";
import { listTopScorerYears } from "@/lib/seo/programmatic-pages";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/football/top-scorers/")({
  head: () => {
    const path = "/football/top-scorers";
    const title = "FIFA World Cup Top Scorers — Every Tournament | PlaySports";
    const desc =
      "Complete top-scorers rankings for every FIFA World Cup, plus the all-time list. Goals, penalties, and record holders from 1930 to today.";
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
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Top Scorers", path },
          ]),
        ),
      ],
    };
  },
  component: TopScorersIndex,
});

function TopScorersIndex() {
  const years = listTopScorerYears();
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-20">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> / Top Scorers
      </nav>
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">FIFA World Cup Top Scorers</h1>
      <p className="mb-6 text-muted-foreground">
        Every tournament&apos;s leading goalscorers, plus the all-time list across World Cup history.
      </p>

      <Link
        to="/football/top-scorers/$year"
        params={{ year: "all-time" }}
        className="mb-6 flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/5 p-5 hover:bg-gold/10"
      >
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gold">Featured</div>
          <div className="mt-1 text-lg font-bold">All-Time World Cup Top Scorers</div>
          <div className="text-sm text-muted-foreground">
            Every player&apos;s combined World Cup goal tally from 1930 to today.
          </div>
        </div>
        <span aria-hidden className="text-gold">→</span>
      </Link>

      <h2 className="mb-3 text-lg font-semibold">Browse by tournament</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {years.map((y) => (
          <Link
            key={y}
            to="/football/top-scorers/$year"
            params={{ year: String(y) }}
            className="rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-semibold hover:border-gold hover:bg-gold/5"
          >
            {y}
          </Link>
        ))}
      </div>
    </div>
  );
}
