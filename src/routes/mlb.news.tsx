import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSportNews } from "@/lib/espn.functions";
import { NewsRail } from "@/components/sports/NewsRail";
import { GameGridSkeleton } from "@/components/sports/Skeletons";

export const Route = createFileRoute("/mlb/news")({
  component: NewsPage,
});

function NewsPage() {
  const fn = useServerFn(getSportNews);
  const q = useQuery({ queryKey: ["mlb", "news-full"], queryFn: () => fn({ data: { sportPath: "baseball/mlb" } }), staleTime: 30 * 60_000 });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold tracking-tight">Latest MLB News</h2>
      {q.isLoading ? <GameGridSkeleton count={6} /> : (
        <NewsRail items={q.data?.items ?? []} />
      )}
    </div>
  );
}
