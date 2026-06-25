import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Tv } from "lucide-react";
import { getScoreboard, type SportGame } from "@/lib/espn.functions";
import { GameCard } from "@/components/sports/GameCard";
import { DateScrubber, todayYmd } from "@/components/sports/DateScrubber";
import { GameGridSkeleton } from "@/components/sports/Skeletons";

type Filter = "all" | "live" | "upcoming" | "final";

export const Route = createFileRoute("/mlb/scores")({
  head: () => ({
    meta: [
      { title: "MLB Scores & Schedule — Live, Upcoming, Final" },
      { name: "description", content: "Live MLB scores, today's schedule, and final results across the league with broadcast info and quick filters." },
      { property: "og:title", content: "MLB Scores & Schedule" },
      { property: "og:description", content: "Live MLB scores and today's schedule." },
      { property: "og:url", content: "https://allsportslive.lovable.app/mlb/scores" },
    ],
    links: [{ rel: "canonical", href: "https://allsportslive.lovable.app/mlb/scores" }],
  }),
  component: ScoresPage,
});

function ScoresPage() {
  const [day, setDay] = useState(todayYmd());
  const [filter, setFilter] = useState<Filter>("all");
  const fn = useServerFn(getScoreboard);
  const q = useQuery({
    queryKey: ["mlb", "scores", day],
    queryFn: () => fn({ data: { sportPath: "baseball/mlb", league: "MLB", yyyymmdd: day } }),
    staleTime: 20_000,
    refetchInterval: (qq) => {
      const d = qq.state.data as { games?: SportGame[] } | undefined;
      return d?.games?.some((g) => g.status === "in") ? 20_000 : false;
    },
  });
  const games = q.data?.games ?? [];
  const live = games.filter((g) => g.status === "in").length;
  const up = games.filter((g) => g.status === "pre").length;
  const fin = games.filter((g) => g.status === "post").length;
  const filtered = useMemo(() => {
    if (filter === "all") return games;
    const k = filter === "live" ? "in" : filter === "upcoming" ? "pre" : "post";
    return games.filter((g) => g.status === k);
  }, [games, filter]);

  return (
    <div className="space-y-4">
      <DateScrubber selected={day} onChange={setDay} />
      <div className="flex flex-wrap items-center gap-2">
        <Chip label="All" count={games.length} active={filter === "all"} onClick={() => setFilter("all")} />
        <Chip label="Live" count={live} active={filter === "live"} onClick={() => setFilter("live")} tone="red" />
        <Chip label="Upcoming" count={up} active={filter === "upcoming"} onClick={() => setFilter("upcoming")} tone="amber" />
        <Chip label="Final" count={fin} active={filter === "final"} onClick={() => setFilter("final")} />
        {q.isFetching && !q.isLoading && (
          <span className="ml-auto text-[10px] text-gray-500 inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" /> Updating…
          </span>
        )}
      </div>
      {q.isLoading ? <GameGridSkeleton /> : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Tv className="size-10 opacity-30 mx-auto mb-2" />
          <p className="text-sm">No games for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((g) => <GameCard key={g.id} game={g} linkTo={`/mlb/game/${g.id}`} />)}
        </div>
      )}
    </div>
  );
}

function Chip({ label, count, active, onClick, tone = "default" }: { label: string; count: number; active: boolean; onClick: () => void; tone?: "red" | "amber" | "default" }) {
  const base = active
    ? tone === "red" ? "bg-red-500 text-white ring-red-400"
      : tone === "amber" ? "bg-amber-500 text-black ring-amber-400"
      : "bg-white text-black ring-white"
    : "bg-gray-900 text-gray-300 ring-gray-800 hover:ring-gray-700";
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 transition-colors ${base}`}>
      {label}
      <span className="tabular-nums opacity-70 text-[10px]">{count}</span>
    </button>
  );
}
