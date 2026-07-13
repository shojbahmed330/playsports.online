import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getScoreboard } from "@/lib/espn.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { DateScrubber, toYmd } from "@/components/football/DateScrubber";
import { EuroScoresHero, type ScoresFilter } from "@/components/football/EuroScoresHero";
import { ScoresLiveTicker } from "@/components/football/ScoresLiveTicker";
import { ScoresGroupedList } from "@/components/football/ScoresGroupedList";
import { ScoresEmptyState } from "@/components/football/ScoresEmptyState";
import { ScoresJumpBar } from "@/components/football/ScoresJumpBar";
import { EuroQualifyingBanner } from "@/components/football/EuroQualifyingBanner";
import { EuroPastFinalsStrip } from "@/components/football/EuroPastFinalsStrip";
import { CopaScoresHero } from "@/components/football/CopaScoresHero";
import { CopaOnThisDayFinal } from "@/components/football/CopaOnThisDayFinal";
import { CompetitionMatchList } from "@/components/football/CompetitionMatchList";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { buildCompetitionHead } from "@/lib/competition-head";

export const Route = createFileRoute("/football/$comp/scores")({
  loader: ({ params, context }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    void context.queryClient
      .prefetchQuery({
        queryKey: ["comp-scoreboard", comp.slug, "today"],
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
      descriptionOverride:
        comp.slug === "copa-america"
          ? "Copa América live scores, fixtures and results — every kickoff across the tournament window with today's live board and the full match archive."
          : undefined,
    });
  },
  component: ScoresPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function ScoresPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const isEuro = comp.slug === "euro";
  const isCopa = comp.slug === "copa-america";
  const [day, setDay] = useState<Date>(() => new Date());
  const [filter, setFilter] = useState<ScoresFilter>("all");
  const isToday = toYmd(day) === toYmd(new Date());
  const yyyymmdd = isToday ? undefined : toYmd(day);

  const q = useQuery({
    queryKey: ["comp-scoreboard", comp.slug, yyyymmdd ?? "today"],
    queryFn: () =>
      getScoreboard({
        data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name, yyyymmdd },
      }),
    staleTime: 20_000,
    refetchInterval: (query) => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return false;
      const games = (query.state.data as any)?.games ?? [];
      const hasLive = games.some((g: any) => g.status === "in");
      if (hasLive) return 30_000;
      return isToday ? 5 * 60_000 : false;
    },
    refetchIntervalInBackground: false,
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

  const counts = useMemo(() => ({
    all: games.length,
    live: live.length,
    upcoming: games.filter((g) => g.status === "pre").length,
    final: games.filter((g) => g.status === "post").length,
  }), [games, live.length]);

  const filtered = useMemo(() => {
    if (filter === "all") return games;
    if (filter === "live") return games.filter((g) => g.status === "in");
    if (filter === "upcoming") return games.filter((g) => g.status === "pre");
    return games.filter((g) => g.status === "post");
  }, [games, filter]);

  return (
    <CompetitionPageShell
      comp={comp}
      liveCount={live.length}
      todayCount={today.length}
      nextLabel={nextLabel}
    >
      {isEuro ? (
        <>
          <EuroScoresHero
            comp={comp}
            liveCount={live.length}
            todayCount={today.length}
            nextLabel={nextLabel}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />
          <ScoresLiveTicker games={live} compSlug={comp.slug} />
          <DateScrubber value={day} onChange={setDay} />
          <EuroPastFinalsStrip value={day} />

          <div className="mt-4">
            {q.isLoading ? (
              <SkeletonList />
            ) : q.data?.error ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
                Live scores are temporarily unavailable. Please refresh in a moment.
              </div>
            ) : filtered.length === 0 ? (
              <div className="space-y-4">
                {isToday && <EuroQualifyingBanner />}
                <ScoresEmptyState
                  comp={comp}
                  value={day}
                  onJumpTo={setDay}
                  showRecap={isToday}
                />
              </div>
            ) : (
              <ScoresGroupedList games={filtered} compSlug={comp.slug} />
            )}
          </div>

          <ScoresJumpBar value={day} onChange={setDay} />
        </>
      ) : isCopa ? (
        <>
          <CopaScoresHero
            comp={comp}
            liveCount={live.length}
            todayCount={today.length}
            nextLabel={nextLabel}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
          />
          <ScoresLiveTicker games={live} compSlug={comp.slug} />
          <DateScrubber value={day} onChange={setDay} />
          <CopaOnThisDayFinal value={day} />

          <div className="mt-4">
            {q.isLoading ? (
              <SkeletonList />
            ) : q.data?.error ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
                Live scores are temporarily unavailable. Please refresh in a moment.
              </div>
            ) : filtered.length === 0 ? (
              <div className="space-y-4">
                {isToday && (
                  <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] px-4 py-3 text-[13px] text-amber-100">
                    Next Copa América · <span className="font-bold">2028</span> — off-season below, browse the {" "}
                    <span className="font-bold">2024 recap</span>.
                  </div>
                )}
                <ScoresEmptyState
                  comp={comp}
                  value={day}
                  onJumpTo={setDay}
                  showRecap={isToday}
                />
              </div>
            ) : (
              <ScoresGroupedList games={filtered} compSlug={comp.slug} />
            )}
          </div>

          <ScoresJumpBar value={day} onChange={setDay} />
        </>
      ) : (
        // Non-Euro competitions: keep existing simple layout.
        <>
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            {isToday
              ? "Live & Today"
              : day.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h2>
          <DateScrubber value={day} onChange={setDay} />
          {q.isLoading ? (
            <SkeletonList />
          ) : q.data?.error ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
              Live scores are temporarily unavailable. Please refresh in a moment.
            </div>
          ) : games.length === 0 && comp.kind === "tournament" && isToday ? (
            <div className="mt-2">
              <p className="mb-4 text-sm text-muted-foreground">
                No {comp.shortName} matches scheduled around this date. Here&apos;s the last completed edition:
              </p>
              <LastEditionRecap comp={comp} />
            </div>
          ) : (
            <CompetitionMatchList
              games={games}
              emptyLabel={`No ${comp.shortName} matches on this date.`}
              h2hCompSlug={comp.slug}
            />
          )}
        </>
      )}
    </CompetitionPageShell>
  );
}

function SkeletonList() {
  return (
    <ul className="grid gap-2 sm:gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="h-[104px] rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse"
        />
      ))}
    </ul>
  );
}
