import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getHighlightBySlug, listHighlights } from "@/lib/seo/entities";
import { slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, videoObject, faqPage, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/highlights/$slug")({
  loader: ({ params }) => {
    const h = getHighlightBySlug(params.slug);
    if (!h) throw notFound();
    return { highlight: h };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Highlight not found" }, { name: "robots", content: "noindex" }] };
    }
    const { highlight: h } = loaderData;
    const path = `/highlights/${params.slug}`;
    const title = `${h.teamA} vs ${h.teamB} — Match Highlights Video | PlaySports`;
    const desc = `Watch full highlights from ${h.teamA} vs ${h.teamB}. Goals, key moments and match recap embedded from YouTube.`;
    const thumb = h.youtubeId ? `https://i.ytimg.com/vi/${h.youtubeId}/hqdefault.jpg` : canonical("/og-image.png");
    const embed = h.youtubeId ? `https://www.youtube.com/embed/${h.youtubeId}` : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "video.other" },
        { property: "og:image", content: thumb },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          videoObject({
            name: `${h.teamA} vs ${h.teamB} — Match Highlights`,
            description: desc,
            path,
            thumbnailUrl: thumb,
            uploadDate: new Date().toISOString(),
            embedUrl: embed,
            contentUrl: h.videoUrl,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Highlights", path: "/football" },
            { name: `${h.teamA} vs ${h.teamB}`, path },
          ]),
        ),
        ldScript(
          faqPage([
            { q: `Where can I watch ${h.teamA} vs ${h.teamB} highlights?`, a: `Watch the full highlights of ${h.teamA} vs ${h.teamB} embedded on this page.` },
            { q: `Who played in this match?`, a: `${h.teamA} played against ${h.teamB}.` },
          ]),
        ),
      ],
    };
  },
  component: HighlightPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Highlight not found.</div>,
});

function HighlightPage() {
  const { highlight: h } = Route.useLoaderData();
  const related = listHighlights()
    .filter((x) => x.slug !== h.slug && (x.teamA === h.teamA || x.teamB === h.teamA || x.teamA === h.teamB || x.teamB === h.teamB))
    .slice(0, 8);
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> /{" "}
        <span>Highlights</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        {h.teamA} vs {h.teamB} — Match Highlights
      </h1>
      <p className="text-muted-foreground mb-4">
        Full highlights featuring{" "}
        <Link to="/football/teams/$slug" params={{ slug: slugify(h.teamA) }} className="hover:underline">
          {h.teamA}
        </Link>{" "}
        and{" "}
        <Link to="/football/teams/$slug" params={{ slug: slugify(h.teamB) }} className="hover:underline">
          {h.teamB}
        </Link>
        .
      </p>

      {h.youtubeId ? (
        <div className="aspect-video overflow-hidden rounded-lg border">
          <iframe
            className="h-full w-full"
            loading="lazy"
            src={`https://www.youtube.com/embed/${h.youtubeId}`}
            title={`${h.teamA} vs ${h.teamB} highlights`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={h.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          Watch on YouTube
        </a>
      )}

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Related highlights</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((x) => (
              <Link
                key={x.slug}
                to="/highlights/$slug"
                params={{ slug: x.slug }}
                className="px-3 py-1 rounded-full bg-muted text-xs hover:bg-accent"
              >
                {x.teamA} vs {x.teamB}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
