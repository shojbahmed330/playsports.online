import { createFileRoute, Link } from "@tanstack/react-router";
import { listHighlights } from "@/lib/seo/entities";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, itemList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/highlights/")({
  head: () => {
    const path = "/highlights";
    const title = "Football Match Highlights — World Cup Videos | PlaySports";
    const desc = "Browse every FIFA World Cup 2026 match highlight page, with official video embeds, team links and related football highlights.";
    const highlights = listHighlights();
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
            name: "Football match highlights",
            path,
            items: highlights.map((h) => ({
              name: `${h.teamA} vs ${h.teamB}`,
              path: `/highlights/${h.slug}`,
            })),
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Highlights", path },
          ]),
        ),
      ],
    };
  },
  component: HighlightsIndexPage,
});

function HighlightsIndexPage() {
  const highlights = listHighlights();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-20">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        {" / "}
        <Link to="/football" className="hover:underline">Football</Link>
        {" / "}
        <span className="text-foreground">Highlights</span>
      </nav>

      <h1 className="text-3xl font-bold md:text-4xl">Football Match Highlights</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Watch official video pages for FIFA World Cup 2026 fixtures and jump between related matchups.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="All football highlights">
        {highlights.map((h) => (
          <Link
            key={h.slug}
            to="/highlights/$slug"
            params={{ slug: h.slug }}
            className="rounded-lg border border-border bg-card/40 p-4 transition hover:border-indigo-400/60 hover:bg-muted/40"
          >
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Match highlights</div>
            <h2 className="mt-2 text-base font-semibold text-foreground">{h.teamA} vs {h.teamB}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Official video page →</p>
          </Link>
        ))}
      </section>
    </main>
  );
}