import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionTeams } from "@/lib/espn.functions";
import { EuroTeamsPage } from "@/components/football/EuroTeamsPage";
import { euroChampionNations } from "@/lib/euro-teams";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/football/$comp/teams/")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Teams" }, { name: "robots", content: "noindex" }] };
    if (comp.slug === "euro") {
      const title = "UEFA Euro Nations — 55 Teams, Champions & Euro 2028 Hosts";
      const description =
        "Every UEFA member nation ranked by their best Euro finish — Spain's 4 titles, England's 2024 final, Euro 2028 host nations and each team's tournament history.";
      const url = canonical("/football/euro/teams");
      const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "UEFA Euro champion nations",
        itemListElement: euroChampionNations().map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${c.team} — ${c.titles} Euro title${c.titles === 1 ? "" : "s"}`,
        })),
      };
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:url", content: url },
          { property: "og:type", content: "website" },
          { property: "og:site_name", content: "PlaySports" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: description },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          ldScript(
            breadcrumbList([
              { name: "Home", path: "/" },
              { name: "Football", path: "/football" },
              { name: "Euro", path: "/football/euro" },
              { name: "Teams", path: "/football/euro/teams" },
            ]),
          ),
          { type: "application/ld+json", children: JSON.stringify(itemList) },
        ],
      };
    }
    return buildCompetitionHead({
      comp,
      section: comp.kind === "league" ? "Clubs" : "Teams",
      path: `/football/${comp.slug}/teams`,
    });
  },
  component: TeamsRoute,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Could not load teams" message={errorMessage(error)} onRetry={reset} />
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

function TeamsRoute() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  if (comp.slug === "euro") return <EuroTeamsPage />;
  return <GenericTeamsPage />;
}

function GenericTeamsPage() {
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
      <h2 className="text-lg sm:text-xl font-bold mb-1">
        {comp.name} {label}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {teams.length > 0
          ? `${teams.length} ${label.toLowerCase()} competing in ${comp.shortName}.`
          : `The full ${comp.shortName} ${label.toLowerCase()} registry, sourced live from ESPN.`}
      </p>

      {q.isError ? (
        <ErrorState
          title={`Could not load ${label.toLowerCase()}`}
          message={errorMessage(q.error)}
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : q.isLoading ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />{" "}
          Loading {label.toLowerCase()}…
        </div>
      ) : q.data?.error ? (
        <ErrorState
          title={`${label} temporarily unavailable`}
          message={q.data.error}
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : teams.length === 0 ? (
        <EmptyState
          title={`No ${label.toLowerCase()} listed`}
          description={`No ${label.toLowerCase()} returned for ${comp.shortName} right now.`}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <li key={t.id}>
              <Link
                to="/football/$comp/teams/$teamId"
                params={{ comp: comp.slug, teamId: t.id }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 hover:bg-white/[0.06] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
              >
                <span
                  className="size-10 shrink-0 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center overflow-hidden"
                  style={t.color ? { backgroundColor: `${t.color}20` } : undefined}
                >
                  {t.logo ? (
                    <img
                      src={t.logo}
                      alt=""
                      className="size-8 object-contain"
                      loading="lazy"
                      decoding="async"
                    />
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
