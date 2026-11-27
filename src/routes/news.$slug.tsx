import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Clock3 } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { getNewsRecap, listNewsRecaps } from "@/lib/news.server";
import { pickRelatedNews, recapMatchPath } from "@/lib/news-feed";
import { formatNewsDate } from "@/lib/news-date";
import { markdownToHtml } from "@/lib/markdown-lite";
import { articlePage, breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const article = await getNewsRecap(params.slug);
    if (!article) throw notFound();
    const related = pickRelatedNews(article.slug, article.sport, await listNewsRecaps(12), 3);
    return { article, related };
  },
  head: ({ params, loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return {
        meta: [
          { title: "Article not found — PlaySports" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }
    const path = `/news/${params.slug}`;
    const image = article.heroImage ?? "https://www.playsports.online/og-default.png";
    return {
      meta: [
        { title: `${article.headline} | PlaySports` },
        { name: "description", content: article.metaDescription ?? article.summary },
        { property: "og:title", content: article.headline },
        { property: "og:description", content: article.metaDescription ?? article.summary },
        { property: "og:url", content: `https://www.playsports.online${path}` },
        { property: "og:type", content: "article" },
        { property: "og:image", content: image },
        { property: "article:published_time", content: article.updatedAt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.headline },
        { name: "twitter:description", content: article.metaDescription ?? article.summary },
        { name: "twitter:image", content: image },
      ],
      links: [
        { rel: "canonical", href: `https://www.playsports.online${path}` },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "PlaySports match recaps RSS",
          href: "https://www.playsports.online/news/rss.xml",
        },
      ],
      scripts: [
        ldScript(
          articlePage({
            type: "NewsArticle",
            headline: article.headline,
            description: article.metaDescription ?? article.summary,
            path,
            datePublished: article.updatedAt,
            dateModified: article.updatedAt,
            image,
            articleSection: article.sport,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: article.headline.slice(0, 80), path },
          ]),
        ),
      ],
    };
  },
  component: NewsArticlePage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Article not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This recap may have been moved or is not published yet.
      </p>
      <Link to="/news" className="mt-6 inline-flex text-sm font-bold text-sky-300 underline">
        Back to news
      </Link>
    </div>
  ),
});

function NewsArticlePage() {
  const { article, related } = Route.useLoaderData();
  const html = markdownToHtml(article.fullArticle);
  const matchPath = recapMatchPath(article.sport, article.matchKey);

  return (
    <div className="min-h-screen">
      <SportNav />
      <Breadcrumbs />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <article>
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider font-bold">
              <span className="rounded-full bg-sky-500/15 px-2 py-1 text-sky-300 ring-1 ring-sky-500/30">
                {article.sport}
              </span>
              {article.tournament && (
                <span className="rounded-full bg-white/5 px-2 py-1 text-muted-foreground">
                  {article.tournament}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <CalendarDays className="size-3" /> {formatNewsDate(article.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Clock3 className="size-3" /> 4 min read
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              {article.headline}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">{article.summary}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>
                {article.homeTeam}
                {article.homeScore != null && article.awayScore != null
                  ? ` ${article.homeScore}–${article.awayScore} `
                  : " v "}
                {article.awayTeam}
              </span>
              {matchPath && (
                <a
                  href={matchPath}
                  className="inline-flex items-center gap-0.5 font-bold text-sky-300 hover:text-sky-200"
                >
                  Match page <ChevronRight className="size-3" />
                </a>
              )}
            </div>
          </header>

          {article.heroImage && (
            <img
              src={article.heroImage}
              alt=""
              className="mt-6 w-full rounded-2xl border border-border object-cover"
              loading="lazy"
              decoding="async"
            />
          )}

          {article.keyMoments.length > 0 && (
            <section className="mt-8 rounded-2xl border border-border bg-card p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-sky-300">
                Key moments
              </h2>
              <ol className="mt-3 space-y-3">
                {article.keyMoments.map((moment, index) => (
                  <li key={`${moment.title}-${index}`} className="flex gap-3 text-sm">
                    <span className="shrink-0 font-bold tabular-nums text-muted-foreground">
                      {moment.minute ?? `${index + 1}.`}
                    </span>
                    <span>
                      <strong className="font-semibold">{moment.title}</strong>
                      <span className="text-muted-foreground"> — {moment.detail}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div
            className="prose prose-invert mt-8 max-w-none prose-headings:font-extrabold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <div className="mt-10 border-t border-border pt-6">
            <Link
              to="/news"
              className="inline-flex items-center gap-1 text-sm font-bold text-sky-300 hover:text-sky-200"
            >
              <ChevronRight className="size-4 rotate-180" /> All match recaps
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-sky-300">
              More match recaps
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to="/news/$slug"
                  params={{ slug: item.slug }}
                  className="group rounded-xl border border-border bg-card p-3 transition-colors hover:border-sky-500/40"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                    {item.sport}
                  </span>
                  <h3 className="mt-1.5 text-sm font-bold leading-snug line-clamp-3 group-hover:text-sky-200">
                    {item.headline}
                  </h3>
                  <span className="mt-2 block text-[11px] text-muted-foreground">
                    {formatNewsDate(item.updatedAt)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
