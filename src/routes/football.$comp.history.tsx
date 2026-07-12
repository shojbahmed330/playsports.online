import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCompetition, requireCompetition, formatSeasonLabel } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/football/$comp/history")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "History" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "History",
      path: `/football/${comp.slug}/history`,
      descriptionOverride: `Every ${comp.name} edition since ${comp.years[0]} — winners, hosts, top scorers and full brackets.`,
    });
  },
  component: HistoryPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function HistoryPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const editions = [...comp.years].reverse();

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} — All Editions</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {editions.length} {comp.kind === "league" ? "seasons" : "editions"} from {comp.years[0]} to {comp.years[comp.years.length - 1]}.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {editions.map((year) => (
          <li key={year}>
            <Link
              to="/football/tournaments/$year"
              params={{ year: String(year) }}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 hover:bg-white/[0.06] transition"
            >
              <span className="flex items-center gap-3">
                <span className="size-8 rounded-full bg-gradient-to-br from-amber-500/30 to-rose-500/20 grid place-items-center ring-1 ring-white/10">
                  <Trophy className="size-4 text-amber-300" />
                </span>
                <span className="font-semibold">{formatSeasonLabel(comp, year)}</span>
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">
                View →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted-foreground">
        Detailed edition pages (brackets, top scorers, records) roll out per competition — {comp.shortName}-specific pages are being wired in.
      </p>
    </CompetitionPageShell>
  );
}
