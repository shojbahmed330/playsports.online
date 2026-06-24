import { createFileRoute } from "@tanstack/react-router";
import { HistoryTimeline } from "@/components/mlb/HistoryTimeline";

export const Route = createFileRoute("/mlb/history")({
  head: () => ({
    meta: [
      { title: "MLB History — World Series, MVPs, Cy Young, All-Time Leaders" },
      { name: "description", content: "Browse 30 years of World Series champions, MVPs, Cy Young winners, Rookie of the Year, and all-time MLB career leaders." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">MLB History & Records</h1>
        <p className="text-sm text-muted-foreground mt-1">Champions · Awards · All-time leaders</p>
      </header>
      <HistoryTimeline />
    </div>
  );
}
