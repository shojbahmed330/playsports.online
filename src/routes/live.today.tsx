import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
const SPORTS = [
  { slug: "football", name: "Football", link: "/football" as const },
  { slug: "cricket", name: "Cricket", link: "/cricket" as const },
  { slug: "mlb", name: "MLB", link: "/mlb" as const },
  { slug: "nba", name: "NBA", link: "/nba" as const },
  { slug: "nhl", name: "NHL", link: "/nhl" as const },
  { slug: "mls", name: "MLS", link: "/mls" as const },
];

export const Route = createFileRoute("/live/today")({
  head: () => {
    const path = "/live/today";
    const title = "Live Sports Today — All Live Matches & Scores | PlaySports";
    const desc =
      "Every live match across football, cricket, MLB, NBA, NHL and MLS in one place. Real-time scores, fixtures for today, and one-tap access to each sport's live hub.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(collectionPage({ name: title, description: desc, path })),
        ldScript(
          itemList({
            name: "Live sports today",
            path,
            items: SPORTS.map((s) => ({ name: `Live ${s.name}`, path: `/live/${s.slug}` })),
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Live sports today", path },
          ]),
        ),
        ldScript(
          faqPage([
            {
              q: "What live sports are on today?",
              a: "Football, cricket, MLB, NBA, NHL and MLS all have live-match hubs on PlaySports, each refreshing scores every minute.",
            },
            {
              q: "How do I follow one specific match live?",
              a: "Tap any match card on a sport's live hub — it opens a full match centre with lineups, momentum and running commentary.",
            },
          ]),
        ),
      ],
    };
  },
  component: withHubLinks(LiveTodayHub, { sport: "live", currentPath: "/live/today" }),
});

function LiveTodayHub() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground" aria-current="page">
          Live sports today
        </span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Sports Today</h1>
      <p className="text-muted-foreground mb-6">
        Every live match on PlaySports right now — football, cricket, MLB, NBA, NHL and MLS. Pick a
        sport to see live scores and full fixtures for today.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SPORTS.map((s) => (
          <Link
            key={s.slug}
            to="/live/$sport"
            params={{ sport: s.slug }}
            className="flex min-h-11 items-center justify-between rounded-2xl border border-border bg-card/40 px-4 py-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-medium">Live {s.name}</span>
            <span className="text-muted-foreground text-sm">
              Today <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
      <section className="mt-10 prose prose-sm dark:prose-invert max-w-none">
        <h2>How live scoring works on PlaySports</h2>
        <p>
          PlaySports pulls live-match data from official league feeds. Scores, cards and goal events
          update within a minute of happening, so this page is always current — no refresh needed.
          Each sport's dedicated hub gives you match centres with lineups, momentum charts, and
          post-match highlights when they become available.
        </p>
      </section>
    </main>
  );
}
