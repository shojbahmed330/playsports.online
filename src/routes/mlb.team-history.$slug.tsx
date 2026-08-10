// Phase 3 — MLB per-team World Series history programmatic SEO page.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { getMlbTeamHistory, mlbTeamHistorySlugs, type ChampionRow } from "@/lib/seo/multisport-programmatic";
import { getMlbTeamBySlug } from "@/lib/seo/mlb-entities";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeagueTeam } from "@/lib/seo/related";

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
      { q: `How many World Series has ${h.name} won?`, a: `${h.name} have won ${wins} World Series title${wins === 1 ? "" : "s"}.` },
      ...(latest ? [{ q: `When did ${h.name} last win the World Series?`, a: `${h.name} last won in ${latest.year}, defeating the ${latest.runnerUp} ${latest.result}.` }] : []),
      ...(first ? [{ q: `When did ${h.name} first reach the World Series?`, a: `Their first World Series appearance on record was in ${first.year}.` }] : []),
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
        ldScript(sportsTeam({ name: h.name, path: `/mlb/team-history/${params.slug}`, sport: "Baseball", league: "Major League Baseball" })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "MLB", path: "/mlb" },
          { name: "Champions", path: "/mlb/champions" },
          { name: h.name, path: `/mlb/team-history/${params.slug}` },
        ])),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: MlbTeamHistoryPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      No World Series history on record. <Link to="/mlb/champions" className="underline">See all champions</Link>.
    </div>
  ),
});

function MlbTeamHistoryPage() {
  const { h } = Route.useLoaderData();
  const team = getMlbTeamBySlug(h.slug);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15 p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">MLB · Franchise history</div>
        <h1 className="text-3xl font-extrabold text-white mt-1">{h.name}</h1>
        <p className="text-sm text-white/80 mt-1">
          <b className="text-[#f7e6c4]">{h.championships.length}</b> World Series title{h.championships.length === 1 ? "" : "s"} ·{" "}
          <b>{h.runnerUps.length}</b> runner-up finish{h.runnerUps.length === 1 ? "" : "es"} ·{" "}
          <b>{h.appearances}</b> total appearance{h.appearances === 1 ? "" : "s"}
        </p>
        {team ? (
          <Link to="/mlb/teams/$slug" params={{ slug: team.slug }} className="mt-3 inline-block text-xs text-[#f7e6c4] font-semibold hover:underline">
            → Current {team.short} squad & schedule
          </Link>
        ) : null}
      </header>

      {h.championships.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">Championships ({h.championships.length})</h2>
          <ul className="divide-y divide-border">
            {h.championships.map((c: ChampionRow) => (
              <li key={c.year} className="py-2 flex items-baseline gap-3 text-sm">
                <Link to="/mlb/world-series/$year" params={{ year: String(c.year) }} className="tabular-nums font-black text-[#f7e6c4] w-14">
                  {c.year}
                </Link>
                <span className="text-muted-foreground">def. {c.runnerUp} · {c.result}</span>
                {c.extra ? <span className="ml-auto text-xs text-white/60">MVP: {c.extra}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {h.runnerUps.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-white/70 mb-3">Runner-up finishes ({h.runnerUps.length})</h2>
          <ul className="divide-y divide-border">
            {h.runnerUps.map((c: ChampionRow) => (
              <li key={c.year} className="py-2 flex items-baseline gap-3 text-sm">
                <Link to="/mlb/world-series/$year" params={{ year: String(c.year) }} className="tabular-nums font-black text-white/70 w-14">
                  {c.year}
                </Link>
                <span className="text-muted-foreground">lost to {c.champion} · {c.result}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="text-sm">
        <Link to="/mlb/champions" className="text-[#f7e6c4] font-semibold hover:underline">← All MLB champions</Link>
      </div>

      <RelatedLinks title="Explore more MLB history" links={relatedForLeagueTeam("mlb", h.slug)} />
    </div>
  );
}

// Type-check helper (unused at runtime): ensure slug list is at least populated.
void mlbTeamHistorySlugs;
