import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { NbaHero } from "@/components/nba/NbaHero";
import { NbaSubNav } from "@/components/nba/NbaSubNav";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";

export const Route = createFileRoute("/nba")({
  head: () => ({
    meta: [
      { title: "NBA Hub — Live Scores, Standings, Players, History" },
      { name: "description", content: "Live NBA scoreboard, conference standings, team profiles, statistical leaders, player careers, and championship history." },
      { property: "og:title", content: "NBA Pro Hub — Live Scores · Stats · Careers · History" },
      { property: "og:description", content: "Everything NBA — live games, standings, teams, leaders, player stats, championships." },
    ],
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
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Data from ESPN's public sports feed · Auto-refreshes while games are live
      </footer>
    </div>
  );
}
