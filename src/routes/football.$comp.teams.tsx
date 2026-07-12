import { createFileRoute, notFound } from "@tanstack/react-router";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";

export const Route = createFileRoute("/football/$comp/teams")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Teams" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: comp.kind === "league" ? "Clubs" : "Teams",
      path: `/football/${comp.slug}/teams`,
    });
  },
  component: TeamsPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function TeamsPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">
        {comp.name} {comp.kind === "league" ? "Clubs" : "Participating Teams"}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Per-{comp.kind === "league" ? "club" : "team"} pages with squad, season stats and head-to-head are coming in the next drop.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-muted-foreground">
        This section is being wired to the ESPN {comp.espnLeague} team registry — check back shortly.
      </div>
    </CompetitionPageShell>
  );
}
