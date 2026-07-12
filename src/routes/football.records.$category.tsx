import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { listPlayers, playerStats, slugify } from "@/lib/seo/programmatic";
import wcRecords from "@/data/wc_records.json";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";

type Category = {
  slug: string;
  h1: string;
  title: string;
  description: string;
  intro: string;
};

const CATEGORIES: Category[] = [
  {
    slug: "top-scorers-all-time",
    h1: "All-time FIFA World Cup Top Scorers",
    title: "All-time FIFA World Cup Top Scorers (1930–2026) | PlaySports",
    description:
      "Complete list of the highest goal-scorers in FIFA World Cup history from 1930 to 2026 — Messi, Klose, Ronaldo, Müller, Fontaine and every scorer with 5+ goals.",
    intro:
      "Every player in FIFA World Cup history ranked by career tournament goals — updated through the 2026 tournament.",
  },
  {
    slug: "iconic-records",
    h1: "Iconic FIFA World Cup Records",
    title: "Iconic FIFA World Cup Records — Fastest, Oldest, Youngest | PlaySports",
    description:
      "Historic FIFA World Cup records: fastest goal, oldest and youngest scorers, most career goals, most finals played and most titles won.",
    intro: "Records that shape the FIFA World Cup story — from Fontaine's 13 goals to Messi surpassing Klose in 2026.",
  },
  {
    slug: "2026-tournament",
    h1: "FIFA World Cup 2026 — Records & Milestones",
    title: "FIFA World Cup 2026 Records — Golden Boot, Hat-tricks, Milestones | PlaySports",
    description:
      "Live-updated records from the 2026 FIFA World Cup: Golden Boot chase, hat-tricks, biggest wins, milestone goals and semifinal line-up.",
    intro: "Every notable record set at the 2026 FIFA World Cup — updated through the current round.",
  },
  {
    slug: "tournament-totals",
    h1: "FIFA World Cup Tournament Totals (Goals & Matches)",
    title: "FIFA World Cup Tournament Totals — Goals & Matches by Year | PlaySports",
    description:
      "Total goals and matches at every FIFA World Cup from 1930 to 2026 — sortable tournament-by-tournament summary.",
    intro: "How every FIFA World Cup compares by total goals and matches played.",
  },
];

const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c] as const));

export const Route = createFileRoute("/football/records/$category")({
  loader: ({ params }) => {
    const cat = CAT_MAP[params.category];
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const { cat } = loaderData;
    const path = `/football/records/${params.category}`;
    const faqs = [
      { q: `What are the ${cat.h1.toLowerCase()}?`, a: cat.description },
      { q: `Who is the all-time FIFA World Cup top scorer?`, a: `Lionel Messi (Argentina) is the all-time FIFA World Cup top scorer with 21 goals, surpassing Miroslav Klose's 16 in 2026.` },
      { q: `How many goals were scored at the 2026 World Cup?`, a: `Through the quarterfinals of the 2026 FIFA World Cup, 158 goals have been scored in 88 matches.` },
    ];
    return {
      meta: [
        { title: cat.title },
        { name: "description", content: cat.description },
        { property: "og:title", content: cat.title },
        { property: "og:description", content: cat.description },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(collectionPage({ name: cat.h1, description: cat.description, path })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: "Records", path: "/football/records/iconic-records" },
          { name: cat.h1, path },
        ])),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: RecordsCategoryPage,
  notFoundComponent: () => <div className="p-6">Records category not found.</div>,
});

function RecordsCategoryPage() {
  const { cat } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-to-br from-rose-700 via-orange-600 to-amber-500 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <nav className="text-xs uppercase tracking-widest font-semibold text-white/80 mb-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2 opacity-60">/</span>
            <Link to="/football" className="hover:text-white">Football</Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="text-white">Records</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{cat.h1}</h1>
          <p className="mt-2 text-white/90 max-w-2xl">{cat.intro}</p>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pt-6 space-y-6">
        {cat.slug === "top-scorers-all-time" && <TopScorersAllTime />}
        {cat.slug === "iconic-records" && <CuratedList items={wcRecords.curated as CuratedItem[]} />}
        {cat.slug === "2026-tournament" && <CuratedList items={wcRecords.curated2026 as CuratedItem[]} />}
        {cat.slug === "tournament-totals" && <TournamentTotals />}

        <section className="rounded-xl bg-card border p-5">
          <h2 className="text-xl font-bold mb-3">Explore other records</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
              <Link
                key={c.slug}
                to="/football/records/$category"
                params={{ category: c.slug }}
                className="px-3 py-1.5 rounded-full text-sm border hover:border-primary/60 hover:text-primary"
              >
                {c.h1}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function TopScorersAllTime() {
  const rows = listPlayers()
    .map((p) => ({ ...p, stats: playerStats(p.name) }))
    .filter((r) => r.stats.goalsTotal >= 5)
    .sort((a, b) => b.stats.goalsTotal - a.stats.goalsTotal)
    .slice(0, 100);
  return (
    <section className="rounded-xl bg-card border p-5">
      <h2 className="text-xl font-bold mb-3">All-time top scorers (5+ goals)</h2>
      <ol className="space-y-1 text-sm">
        {rows.map((r, i) => (
          <li key={r.slug} className="flex justify-between border-b border-border/40 py-1.5">
            <Link to="/football/players/$slug" params={{ slug: r.slug }} className="hover:text-primary">
              <span className="tabular-nums text-muted-foreground mr-2 w-8 inline-block">#{i + 1}</span>
              {r.name} <span className="text-muted-foreground">({r.team})</span>
            </Link>
            <span className="font-bold tabular-nums">{r.stats.goalsTotal}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

type CuratedItem = { title: string; value: string; context?: string };

function CuratedList({ items }: { items: CuratedItem[] }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {items.map((r) => (
        <div key={r.title} className="rounded-xl bg-card border p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{r.title}</div>
          <div className="mt-1 text-lg font-bold">{r.value}</div>
          {r.context && <div className="text-xs text-muted-foreground mt-1">{r.context}</div>}
        </div>
      ))}
    </section>
  );
}

function TournamentTotals() {
  const rows = (wcRecords.tournamentTotals ?? []) as Array<{ year: number; goals: number; matches: number; note?: string }>;
  return (
    <section className="rounded-xl bg-card border p-5">
      <h2 className="text-xl font-bold mb-3">Goals & matches by tournament</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr><th className="text-left py-1">Year</th><th className="text-right">Goals</th><th className="text-right">Matches</th><th className="text-right">G/M</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year} className="border-b border-border/40">
                <td className="py-1.5">
                  <Link to="/football/tournaments/$year" params={{ year: String(r.year) }} className="hover:text-primary font-semibold">
                    {r.year}
                  </Link>
                  {r.note && <span className="text-xs text-muted-foreground ml-2">({r.note})</span>}
                </td>
                <td className="text-right tabular-nums">{r.goals}</td>
                <td className="text-right tabular-nums">{r.matches}</td>
                <td className="text-right tabular-nums">{(r.goals / r.matches).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
