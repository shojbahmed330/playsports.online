// Phase 3 — Cricket per-team international/tournament history programmatic SEO page.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { getCricketTeamHistory, type ChampionRow } from "@/lib/seo/multisport-programmatic";
import { getCricketTeamBySlug } from "@/lib/seo/cricket-entities";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForCricketTeam } from "@/lib/seo/related";

export const Route = createFileRoute("/cricket/team-history/$slug")({
  loader: ({ params }) => {
    const h = getCricketTeamHistory(params.slug);
    if (!h) throw notFound();
    return { h };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Team history — Cricket" }, { name: "robots", content: "noindex" }] };
    const { h } = loaderData;
    const url = canonical(`/cricket/team-history/${params.slug}`);
    const wins = h.championships.length;
    const title = `${h.name} Trophy History — ${wins} title${wins === 1 ? "" : "s"} across ICC & T20 events`;
    const desc = `${h.name} in major cricket tournaments: ${wins} title${wins === 1 ? "" : "s"}, ${h.runnerUps.length} runner-up finish${h.runnerUps.length === 1 ? "" : "es"}. Full trophy history on PlaySports.`;
    const latest = h.championships[0];
    const faqs = [
      { q: `How many major cricket titles has ${h.name} won?`, a: `${h.name} have won ${wins} major ICC / franchise cricket title${wins === 1 ? "" : "s"} on record.` },
      ...(latest ? [{ q: `When did ${h.name} last win a major cricket trophy?`, a: `Their most recent title on record was ${latest.seasonLabel}, defeating ${latest.runnerUp}.` }] : []),
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
        ldScript(breadcrumbList([
          { name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" },
          { name: "History", path: "/cricket/history" },
          { name: h.name, path: `/cricket/team-history/${params.slug}` },
        ])),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: CricketTeamHistoryPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      No trophy history on record. <Link to="/cricket/history" className="underline">See cricket history</Link>.
    </div>
  ),
});

function CricketTeamHistoryPage() {
  const { h } = Route.useLoaderData();
  const team = getCricketTeamBySlug(h.slug);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Cricket · Trophy history</div>
        <h1 className="text-3xl font-extrabold text-white mt-1">{h.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <b className="text-primary">{h.championships.length}</b> title{h.championships.length === 1 ? "" : "s"} ·{" "}
          <b>{h.runnerUps.length}</b> runner-up · <b>{h.appearances}</b> total appearance{h.appearances === 1 ? "" : "s"}
        </p>
        {team ? (
          <Link to="/cricket/teams/$slug" params={{ slug: team.slug }} className="mt-3 inline-block text-xs text-primary font-semibold hover:underline">
            → {team.name} squad & fixtures
          </Link>
        ) : null}
      </header>

      {h.championships.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">Titles ({h.championships.length})</h2>
          <ul className="divide-y divide-border">
            {h.championships.map((c: ChampionRow) => (
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <span className="tabular-nums font-black text-primary w-14">{c.year}</span>
                <span className="text-white">{c.seasonLabel}</span>
                <span className="text-muted-foreground">def. {c.runnerUp}{c.result ? ` · ${c.result}` : ""}</span>
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
              <li key={c.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <span className="tabular-nums font-black text-white/70 w-14">{c.year}</span>
                <span className="text-white">{c.seasonLabel}</span>
                <span className="text-muted-foreground">lost to {c.champion}{c.result ? ` · ${c.result}` : ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="text-sm"><Link to="/cricket/history" className="text-primary font-semibold hover:underline">← Cricket history</Link></div>
    </div>
  );
}
