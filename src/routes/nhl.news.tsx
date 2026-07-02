import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSportNews } from "@/lib/espn.functions";
import { NewsRail } from "@/components/sports/NewsRail";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/nhl/news")({
  head: () => ({
    meta: [
      { title: "NHL News — Latest Headlines" },
      { name: "description", content: "Latest NHL news, rumors, and analysis from ESPN's feed." },
      { property: "og:url", content: "https://www.playsports.online/nhl/news" },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nhl/news" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NHL", path: "/nhl" }, { name: "News", path: "/nhl/news" }]))],
  }),
  component: NhlNews,
});

function NhlNews() {
  const fn = useServerFn(getSportNews);
  const q = useQuery({ queryKey: ["nhl", "news", "all"], queryFn: () => fn({ data: { sportPath: "hockey/nhl", limit: 40 } }), staleTime: 30 * 60_000 });
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
