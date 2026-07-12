import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getStandings } from "@/lib/espn.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { CompetitionStandingsTable } from "@/components/football/CompetitionStandingsTable";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/football/$comp/standings")({
  loader: ({ params, context }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
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
    if (!comp) return { meta: [{ title: "Standings" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: comp.kind === "league" ? "Table" : "Group Standings",
      path: `/football/${comp.slug}/standings`,
    });
  },
  component: StandingsPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function StandingsPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const q = useQuery({
    queryKey: ["comp-standings", comp.slug],
    queryFn: () => getStandings({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
    staleTime: 5 * 60_000,
  });

  const groups = q.data?.groups ?? [];
  const showFallback =
    !q.isLoading && comp.kind === "tournament" && groups.length === 0;

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-4">
        {comp.kind === "league" ? "League Table" : "Group Standings"}
      </h2>
      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading standings…
        </div>
      ) : showFallback ? (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            The next {comp.shortName} tournament hasn&apos;t started yet, so there&apos;s no live table. Here&apos;s the last completed edition:
          </p>
          <LastEditionRecap comp={comp} />
        </div>
      ) : (
        <CompetitionStandingsTable groups={groups} />
      )}
    </CompetitionPageShell>
  );
}
