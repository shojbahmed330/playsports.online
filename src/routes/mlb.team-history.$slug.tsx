// Phase 3 — MLB per-team World Series history programmatic SEO page.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import {
  getMlbTeamHistory,
  mlbTeamHistorySlugs,
  type ChampionRow,
} from "@/lib/seo/multisport-programmatic";
import { getMlbTeamBySlug } from "@/lib/seo/mlb-entities";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeagueTeam } from "@/lib/seo/related";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/mlb/team-history/$slug")({
  loader: ({ params }) => {
    const h = getMlbTeamHistory(params.slug);
    if (!h) throw notFound();
    return { h };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Team history — MLB" }, { name: "robots", content: "noindex" }] };
    }
    const { h } = loaderData;
    const url = canonical(`/mlb/team-history/${params.slug}`);
    const wins = h.championships.length;
    const title = `${h.name} World Series History — ${wins} title${wins === 1 ? "" : "s"} & every appearance`;
    const desc = `${h.name} in the World Series: ${wins} championship${wins === 1 ? "" : "s"}, ${h.runnerUps.length} runner-up finish${h.runnerUps.length === 1 ? "" : "es"}. Complete list of every ${h.name} World Series appearance on PlaySports.`;
    const first = [...h.championships, ...h.runnerUps].sort((a, b) => a.year - b.year)[0];
    const latest = h.championships[0];
    const faqs = [
      {
        q: `How many World Series has ${h.name} won?`,
        a: `${h.name} have won ${wins} World Series title${wins === 1 ? "" : "s"}.`,
      },
      ...(latest
        ? [
            {
              q: `When did ${h.name} last win the World Series?`,
              a: `${h.name} last won in ${latest.year}, defeating the ${latest.runnerUp} ${latest.result}.`,
            },
          ]
        : []),
      ...(first
        ? [
            {
              q: `When did ${h.name} first reach the World Series?`,
              a: `Their first World Series appearance on record was in ${first.year}.`,
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
            path: `/mlb/team-history/${params.slug}`,
            sport: "Baseball",
            league: "Major League Baseball",
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "MLB", path: "/mlb" },
            { name: "Champions", path: "/mlb/champions" },
            { name: h.name, path: `/mlb/team-history/${params.slug}` },
          ]),
        ),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: MlbTeamHistoryPage,
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
        title="No World Series history on record"
        description="This franchise is not in the World Series archive."
        action={
          <Link
            to="/mlb/champions"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            See all champions
          </Link>
        }
      />
    </div>
  ),
});

function MlbTeamHistoryPage() {
  const { h } = Route.useLoaderData();
  const team = getMlbTeamBySlug(h.slug);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15 p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">
          MLB · Franchise history
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">{h.name}</h1>
        <p className="text-sm text-white/80 mt-1">
          <b className="text-[#f7e6c4]">{h.championships.length}</b> World Series title
          {h.championships.length === 1 ? "" : "s"} · <b>{h.runnerUps.length}</b> runner-up finish
          {h.runnerUps.length === 1 ? "" : "es"} · <b>{h.appearances}</b> total appearance
          {h.appearances === 1 ? "" : "s"}
        </p>
        {team ? (
          <Link
            to="/mlb/teams/$slug"
            params={{ slug: team.slug }}
            className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-[#f7e6c4] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            → Current {team.short} squad &amp; schedule
          </Link>
        ) : null}
      </header>

      {h.championships.length === 0 && h.runnerUps.length === 0 && (
        <EmptyState
          title="No World Series appearances"
          description={`${h.name} do not have a recorded World Series appearance in the archive.`}
        />
      )}

      {h.championships.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">
            Championships ({h.championships.length})
          </h2>
          <ul className="divide-y divide-border">
            {h.championships.map((c: ChampionRow) => (
              <li key={c.year} className="py-2 flex items-baseline gap-3 text-sm">
                <Link
                  to="/mlb/world-series/$year"
                  params={{ year: String(c.year) }}
                  className="inline-flex min-h-11 w-14 items-center tabular-nums font-black text-[#f7e6c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.year}
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
          <h2 className="text-xs uppercase tracking-wider font-bold text-white/70 mb-3">
            Runner-up finishes ({h.runnerUps.length})
          </h2>
          <ul className="divide-y divide-border">
            {h.runnerUps.map((c: ChampionRow) => (
              <li key={c.year} className="py-2 flex items-baseline gap-3 text-sm">
                <Link
                  to="/mlb/world-series/$year"
                  params={{ year: String(c.year) }}
                  className="inline-flex min-h-11 w-14 items-center tabular-nums font-black text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.year}
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
          to="/mlb/champions"
          className="inline-flex min-h-11 items-center font-semibold text-[#f7e6c4] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← All MLB champions
        </Link>
      </div>

      <RelatedLinks title="Explore more MLB history" links={relatedForLeagueTeam("mlb", h.slug)} />
    </div>
  );
}

// Type-check helper (unused at runtime): ensure slug list is at least populated.
void mlbTeamHistorySlugs;
