import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getMultiCricketToday, type CricketMatch } from "@/lib/cricket.functions";
import { CRICKET_LEAGUES } from "@/lib/cricket-leagues";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";

export function CricketSlate() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const fn = useServerFn(getMultiCricketToday);
  const leagueIds = CRICKET_LEAGUES.map((l) => l.id);
  const q = useQuery({
    queryKey: ["cricket", "slate", leagueIds.join(",")],
    queryFn: () => fn({ data: { leagueIds } }),
    staleTime: 30_000,
    refetchInterval: (qq) => {
      const d = qq.state.data as { matches?: CricketMatch[] } | undefined;
      return d?.matches?.some((m) => m.status === "in") ? 25_000 : false;
    },
  });

  const matches = q.data?.matches ?? [];
  const live = matches.filter((m) => m.status === "in");
  const upcoming = matches
    .filter((m) => m.status === "pre")
    .sort((a, b) => a.startTs - b.startTs)
    .slice(0, 3);
  const recent = matches
    .filter((m) => m.status === "post")
    .sort((a, b) => b.startTs - a.startTs)
    .slice(0, 3);
  const pick = [...live, ...upcoming, ...recent].slice(0, 6);

  // Keep the first client render identical to the server render. If the
  // server had no prefetched slate, render nothing until mount, then fetch.
  if (!mounted && !q.data) return null;

  if (q.isLoading) {
    return (
      <section className="space-y-3">
        <div className="text-lg font-bold text-[var(--color-accent-cricket)] flex items-center gap-2">
          🏏 Cricket
        </div>
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground bg-background">
          Loading cricket slate…
        </div>
      </section>
    );
  }
  if (pick.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          to="/cricket"
          className="group inline-flex items-center gap-2 text-lg font-bold text-[var(--color-accent-cricket)] hover:underline"
        >
          <span className="text-base">🏏</span> Cricket — live & upcoming
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <div className="flex items-center gap-2 text-[11px]">
          {live.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[var(--color-live)] bg-[var(--color-live)]/15 ring-1 ring-[var(--color-live)]/30 rounded-full px-2 py-0.5 font-bold">
              <span className="size-1.5 rounded-full bg-[var(--color-live)] animate-pulse motion-reduce:animate-none" />{" "}
              {live.length} live
            </span>
          )}
          <span className="text-muted-foreground">
            {matches.length} total · {CRICKET_LEAGUES.length} series
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pick.map((m) => (
          <CricketMatchCard key={m.id} match={m} />
        ))}
      </div>
    </section>
  );
}
