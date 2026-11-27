import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { NbaHero } from "@/components/nba/NbaHero";
import { NbaSubNav } from "@/components/nba/NbaSubNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";
import { canonical } from "@/lib/seo/canonical";

export const Route = createFileRoute("/nba")({
  head: () => ({
    meta: [
      { title: "NBA Hub — Live Scores, Standings, Players, History" },
      {
        name: "description",
        content:
          "Live NBA scoreboard, conference standings, team profiles, statistical leaders, player careers, and championship history.",
      },
      { property: "og:title", content: "NBA Pro Hub — Live Scores · Stats · Careers · History" },
      {
        property: "og:description",
        content:
          "Everything NBA — live games, standings, teams, leaders, player stats, championships.",
      },
      { property: "og:url", content: canonical("/nba") },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NBA Hub — Live Scores, Standings, Players, History" },
      {
        name: "twitter:description",
        content: "Everything NBA — live games, standings, teams, leaders and championships.",
      },
    ],
    links: [{ rel: "canonical", href: canonical("/nba") }],
  }),
  component: NbaLayout,
});

function NbaLayout() {
  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      <SportNav />
      <Breadcrumbs />
      <NbaHero />
      <NbaSubNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
