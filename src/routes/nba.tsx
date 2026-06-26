import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";
import { getScoreboard, getStandings } from "@/lib/espn.functions";
import { todayYmd } from "@/components/sports/DateScrubber";

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
    scripts: [
      ldScript(collectionPage({ name: "NBA — Live Scores & Standings", description: "NBA scores, conference standings and headlines.", path: "/nba" })),
      ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NBA", path: "/nba" }])),
    ],
  }),
  loader: async ({ context }) => {
    const day = todayYmd();
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ["espn", "nba", "scoreboard", day],
        queryFn: () => getScoreboard({ data: { sportPath: "basketball/nba", league: "NBA", yyyymmdd: day } }),
        staleTime: 30_000,
      }).catch(() => null),
      context.queryClient.prefetchQuery({
        queryKey: ["espn", "nba", "standings"],
        queryFn: () => getStandings({ data: { sportPath: "basketball/nba" } }),
        staleTime: 60 * 60_000,
      }).catch(() => null),
    ]);
    return null;
  },
  component: () => <LeaguePage sport={SPORTS.nba} />,
});
