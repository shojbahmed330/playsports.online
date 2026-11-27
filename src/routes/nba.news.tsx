import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSportNews } from "@/lib/espn.functions";
import { NewsRail } from "@/components/sports/NewsRail";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/nba/news")({
  head: () => ({
    meta: [
      { title: "NBA News — Latest Headlines" },
      { name: "description", content: "Latest NBA news, rumors, and analysis from ESPN's feed." },
      { property: "og:url", content: "https://www.playsports.online/nba/news" },
      { property: "og:title", content: "NBA News — Latest Headlines" },
      {
        property: "og:description",
        content: "Latest NBA news, rumors, and analysis from ESPN's feed.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NBA News — Latest Headlines" },
      {
        name: "twitter:description",
        content: "Latest NBA news, rumors, and analysis from ESPN's feed.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nba/news" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "NBA", path: "/nba" },
          { name: "News", path: "/nba/news" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(NbaNews, { sport: "nba", currentPath: "/nba/news" }),
});

function NbaNews() {
  const fn = useServerFn(getSportNews);
  const q = useQuery({
    queryKey: ["nba", "news", "all"],
    queryFn: () => fn({ data: { sportPath: "basketball/nba", limit: 40 } }),
    staleTime: 30 * 60_000,
  });
  const items = q.data?.items ?? [];
  if (q.isLoading) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        role="status"
        aria-label="Loading NBA news"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl ring-1 ring-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }
  if (q.error) {
    return (
      <ErrorState
        title="Could not load NBA news"
        message={errorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="No NBA headlines right now"
        description="The news feed is empty or temporarily unavailable."
      />
    );
  }
  return <NewsRail items={items} />;
}
