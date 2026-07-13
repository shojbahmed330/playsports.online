import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSportNews } from "@/lib/espn.functions";
import { NewsRail } from "@/components/sports/NewsRail";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/mls/news")({
  head: () => ({
    meta: [
      { title: "MLS News — Latest Headlines" },
      { name: "description", content: "Latest MLS news, rumors, and analysis from ESPN's feed." },
      { property: "og:url", content: "https://www.playsports.online/mls/news" },
      { property: "og:title", content: "MLS News — Latest Headlines" },
      { property: "og:description", content: "Latest MLS news, rumors, and analysis from ESPN's feed." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLS News — Latest Headlines" },
      { name: "twitter:description", content: "Latest MLS news, rumors, and analysis from ESPN's feed." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mls/news" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLS", path: "/mls" }, { name: "News", path: "/mls/news" }]))],
  }),
  component: MlsNews,
});

function MlsNews() {
  const fn = useServerFn(getSportNews);
  const q = useQuery({ queryKey: ["mls", "news", "all"], queryFn: () => fn({ data: { sportPath: "soccer/usa.1", limit: 40 } }), staleTime: 30 * 60_000 });
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
