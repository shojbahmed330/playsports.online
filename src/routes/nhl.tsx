import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { NhlHero } from "@/components/nhl/NhlHero";
import { NhlSubNav } from "@/components/nhl/NhlSubNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";

export const Route = createFileRoute("/nhl")({
  head: () => ({
    meta: [
      { title: "NHL Hub — Live Scores, Standings, Players, History" },
      {
        name: "description",
        content:
          "Live NHL scoreboard, conference standings, team profiles, statistical leaders, player careers, and championship history.",
      },
      { property: "og:title", content: "NHL Pro Hub — Live Scores · Stats · Careers · History" },
      {
        property: "og:description",
        content:
          "Everything NHL — live games, standings, teams, leaders, player stats, championships.",
      },
    ],
  }),
  component: NhlLayout,
});

function NhlLayout() {
  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      <SportNav />
      <Breadcrumbs />
      <NhlHero />
      <NhlSubNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
