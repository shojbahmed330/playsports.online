// Phase 3 — MLB all-time champions programmatic SEO page.
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, itemList } from "@/lib/seo/jsonld";
import {
  aggregateMlbChampions,
  listMlbChampions,
  listMlbTeamHistories,
} from "@/lib/seo/multisport-programmatic";

export const Route = createFileRoute("/mlb/champions")({
  head: () => {
    const url = canonical("/mlb/champions");
    const rows = listMlbChampions();
    const agg = aggregateMlbChampions();
    const title = `MLB World Series Champions — Every Winner (${rows[rows.length - 1]?.year}–${rows[0]?.year})`;
    const desc = `Complete list of every MLB World Series champion, runner-up and MVP. ${agg[0]?.name} lead with ${agg[0]?.titles} titles. Full winners table on PlaySports.`;
    const faqs = [
      { q: "Which MLB team has the most World Series titles?", a: `The ${agg[0]?.name} lead all franchises with ${agg[0]?.titles} World Series titles.` },
      { q: "Who won the most recent World Series?", a: `The ${rows[0]?.champion} won the ${rows[0]?.year} World Series, defeating the ${rows[0]?.runnerUp} ${rows[0]?.result}.` },
      { q: "How many teams have won the World Series?", a: `${agg.length} different franchises have won the World Series across ${rows.length} editions on record.` },
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
          { name: "MLB", path: "/mlb" },
          { name: "Champions", path: "/mlb/champions" },
        ])),
        ldScript(itemList({
          name: "MLB World Series champions",
          path: "/mlb/champions",
          items: agg.slice(0, 20).map((a) => ({ name: `${a.name} (${a.titles} titles)`, path: `/mlb/team-history/${a.slug}` })),
        })),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: MlbChampionsPage,
});

function MlbChampionsPage() {
  const rows = listMlbChampions();
  const agg = aggregateMlbChampions();
  const teams = listMlbTeamHistories();

  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15 p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">MLB · All-time</div>
        <h1 className="text-3xl font-extrabold text-white mt-1">World Series Champions</h1>
        <p className="text-sm text-white/80 mt-1">
          Every MLB World Series winner from {rows[rows.length - 1]?.year} to {rows[0]?.year}. {agg.length} franchises · {rows.length} editions.
        </p>
      </header>

      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">Most titles</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {agg.slice(0, 12).map((a, i) => (
            <li key={a.slug} className="flex items-center justify-between rounded-xl bg-white/[0.03] ring-1 ring-border px-3 py-2">
              <Link to="/mlb/team-history/$slug" params={{ slug: a.slug }} className="text-white hover:text-[#f7e6c4] font-semibold">
                <span className="tabular-nums text-muted-foreground mr-2">#{i + 1}</span>{a.name}
              </Link>
              <span className="text-[#f7e6c4] font-black tabular-nums">{a.titles}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">All winners by year</h2>
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.year} className="py-2 flex items-baseline gap-3 text-sm">
              <Link to="/mlb/world-series/$year" params={{ year: String(r.year) }} className="tabular-nums font-black text-[#f7e6c4] w-14">
                {r.year}
              </Link>
              <span className="text-white font-semibold">{r.champion}</span>
              <span className="text-muted-foreground">def. {r.runnerUp} · {r.result}</span>
              {r.extra ? <span className="ml-auto text-xs text-white/60">MVP: {r.extra}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">Team histories</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {teams.map((t) => (
            <li key={t.slug}>
              <Link to="/mlb/team-history/$slug" params={{ slug: t.slug }} className="block rounded-xl bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-border px-3 py-2 text-white">
                {t.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {t.championships.length}W · {t.runnerUps.length}L
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
