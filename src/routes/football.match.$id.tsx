import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { getWc2026Match } from "@/lib/wc2026.functions";
import { LiveMatchCenter } from "@/components/wc/LiveMatchCenter";
import { WatchLivePanel } from "@/components/wc/WatchLivePanel";

export const Route = createFileRoute("/football/match/$id")({
  component: MatchPage,
});

function MatchPage() {
  const { id } = useParams({ from: "/football/match/$id" });
  const matchId = Number(id);

  const q = useQuery({
    queryKey: ["wc2026", "match", matchId],
    queryFn: () => getWc2026Match({ data: { matchId } }),
    refetchInterval: 30_000,
    enabled: Number.isFinite(matchId),
  });

  return (
    <div className="min-h-dvh bg-black text-foreground">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/70 border-b border-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link
            to="/football"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
          >
            <ChevronLeft className="size-4" /> Football
          </Link>
          <div className="ml-auto text-[10px] text-gray-600 uppercase tracking-widest">
            Match Centre
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {q.isLoading && (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="size-5 animate-spin mr-2" /> Loading match…
          </div>
        )}
        {q.data?.error && !q.data.fixture && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Match unavailable: {q.data.error}
          </div>
        )}
        {q.data?.fixture && (
          <>
            <LiveMatchCenter fixture={q.data.fixture} />
            <WatchLivePanel />
          </>
        )}
      </main>
    </div>
  );
}
