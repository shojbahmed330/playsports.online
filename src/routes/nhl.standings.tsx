import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNhlStandingsPro } from "@/lib/nhl.functions";
import { NhlStandingsPro } from "@/components/nhl/NhlStandingsPro";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/nhl/standings")({
  head: () => ({
    meta: [
      { title: "NHL Standings — East & West Conference" },
      {
        name: "description",
        content:
          "Live Eastern and Western Conference standings with division breakdowns, streaks, last 10, and point differential.",
      },
      { property: "og:url", content: "https://www.playsports.online/nhl/standings" },
      { property: "og:title", content: "NHL Standings — East & West Conference" },
      {
        property: "og:description",
        content:
          "Live Eastern and Western Conference standings with division breakdowns, streaks, last 10, and point differential.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NHL Standings — East & West Conference" },
      {
        name: "twitter:description",
        content:
          "Live Eastern and Western Conference standings with division breakdowns, streaks, last 10, and point differential.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nhl/standings" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "NHL", path: "/nhl" },
          { name: "Standings", path: "/nhl/standings" },
        ]),
      ),
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient
      .prefetchQuery({
        queryKey: ["nhl", "st"],
        queryFn: () => getNhlStandingsPro(),
        staleTime: 30 * 60_000,
      })
      .catch(() => null);
    return null;
  },
  component: withHubLinks(NhlStandings, { sport: "nhl", currentPath: "/nhl/standings" }),
});

function NhlStandings() {
  const fn = useServerFn(getNhlStandingsPro);
  const q = useQuery({ queryKey: ["nhl", "st"], queryFn: () => fn(), staleTime: 30 * 60_000 });
  if (q.isLoading) {
    return (
      <div
        className="grid grid-cols-1 xl:grid-cols-2 gap-4"
        role="status"
        aria-label="Loading NHL standings"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-72 rounded-2xl ring-1 ring-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }
  if (q.error) {
    return (
      <ErrorState
        title="Could not load NHL standings"
        message={errorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  }
  if ((q.data?.conferences.length ?? 0) === 0) {
    return (
      <EmptyState
        title="No standings available"
        description="The NHL standings feed is temporarily unavailable."
      />
    );
  }
  return <NhlStandingsPro conferences={q.data?.conferences ?? []} />;
}
