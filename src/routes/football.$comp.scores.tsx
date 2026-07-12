import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getScoreboard } from "@/lib/espn.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { CompetitionMatchList } from "@/components/football/CompetitionMatchList";
import { DateScrubber, toYmd } from "@/components/football/DateScrubber";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/football/$comp/scores")({
  loader: ({ params, context }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    void context.queryClient
      .prefetchQuery({
        queryKey: ["comp-scoreboard", comp.slug],
        queryFn: () =>
          getScoreboard({ data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name } }),
        staleTime: 20_000,
      })
      .catch(() => null);
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Scores" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Live Scores",
      path: `/football/${comp.slug}/scores`,
    });
  },
  component: ScoresPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function ScoresPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const [day, setDay] = useState<Date>(() => new Date());
  const isToday = toYmd(day) === toYmd(new Date());
  const yyyymmdd = isToday ? undefined : toYmd(day);

  const q = useQuery({
    queryKey: ["comp-scoreboard", comp.slug, yyyymmdd ?? "today"],
    queryFn: () =>
      getScoreboard({
        data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name, yyyymmdd },
      }),
    staleTime: 20_000,
    refetchInterval: isToday ? 30_000 : false,
  });

  const games = q.data?.games ?? [];
  const live = games.filter((g) => g.status === "in");
  const today = games.filter((g) => g.status !== "post");
  const nextGame = today.find((g) => g.status === "pre");
  const nextLabel = nextGame
    ? new Date(nextGame.startTs).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <CompetitionPageShell
      comp={comp}
      liveCount={live.length}
      todayCount={today.length}
      nextLabel={nextLabel}
    >
      <h2 className="text-lg sm:text-xl font-bold mb-4">
        {isToday ? "Live & Today" : day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </h2>
      <DateScrubber value={day} onChange={setDay} />
      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading scores…
        </div>
      ) : q.data?.error ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          Live scores are temporarily unavailable. Please refresh in a moment.
        </div>
      ) : (
        <>
          <CompetitionMatchList
            games={games}
            emptyLabel={`No ${comp.shortName} matches on this date.`}
            h2hCompSlug={comp.slug}
          />
          {games.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Tap any match to open the{" "}
              <Link
                to="/football/$comp/matches/$matchId"
                params={{ comp: comp.slug, matchId: games[0].id }}
                className="underline underline-offset-4 hover:text-foreground"
              >
                match center
              </Link>
              .
            </p>
          )}
        </>
      )}
    </CompetitionPageShell>
  );
}
