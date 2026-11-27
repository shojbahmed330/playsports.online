import { createFileRoute } from "@tanstack/react-router";
import { HistoryTimeline } from "@/components/mlb/HistoryTimeline";
import { MlbSeasonLeaderHistory } from "@/components/mlb/MlbSeasonLeaderHistory";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/mlb/history")({
  head: () => ({
    meta: [
      { title: "MLB History — World Series, MVPs, Cy Young, All-Time Leaders" },
      {
        name: "description",
        content:
          "Browse 30 years of World Series champions, MVPs, Cy Young winners, Rookie of the Year, all-time MLB career leaders and season-by-season leader history.",
      },
      { property: "og:title", content: "MLB History & All-Time Leaders" },
      {
        property: "og:description",
        content: "World Series champions, MVPs, Cy Young winners and career leaders.",
      },
      { property: "og:url", content: "https://www.playsports.online/mlb/history" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "MLB History — World Series, MVPs, Cy Young, All-Time Leaders",
      },
      {
        name: "twitter:description",
        content:
          "Browse 30 years of World Series champions, MVPs, Cy Young winners, Rookie of the Year, all-time MLB career leaders and season-by-season leader history.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb/history" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "MLB", path: "/mlb" },
          { name: "History", path: "/mlb/history" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(HistoryPage, { sport: "mlb", currentPath: "/mlb/history" }),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load MLB history"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
});

function HistoryPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">MLB History & Records</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Champions · Awards · All-time leaders · Season leader history
        </p>
      </header>
      <HistoryTimeline />
      <MlbSeasonLeaderHistory />
    </div>
  );
}
