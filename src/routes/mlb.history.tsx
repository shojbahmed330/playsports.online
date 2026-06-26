import { createFileRoute } from "@tanstack/react-router";
import { HistoryTimeline } from "@/components/mlb/HistoryTimeline";
import { MlbSeasonLeaderHistory } from "@/components/mlb/MlbSeasonLeaderHistory";

export const Route = createFileRoute("/mlb/history")({
  head: () => ({
    meta: [
      { title: "MLB History — World Series, MVPs, Cy Young, All-Time Leaders" },
      { name: "description", content: "Browse 30 years of World Series champions, MVPs, Cy Young winners, Rookie of the Year, all-time MLB career leaders and season-by-season leader history." },
      { property: "og:title", content: "MLB History & All-Time Leaders" },
      { property: "og:description", content: "World Series champions, MVPs, Cy Young winners and career leaders." },
      { property: "og:url", content: "https://allsportslive.lovable.app/mlb/history" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/mlb/history" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">MLB History & Records</h1>
        <p className="text-sm text-muted-foreground mt-1">Champions · Awards · All-time leaders · Season leader history</p>
      </header>
      <HistoryTimeline />
      <MlbSeasonLeaderHistory />
    </div>
  );
}
