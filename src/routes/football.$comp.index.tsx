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
import { CompetitionH2HPicker } from "@/components/football/CompetitionH2HPicker";
import { CompetitionNewsRail } from "@/components/football/CompetitionNewsRail";
import { CompetitionCountdown } from "@/components/football/CompetitionCountdown";
import { ChampionsTimelineWidget } from "@/components/football/ChampionsTimelineWidget";
import { TopScorersPreviewCard } from "@/components/football/TopScorersPreviewCard";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { Euro2028Hero } from "@/components/football/Euro2028Hero";
import { Euro2028VenuesCard } from "@/components/football/Euro2028VenuesCard";
import { EuroLegendsRail } from "@/components/football/EuroLegendsRail";
import { EuroSquadOfTournament2024 } from "@/components/football/EuroSquadOfTournament2024";
import { EuroHonoursStrip } from "@/components/football/EuroHonoursStrip";
import { EuroFactsGrid } from "@/components/football/EuroFactsGrid";
import { EuroOnThisDayCard } from "@/components/football/EuroOnThisDayCard";
import { EuroGoldenBootTimeline } from "@/components/football/EuroGoldenBootTimeline";
import { EuroPopularMatchups } from "@/components/football/EuroPopularMatchups";
import { MobileJumpNav } from "@/components/football/MobileJumpNav";
import { CopaHero } from "@/components/football/CopaHero";
import { CopaFactsGrid } from "@/components/football/CopaFactsGrid";
import { CopaHonoursStrip } from "@/components/football/CopaHonoursStrip";
import { CopaGoldenBootTimeline } from "@/components/football/CopaGoldenBootTimeline";
import { CopaLegendsRail } from "@/components/football/CopaLegendsRail";
import { CopaPastFinalsStrip } from "@/components/football/CopaPastFinalsStrip";
import { CopaOnThisDayCard } from "@/components/football/CopaOnThisDayCard";
import { CopaPopularMatchups } from "@/components/football/CopaPopularMatchups";
import { copaTitleCounts } from "@/lib/copa-history";
import { buildCompetitionHead } from "@/lib/competition-head";
import { ldScript } from "@/lib/seo/jsonld";
import { ArrowRight } from "lucide-react";

/**
 * Landing page for /football/$comp (Overview tab). Lives in an index route so
 * the parent /football/$comp layout can render <Outlet /> and let sibling
 * tabs (scores, fixtures, standings, ...) mount properly.
 */
export const Route = createFileRoute("/football/$comp/")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Overview" }, { name: "robots", content: "noindex" }] };
    const isCopa = comp.slug === "copa-america";
    const copaTop = isCopa ? copaTitleCounts()[0] : undefined;
    const base = buildCompetitionHead({
      comp,
      section: "Overview",
      path: `/football/${comp.slug}`,
      descriptionOverride: isCopa
        ? `Copa América — ${copaTop ? `${copaTop.team} lead with ${copaTop.titles} titles` : "South America's oldest continental trophy"}. Reigning champion Argentina (2024), Messi's crown, every final, every top scorer.`
        : `${comp.name} ${formatSeasonLabel(
            comp,
            comp.currentSeason,
          )} overview — hero facts, honours, top scorers, legends and full archive for ${comp.shortName}.`,
    });
    if (!isCopa) return base;
    const counts = copaTitleCounts();
    const honoursLD = ldScript({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Copa América honours by nation",
      itemListElement: counts.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${c.team} — ${c.titles} Copa América title${c.titles === 1 ? "" : "s"}`,
      })),
    });
    return { ...base, scripts: [...(base.scripts ?? []), honoursLD] };
  },
  component: CompetitionLandingPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
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
      {comp.slug === "euro" && comp.currentSeason === 2028 ? (
        <>
          <Euro2028Hero />
          <MobileJumpNav
            items={[
              { id: "facts", label: "Facts" },
              { id: "honours", label: "Honours" },
              { id: "golden-boot", label: "Golden Boot" },
              { id: "venues", label: "Venues" },
              { id: "squad-2024", label: "Squad 2024" },
              { id: "scorers", label: "Scorers" },
              { id: "legends", label: "Legends" },
              { id: "h2h", label: "H2H" },
            ]}
          />
        </>
      ) : comp.slug === "copa-america" ? (
        <>
          <CopaHero />
          <MobileJumpNav
            items={[
              { id: "facts", label: "Facts" },
              { id: "honours", label: "Honours" },
              { id: "golden-boot", label: "Top scorers" },
              { id: "finals", label: "Finals" },
              { id: "legends", label: "Legends" },
              { id: "scorers", label: "Leaders" },
              { id: "h2h", label: "H2H" },
            ]}
          />
        </>
      ) : (
        isFutureEdition && <CompetitionCountdown comp={comp} />
      )}

      {comp.slug === "euro" && <EuroFactsGrid />}
      {comp.slug === "copa-america" && <CopaFactsGrid />}

      {(isFutureEdition || isOffSeason) && (
        <div className="mt-8 sm:mt-10">
          <LastEditionRecap comp={comp} />
        </div>
      )}

      {comp.slug === "euro" && <EuroHonoursStrip />}
      {comp.slug === "euro" && <EuroGoldenBootTimeline />}

      {comp.slug === "copa-america" && <CopaHonoursStrip />}
      {comp.slug === "copa-america" && <CopaGoldenBootTimeline />}
      {comp.slug === "copa-america" && <CopaPastFinalsStrip />}

      {comp.slug === "euro" && comp.currentSeason === 2028 && <Euro2028VenuesCard />}
      {comp.slug === "euro" && (
        <div id="squad-2024" className="scroll-mt-24">
          <EuroSquadOfTournament2024 />
        </div>
      )}

      <div id="scorers" className="scroll-mt-24">
        <TopScorersPreviewCard comp={comp} />
      </div>
      {comp.slug === "euro" && <EuroLegendsRail />}
      {comp.slug === "euro" && <EuroOnThisDayCard />}
      {comp.slug === "copa-america" && <CopaLegendsRail />}
      {comp.slug === "copa-america" && <CopaOnThisDayCard />}
      <ChampionsTimelineWidget comp={comp} />
      <CompetitionNewsRail comp={comp} />
      <div id="h2h" className="scroll-mt-24">
        <CompetitionH2HPicker comp={comp} />
        {comp.slug === "euro" && <EuroPopularMatchups />}
        {comp.slug === "copa-america" && <CopaPopularMatchups />}
      </div>
      <QuickLinks comp={comp} />
    </CompetitionPageShell>
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
    <section className="mt-8 sm:mt-10">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
        More {comp.shortName}
      </h3>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="tap-target rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-center hover:border-white/20 hover:bg-white/[0.06] inline-flex items-center gap-1"
          >
            {l.label} <ArrowRight className="size-3.5 opacity-60" />
          </Link>
        ))}
      </div>
    </section>
  );
}
