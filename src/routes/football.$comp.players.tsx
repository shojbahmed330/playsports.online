import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";

export const Route = createFileRoute("/football/$comp/players")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Players" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Players",
      path: `/football/${comp.slug}/players`,
    });
  },
  component: PlayersPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function PlayersPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} Players</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Player leaderboards for {comp.shortName} — top scorers, assists and appearances — ship in the next update.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-muted-foreground">
        Meanwhile, jump to <a className="underline hover:text-foreground" href={`/football/${comp.slug}/records`}>Records</a> for all-time top scorers.
      </div>
    </CompetitionPageShell>
  );
}
