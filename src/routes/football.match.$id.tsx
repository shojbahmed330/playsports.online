import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, Loader2, ChevronDown, Tv } from "lucide-react";
import { getWc2026Match } from "@/lib/wc2026.functions";
import { LiveMatchCenter } from "@/components/wc/LiveMatchCenter";
import { WatchLivePanel } from "@/components/wc/WatchLivePanel";

export const Route = createFileRoute("/football/match/$id")({
  head: ({ params }) => {
    const url = `https://allsportslive.lovable.app/football/match/${params.id}`;
    return {
      meta: [
        { title: "FIFA World Cup 2026 Match — Live Score & Lineups" },
        { name: "description", content: "Live FIFA World Cup 2026 match: score, lineups, key events, broadcast info and where to watch." },
        { property: "og:title", content: "FIFA World Cup 2026 — Live Match" },
        { property: "og:description", content: "Live score, lineups and broadcast info." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: MatchPage,
});

function MatchPage() {
  const { id } = useParams({ from: "/football/match/$id" });
  const matchId = Number(id);
  const [watchOpen, setWatchOpen] = useState(false);

  const q = useQuery({
    queryKey: ["wc2026", "match", matchId],
    queryFn: () => getWc2026Match({ data: { matchId } }),
    refetchInterval: 30_000,
    enabled: Number.isFinite(matchId),
  });

  const fx = q.data?.fixture;
  const title = fx ? `${fx.home.name} v ${fx.away.name}` : "Match Centre";
  const isLive = fx?.status === "inprogress";

  return (
    <div className="min-h-dvh bg-black text-foreground pb-16 sm:pb-0">
      {/* Single slim header — no nested look */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/80 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center gap-2">
          <Link
            to="/football"
            search={(prev: Record<string, unknown>) => ({ ...prev, tab: "knockout" })}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white shrink-0"
            aria-label="Back to Football"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Football</span>
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-white text-center">
            {title}
          </h1>
          {isLive ? (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> Live
            </span>
          ) : (
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-gray-600">2026</span>
          )}
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
        {fx && (
          <>
            <LiveMatchCenter fixture={fx} />

            {/* Watch live — collapsible disclosure, not a second stacked card */}
            <section className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
              <button
                type="button"
                onClick={() => setWatchOpen((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-amber-200 hover:bg-amber-500/10 rounded-xl"
                aria-expanded={watchOpen}
              >
                <Tv className="size-4" />
                <span>Watch live</span>
                <span className="ml-auto text-[10px] uppercase tracking-widest text-amber-200/60">
                  {watchOpen ? "Hide" : "Show"}
                </span>
                <ChevronDown className={`size-4 transition-transform ${watchOpen ? "rotate-180" : ""}`} />
              </button>
              {watchOpen && (
                <div className="border-t border-amber-500/15 px-3 py-3">
                  <WatchLivePanel compact />
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
