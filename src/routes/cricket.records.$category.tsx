import { errorMessage } from "@/lib/error-message";
// Phase 2.1 (cricket) — SSR record leaderboard page (long-tail SEO target).
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { breadcrumbList, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import {
  getCricketPlayerBySlug,
  getCricketRecordCategory,
  listCricketRecordCategories,
} from "@/lib/seo/cricket-entities";
import { slugify } from "@/lib/seo/programmatic";
import recordsData from "@/data/cricket/records.json";
import { EmptyState, ErrorState } from "@/components/ui/state";

export const Route = createFileRoute("/cricket/records/$category")({
  loader: ({ params }) => {
    const cat = getCricketRecordCategory(params.category);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Record not found — Cricket" }, { name: "robots", content: "noindex" }],
      };
    }
    const { cat } = loaderData;
    const url = canonical(`/cricket/records/${params.category}`);
    const image = "https://www.playsports.online/og-default.png";
    const title = `${cat.title} — All-time cricket leaderboard`;
    const top = cat.rows[0];
    const desc = top
      ? `${cat.title}: ${top.player} (${top.team}) leads with ${top.value}${top.extra ? ` (${top.extra})` : ""}. Full top-10 leaderboard.`
      : `${cat.title} — top-10 all-time cricket leaderboard.`;
    const faqs = buildFaqs(cat);
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc.slice(0, 200) },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          itemList({
            name: cat.title,
            path: `/cricket/records/${params.category}`,
            items: cat.rows.map((r) => ({
              name: `${r.player} — ${r.value} ${cat.metric}`,
              path: playerPath(r.player),
            })),
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Records", path: "/cricket/records" },
            { name: cat.title, path: `/cricket/records/${params.category}` },
          ]),
        ),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: RecordCategoryPage,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="Could not load this record"
          message={errorMessage(error)}
          onRetry={reset}
        />
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Record not found"
          description="This record category is not in the cricket registry."
          action={
            <Link
              to="/cricket/records"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent-cricket)]/15 px-4 text-sm font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30"
            >
              Browse all records
            </Link>
          }
        />
      </div>
    </div>
  ),
});

const RECORDS_UPDATED = (recordsData as { updatedAt?: string }).updatedAt;

function playerPath(name: string): string {
  const slug = slugify(name);
  return getCricketPlayerBySlug(slug)
    ? `/cricket/players/${slug}`
    : `/search?q=${encodeURIComponent(name)}`;
}

function buildFaqs(
  cat: ReturnType<typeof getCricketRecordCategory>,
): Array<{ q: string; a: string }> {
  if (!cat) return [];
  const faqs: Array<{ q: string; a: string }> = [];
  const [first, second] = cat.rows;
  if (first) {
    faqs.push({
      q: `Who holds the record for ${cat.title.toLowerCase()}?`,
      a: `${first.player} (${first.team}) holds the record with ${first.value} ${cat.metric.toLowerCase()}${first.extra ? ` (${first.extra})` : ""}.`,
    });
  }
  if (second) {
    faqs.push({
      q: `Who is second on the ${cat.title.toLowerCase()} list?`,
      a: `${second.player} (${second.team}) is second with ${second.value} ${cat.metric.toLowerCase()}.`,
    });
  }
  faqs.push({
    q: `How many players are on the ${cat.title} top-10?`,
    a: `${cat.rows.length} players appear on the ${cat.title} leaderboard.`,
  });
  return faqs;
}

function RecordCategoryPage() {
  const { cat } = Route.useLoaderData() as {
    cat: NonNullable<
      ReturnType<typeof import("@/lib/seo/cricket-entities").getCricketRecordCategory>
    >;
  };
  const others = listCricketRecordCategories().filter((c) => c.id !== cat.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">
            Cricket
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket/records" className="hover:underline">
            Records
          </Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{cat.title}</span>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{cat.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All-time top {cat.rows.length} · Format: {cat.format.toUpperCase()}
            {RECORDS_UPDATED ? ` · snapshot ${RECORDS_UPDATED}` : ""}
          </p>
        </header>

        <section className="mb-10">
          {cat.rows.length === 0 ? (
            <EmptyState
              title="No leaderboard entries"
              description="This record category has no verified entries yet."
            />
          ) : (
            <ol className="space-y-2">
              {cat.rows.map((r, i) => {
                const slug = slugify(r.player);
                const hasProfile = !!getCricketPlayerBySlug(slug);
                return (
                  <li
                    key={`${r.player}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-6 text-lg font-mono text-muted-foreground">{i + 1}</span>
                      <span className="text-xl" aria-hidden>
                        {r.flag}
                      </span>
                      {hasProfile ? (
                        <Link
                          to="/cricket/players/$slug"
                          params={{ slug }}
                          className="inline-flex min-h-9 items-center font-medium hover:underline"
                        >
                          {r.player}
                        </Link>
                      ) : (
                        <span className="font-medium">{r.player}</span>
                      )}
                      <span className="text-xs text-muted-foreground">({r.team})</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold">{r.value}</p>
                      {r.extra && <p className="text-xs text-muted-foreground">{r.extra}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Frequently asked</h2>
          <div className="space-y-3">
            {buildFaqs(cat).map((f) => (
              <div key={f.q} className="rounded-lg border border-border bg-card/50 p-4">
                <p className="font-medium">{f.q}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {others.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">More cricket records</h2>
            <ul className="flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.id}>
                  <Link
                    to="/cricket/records/$category"
                    params={{ category: o.id }}
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
                  >
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
