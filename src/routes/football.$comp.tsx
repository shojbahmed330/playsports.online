import { createFileRoute, notFound, Link, Outlet } from "@tanstack/react-router";
import { getCompetition } from "@/lib/competitions";
import { getScoreboard, getStandings } from "@/lib/espn.functions";
import { SportNav } from "@/components/sports/SportNav";

/**
 * Layout route for /football/$comp/*. Prefetches shared data and delegates
 * rendering to the matched child (index / scores / fixtures / ...). It MUST
 * render <Outlet /> — otherwise child routes match but never mount, so every
 * tab renders the parent's content instead of its own.
 */
export const Route = createFileRoute("/football/$comp")({
  loader: ({ params, context }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    void context.queryClient
      .prefetchQuery({
        queryKey: ["comp-scoreboard", comp.slug],
        queryFn: () =>
          getScoreboard({ data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name } }),
        staleTime: 20_000,
      })
      .catch(() => null);
    void context.queryClient
      .prefetchQuery({
        queryKey: ["comp-standings", comp.slug],
        queryFn: () => getStandings({ data: { sportPath: `soccer/${comp.espnLeague}` } }),
        staleTime: 5 * 60_000,
      })
      .catch(() => null);
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Football competition" }, { name: "robots", content: "noindex" }] };
    // Leaf routes (index / scores / fixtures / ...) own the title, description,
    // canonical and structured data. The layout must not add a second canonical.
    return { meta: [] };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Competition not found</h1>
        <p className="mt-3 text-muted-foreground">
          We don&apos;t have a page for that competition yet.
        </p>
        <Link
          to="/football"
          className="mt-6 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to Football
        </Link>
      </div>
    </div>
  ),
  component: () => <Outlet />,
});
