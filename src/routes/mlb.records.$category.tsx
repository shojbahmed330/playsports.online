// Phase 2.1 — MLB all-time record category page (SSR, indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getMlbRecordCategory, listMlbRecordCategories } from "@/lib/seo/mlb-entities";
import { breadcrumbList, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { slugify } from "@/lib/seo/programmatic";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/mlb/records/$category")({
  loader: ({ params }) => {
    const cat = getMlbRecordCategory(params.category);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.cat;
    const url = canonical(`/mlb/records/${params.category}`);
    const title = c ? `${c.title} — MLB All-Time` : "MLB Records";
    const desc = c
      ? `MLB all-time ${c.title.toLowerCase()} — top ${c.rows.length} players ranked by career ${c.metric}. Updated leaderboard on PlaySports.`
      : "MLB all-time record leaderboards.";
    const faqs =
      c && c.rows.length
        ? [
            {
              q: `Who leads MLB in career ${c.metric}?`,
              a: `${c.rows[0].player} leads MLB in career ${c.metric} with ${c.rows[0].value}.`,
            },
            {
              q: `How many players are in the ${c.title}?`,
              a: `The ${c.title} page currently lists the top ${c.rows.length} players in MLB history.`,
            },
          ]
        : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: c
        ? [
            ldScript(
              itemList({
                name: c.title,
                path: `/mlb/records/${c.slug}`,
                items: c.rows.map((r) => ({
                  name: `${r.rank}. ${r.player} — ${r.value}`,
                  path: `/mlb/players/${slugify(r.player)}`,
                })),
              }),
            ),
            ldScript(
              breadcrumbList([
                { name: "Home", path: "/" },
                { name: "MLB", path: "/mlb" },
                { name: "History", path: "/mlb/history" },
                { name: c.title, path: `/mlb/records/${c.slug}` },
              ]),
            ),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: RecordCategoryPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this leaderboard"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="py-10">
      <EmptyState
        title="Record category not found"
        description="Choose another all-time leaderboard from MLB history."
        action={
          <Link
            to="/mlb/history"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to MLB history
          </Link>
        }
      />
    </div>
  ),
});

function RecordCategoryPage() {
  const { cat } = Route.useLoaderData() as {
    cat: NonNullable<ReturnType<typeof getMlbRecordCategory>>;
  };
  const others = listMlbRecordCategories().filter((c) => c.slug !== cat.slug);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15 p-6 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-40" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">
            MLB · All-Time · {cat.group === "batting" ? "Batting" : "Pitching"}
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{cat.title}</h1>
          <p className="text-sm text-white/80 mt-1">Ranked by career {cat.metric}.</p>
        </div>
      </header>

      <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
        {cat.rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No players in this leaderboard"
              description="This all-time list is empty right now."
            />
          </div>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">{cat.title} — MLB all-time leaderboard</caption>
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="text-left px-4 py-2 w-14">
                  #
                </th>
                <th scope="col" className="text-left px-4 py-2">
                  Player
                </th>
                <th scope="col" className="text-right px-4 py-2 w-24">
                  {cat.metric}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cat.rows.map((r) => (
                <tr key={r.rank} className="hover:bg-accent/40">
                  <td className="px-4 py-2 tabular-nums font-black text-[#f7e6c4]">{r.rank}</td>
                  <td className="px-4 py-2">
                    <Link
                      to="/mlb/players/$slug"
                      params={{ slug: slugify(r.player) }}
                      className="inline-flex min-h-11 items-center font-semibold text-foreground hover:text-[#f7e6c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {r.player}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground font-bold">
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">
          Other all-time leaderboards
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {others.map((c) => (
            <li key={c.slug}>
              <Link
                to="/mlb/records/$category"
                params={{ category: c.slug }}
                className="flex min-h-11 items-center rounded-xl bg-muted/40 hover:bg-accent ring-1 ring-border px-3 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
