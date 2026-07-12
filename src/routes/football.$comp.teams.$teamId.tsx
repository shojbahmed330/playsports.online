import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionTeam } from "@/lib/espn.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/football/$comp/teams/$teamId")({
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
  notFoundComponent: () => <div className="p-10 text-center">Team not found.</div>,
});

function TeamDetailPage() {
  const { comp: raw, teamId } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);

  const q = useQuery({
    queryKey: ["comp-team", comp.slug, teamId],
    queryFn: () =>
      getCompetitionTeam({ data: { sportPath: `soccer/${comp.espnLeague}`, teamId } }),
    staleTime: 6 * 60 * 60_000,
  });

  const team = q.data?.team;

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-4 text-sm">
        <Link
          to="/football/$comp/teams"
          params={{ comp: comp.slug }}
          className="text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          ← All {comp.shortName} {comp.kind === "league" ? "clubs" : "teams"}
        </Link>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading team…
        </div>
      ) : q.data?.error || !team ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          {q.data?.error ?? "Team profile is not available right now."}
        </div>
      ) : (
        <>
          <header className="flex items-center gap-4 mb-6">
            <span
              className="size-16 rounded-2xl bg-white/5 ring-1 ring-white/10 grid place-items-center overflow-hidden shrink-0"
              style={team.color ? { backgroundColor: `${team.color}20` } : undefined}
            >
              {team.logo ? (
                <img src={team.logo} alt="" className="size-12 object-contain" />
              ) : (
                <span className="text-lg font-bold">{team.abbr || team.shortName.slice(0, 3)}</span>
              )}
            </span>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{team.displayName}</h1>
              {team.location && (
                <div className="text-sm text-muted-foreground truncate">{team.location}</div>
              )}
              <div className="mt-1 text-xs text-muted-foreground">
                Competing in {comp.name}
              </div>
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
                {team.nextEvent.date
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
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              Season {comp.currentSeason} run →
            </Link>
            <Link
              to="/football/$comp/fixtures"
              params={{ comp: comp.slug }}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              {comp.shortName} fixtures →
            </Link>
            <Link
              to="/football/$comp/standings"
              params={{ comp: comp.slug }}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              {comp.shortName} standings →
            </Link>
            <Link
              to="/football/$comp/scores"
              params={{ comp: comp.slug }}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              {comp.shortName} live scores →
            </Link>
          </nav>
        </>
      )}
    </CompetitionPageShell>
  );
}
