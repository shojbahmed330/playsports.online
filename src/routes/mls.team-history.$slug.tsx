// Phase 3 — MLS per-club MLS Cup history programmatic SEO page.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { getMlsTeamHistory, type ChampionRow } from "@/lib/seo/multisport-programmatic";
import { getMlsTeamBySlug } from "@/lib/seo/mls-entities";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeagueTeam } from "@/lib/seo/related";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/mls/team-history/$slug")({
  loader: ({ params }) => {
    const h = getMlsTeamHistory(params.slug);
    if (!h) throw notFound();
    return { h };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Club history — MLS" }, { name: "robots", content: "noindex" }] };
    const { h } = loaderData;
    const url = canonical(`/mls/team-history/${params.slug}`);
    const wins = h.championships.length;
    const title = `${h.name} MLS Cup History — ${wins} title${wins === 1 ? "" : "s"} & every final`;
    const desc = `${h.name} in MLS Cup: ${wins} championship${wins === 1 ? "" : "s"}, ${h.runnerUps.length} runner-up finish${h.runnerUps.length === 1 ? "" : "es"}. Complete list on PlaySports.`;
    const latest = h.championships[0];
    const faqs = [
      {
        q: `How many MLS Cups has ${h.name} won?`,
        a: `${h.name} have won ${wins} MLS Cup${wins === 1 ? "" : "s"}.`,
      },
      ...(latest
        ? [
            {
              q: `When did ${h.name} last win MLS Cup?`,
              a: `${h.name} last won in ${latest.seasonLabel}, defeating ${latest.runnerUp} ${latest.result}.`,
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
            path: `/mls/team-history/${params.slug}`,
            sport: "Soccer",
            league: "Major League Soccer",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "MLS", path: "/mls" },
            { name: "Champions", path: "/mls/champions" },
            { name: h.name, path: `/mls/team-history/${params.slug}` },
          ]),
        ),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: MlsTeamHistoryPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this club history"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="py-10">
      <EmptyState
        title="No MLS Cup history on record"
        description="This club is not in the MLS Cup archive."
        action={
          <Link
            to="/mls/champions"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            See all champions
          </Link>
        }
      />
    </div>
  ),
});

function MlsTeamHistoryPage() {
  const { h } = Route.useLoaderData();
  const team = getMlsTeamBySlug(h.slug);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          MLS · Club history
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mt-1">{h.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <b className="text-primary">{h.championships.length}</b> MLS Cup
          {h.championships.length === 1 ? "" : "s"} · <b>{h.runnerUps.length}</b> Final loss
          {h.runnerUps.length === 1 ? "" : "es"} · <b>{h.appearances}</b> total
        </p>
        {team ? (
          <Link
            to="/mls/teams/$slug"
            params={{ slug: team.slug }}
            className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            → Current {team.short ?? team.name} squad &amp; schedule
          </Link>
        ) : null}
      </header>

      {h.championships.length === 0 && h.runnerUps.length === 0 && (
        <EmptyState
          title="No MLS Cup appearances"
          description={`${h.name} do not have a recorded MLS Cup final appearance in the archive.`}
        />
      )}

      {h.championships.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">
            MLS Cup titles ({h.championships.length})
          </h2>
          <ul className="divide-y divide-border">
            {h.championships.map((c: ChampionRow) => (
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <Link
                  to="/mls/cup/$year"
                  params={{ year: String(c.year) }}
                  className="inline-flex min-h-11 w-20 items-center tabular-nums font-black text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.seasonLabel}
                </Link>
                <span className="text-muted-foreground">
                  def. {c.runnerUp} · {c.result}
                </span>
                {c.extra ? (
                  <span className="ml-auto text-xs text-muted-foreground">MVP: {c.extra}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}
      {h.runnerUps.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-3">
            Final losses ({h.runnerUps.length})
          </h2>
          <ul className="divide-y divide-border">
            {h.runnerUps.map((c: ChampionRow) => (
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <Link
                  to="/mls/cup/$year"
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
          to="/mls/champions"
          className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← All MLS Cup champions
        </Link>
      </div>
      <RelatedLinks title="Explore more MLS history" links={relatedForLeagueTeam("mls", h.slug)} />
    </div>
  );
}
