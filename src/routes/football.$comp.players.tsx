import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionLeaders } from "@/lib/espn.functions";
import { EuroPlayersPage } from "@/components/football/EuroPlayersPage";
import { EURO_TOP_SCORERS } from "@/lib/euro-records";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/football/$comp/players")({
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
      const url = "https://allsportslive.lovable.app/football/euro/players";
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
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [{ type: "application/ld+json", children: JSON.stringify(itemList) }],
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
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
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
        <Link to="/football/$comp/records" params={{ comp: comp.slug }} className="underline hover:text-foreground">
          {comp.shortName} Records
        </Link>
        .
      </p>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading leaders…
        </div>
      ) : q.data?.error || cats.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          {q.data?.error ?? `No live leaders available for ${comp.shortName} right now — check back once the season is underway.`}
        </div>
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
                      <span className="w-6 text-right tabular-nums text-xs text-muted-foreground">{l.rank}</span>
                      {l.teamLogo ? (
                        <img src={l.teamLogo} alt="" className="size-5 object-contain" loading="lazy" />
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
                          className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.04] transition"
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
