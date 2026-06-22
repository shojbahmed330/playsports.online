import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";

export const Route = createFileRoute("/nhl")({
  head: () => ({
    meta: [
      { title: "NHL Scores, Standings & News — Sports Hub" },
      { name: "description", content: "Live NHL scoreboard, division standings, and breaking hockey news from ESPN." },
      { property: "og:title", content: "NHL — Live Scores & Standings" },
      { property: "og:description", content: "Tonight's NHL games, division standings, and headlines." },
    ],
  }),
  component: () => <LeaguePage sport={SPORTS.nhl} />,
});
