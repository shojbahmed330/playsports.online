import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";

export const Route = createFileRoute("/mls")({
  head: () => ({
    meta: [
      { title: "MLS Scores, Standings & News — Sports Hub" },
      { name: "description", content: "Live Major League Soccer scoreboard, Eastern and Western conference standings, and breaking soccer news from ESPN." },
      { property: "og:title", content: "MLS — Live Scores & Standings" },
      { property: "og:description", content: "Today's MLS games, conference standings, and headlines." },
    ],
  }),
  component: () => <LeaguePage sport={SPORTS.mls} />,
});
