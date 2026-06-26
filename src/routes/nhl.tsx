import { createFileRoute } from "@tanstack/react-router";
import { LeaguePage } from "@/components/sports/LeaguePage";
import { SPORTS } from "@/lib/sports-config";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";
import { getScoreboard, getStandings } from "@/lib/espn.functions";
import { todayYmd } from "@/components/sports/DateScrubber";

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
  loader: async ({ context }) => {
    const day = todayYmd();
    await Promise.all([
      context.queryClient.prefetchQuery({
        queryKey: ["espn", "nhl", "scoreboard", day],
        queryFn: () => getScoreboard({ data: { sportPath: "hockey/nhl", league: "NHL", yyyymmdd: day } }),
        staleTime: 30_000,
      }).catch(() => null),
      context.queryClient.prefetchQuery({
        queryKey: ["espn", "nhl", "standings"],
        queryFn: () => getStandings({ data: { sportPath: "hockey/nhl" } }),
        staleTime: 60 * 60_000,
      }).catch(() => null),
    ]);
    return null;
  },
  component: () => <LeaguePage sport={SPORTS.nhl} />,
});
