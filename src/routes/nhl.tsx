import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";

export const Route = createFileRoute("/nhl")({
  head: () => ({
    meta: [
      { title: "NHL Scores, Standings & News — AllSportsLive" },
      { name: "description", content: "Live NHL scoreboard, division standings, and breaking hockey news from ESPN." },
      { property: "og:title", content: "NHL — Live Scores & Standings" },
      { property: "og:description", content: "Tonight's NHL games, division standings, and headlines." },
      { property: "og:url", content: "https://allsportslive.lovable.app/nhl" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/nhl" }],
  }),
  component: () => <LeaguePage sport={SPORTS.nhl} />,
});
