import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";

export const Route = createFileRoute("/mlb")({
  head: () => ({
    meta: [
      { title: "MLB Scores, Standings & News — Sports Hub" },
      { name: "description", content: "Live Major League Baseball scoreboard, division standings, and breaking MLB news from ESPN." },
      { property: "og:title", content: "MLB — Live Scores & Standings" },
      { property: "og:description", content: "Today's MLB games, division standings, and headlines." },
    ],
  }),
  component: () => <LeaguePage sport={SPORTS.mlb} />,
});
