import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionPlayer } from "@/lib/espn.functions";
import { CareerInCompetition } from "@/components/football/CareerInCompetition";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/football/$comp/players/$playerId")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp, playerId: params.playerId };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Player" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Player",
      path: `/football/${comp.slug}/players/${params.playerId}`,
      descriptionOverride: `Player profile in ${comp.name}: stats, team, position and season detail.`,
    });
  },
  component: PlayerDetailPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this player"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Player not found"
        description="This player is not in the competition feed."
      />
    </div>
  ),
});

function PlayerDetailPage() {
  const { comp: raw, playerId } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);

  const q = useQuery({
    queryKey: ["comp-player", comp.slug, playerId],
    queryFn: () =>
      getCompetitionPlayer({ data: { sportPath: `soccer/${comp.espnLeague}`, playerId } }),
    staleTime: 6 * 60 * 60_000,
  });

  const p = q.data?.player;

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-4 text-sm">
        <Link
          to="/football/$comp/players"
          params={{ comp: comp.slug }}
          className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← All {comp.shortName} players
        </Link>
      </div>

      {q.isError || q.data?.error ? (
        <ErrorState
          title="Player profile temporarily unavailable"
          message={
            q.isError ? errorMessage(q.error) : (q.data?.error ?? "Please refresh in a moment.")
          }
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : q.isLoading ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />{" "}
          Loading player…
        </div>
      ) : !p ? (
        <EmptyState
          title="Player profile not available"
          description="This player has no profile data right now."
          className="border-white/10 bg-white/[0.02]"
        />
      ) : (
        <>
          <header className="flex items-center gap-4 mb-6">
            <span className="size-20 rounded-2xl bg-white/5 ring-1 ring-white/10 grid place-items-center overflow-hidden shrink-0">
              {p.headshot ? (
                <img
                  src={p.headshot}
                  alt=""
                  className="size-full object-cover"
                  decoding="async"
                  loading="lazy"
                />
              ) : (
                <span className="text-2xl font-bold">
                  {p.displayName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{p.displayName}</h1>
              <div className="text-sm text-muted-foreground truncate">
                {[p.position, p.jersey ? `#${p.jersey}` : null, p.citizenship]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">In {comp.name}</div>
            </div>
          </header>

          {p.team && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 mb-6 flex items-center gap-3">
              {p.team.logo && (
                <img
                  src={p.team.logo}
                  alt=""
                  className="size-10 object-contain"
                  decoding="async"
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Team</div>
                <div className="font-semibold truncate">{p.team.name}</div>
              </div>
              {p.team.id && (
                <Link
                  to="/football/$comp/teams/$teamId"
                  params={{ comp: comp.slug, teamId: p.team.id }}
                  className="inline-flex min-h-11 items-center text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Team page →
                </Link>
              )}
            </section>
          )}
          <CareerInCompetition comp={comp} playerName={p.fullName || p.displayName} />

          {p.stats.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-2">
                {comp.shortName} season stats
              </h2>
              <dl className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                {p.stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <dt className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">
                      {s.label}
                    </dt>
                    <dd className="text-lg font-bold tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(p.height || p.weight || p.age) && (
            <dl className="grid gap-3 sm:grid-cols-3 mb-6">
              {p.age !== null && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Age</dt>
                  <dd className="text-base font-semibold">{p.age}</dd>
                </div>
              )}
              {p.height && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Height</dt>
                  <dd className="text-base font-semibold">{p.height}</dd>
                </div>
              )}
              {p.weight && (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Weight</dt>
                  <dd className="text-base font-semibold">{p.weight}</dd>
                </div>
              )}
            </dl>
          )}
        </>
      )}
    </CompetitionPageShell>
  );
}
