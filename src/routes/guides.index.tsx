import { createFileRoute, Link } from "@tanstack/react-router";
import { listGuides } from "@/content/guides";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

export const Route = createFileRoute("/guides/")({
  head: () => ({
    meta: [
      { title: "Sports Guides — Explainers, Formats & Rules | PlaySports" },
      {
        name: "description",
        content:
          "In-depth guides to football, cricket, basketball and more. Learn how tournaments, formats and rules work — from the FIFA World Cup knockouts to VAR, IPL and NBA playoffs.",
      },
      { property: "og:title", content: "Sports Guides | PlaySports" },
      {
        property: "og:description",
        content: "Explainers, formats and rules for the world's biggest sports.",
      },
      { property: "og:url", content: canonical("/guides/") },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sports Guides | PlaySports" },
      {
        name: "twitter:description",
        content: "Explainers, formats and rules for the world's biggest sports.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/guides/") }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides/" },
        ]),
      ),
    ],
  }),
  component: GuidesIndex,
});

function GuidesIndex() {
  const guides = listGuides();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span className="mx-2 text-border" aria-hidden="true">
          /
        </span>
        <span className="text-foreground" aria-current="page">
          Guides
        </span>
      </nav>

      <header className="mb-10 pb-8 border-b border-border">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
          Knowledge base
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
          Sports guides & explainers
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Clear, up-to-date explainers on how the biggest tournaments, formats and rules work — from
          the FIFA World Cup to the IPL, NBA and beyond.
        </p>
      </header>

      {guides.length === 0 ? (
        <EmptyState
          title="No guides published yet"
          description="Sports explainers will appear here once they are published."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link
                to="/guides/$slug"
                params={{ slug: g.slug }}
                className="group block h-full min-h-11 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                  {g.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {g.description}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Updated{" "}
                  {new Date(g.updated).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
