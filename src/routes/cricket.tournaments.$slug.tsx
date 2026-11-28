import { errorMessage } from "@/lib/error-message";
// Phase 2.1 (cricket) â€” SSR tournament landing page.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { breadcrumbList, faqPage, itemList, ldScript, sportsOrganization } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { slugify } from "@/lib/seo/programmatic";
import { getCricketTournamentBySlug, listCricketTournaments } from "@/lib/seo/cricket-entities";

export const Route = createFileRoute("/cricket/tournaments/$slug")({
  loader: ({ params }) => {
    const t = getCricketTournamentBySlug(params.slug);
    if (!t) throw notFound();
    return { t };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Tournament not found â€” Cricket" }, { name: "robots", content: "noindex" }],
      };
    }
    const { t } = loaderData;
    const url = canonical(`/cricket/tournaments/${params.slug}`);
    const title = `${t.longName} â€” champions, records & full history`;
    const desc = t.history
      ? `${t.longName}: ${t.history.champions.length} editions since ${t.history.champions[0]?.year}. Latest winner: ${t.latestChampion}. Complete winners list, top scorers and record wicket-takers.`
      : `${t.longName} â€” fixtures, live scores, standings and records.`;
    const faqs = buildFaqs(t);
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc.slice(0, 200) },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          sportsOrganization({
            name: t.longName,
            path: `/cricket/tournaments/${params.slug}`,
            sport: "Cricket",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Tournaments", path: "/cricket/tournaments" },
            { name: t.longName, path: `/cricket/tournaments/${params.slug}` },
          ]),
        ),
        ...(t.history?.champions
          ? [
              ldScript(
                itemList({
                  name: `${t.longName} champions`,
                  path: `/cricket/tournaments/${params.slug}`,
                  items: t.history.champions.map((c) => ({
                    name: `${c.year} â€” ${c.champion}`,
                    path: `/cricket/tournaments/${params.slug}`,
                  })),
                }),
              ),
            ]
          : []),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: TournamentPage,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="Could not load this tournament"
          message={errorMessage(error)}
          onRetry={reset}
        />
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Tournament not found"
          description="This tournament is not in the cricket directory."
          action={
            <Link
              to="/cricket/tournaments"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent-cricket)]/15 px-4 text-sm font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30"
            >
              Browse all tournaments
            </Link>
          }
        />
      </div>
    </div>
  ),
});

function buildFaqs(
  t: ReturnType<typeof getCricketTournamentBySlug>,
): Array<{ q: string; a: string }> {
  if (!t) return [];
  const faqs: Array<{ q: string; a: string }> = [];
  if (t.history?.champions?.length) {
    const latest = t.history.champions[t.history.champions.length - 1];
    faqs.push({
      q: `Who won the most recent ${t.longName}?`,
      a: `${latest.champion} won the ${latest.year} ${t.longName}${latest.result ? `: ${latest.result}` : ""}.`,
    });
    const counts = new Map<string, number>();
    t.history.champions.forEach((c) => counts.set(c.champion, (counts.get(c.champion) ?? 0) + 1));
    const [topName, topCount] = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
    faqs.push({
      q: `Which team has won the ${t.longName} most times?`,
      a: `${topName} leads with ${topCount} title${topCount === 1 ? "" : "s"}.`,
    });
    faqs.push({
      q: `When did the ${t.longName} start?`,
      a: `The first ${t.longName} was held in ${t.history.champions[0].year}.`,
    });
  }
  if (t.history?.topRuns?.[0]) {
    const tr = t.history.topRuns[0];
    faqs.push({
      q: `Who is the leading run-scorer in ${t.longName} history?`,
      a: `${tr.player} (${tr.country}) with ${tr.runs} runs in ${tr.matches} matches (avg ${tr.avg}).`,
    });
  }
  if (t.history?.topWickets?.[0]) {
    const tw = t.history.topWickets[0];
    faqs.push({
      q: `Who has taken the most wickets in ${t.longName} history?`,
      a: `${tw.player} (${tw.country}) with ${tw.wickets} wickets in ${tw.matches} matches (avg ${tw.avg}).`,
    });
  }
  return faqs;
}

function TournamentPage() {
  const { t } = Route.useLoaderData() as {
    t: NonNullable<
      ReturnType<typeof import("@/lib/seo/cricket-entities").getCricketTournamentBySlug>
    >;
  };
  const others = listCricketTournaments()
    .filter((x) => x.slug !== t.slug)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">
            Cricket
          </Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{t.longName}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden>
              {t.emoji}
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t.longName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t.format.toUpperCase()} Â· {t.group}
                {t.totalEditions ? ` Â· ${t.totalEditions} editions` : ""}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">{t.tagline}</p>
        </header>

        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            to="/cricket/series/$id"
            params={{ id: t.id }}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--color-accent-cricket)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-accent-cricket)]"
          >
            View live fixtures & results â†’
          </Link>
        </div>

        {t.history?.champions?.length ? (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">Champions by year</h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">{t.longName} champions by year</caption>
                <thead className="bg-muted/40 text-xs uppercase tracking-wide">
                  <tr>
                    <th scope="col" className="text-left px-3 py-2">
                      Year
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Champion
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Runner-up
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Venue
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...t.history.champions].reverse().map((c) => (
                    <tr key={c.year} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{c.year}</td>
                      <td className="px-3 py-2 font-medium">{c.champion}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.runnerUp}</td>
                      <td className="px-3 py-2 text-muted-foreground">{c.venue ?? "â€”"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.result ?? "â€”"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">Champions by year</h2>
            <EmptyState
              title="No champions recorded yet"
              description="The winners list will appear once this tournament has completed editions."
            />
          </section>
        )}

        {t.history?.topRuns?.length ? (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">Top run scorers ({t.longName})</h2>
            <ol className="space-y-2">
              {t.history.topRuns.map((r) => (
                <li
                  key={r.player}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <Link
                    to="/cricket/players/$slug"
                    params={{ slug: slugify(r.player) }}
                    className="font-medium hover:underline"
                  >
                    {r.player} <span className="text-xs text-muted-foreground">({r.country})</span>
                  </Link>
                  <span className="font-mono text-sm">
                    {r.runs} runs Â· {r.matches} m Â· avg {r.avg}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {t.history?.topWickets?.length ? (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">Top wicket takers ({t.longName})</h2>
            <ol className="space-y-2">
              {t.history.topWickets.map((w) => (
                <li
                  key={w.player}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <Link
                    to="/cricket/players/$slug"
                    params={{ slug: slugify(w.player) }}
                    className="font-medium hover:underline"
                  >
                    {w.player} <span className="text-xs text-muted-foreground">({w.country})</span>
                  </Link>
                  <span className="font-mono text-sm">
                    {w.wickets} wkts Â· {w.matches} m Â· avg {w.avg}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Frequently asked</h2>
          <div className="space-y-3">
            {buildFaqs(t).map((f) => (
              <div key={f.q} className="rounded-lg border border-border bg-card/50 p-4">
                <p className="font-medium">{f.q}</p>
                <p className="text-sm text-muted-foreground mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {others.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">Other cricket tournaments</h2>
            <ul className="flex flex-wrap gap-2">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link
                    to="/cricket/tournaments/$slug"
                    params={{ slug: o.slug }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
                  >
                    <span aria-hidden>{o.emoji}</span> {o.longName}
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
