import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSportNews } from "@/lib/espn.functions";
import { MlbNewsHub } from "@/components/mlb/MlbNewsHub";
import { GameGridSkeleton } from "@/components/sports/Skeletons";

export const Route = createFileRoute("/mlb/news")({
  head: () => ({
    meta: [
      { title: "MLB News — Latest Headlines, Trades, Injuries" },
      { name: "description", content: "The latest MLB news: headlines, trades, injuries, recaps, and analysis updated throughout the day." },
      { property: "og:title", content: "MLB News — Latest Headlines, Trades, Injuries" },
      { property: "og:description", content: "Live MLB headlines and analysis updated throughout the day." },
      { property: "og:url", content: "https://allsportslive.lovable.app/mlb/news" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/mlb/news" }],
  }),
  component: NewsPage,
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
