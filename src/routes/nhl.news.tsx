import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSportNews } from "@/lib/espn.functions";
import { NewsRail } from "@/components/sports/NewsRail";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/nba/news")({
  head: () => ({
    meta: [
      { title: "NBA News — Latest Headlines" },
      { name: "description", content: "Latest NBA news, rumors, and analysis from ESPN's feed." },
      { property: "og:url", content: "https://allsportslive.lovable.app/nba/news" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/nba/news" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NBA", path: "/nba" }, { name: "News", path: "/nba/news" }]))],
  }),
  component: NbaNews,
});

function NbaNews() {
  const fn = useServerFn(getSportNews);
  const q = useQuery({ queryKey: ["nba", "news", "all"], queryFn: () => fn({ data: { sportPath: "basketball/nba", limit: 40 } }), staleTime: 30 * 60_000 });
  const items = q.data?.items ?? [];
  if (q.isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 rounded-2xl ring-1 ring-border bg-card animate-pulse" />)}
      </div>
    );
  }
  return <NewsRail items={items} />;
}
