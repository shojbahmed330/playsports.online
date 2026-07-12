import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCompetition, requireCompetition, formatSeasonLabel } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { editionsByDecade } from "@/lib/competition-history";

export const Route = createFileRoute("/football/$comp/records/decades")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Records by decade" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Records by Decade",
      path: `/football/${comp.slug}/records/decades`,
      descriptionOverride: `${comp.name} champions and roll-up stats grouped by decade — see which side ruled the 90s, 00s, 10s and beyond.`,
    });
  },
  component: DecadesPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function DecadesPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const decades = editionsByDecade(comp.slug);

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-4 text-sm">
        <Link
          to="/football/$comp/records"
          params={{ comp: comp.slug }}
          className="text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          ← All {comp.shortName} records
        </Link>
      </div>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} by decade</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Champions, matches and goals aggregated per decade.
      </p>

      {decades.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          No historical editions available yet.
        </div>
      ) : (
        <ul className="grid gap-4">
          {decades.map((d) => (
            <li
              key={d.decade}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="text-2xl font-black">{d.label}</h3>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                  {typeof d.totalMatches === "number" && (
                    <span>{d.totalMatches.toLocaleString()} matches</span>
                  )}
                  {typeof d.totalGoals === "number" && (
                    <span>{d.totalGoals.toLocaleString()} goals</span>
                  )}
                  <span>{d.editions.length} editions</span>
                </div>
              </div>

              {d.champions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {d.champions.map((c) => (
                    <span
                      key={c.team}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs"
                    >
                      <span className="font-semibold">{c.team}</span>
                      <span className="tabular-nums text-muted-foreground">×{c.titles}</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {d.editions.map((e) => (
                  <Link
                    key={e.year}
                    to="/football/$comp/history/$year"
                    params={{ comp: comp.slug, year: String(e.year) }}
                    className="rounded-lg border border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.06] px-3 py-1.5 text-xs"
                  >
                    <span className="tabular-nums font-semibold">
                      {formatSeasonLabel(comp, e.year)}
                    </span>{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    <span>{e.winner || "TBD"}</span>
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </CompetitionPageShell>
  );
}
