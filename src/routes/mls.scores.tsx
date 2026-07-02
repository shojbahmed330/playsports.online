import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { getMlsScoreboard } from "@/lib/mls.functions";
import { GameCard } from "@/components/sports/GameCard";
import { DateScrubber, todayYmd } from "@/components/sports/DateScrubber";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/mls/scores")({
  head: () => ({
    meta: [
      { title: "MLS Scoreboard — Live & Recent Games" },
      { name: "description", content: "Browse every MLS game by date with live scores, quarters, and matchup details." },
      { property: "og:url", content: "https://www.playsports.online/mls/scores" },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mls/scores" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLS", path: "/mls" }, { name: "Scores", path: "/mls/scores" }]))],
  }),
  component: MlsScores,
});

type Filter = "all" | "live" | "upcoming" | "final";

function MlsScores() {
  const [day, setDay] = useState(todayYmd());
  const [filter, setFilter] = useState<Filter>("all");
  const sbFn = useServerFn(getMlsScoreboard);

  const sbQ = useQuery({
    queryKey: ["mls", "scores", day],
    queryFn: () => sbFn({ data: { yyyymmdd: day } }),
    staleTime: 20_000,
    refetchInterval: (q) => {
      const d = q.state.data as any;
      return d?.games?.some((g: any) => g.status === "in") ? 20_000 : false;
    },
  });

  const games = sbQ.data?.games ?? [];
  const filtered = useMemo(() => {
    if (filter === "all") return games;
    if (filter === "live") return games.filter((g) => g.status === "in");
    if (filter === "upcoming") return games.filter((g) => g.status === "pre");
    return games.filter((g) => g.status === "post");
  }, [games, filter]);

  return (
    <div className="space-y-5">
      <DateScrubber selected={day} onChange={setDay} />
      <div className="flex flex-wrap items-center gap-2">
        {(["all", "live", "upcoming", "final"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
              filter === f ? "bg-orange-500/20 text-orange-200 ring-orange-500/40" : "bg-card text-muted-foreground ring-border hover:text-white"
            }`}
          >{f.toUpperCase()}</button>
        ))}
        <div className="ml-auto text-xs text-muted-foreground">{filtered.length} game{filtered.length === 1 ? "" : "s"}</div>
      </div>

      {sbQ.isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-2xl ring-1 ring-border bg-card animate-pulse" />)}
        </div>
      )}
      {!sbQ.isLoading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">
          No games match the current filter on this date.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((g) => (
          <GameCard key={g.id} game={g as any} linkTo={`/mls/game/${g.id}`} />
        ))}
      </div>
    </div>
  );
}
