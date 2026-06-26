import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";
import { getScoreboard, getStandings } from "@/lib/espn.functions";
import { todayYmd } from "@/components/sports/DateScrubber";

export const Route = createFileRoute("/mls")({
  head: () => ({
    meta: [
      { title: "MLS Scores, Standings & News — AllSportsLive" },
      { name: "description", content: "Live Major League Soccer scoreboard, Eastern and Western conference standings, and breaking soccer news from ESPN." },
      { property: "og:title", content: "MLS — Live Scores & Standings" },
      { property: "og:description", content: "Today's MLS games, conference standings, and headlines." },
      { property: "og:url", content: "https://allsportslive.lovable.app/mls" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/mls" }],
    scripts: [
      ldScript(collectionPage({ name: "MLS — Live Scores & Standings", description: "MLS scores, conference standings and headlines.", path: "/mls" })),
      ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLS", path: "/mls" }])),
    ],
  }),
  loader: async ({ context }) => {
    const day = todayYmd();
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ["espn", "mls", "scoreboard", day],
        queryFn: () => getScoreboard({ data: { sportPath: "soccer/usa.1", league: "MLS", yyyymmdd: day } }),
        staleTime: 30_000,
      }).catch(() => null),
      context.queryClient.prefetchQuery({
        queryKey: ["espn", "mls", "standings"],
        queryFn: () => getStandings({ data: { sportPath: "soccer/usa.1" } }),
        staleTime: 60 * 60_000,
      }).catch(() => null),
    ]);
    return null;
  },
  component: () => <LeaguePage sport={SPORTS.mls} />,
});
