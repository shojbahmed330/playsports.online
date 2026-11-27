import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getStandings } from "@/lib/espn.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { CompetitionStandingsTable } from "@/components/football/CompetitionStandingsTable";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { CopaStandingsHero } from "@/components/football/CopaStandingsHero";
import { Copa2024GroupsSnapshot } from "@/components/football/Copa2024GroupsSnapshot";
import { Copa2024KnockoutBracket } from "@/components/football/Copa2024KnockoutBracket";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Loader2 } from "lucide-react";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/football/$comp/standings")({
  loader: async ({ params, context }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    // Wait for the table on the server so the first client render matches.
    await context.queryClient
      .ensureQueryData({
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
    const head = buildCompetitionHead({
      comp,
      section: comp.kind === "league" ? "Table" : "Group Standings",
      path: `/football/${comp.slug}/standings`,
    });
    if (comp.slug === "copa-america") {
      const desc =
        "Copa América group standings and knockout path — live table when the tournament is on, plus the definitive 2024 group tables and bracket.";
      head.meta = (head.meta ?? []).map((m: any) =>
        m?.name === "description" || m?.property === "og:description" ? { ...m, content: desc } : m,
      );
    }
    return head;
  },
  component: StandingsPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Could not load standings" message={errorMessage(error)} onRetry={reset} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Competition not found"
        description="This competition is not in the football directory."
      />
    </div>
  ),
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
  const isCopa = comp.slug === "copa-america";

  if (isCopa) {
    const hasLive = groups.length > 0;
    return (
      <CompetitionPageShell comp={comp}>
        <CopaStandingsHero live={hasLive} />
        {q.isError ? (
          <ErrorState
            title="Could not load standings"
            message={errorMessage(q.error)}
            onRetry={() => void q.refetch()}
            className="border-white/10 bg-white/[0.02]"
          />
        ) : q.isLoading ? (
          <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />{" "}
            Loading standings…
          </div>
        ) : hasLive ? (
          <CompetitionStandingsTable groups={groups} compSlug={comp.slug} />
        ) : (
          <>
            <Copa2024GroupsSnapshot />
            <Copa2024KnockoutBracket />
          </>
        )}
      </CompetitionPageShell>
    );
  }

  const showFallback = !q.isLoading && comp.kind === "tournament" && groups.length === 0;

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-4">
        {comp.kind === "league" ? "League Table" : "Group Standings"}
      </h2>
      {q.isError ? (
        <ErrorState
          title="Could not load standings"
          message={errorMessage(q.error)}
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : q.isLoading ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />{" "}
          Loading standings…
        </div>
      ) : showFallback ? (
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            The next {comp.shortName} tournament hasn&apos;t started yet, so there&apos;s no live
            table. Here&apos;s the last completed edition:
          </p>
          <LastEditionRecap comp={comp} />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          title="No standings available"
          description="The table appears once this competition has played matches."
          className="border-white/10 bg-white/[0.02]"
        />
      ) : (
        <CompetitionStandingsTable groups={groups} compSlug={comp.slug} />
      )}
    </CompetitionPageShell>
  );
}
