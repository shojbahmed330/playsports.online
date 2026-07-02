import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getGuide, listGuides } from "@/content/guides";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";

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
});

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const others = listGuides().filter((g) => g.slug !== guide.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        {" / "}
        <span className="text-foreground">Guides</span>
      </nav>
      <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
        <h1>{guide.title}</h1>
        <p className="lead text-muted-foreground">{guide.description}</p>
        <p className="text-xs text-muted-foreground">
          Updated {new Date(guide.updated).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div dangerouslySetInnerHTML={{ __html: guide.html }} />

        <h2>FAQ</h2>
        <dl>
          {guide.faqs.map((f) => (
            <div key={f.q} className="mb-4">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </article>

      {others.length > 0 && (
        <section className="mt-12 border-t border-border pt-6">
          <h2 className="text-lg font-semibold mb-3">Related guides</h2>
          <ul className="space-y-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link to="/guides/$slug" params={{ slug: g.slug }} className="text-primary hover:underline">
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
