import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { MlsHero } from "@/components/mls/MlsHero";
import { MlsSubNav } from "@/components/mls/MlsSubNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { canonical } from "@/lib/seo/canonical";

export const Route = createFileRoute("/mls")({
  head: () => ({
    meta: [
      { title: "MLS Hub — Live Scores, Standings, Players, History" },
      {
        name: "description",
        content:
          "Live MLS scoreboard, conference standings, team profiles, statistical leaders, player careers, and championship history.",
      },
      { property: "og:title", content: "MLS Pro Hub — Live Scores · Stats · Careers · History" },
      {
        property: "og:description",
        content:
          "Everything MLS — live games, standings, teams, leaders, player stats, championships.",
      },
      { property: "og:url", content: canonical("/mls") },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLS Hub — Live Scores, Standings, Players, History" },
      {
        name: "twitter:description",
        content: "Everything MLS — live games, standings, teams, leaders and championships.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/mls") }],
  }),
  component: MlsLayout,
});

function MlsLayout() {
  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      <SportNav />
      <Breadcrumbs />
      <MlsHero />
      <MlsSubNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
