import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionLeaders } from "@/lib/espn.functions";
import { EuroPlayersPage } from "@/components/football/EuroPlayersPage";
import { EURO_TOP_SCORERS } from "@/lib/euro-records";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/football/$comp/players/")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Players" }, { name: "robots", content: "noindex" }] };
    if (comp.slug === "euro") {
      const title = "UEFA Euro Players — All-Time Top Scorers, Legends & Rising Stars";
      const description =
        "Every UEFA Euro legend — Cristiano Ronaldo's 14 goals, Platini's 9-goal record, the 2024 Squad of the Tournament and the next generation to watch at Euro 2028.";
      const url = canonical("/football/euro/players");
      const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "UEFA Euro all-time top scorers",
        itemListElement: EURO_TOP_SCORERS.map((r) => ({
          "@type": "ListItem",
          position: r.rank,
          name: `${r.name} (${r.nation}) — ${r.value} goals`,
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
              { name: "Players", path: "/football/euro/players" },
            ]),
          ),
          { type: "application/ld+json", children: JSON.stringify(itemList) },
        ],
      };
    }
    return buildCompetitionHead({
      comp,
      section: "Players",
      path: `/football/${comp.slug}/players`,
      descriptionOverride: `${comp.name} top players this season — goals, assists and appearances live from ESPN.`,
    });
  },
  component: PlayersRoute,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState title="Could not load players" message={errorMessage(error)} onRetry={reset} />
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

function PlayersRoute() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  if (comp.slug === "euro") return <EuroPlayersPage />;
  return <GenericPlayersPage />;
}

function GenericPlayersPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);

  const q = useQuery({
    queryKey: ["comp-leaders", comp.slug],
    queryFn: () => getCompetitionLeaders({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
    staleTime: 30 * 60_000,
  });

  const cats = q.data?.categories ?? [];

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} Players</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Season-to-date leaders scoped to {comp.shortName}. For all-time career records visit{" "}
        <Link
          to="/football/$comp/records"
          params={{ comp: comp.slug }}
          className="underline hover:text-foreground"
        >
          {comp.shortName} Records
        </Link>
        .
      </p>

      {q.isError ? (
        <ErrorState
          title="Could not load player leaders"
          message={errorMessage(q.error)}
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : q.isLoading ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />{" "}
          Loading leaders…
        </div>
      ) : q.data?.error ? (
        <ErrorState
          title="Player leaders temporarily unavailable"
          message={q.data.error}
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : cats.length === 0 ? (
        <EmptyState
          title="No live leaders yet"
          description={`No live leaders available for ${comp.shortName} right now — check back once the season is underway.`}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cats.map((cat) => (
            <section
              key={cat.category}
              className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
            >
              <header className="px-4 py-2 border-b border-white/10 bg-white/[0.03]">
                <h3 className="text-sm font-bold">{cat.displayName}</h3>
              </header>
              <ol className="divide-y divide-white/5">
                {cat.leaders.map((l) => {
                  const row = (
                    <>
                      <span className="w-6 text-right tabular-nums text-xs text-muted-foreground">
                        {l.rank}
                      </span>
                      {l.teamLogo ? (
                        <img
                          src={l.teamLogo}
                          alt=""
                          className="size-5 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="size-5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{l.athlete}</div>
                        {l.team && (
                          <div className="text-[11px] text-muted-foreground truncate">{l.team}</div>
                        )}
                      </div>
                      <div className="tabular-nums font-bold text-sm">{l.value}</div>
                    </>
                  );
                  return (
                    <li key={`${cat.category}-${l.rank}-${l.athlete}`}>
                      {l.athleteId ? (
                        <Link
                          to="/football/$comp/players/$playerId"
                          params={{ comp: comp.slug, playerId: l.athleteId }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.04] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                        >
                          {row}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-2">{row}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </CompetitionPageShell>
  );
}
