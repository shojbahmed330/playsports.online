import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getGuide, listGuides } from "@/content/guides";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";

export const Route = createFileRoute("/guides/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Guide not found" }, { name: "robots", content: "noindex" }] };
    }
    const { guide } = loaderData;
    const path = `/guides/${params.slug}`;
    return {
      meta: [
        { title: `${guide.title} | PlaySports` },
        { name: "description", content: guide.description },
        { property: "og:title", content: guide.title },
        { property: "og:description", content: guide.description },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: guide.title },
        { name: "twitter:description", content: guide.description },
        { property: "article:modified_time", content: guide.updated },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          dateModified: guide.updated,
          datePublished: guide.updated,
          url: canonical(path),
          author: { "@type": "Organization", name: "PlaySports" },
          publisher: { "@type": "Organization", name: "PlaySports" },
        }),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides/" + params.slug },
            { name: guide.title, path },
          ]),
        ),
        ldScript(faqPage(guide.faqs)),
      ],
    };
  },
  component: GuidePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <EmptyState
        title="Guide not found"
        description="This guide may have moved or is not published."
        action={
          <Link
            to="/guides"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All guides
          </Link>
        }
      />
    </div>
  ),
});

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const others = listGuides().filter((g) => g.slug !== guide.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">
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
        <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">Guide</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-4">
          {guide.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">{guide.description}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Updated{" "}
          {new Date(guide.updated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })}
        </p>
      </header>

      <article
        className="guide-content text-foreground"
        dangerouslySetInnerHTML={{ __html: guide.html }}
      />

      <section className="mt-14 pt-8 border-t border-border">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Frequently asked questions</h2>
        <dl className="space-y-4">
          {guide.faqs.map((f: { q: string; a: string }) => (
            <div key={f.q} className="rounded-lg border border-border bg-card p-5">
              <dt className="font-semibold text-foreground mb-2">{f.q}</dt>
              <dd className="text-muted-foreground leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {others.length > 0 && (
        <section className="mt-14 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Related guides</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link
                  to="/guides/$slug"
                  params={{ slug: g.slug }}
                  className="flex min-h-11 items-center rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="font-medium text-foreground">{g.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
