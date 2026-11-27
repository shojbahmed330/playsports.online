import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Tv } from "lucide-react";
import { getScoreboard, type SportGame } from "@/lib/espn.functions";
import { GameCard } from "@/components/sports/GameCard";
import { DateScrubber, todayYmd } from "@/components/sports/DateScrubber";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withHubLinks } from "@/components/seo/withHubLinks";
type Filter = "all" | "live" | "upcoming" | "final";

export const Route = createFileRoute("/mlb/scores")({
  head: () => ({
    meta: [
      { title: "MLB Scores & Schedule — Live, Upcoming, Final" },
      {
        name: "description",
        content:
          "Live MLB scores, today's schedule, and final results across the league with broadcast info and quick filters.",
      },
      { property: "og:title", content: "MLB Scores & Schedule" },
      { property: "og:description", content: "Live MLB scores and today's schedule." },
      { property: "og:url", content: "https://www.playsports.online/mlb/scores" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLB Scores & Schedule — Live, Upcoming, Final" },
      {
        name: "twitter:description",
        content:
          "Live MLB scores, today's schedule, and final results across the league with broadcast info and quick filters.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb/scores" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "MLB", path: "/mlb" },
          { name: "Scores", path: "/mlb/scores" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(ScoresPage, { sport: "mlb", currentPath: "/mlb/scores" }),
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
        <Chip
          label="All"
          count={games.length}
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <Chip
          label="Live"
          count={live}
          active={filter === "live"}
          onClick={() => setFilter("live")}
          tone="red"
        />
        <Chip
          label="Upcoming"
          count={up}
          active={filter === "upcoming"}
          onClick={() => setFilter("upcoming")}
          tone="amber"
        />
        <Chip
          label="Final"
          count={fin}
          active={filter === "final"}
          onClick={() => setFilter("final")}
        />
        {q.isFetching && !q.isLoading && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />{" "}
            Updating…
          </span>
        )}
      </div>
      {q.isLoading ? (
        <GameGridSkeleton />
      ) : q.error ? (
        <ErrorState
          title="Could not load MLB scores"
          message={errorMessage(q.error)}
          onRetry={() => void q.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No games for this filter"
          description="Try another date or switch back to the All filter."
          icon={<Tv className="size-5" aria-hidden="true" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((g) => (
            <GameCard key={g.id} game={g} linkTo={`/mlb/game/${g.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
  tone = "default",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "red" | "amber" | "default";
}) {
  const base = active
    ? tone === "red"
      ? "bg-red-500 text-white ring-red-400"
      : tone === "amber"
        ? "bg-amber-500 text-black ring-amber-400"
        : "bg-primary text-primary-foreground ring-primary"
    : "bg-muted text-muted-foreground ring-border hover:ring-ring/60";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-xs font-semibold ring-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${base}`}
    >
      {label}
      <span className="tabular-nums opacity-70 text-[10px]">{count}</span>
    </button>
  );
}
