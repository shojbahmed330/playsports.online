import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionTeams } from "@/lib/espn.functions";
import { Loader2 } from "lucide-react";

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
  const label = comp.kind === "league" ? "Clubs" : "Teams";

  const q = useQuery({
    queryKey: ["comp-teams", comp.slug],
    queryFn: () => getCompetitionTeams({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
    staleTime: 6 * 60 * 60_000,
  });

  const teams = q.data?.teams ?? [];

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} {label}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {teams.length > 0
          ? `${teams.length} ${label.toLowerCase()} competing in ${comp.shortName}.`
          : `The full ${comp.shortName} ${label.toLowerCase()} registry, sourced live from ESPN.`}
      </p>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading {label.toLowerCase()}…
        </div>
      ) : q.data?.error || teams.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          {q.data?.error ?? `No ${label.toLowerCase()} returned for ${comp.shortName} right now.`}
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <li key={t.id}>
              <Link
                to="/football/$comp/teams/$teamId"
                params={{ comp: comp.slug, teamId: t.id }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 hover:bg-white/[0.06] transition"
              >
                <span
                  className="size-10 shrink-0 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center overflow-hidden"
                  style={t.color ? { backgroundColor: `${t.color}20` } : undefined}
                >
                  {t.logo ? (
                    <img src={t.logo} alt="" className="size-8 object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xs font-bold">{t.abbr || t.shortName.slice(0, 3)}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{t.name}</div>
                  {t.location && (
                    <div className="text-xs text-muted-foreground truncate">{t.location}</div>
                  )}
                </div>
              </Link>
            </li>
          ))}

        </ul>
      )}
    </CompetitionPageShell>
  );
}
