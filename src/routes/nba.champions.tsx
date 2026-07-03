// Phase 3 — NBA all-time champions programmatic SEO page.
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, itemList } from "@/lib/seo/jsonld";
import {
  aggregateNbaChampions,
  listNbaChampions,
  listNbaTeamHistories,
} from "@/lib/seo/multisport-programmatic";

export const Route = createFileRoute("/nba/champions")({
  head: () => {
    const url = canonical("/nba/champions");
    const rows = listNbaChampions();
    const agg = aggregateNbaChampions();
    const title = `NBA Finals Champions — Every Winner (${rows[rows.length - 1]?.seasonLabel} → ${rows[0]?.seasonLabel})`;
    const desc = `Complete list of every NBA Finals champion, runner-up and Finals MVP. ${agg[0]?.name} lead with ${agg[0]?.titles} titles. Full winners table on PlaySports.`;
    const faqs = [
      { q: "Which NBA team has the most championships?", a: `The ${agg[0]?.name} lead all franchises with ${agg[0]?.titles} NBA Finals titles.` },
      { q: "Who won the most recent NBA Finals?", a: `The ${rows[0]?.champion} won the ${rows[0]?.seasonLabel} NBA Finals, defeating the ${rows[0]?.runnerUp} ${rows[0]?.result}.` },
      { q: "How many franchises have won an NBA title?", a: `${agg.length} different franchises have won the NBA Finals across ${rows.length} editions on record.` },
    ];
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "NBA", path: "/nba" },
          { name: "Champions", path: "/nba/champions" },
        ])),
        ldScript(itemList({
          name: "NBA champions", path: "/nba/champions",
          items: agg.slice(0, 20).map((a) => ({ name: `${a.name} (${a.titles})`, path: `/nba/team-history/${a.slug}` })),
        })),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: NbaChampionsPage,
});

function NbaChampionsPage() {
  const rows = listNbaChampions();
  const agg = aggregateNbaChampions();
  const teams = listNbaTeamHistories();
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">NBA · All-time</div>
        <h1 className="text-3xl font-extrabold text-white mt-1">NBA Finals Champions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every NBA Finals winner from {rows[rows.length - 1]?.seasonLabel} to {rows[0]?.seasonLabel} · {agg.length} franchises · {rows.length} finals.
        </p>
      </header>
      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">Most titles</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {agg.slice(0, 12).map((a, i) => (
            <li key={a.slug} className="flex items-center justify-between rounded-xl bg-white/[0.03] ring-1 ring-border px-3 py-2">
              <Link to="/nba/team-history/$slug" params={{ slug: a.slug }} className="text-white hover:text-primary font-semibold">
                <span className="tabular-nums text-muted-foreground mr-2">#{i + 1}</span>{a.name}
              </Link>
              <span className="text-primary font-black tabular-nums">{a.titles}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">All winners by season</h2>
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
              <Link to="/nba/finals/$year" params={{ year: String(r.year) }} className="tabular-nums font-black text-primary w-20">
                {r.seasonLabel}
              </Link>
              <span className="text-white font-semibold">{r.champion}</span>
              <span className="text-muted-foreground">def. {r.runnerUp} · {r.result}</span>
              {r.extra ? <span className="ml-auto text-xs text-white/60">FMVP: {r.extra}</span> : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">Team histories</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {teams.map((t) => (
            <li key={t.slug}>
              <Link to="/nba/team-history/$slug" params={{ slug: t.slug }} className="block rounded-xl bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-border px-3 py-2 text-white">
                {t.name}
                <span className="ml-2 text-xs text-muted-foreground">{t.championships.length}W · {t.runnerUps.length}L</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
