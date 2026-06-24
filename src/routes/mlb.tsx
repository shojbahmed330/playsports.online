import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { MlbHero } from "@/components/mlb/MlbHero";
import { MlbSubNav } from "@/components/mlb/MlbSubNav";

export const Route = createFileRoute("/mlb")({
  head: () => ({
    meta: [
      { title: "MLB Hub — Live Scores, Standings, Players, History" },
      { name: "description", content: "Live Major League Baseball scoreboard, standings, team profiles, league leaders, player careers, and 100+ years of World Series history." },
      { property: "og:title", content: "MLB Pro Hub — Live Scores · Stats · Careers · History" },
      { property: "og:description", content: "Everything MLB — live games, standings, teams, leaders, player stats, World Series history." },
    ],
  }),
  component: MlbLayout,
});

function MlbLayout() {
  return (
    <div className="min-h-screen">
      <SportNav />
      <MlbHero />
      <MlbSubNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Data from ESPN's public sports feed · Auto-refreshes while games are live
      </footer>
    </div>
  );
}
