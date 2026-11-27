import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Newspaper, Rss } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { listNewsRecaps } from "@/lib/news.server";
import { formatNewsDate } from "@/lib/news-date";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/news/")({
  loader: async () => ({ articles: await listNewsRecaps(30) }),
  head: () => {
    const title = "Football & Cricket News, Recaps & Analysis | PlaySports";
    const description =
      "Match recaps, results and analysis from cricket and football — Premier League, Champions League, internationals and more.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "https://www.playsports.online/news" },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "https://www.playsports.online/og-default.png" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://www.playsports.online/og-default.png" },
      ],
      links: [
        { rel: "canonical", href: "https://www.playsports.online/news" },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "PlaySports match recaps RSS",
          href: "https://www.playsports.online/news/rss.xml",
        },
      ],
      scripts: [
        ldScript(collectionPage({ name: "Match recaps & analysis", description, path: "/news" })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
          ]),
        ),
      ],
    };
  },
  component: NewsIndex,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load the news feed"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
});

function NewsIndex() {
  const { articles } = Route.useLoaderData();

  return (
    <div className="min-h-screen">
      <SportNav />
      <Breadcrumbs />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <header className="rounded-2xl border border-border bg-gradient-to-br from-sky-950/40 via-background to-emerald-950/20 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-sky-300">
              <Newspaper className="size-4" aria-hidden="true" /> PlaySports news
            </div>
            <a
              href="/news/rss.xml"
              className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-sky-500/40 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Subscribe to the PlaySports news RSS feed"
            >
              <Rss className="size-3" aria-hidden="true" /> RSS
            </a>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Match recaps &amp; analysis</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Data-grounded recaps from cricket and football — results, key moments and what they
            mean.
          </p>
        </header>

        {articles.length === 0 ? (
          <EmptyState
            title="No recaps published yet"
            description="Recaps are generated after matches finish. In the meantime, browse live scores."
            action={
              <>
                <Link
                  to="/cricket"
                  className="inline-flex min-h-11 items-center rounded-full bg-emerald-500/15 px-3 text-xs font-bold text-emerald-200 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Cricket scores
                </Link>
                <Link
                  to="/football"
                  className="inline-flex min-h-11 items-center rounded-full bg-sky-500/15 px-3 text-xs font-bold text-sky-200 ring-1 ring-sky-500/30 hover:bg-sky-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Football scores
                </Link>
              </>
            }
          />
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                to="/news/$slug"
                params={{ slug: article.slug }}
                className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="font-bold text-sky-300">{article.sport}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" aria-hidden="true" />
                    {formatNewsDate(article.updatedAt)}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-extrabold leading-snug line-clamp-3">
                  {article.headline}
                </h2>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{article.summary}</p>
                <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="truncate">
                    {article.homeTeam} v {article.awayTeam}
                  </span>
                  <span className="inline-flex items-center gap-0.5 font-bold text-sky-300 group-hover:gap-1.5 transition-all">
                    Read <ChevronRight className="size-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
