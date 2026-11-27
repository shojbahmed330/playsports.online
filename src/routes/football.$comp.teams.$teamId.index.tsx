import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionTeam, getCompetitionTeams } from "@/lib/espn.functions";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/football/$comp/teams/$teamId/")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp, teamId: params.teamId };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Team" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Team",
      path: `/football/${comp.slug}/teams/${params.teamId}`,
      descriptionOverride: `Team profile in ${comp.name}: record, standing, next fixture and season detail.`,
    });
  },
  component: TeamDetailPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Could not load this team" message={errorMessage(error)} onRetry={reset} />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Team not found"
        description="This team is not in the competition directory."
      />
    </div>
  ),
});

function TeamDetailPage() {
  const { comp: raw, teamId } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const q = useQuery({
    queryKey: ["comp-team", comp.slug, teamId],
    queryFn: () => getCompetitionTeam({ data: { sportPath: `soccer/${comp.espnLeague}`, teamId } }),
    staleTime: 6 * 60 * 60_000,
  });

  const teamsQ = useQuery({
    queryKey: ["comp-teams", comp.slug],
    queryFn: () => getCompetitionTeams({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
    staleTime: 12 * 60 * 60_000,
  });
  const team = q.data?.team;
  const relatedTeams = (teamsQ.data?.teams ?? [])
    .filter((t) => t.id && t.id !== teamId)
    .slice(0, 8);

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-4 text-sm">
        <Link
          to="/football/$comp/teams"
          params={{ comp: comp.slug }}
          className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← All {comp.shortName} {comp.kind === "league" ? "clubs" : "teams"}
        </Link>
      </div>

      {q.isError || q.data?.error ? (
        <ErrorState
          title="Team profile temporarily unavailable"
          message={
            q.isError ? errorMessage(q.error) : (q.data?.error ?? "Please refresh in a moment.")
          }
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : q.isLoading ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />{" "}
          Loading team…
        </div>
      ) : !team ? (
        <EmptyState
          title="Team profile not available"
          description="This team has no profile data right now."
          className="border-white/10 bg-white/[0.02]"
        />
      ) : (
        <>
          <header className="flex items-center gap-4 mb-6">
            <span
              className="size-16 rounded-2xl bg-white/5 ring-1 ring-white/10 grid place-items-center overflow-hidden shrink-0"
              style={team.color ? { backgroundColor: `${team.color}20` } : undefined}
            >
              {team.logo ? (
                <img
                  src={team.logo}
                  alt=""
                  className="size-12 object-contain"
                  decoding="async"
                  loading="lazy"
                />
              ) : (
                <span className="text-lg font-bold">{team.abbr || team.shortName.slice(0, 3)}</span>
              )}
            </span>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{team.displayName}</h1>
              {team.location && (
                <div className="text-sm text-muted-foreground truncate">{team.location}</div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">Competing in {comp.name}</div>
            </div>
          </header>

          <dl className="grid gap-3 sm:grid-cols-2 mb-6">
            {team.record && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Record</dt>
                <dd className="text-base font-semibold">{team.record}</dd>
              </div>
            )}
            {team.standingSummary && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Standing</dt>
                <dd className="text-base font-semibold">{team.standingSummary}</dd>
              </div>
            )}
            {team.venue && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Venue</dt>
                <dd className="text-base font-semibold">{team.venue}</dd>
              </div>
            )}
          </dl>

          {team.nextEvent && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-6">
              <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
                Next fixture
              </h2>
              <div className="font-semibold">{team.nextEvent.name}</div>
              <div className="text-sm text-muted-foreground">
                {hydrated && team.nextEvent.date
                  ? new Date(team.nextEvent.date).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : ""}
                {team.nextEvent.homeAway ? ` · ${team.nextEvent.homeAway.toUpperCase()}` : ""}
              </div>
            </section>
          )}

          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/football/$comp/teams/$teamId/season-{$year}"
              params={{ comp: comp.slug, teamId, year: String(comp.currentSeason) }}
              className="flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              Season {comp.currentSeason} run →
            </Link>
            <Link
              to="/football/$comp/fixtures"
              params={{ comp: comp.slug }}
              className="flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {comp.shortName} fixtures →
            </Link>
            <Link
              to="/football/$comp/standings"
              params={{ comp: comp.slug }}
              className="flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {comp.shortName} standings →
            </Link>
            <Link
              to="/football/$comp/scores"
              params={{ comp: comp.slug }}
              className="flex min-h-11 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            >
              {comp.shortName} live scores →
            </Link>
          </nav>

          {relatedTeams.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                More {comp.shortName} {comp.kind === "league" ? "clubs" : "teams"}
              </h2>
              <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {relatedTeams.map((t) => (
                  <li key={t.id}>
                    <Link
                      to="/football/$comp/teams/$teamId"
                      params={{ comp: comp.slug, teamId: t.id }}
                      className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm transition hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    >
                      {t.logo ? (
                        <img
                          src={t.logo}
                          alt=""
                          className="size-5 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                      <span className="truncate">{t.shortName || t.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </CompetitionPageShell>
  );
}
