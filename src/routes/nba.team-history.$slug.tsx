// Phase 3 — NBA per-team championship history programmatic SEO page.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { getNbaTeamHistory, type ChampionRow } from "@/lib/seo/multisport-programmatic";
import { getNbaTeamBySlug } from "@/lib/seo/nba-entities";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeagueTeam } from "@/lib/seo/related";

export const Route = createFileRoute("/nba/team-history/$slug")({
  loader: ({ params }) => {
    const h = getNbaTeamHistory(params.slug);
    if (!h) throw notFound();
    return { h };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Team history — NBA" }, { name: "robots", content: "noindex" }] };
    const { h } = loaderData;
    const url = canonical(`/nba/team-history/${params.slug}`);
    const wins = h.championships.length;
    const title = `${h.name} NBA Finals History — ${wins} title${wins === 1 ? "" : "s"} & every appearance`;
    const desc = `${h.name} in the NBA Finals: ${wins} championship${wins === 1 ? "" : "s"}, ${h.runnerUps.length} runner-up finish${h.runnerUps.length === 1 ? "" : "es"}. Complete list of every ${h.name} Finals appearance on PlaySports.`;
    const latest = h.championships[0];
    const faqs = [
      { q: `How many NBA titles has ${h.name} won?`, a: `${h.name} have won ${wins} NBA championship${wins === 1 ? "" : "s"}.` },
      ...(latest ? [{ q: `When did ${h.name} last win the NBA Finals?`, a: `${h.name} last won in ${latest.seasonLabel}, defeating the ${latest.runnerUp} ${latest.result}.` }] : []),
    ];
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(sportsTeam({ name: h.name, path: `/nba/team-history/${params.slug}`, sport: "Basketball", league: "National Basketball Association" })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" }, { name: "NBA", path: "/nba" },
          { name: "Champions", path: "/nba/champions" },
          { name: h.name, path: `/nba/team-history/${params.slug}` },
        ])),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: NbaTeamHistoryPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      No NBA Finals history on record. <Link to="/nba/champions" className="underline">See all champions</Link>.
    </div>
  ),
});

function NbaTeamHistoryPage() {
  const { h } = Route.useLoaderData();
  const team = getNbaTeamBySlug(h.slug);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">NBA · Franchise history</div>
        <h1 className="text-3xl font-extrabold text-white mt-1">{h.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <b className="text-primary">{h.championships.length}</b> NBA title{h.championships.length === 1 ? "" : "s"} ·{" "}
          <b>{h.runnerUps.length}</b> Finals loss{h.runnerUps.length === 1 ? "" : "es"} · <b>{h.appearances}</b> total appearance{h.appearances === 1 ? "" : "s"}
        </p>
        {team ? (
          <Link to="/nba/teams/$slug" params={{ slug: team.slug }} className="mt-3 inline-block text-xs text-primary font-semibold hover:underline">
            → Current {team.short ?? team.name} squad & schedule
          </Link>
        ) : null}
      </header>

      {h.championships.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">Championships ({h.championships.length})</h2>
          <ul className="divide-y divide-border">
            {h.championships.map((c: ChampionRow) => (
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <Link to="/nba/finals/$year" params={{ year: String(c.year) }} className="tabular-nums font-black text-primary w-20">
                  {c.seasonLabel}
                </Link>
                <span className="text-muted-foreground">def. {c.runnerUp} · {c.result}</span>
                {c.extra ? <span className="ml-auto text-xs text-white/60">FMVP: {c.extra}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      )}
      {h.runnerUps.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-white/70 mb-3">Finals losses ({h.runnerUps.length})</h2>
          <ul className="divide-y divide-border">
            {h.runnerUps.map((c: ChampionRow) => (
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <Link to="/nba/finals/$year" params={{ year: String(c.year) }} className="tabular-nums font-black text-white/70 w-20">
                  {c.seasonLabel}
                </Link>
                <span className="text-muted-foreground">lost to {c.champion} · {c.result}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="text-sm"><Link to="/nba/champions" className="text-primary font-semibold hover:underline">← All NBA champions</Link></div>
      <RelatedLinks title="Explore more NBA history" links={relatedForLeagueTeam("nba", h.slug)} />
    </div>
  );
}
