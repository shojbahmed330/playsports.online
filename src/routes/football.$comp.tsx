import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  getCompetition,
  requireCompetition,
  formatSeasonLabel,
  type Competition,
} from "@/lib/competitions";
import { getScoreboard, getStandings } from "@/lib/espn.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { CompetitionMatchList } from "@/components/football/CompetitionMatchList";
import { CompetitionStandingsTable } from "@/components/football/CompetitionStandingsTable";
import { CompetitionH2HPicker } from "@/components/football/CompetitionH2HPicker";
import { CompetitionNewsRail } from "@/components/football/CompetitionNewsRail";
import { CompetitionCountdown } from "@/components/football/CompetitionCountdown";
import { ChampionsTimelineWidget } from "@/components/football/ChampionsTimelineWidget";
import { TopScorersPreviewCard } from "@/components/football/TopScorersPreviewCard";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { SportNav } from "@/components/sports/SportNav";
import { SiteFooter } from "@/components/home/SiteFooter";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/football/$comp")({
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
    void context.queryClient
      .prefetchQuery({
        queryKey: ["comp-standings", comp.slug],
        queryFn: () => getStandings({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
        staleTime: 5 * 60_000,
      })
      .catch(() => null);
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Football competition" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Live Scores, Standings & History",
      path: `/football/${comp.slug}`,
      descriptionOverride: `Live ${comp.name} ${formatSeasonLabel(
        comp,
        comp.currentSeason,
      )} scores, standings, fixtures, records and full history — one home for everything ${comp.shortName}.`,
    });
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Competition not found</h1>
        <p className="mt-3 text-muted-foreground">
          We don&apos;t have a page for that competition yet.
        </p>
        <Link
          to="/football"
          className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to Football
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  component: CompetitionLandingPage,
});

function CompetitionLandingPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);

  const scoreboard = useQuery({
    queryKey: ["comp-scoreboard", comp.slug],
    queryFn: () =>
      getScoreboard({ data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name } }),
    staleTime: 20_000,
    refetchInterval: 30_000,
  });
  const standings = useQuery({
    queryKey: ["comp-standings", comp.slug],
    queryFn: () => getStandings({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
    staleTime: 5 * 60_000,
  });

  const games = scoreboard.data?.games ?? [];
  const live = games.filter((g) => g.status === "in");
  const today = games.filter((g) => g.status !== "post");
  const nextGame = games.find((g) => g.status === "pre");
  const nextLabel = nextGame
    ? new Date(nextGame.startTs).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const previewGames = games.slice(0, 6);
  // Show ALL groups (not just Group A). WC has 12 groups; users want to see
  // the full field on the landing page, not scroll through a single group.
  const previewGroups = standings.data?.groups ?? [];


  const isFutureEdition =
    comp.kind === "tournament" &&
    comp.currentSeason > new Date().getFullYear() &&
    games.length === 0;
  const isOffSeason = !scoreboard.isLoading && games.length === 0 && !isFutureEdition;

  return (
    <CompetitionPageShell
      comp={comp}
      liveCount={live.length}
      todayCount={today.length}
      nextLabel={nextLabel}
    >
      {isFutureEdition && <CompetitionCountdown comp={comp} />}

      {(isFutureEdition || isOffSeason) ? (
        <div className="mt-6">
          <LastEditionRecap comp={comp} />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3 mt-6">
          <section className="lg:col-span-2">
            <SectionHeader
              title={live.length > 0 ? "Live & Today" : "Latest Matches"}
              to={`/football/${comp.slug}/scores`}
              cta="All scores"
            />
            {scoreboard.isLoading ? (
              <Loading label="Loading scores…" />
            ) : (
              <CompetitionMatchList
                games={previewGames}
                emptyLabel={`No ${comp.shortName} matches right now. See fixtures for what's next.`}
                h2hCompSlug={comp.slug}
              />
            )}
          </section>

          <section>
            <SectionHeader
              title={comp.kind === "league" ? "Table" : "Standings"}
              to={`/football/${comp.slug}/standings`}
              cta="Full table"
            />
            {standings.isLoading ? (
              <Loading label="Loading standings…" />
            ) : (
              <CompetitionStandingsTable groups={previewGroups} compact />
            )}
          </section>

        </div>
      )}

      <TopScorersPreviewCard comp={comp} />
      <ChampionsTimelineWidget comp={comp} />
      <CompetitionNewsRail comp={comp} />
      <CompetitionH2HPicker comp={comp} />
      <QuickLinks comp={comp} />
    </CompetitionPageShell>
  );
}

function SectionHeader({ title, to, cta }: { title: string; to: string; cta: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
      <a
        href={to}
        className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        {cta} <ArrowRight className="size-3.5" />
      </a>
    </div>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> {label}
    </div>
  );
}

function QuickLinks({ comp }: { comp: Competition }) {
  const links = [
    { label: "Fixtures", to: `/football/${comp.slug}/fixtures` },
    { label: "History", to: `/football/${comp.slug}/history` },
    { label: "Records", to: `/football/${comp.slug}/records` },
    { label: comp.kind === "league" ? "Clubs" : "Teams", to: `/football/${comp.slug}/teams` },
    { label: "Players", to: `/football/${comp.slug}/players` },
  ];
  return (
    <section className="mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
        More {comp.shortName}
      </h3>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.to}
            href={l.to}
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm font-semibold hover:border-white/20 hover:bg-white/[0.06]"
          >
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
