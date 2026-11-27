import { createFileRoute, Link } from "@tanstack/react-router";
import { listTeams, teamStats } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState } from "@/components/ui/state";
import { flagOf } from "@/lib/flags";

export const Route = createFileRoute("/football/countries/")({
  loader: () => {
    const rows = listTeams()
      .map((t) => {
        const s = teamStats(t.name);
        return {
          name: t.name,
          slug: t.slug,
          played: s.matchesPlayed,
          years: s.years.length,
          goals: s.gf,
        };
      })
      .filter((r) => r.played > 0 || r.years > 0)
      .sort((a, b) => b.played - a.played);
    return { rows };
  },
  head: ({ loaderData }) => {
    const path = "/football/countries";
    const count = loaderData?.rows.length ?? 0;
    const title = `All ${count} FIFA World Cup Countries — Complete Nation Directory | PlaySports`;
    const desc = `Every nation that has appeared at the FIFA World Cup (1930–2026), ranked by matches played, with appearances and goals scored.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(collectionPage({ name: "FIFA World Cup Countries", description: desc, path })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Countries", path },
          ]),
        ),
        loaderData
          ? ldScript(
              itemList({
                name: "FIFA World Cup nations",
                path,
                items: loaderData.rows
                  .slice(0, 50)
                  .map((r) => ({ name: r.name, path: `/football/teams/${r.slug}` })),
              }),
            )
          : null,
      ].filter(Boolean) as ReturnType<typeof ldScript>[],
    };
  },
  component: CountriesIndex,
});

function CountriesIndex() {
  const { rows } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-700 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <nav
            className="text-xs uppercase tracking-widest font-semibold text-white/80 mb-3"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2 opacity-60" aria-hidden="true">
              /
            </span>
            <Link to="/football" className="hover:text-white">
              Football
            </Link>
            <span className="mx-2 opacity-60" aria-hidden="true">
              /
            </span>
            <span className="text-white">Countries</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-black text-white">FIFA World Cup Countries</h1>
          <p className="mt-2 text-white/90 max-w-2xl">
            Every nation that has appeared at the FIFA World Cup from 1930 to 2026 — {rows.length}{" "}
            teams ranked by matches played.
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="No countries available"
            description="The World Cup nation directory is empty right now."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map(
              (r: { name: string; slug: string; played: number; years: number; goals: number }) => (
                <Link
                  key={r.slug}
                  to="/football/teams/$slug"
                  params={{ slug: r.slug }}
                  className="group flex items-center gap-3 rounded-xl bg-card border border-border p-3 hover:border-primary/60 hover:shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <div className="text-3xl" aria-hidden>
                    {flagOf(r.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate group-hover:text-primary">{r.name}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {r.played} matches · {r.years} WCs · {r.goals} goals
                    </div>
                  </div>
                </Link>
              ),
            )}
          </div>
        )}
      </main>
    </div>
  );
}
