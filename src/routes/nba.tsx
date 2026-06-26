import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";

export const Route = createFileRoute("/nba")({
  head: () => ({
    meta: [
      { title: "NBA Scores, Standings & News — AllSportsLive" },
      { name: "description", content: "Live NBA scoreboard, Eastern and Western conference standings, and breaking basketball news from ESPN." },
      { property: "og:title", content: "NBA — Live Scores & Standings" },
      { property: "og:description", content: "Tonight's NBA games, conference standings, and headlines." },
      { property: "og:url", content: "https://allsportslive.lovable.app/nba" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/nba" }],
  }),
  component: () => <LeaguePage sport={SPORTS.nba} />,
});
