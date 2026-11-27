import { errorMessage } from "@/lib/error-message";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getHighlightBySlug } from "@/lib/seo/entities";
import { slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, videoObject, faqPage, ldScript } from "@/lib/seo/jsonld";
import { relatedHighlights } from "@/lib/seo/related";
import { EmptyState, ErrorState } from "@/components/ui/state";

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
    const thumb = h.youtubeId
      ? `https://i.ytimg.com/vi/${h.youtubeId}/hqdefault.jpg`
      : canonical("/og-image.png");
    const embed = h.youtubeId ? `https://www.youtube.com/embed/${h.youtubeId}` : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "video.other" },
        { property: "og:site_name", content: "PlaySports" },
        { property: "og:image", content: thumb },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: thumb },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          videoObject({
            name: `${h.teamA} vs ${h.teamB} — Match Highlights`,
            description: desc,
            path,
            thumbnailUrl: thumb,
            uploadDate: "2026-01-01T00:00:00.000Z",
            embedUrl: embed,
            contentUrl: h.videoUrl,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Highlights", path: "/highlights" },
            { name: `${h.teamA} vs ${h.teamB}`, path },
          ]),
        ),
        ldScript(
          faqPage([
            {
              q: `Where can I watch ${h.teamA} vs ${h.teamB} highlights?`,
              a: `Watch the full highlights of ${h.teamA} vs ${h.teamB} embedded on this page.`,
            },
            { q: `Who played in this match?`, a: `${h.teamA} played against ${h.teamB}.` },
          ]),
        ),
      ],
    };
  },
  component: HighlightPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this highlight"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <EmptyState
        title="Highlight not found"
        description="This highlight is not in the archive."
        action={
          <Link
            to="/highlights"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All highlights
          </Link>
        }
      />
    </div>
  ),
});

function HighlightPage() {
  const { highlight: h } = Route.useLoaderData();
  const related = relatedHighlights(h, 12);
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center text-xs text-muted-foreground"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to="/football"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Football
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to="/highlights"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Highlights
        </Link>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        {h.teamA} vs {h.teamB} — Match Highlights
      </h1>
      <p className="text-muted-foreground mb-4">
        Full highlights featuring{" "}
        <Link
          to="/football/teams/$slug"
          params={{ slug: slugify(h.teamA) }}
          className="hover:underline"
        >
          {h.teamA}
        </Link>{" "}
        and{" "}
        <Link
          to="/football/teams/$slug"
          params={{ slug: slugify(h.teamB) }}
          className="hover:underline"
        >
          {h.teamB}
        </Link>
        .
      </p>

      {h.youtubeId ? (
        <div className="aspect-video overflow-hidden rounded-lg border">
          <iframe
            className="h-full w-full"
            loading="lazy"
            src={`https://www.youtube-nocookie.com/embed/${h.youtubeId}`}
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
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Watch on YouTube
        </a>
      )}

      {related.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Related highlights</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((x) => (
              <a
                key={x.href}
                href={x.href}
                className="inline-flex min-h-11 items-center rounded-full bg-muted px-3 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {x.label.replace(" — highlights", "")}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
