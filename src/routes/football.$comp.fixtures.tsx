import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getScoreboard, type SportGame } from "@/lib/espn.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { CompetitionMatchList } from "@/components/football/CompetitionMatchList";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { EuroFixturesHero, type FixtureFilter } from "@/components/football/EuroFixturesHero";
import { EuroFixturesRoadmap } from "@/components/football/EuroFixturesRoadmap";
import { EuroHostVenuesCarousel } from "@/components/football/EuroHostVenuesCarousel";
import { AddSeasonToCalendar } from "@/components/football/AddSeasonToCalendar";
import { FixturesCalendarStrip } from "@/components/football/FixturesCalendarStrip";
import { FixturesMonthGroups } from "@/components/football/FixturesMonthGroups";
import { FixturesEmptyStateEuro } from "@/components/football/FixturesEmptyStateEuro";
import {
  EuroTeamFilterChips,
  useEuroFavTeams,
} from "@/components/football/EuroTeamFilterChips";
import { CopaFixturesHero } from "@/components/football/CopaFixturesHero";
import { CopaFixturesRoadmap } from "@/components/football/CopaFixturesRoadmap";
import { CopaVenuesTeaser } from "@/components/football/CopaVenuesTeaser";
import {
  CopaTeamFilterChips,
  useCopaFavTeams,
} from "@/components/football/CopaTeamFilterChips";
import { FixturesEmptyStateCopa } from "@/components/football/FixturesEmptyStateCopa";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Loader2 } from "lucide-react";
import type { Competition } from "@/lib/competitions";

/** YYYYMMDD from a Date (UTC). */
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function buildDateRange(daysAhead: number): string[] {
  const out: string[] = [];
  const start = new Date();
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    out.push(ymd(d));
  }
  return out;
}

export const Route = createFileRoute("/football/$comp/fixtures")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Fixtures" }, { name: "robots", content: "noindex" }] };
    const head = buildCompetitionHead({
      comp,
      section: "Fixtures",
      path: `/football/${comp.slug}/fixtures`,
    });
    if (comp.slug === "copa-america") {
      const desc =
        "Copa América 2028 fixtures, qualifying schedule and the road to the final — every kickoff plus the full 2024 archive.";
      head.meta = (head.meta ?? []).map((m: any) =>
        m?.name === "description" || m?.property === "og:description"
          ? { ...m, content: desc }
          : m,
      );
    }
    return head;
  },
  component: FixturesPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function FixturesPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const isEuro = comp.slug === "euro";
  const isCopa = comp.slug === "copa-america";
  const isTournament = isEuro || isCopa;
  // Wider scan for tournaments so late-year qualifiers still surface.
  const dates = buildDateRange(isTournament ? 180 : 60);

  const q = useQuery({
    queryKey: ["comp-fixtures", comp.slug, isTournament ? "wide" : "std"],
    queryFn: async () => {
      const results = await Promise.all([
        getScoreboard({
          data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name },
        }).catch(() => null),
        ...dates.map((d) =>
          getScoreboard({
            data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name, yyyymmdd: d },
          }).catch(() => null),
        ),
      ]);
      const all = results.flatMap((r) => r?.games ?? []);
      const seen = new Set<string>();
      const upcoming = all
        .filter((g) => {
          if (seen.has(g.id)) return false;
          seen.add(g.id);
          return g.status !== "post";
        })
        .sort((a, b) => a.startTs - b.startTs);
      return upcoming;
    },
    staleTime: 5 * 60_000,
  });

  const games = q.data ?? [];

  if (isEuro) {
    return (
      <CompetitionPageShell comp={comp}>
        <EuroFixturesInner comp={comp} games={games} loading={q.isLoading} />
      </CompetitionPageShell>
    );
  }

  if (isCopa) {
    return (
      <CompetitionPageShell comp={comp}>
        <CopaFixturesInner comp={comp} games={games} loading={q.isLoading} />
      </CompetitionPageShell>
    );
  }

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-4">Upcoming Fixtures</h2>
      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading fixtures…
        </div>
      ) : (
        <CompetitionMatchList
          games={games}
          emptyLabel={`No upcoming ${comp.shortName} matches in the next 60 days.`}
          h2hCompSlug={comp.slug}
        />
      )}
    </CompetitionPageShell>
  );
}

function CopaFixturesInner({
  comp,
  games,
  loading,
}: {
  comp: Competition;
  games: SportGame[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<FixtureFilter>("all");
  const [favTeams, toggleFav, clearFav] = useCopaFavTeams();

  const classify = (g: SportGame): "qualifying" | "finals" => {
    const s = (g.shortDetail || "").toLowerCase();
    const yr = new Date(g.startTs).getUTCFullYear();
    const mo = new Date(g.startTs).getUTCMonth();
    if (
      s.includes("group") || s.includes("quarter") || s.includes("semi") ||
      s.includes("final") || s.includes("knockout")
    ) {
      return yr >= 2028 && mo >= 5 ? "finals" : "qualifying";
    }
    return "qualifying";
  };

  const filteredByType = useMemo(() => {
    return games.filter((g) => {
      const kind = classify(g);
      if (filter === "qualifying" && kind !== "qualifying") return false;
      if (filter === "finals" && kind !== "finals") return false;
      if (filter === "my") {
        if (favTeams.length === 0) return false;
        return favTeams.some((t) => g.home.name === t || g.away.name === t);
      }
      return true;
    });
  }, [games, filter, favTeams]);

  const counts = useMemo(() => {
    const c = { all: games.length, qualifying: 0, finals: 0, my: 0 };
    for (const g of games) {
      const k = classify(g);
      c[k]++;
      if (favTeams.some((t) => g.home.name === t || g.away.name === t)) c.my++;
    }
    return c as Record<FixtureFilter, number>;
  }, [games, favTeams]);

  return (
    <>
      <CopaFixturesHero
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />
      <CopaFixturesRoadmap />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AddSeasonToCalendar />
      </div>

      <CopaVenuesTeaser />

      {loading ? (
        <SkeletonList />
      ) : games.length > 0 ? (
        <>
          <FixturesCalendarStrip games={filteredByType} />
          <CopaTeamFilterChips
            selected={favTeams}
            onToggle={toggleFav}
            onClear={clearFav}
          />
          {filteredByType.length === 0 ? (
            <FixturesEmptyStateCopa comp={comp} />
          ) : (
            <FixturesMonthGroups games={filteredByType} compSlug={comp.slug} />
          )}
        </>
      ) : (
        <FixturesEmptyStateCopa comp={comp} />
      )}
    </>
  );
}

function EuroFixturesInner({
  comp,
  games,
  loading,
}: {
  comp: Competition;
  games: SportGame[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<FixtureFilter>("all");
  const [favTeams, toggleFav, clearFav] = useEuroFavTeams();

  const classify = (g: SportGame): "qualifying" | "finals" => {
    const s = (g.shortDetail || "").toLowerCase();
    if (
      s.includes("group") || s.includes("quarter") || s.includes("semi") ||
      s.includes("final") || s.includes("round of 16") || s.includes("r16")
    ) {
      // Finals-tournament stages start June 2028
      const yr = new Date(g.startTs).getUTCFullYear();
      return yr >= 2028 && new Date(g.startTs).getUTCMonth() >= 5 ? "finals" : "qualifying";
    }
    return "qualifying";
  };

  const filteredByType = useMemo(() => {
    return games.filter((g) => {
      const kind = classify(g);
      if (filter === "qualifying" && kind !== "qualifying") return false;
      if (filter === "finals" && kind !== "finals") return false;
      if (filter === "my") {
        if (favTeams.length === 0) return false;
        return favTeams.some((t) => g.home.name === t || g.away.name === t);
      }
      return true;
    });
  }, [games, filter, favTeams]);

  const counts = useMemo(() => {
    const c = { all: games.length, qualifying: 0, finals: 0, my: 0 };
    for (const g of games) {
      const k = classify(g);
      c[k]++;
      if (favTeams.some((t) => g.home.name === t || g.away.name === t)) c.my++;
    }
    return c as Record<FixtureFilter, number>;
  }, [games, favTeams]);

  const filterLabel = filter === "my" ? "My teams" : filter === "all" ? "All" : filter === "qualifying" ? "Qualifying" : "Finals";

  return (
    <>
      <EuroFixturesHero
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
      />
      <EuroFixturesRoadmap />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AddSeasonToCalendar />
      </div>

      <EuroHostVenuesCarousel />

      {loading ? (
        <SkeletonList />
      ) : games.length > 0 ? (
        <>
          <FixturesCalendarStrip games={filteredByType} />
          <EuroTeamFilterChips
            selected={favTeams}
            onToggle={toggleFav}
            onClear={clearFav}
          />
          {filteredByType.length === 0 ? (
            <FixturesEmptyStateEuro
              filterLabel={filterLabel}
              onReset={() => { setFilter("all"); clearFav(); }}
            />
          ) : (
            <FixturesMonthGroups games={filteredByType} compSlug={comp.slug} />
          )}
        </>
      ) : null}

      <div className="mt-8">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          From the archives
        </div>
        <LastEditionRecap comp={comp} collapsible />
      </div>
    </>
  );
}

function SkeletonList() {
  return (
    <ul className="grid gap-2 sm:gap-3 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="h-[104px] rounded-2xl border border-white/10 bg-white/[0.03] animate-pulse"
        />
      ))}
    </ul>
  );
}
