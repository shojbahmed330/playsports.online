import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";

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
    scripts: [
      ldScript(collectionPage({ name: "NHL — Live Scores & Standings", description: "NHL scores, division standings and headlines.", path: "/nhl" })),
      ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NHL", path: "/nhl" }])),
    ],
  }),
  component: () => <LeaguePage sport={SPORTS.nhl} />,
});
