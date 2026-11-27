// Phase 3 — NBA per-team championship history programmatic SEO page.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { getNbaTeamHistory, type ChampionRow } from "@/lib/seo/multisport-programmatic";
import { getNbaTeamBySlug } from "@/lib/seo/nba-entities";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeagueTeam } from "@/lib/seo/related";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/nba/team-history/$slug")({
  loader: ({ params }) => {
    const h = getNbaTeamHistory(params.slug);
    if (!h) throw notFound();
    return { h };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Team history — NBA" }, { name: "robots", content: "noindex" }] };
    const { h } = loaderData;
    const url = canonical(`/nba/team-history/${params.slug}`);
    const wins = h.championships.length;
    const title = `${h.name} NBA Finals History — ${wins} title${wins === 1 ? "" : "s"} & every appearance`;
    const desc = `${h.name} in the NBA Finals: ${wins} championship${wins === 1 ? "" : "s"}, ${h.runnerUps.length} runner-up finish${h.runnerUps.length === 1 ? "" : "es"}. Complete list of every ${h.name} Finals appearance on PlaySports.`;
    const latest = h.championships[0];
    const faqs = [
      {
        q: `How many NBA titles has ${h.name} won?`,
        a: `${h.name} have won ${wins} NBA championship${wins === 1 ? "" : "s"}.`,
      },
      ...(latest
        ? [
            {
              q: `When did ${h.name} last win the NBA Finals?`,
              a: `${h.name} last won in ${latest.seasonLabel}, defeating the ${latest.runnerUp} ${latest.result}.`,
            },
          ]
        : []),
    ];
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc.slice(0, 200) },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          sportsTeam({
            name: h.name,
            path: `/nba/team-history/${params.slug}`,
            sport: "Basketball",
            league: "National Basketball Association",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "NBA", path: "/nba" },
            { name: "Champions", path: "/nba/champions" },
            { name: h.name, path: `/nba/team-history/${params.slug}` },
          ]),
        ),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: NbaTeamHistoryPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this team history"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="py-10">
      <EmptyState
        title="No NBA Finals history on record"
        description="This franchise is not in the NBA Finals archive."
        action={
          <Link
            to="/nba/champions"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            See all champions
          </Link>
        }
      />
    </div>
  ),
});

function NbaTeamHistoryPage() {
  const { h } = Route.useLoaderData();
  const team = getNbaTeamBySlug(h.slug);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          NBA · Franchise history
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mt-1">{h.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <b className="text-primary">{h.championships.length}</b> NBA title
          {h.championships.length === 1 ? "" : "s"} · <b>{h.runnerUps.length}</b> Finals loss
          {h.runnerUps.length === 1 ? "" : "es"} · <b>{h.appearances}</b> total appearance
          {h.appearances === 1 ? "" : "s"}
        </p>
        {team ? (
          <Link
            to="/nba/teams/$slug"
            params={{ slug: team.slug }}
            className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            → Current {team.short ?? team.name} squad &amp; schedule
          </Link>
        ) : null}
      </header>

      {h.championships.length === 0 && h.runnerUps.length === 0 && (
        <EmptyState
          title="No NBA Finals appearances"
          description={`${h.name} do not have a recorded NBA Finals appearance in the archive.`}
        />
      )}

      {h.championships.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">
            Championships ({h.championships.length})
          </h2>
          <ul className="divide-y divide-border">
            {h.championships.map((c: ChampionRow) => (
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <Link
                  to="/nba/finals/$year"
                  params={{ year: String(c.year) }}
                  className="inline-flex min-h-11 w-20 items-center tabular-nums font-black text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.seasonLabel}
                </Link>
                <span className="text-muted-foreground">
                  def. {c.runnerUp} · {c.result}
                </span>
                {c.extra ? (
                  <span className="ml-auto text-xs text-muted-foreground">FMVP: {c.extra}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}
      {h.runnerUps.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">
            Finals losses ({h.runnerUps.length})
          </h2>
          <ul className="divide-y divide-border">
            {h.runnerUps.map((c: ChampionRow) => (
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <Link
                  to="/nba/finals/$year"
                  params={{ year: String(c.year) }}
                  className="inline-flex min-h-11 w-20 items-center tabular-nums font-black text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.seasonLabel}
                </Link>
                <span className="text-muted-foreground">
                  lost to {c.champion} · {c.result}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="text-sm">
        <Link
          to="/nba/champions"
          className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← All NBA champions
        </Link>
      </div>
      <RelatedLinks title="Explore more NBA history" links={relatedForLeagueTeam("nba", h.slug)} />
    </div>
  );
}
