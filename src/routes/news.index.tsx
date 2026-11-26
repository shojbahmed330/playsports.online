import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Newspaper } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { listNewsRecaps } from "@/lib/news.server";
import { formatNewsDate } from "@/lib/news-date";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";

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
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://www.playsports.online/og-default.png" },
      ],
      links: [{ rel: "canonical", href: "https://www.playsports.online/news" }],
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
});

function NewsIndex() {
  const { articles } = Route.useLoaderData();

  return (
    <div className="min-h-screen">
      <SportNav />
      <Breadcrumbs />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <header className="rounded-2xl border border-border bg-gradient-to-br from-sky-950/40 via-background to-emerald-950/20 p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-sky-300">
            <Newspaper className="size-4" /> PlaySports news
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold">Match recaps &amp; analysis</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Data-grounded recaps from cricket and football — results, key moments and what
            they mean.
          </p>
        </header>

        {articles.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border p-10 text-center">
            <h2 className="text-lg font-bold">No recaps published yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Recaps are generated after matches finish. In the meantime, browse live scores.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/cricket"
                className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25"
              >
                Cricket scores
              </Link>
              <Link
                to="/football"
                className="rounded-full bg-sky-500/15 px-3 py-1.5 text-xs font-bold text-sky-200 ring-1 ring-sky-500/30 hover:bg-sky-500/25"
              >
                Football scores
              </Link>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <Link
                key={article.slug}
                to="/news/$slug"
                params={{ slug: article.slug }}
                className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-500/40"
              >
                <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="font-bold text-sky-300">{article.sport}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" />
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
                    Read <ChevronRight className="size-3" />
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
