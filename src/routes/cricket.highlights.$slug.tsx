// Phase 2.1 (cricket) — /cricket/highlights/:slug SSR landing.
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import {
  getCricketHighlightBySlug,
  listCricketHighlights,
  getCricketTeamBySlug,
} from "@/lib/seo/cricket-entities";
import { slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, videoObject, faqPage, ldScript, itemList } from "@/lib/seo/jsonld";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";

export const Route = createFileRoute("/cricket/highlights/$slug")({
  loader: ({ params }) => {
    const h = getCricketHighlightBySlug(params.slug);
    if (!h) throw notFound();
    return { highlight: h };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Highlight not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { highlight: h } = loaderData;
    const path = `/cricket/highlights/${params.slug}`;
    const url = canonical(path);
    const title = `${h.teamA} vs ${h.teamB} — ${h.tournament} ${h.stage} Highlights | PlaySports`;
    const desc = `Watch ${h.teamA} vs ${h.teamB} from the ${h.tournament} ${h.stage} at ${h.venue} on ${h.date}. ${h.result}. Full match highlights and key moments.`;
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
        { property: "og:url", content: url },
        { property: "og:type", content: "video.other" },
        { property: "og:image", content: thumb },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          videoObject({
            name: `${h.teamA} vs ${h.teamB} — ${h.tournament} ${h.stage}`,
            description: desc,
            path,
            thumbnailUrl: thumb,
            uploadDate: `${h.date}T00:00:00Z`,
            embedUrl: embed,
            contentUrl: h.videoUrl,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Highlights", path: "/cricket/highlights" },
            { name: `${h.teamA} vs ${h.teamB}`, path },
          ]),
        ),
        ldScript(
          faqPage([
            {
              q: `Who won ${h.teamA} vs ${h.teamB} in the ${h.tournament} ${h.stage}?`,
              a: `${h.result}. The match was played at ${h.venue} on ${h.date}.`,
            },
            {
              q: `Where was ${h.teamA} vs ${h.teamB} played?`,
              a: `${h.teamA} played ${h.teamB} at ${h.venue}.`,
            },
            {
              q: `Where can I watch ${h.teamA} vs ${h.teamB} highlights?`,
              a: `Full highlights are embedded on this page from the official broadcaster's YouTube channel.`,
            },
          ]),
        ),
      ],
    };
  },
  component: CricketHighlightPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Highlight not found.</div>,
});

function CricketHighlightPage() {
  const { highlight: h } = Route.useLoaderData();
  const related = listCricketHighlights()
    .filter(
      (x) =>
        x.slug !== h.slug &&
        (x.tournament === h.tournament || x.teamA === h.teamA || x.teamB === h.teamA || x.teamA === h.teamB || x.teamB === h.teamB),
    )
    .slice(0, 8);
  const teamAHasProfile = !!getCricketTeamBySlug(slugify(h.teamA));
  const teamBHasProfile = !!getCricketTeamBySlug(slugify(h.teamB));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />
      <main className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
        <nav className="text-xs text-muted-foreground mb-3" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">Home</Link> /{" "}
          <Link to="/cricket" className="hover:underline">Cricket</Link> /{" "}
          <span>Highlights</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {h.teamA} vs {h.teamB} — {h.tournament} {h.stage}
        </h1>
        <p className="text-muted-foreground mb-4">
          {h.venue} · {h.date} · <span className="uppercase">{h.format}</span> — {h.result}
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
            Search on YouTube
          </a>
        )}

        <section className="mt-6 grid sm:grid-cols-2 gap-3">
          {teamAHasProfile && (
            <Link
              to="/cricket/teams/$slug"
              params={{ slug: slugify(h.teamA) }}
              className="rounded-lg border border-border bg-card p-3 hover:bg-muted/60"
            >
              <p className="text-xs text-muted-foreground">Team profile</p>
              <p className="font-medium">{h.teamA}</p>
            </Link>
          )}
          {teamBHasProfile && (
            <Link
              to="/cricket/teams/$slug"
              params={{ slug: slugify(h.teamB) }}
              className="rounded-lg border border-border bg-card p-3 hover:bg-muted/60"
            >
              <p className="text-xs text-muted-foreground">Team profile</p>
              <p className="font-medium">{h.teamB}</p>
            </Link>
          )}
        </section>

        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Related highlights</h2>
            <div className="flex flex-wrap gap-2">
              {related.map((x) => (
                <Link
                  key={x.slug}
                  to="/cricket/highlights/$slug"
                  params={{ slug: x.slug }}
                  className="px-3 py-1 rounded-full bg-muted text-xs hover:bg-accent"
                >
                  {x.teamA} vs {x.teamB} ({x.tournament})
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// Suppress unused-import warning for itemList (kept for future use)
void itemList;
