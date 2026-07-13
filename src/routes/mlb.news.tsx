import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSportNews } from "@/lib/espn.functions";
import { MlbNewsHub } from "@/components/mlb/MlbNewsHub";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/mlb/news")({
  head: () => ({
    meta: [
      { title: "MLB News — Latest Headlines, Trades, Injuries" },
      { name: "description", content: "The latest MLB news: headlines, trades, injuries, recaps, and analysis updated throughout the day." },
      { property: "og:title", content: "MLB News — Latest Headlines, Trades, Injuries" },
      { property: "og:description", content: "Live MLB headlines and analysis updated throughout the day." },
      { property: "og:url", content: "https://www.playsports.online/mlb/news" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLB News — Latest Headlines, Trades, Injuries" },
      { name: "twitter:description", content: "The latest MLB news: headlines, trades, injuries, recaps, and analysis updated throughout the day." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb/news" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLB", path: "/mlb" }, { name: "News", path: "/mlb/news" }]))],
  }),
  component: withHubLinks(NewsPage, { sport: "mlb", currentPath: "/mlb/news" }),
});

function NewsPage() {
  const fn = useServerFn(getSportNews);
  const q = useQuery({
    queryKey: ["mlb", "news-full"],
    queryFn: () => fn({ data: { sportPath: "baseball/mlb", limit: 40 } }),
    staleTime: 15 * 60_000,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">MLB News</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Headlines, trades, injuries, and recaps from around the league
        </p>
      </header>
      {q.isLoading ? <GameGridSkeleton count={6} /> : <MlbNewsHub items={q.data?.items ?? []} />}
    </div>
  );
}
