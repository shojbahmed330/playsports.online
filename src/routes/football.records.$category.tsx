import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { listPlayers, playerStats } from "@/lib/seo/programmatic";
import wcRecords from "@/data/wc_records.json";
import { useMergedGoals } from "@/lib/use-merged-goals";
import { useMergedCards } from "@/lib/use-merged-cards";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, collectionPage, faqPage, ldScript } from "@/lib/seo/jsonld";
import { errorMessage } from "@/lib/error-message";
import { EmptyState, ErrorState } from "@/components/ui/state";

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
    intro:
      "Records that shape the FIFA World Cup story — from Fontaine's 13 goals to Klose's all-time scoring mark.",
  },
  {
    slug: "2026-tournament",
    h1: "FIFA World Cup 2026 — Records & Milestones",
    title: "FIFA World Cup 2026 Records — Golden Boot, Hat-tricks, Milestones | PlaySports",
    description:
      "Live-updated records from the 2026 FIFA World Cup: Golden Boot chase, goals, penalties and disciplinary totals from official match events.",
    intro:
      "Every notable record set at the 2026 FIFA World Cup — updated through the current round.",
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
    if (!loaderData)
      return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const { cat } = loaderData;
    const path = `/football/records/${params.category}`;
    const faqs = [
      { q: `What are the ${cat.h1.toLowerCase()}?`, a: cat.description },
      {
        q: `Who is the all-time FIFA World Cup top scorer?`,
        a: `All-time rankings are calculated from verified historical data plus official live 2026 scoring events when available.`,
      },
      {
        q: `How many goals were scored at the 2026 World Cup?`,
        a: `2026 totals are calculated from official ESPN match events and update as the tournament progresses.`,
      },
    ];
    return {
      meta: [
        { title: cat.title },
        { name: "description", content: cat.description },
        { property: "og:title", content: cat.title },
        { property: "og:description", content: cat.description },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: cat.title },
        { name: "twitter:description", content: cat.description },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(collectionPage({ name: cat.h1, description: cat.description, path })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Records", path: "/football/records/iconic-records" },
            { name: cat.h1, path },
          ]),
        ),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: RecordsCategoryPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load these records"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Records category not found"
        description="Choose one of the World Cup record categories from the records links."
      />
    </div>
  ),
});

function RecordsCategoryPage() {
  const { cat } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <nav
            className="text-xs uppercase tracking-widest font-semibold text-white/80 mb-3"
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Home
            </Link>
            <span className="mx-2 opacity-60" aria-hidden="true">
              /
            </span>
            <Link
              to="/football"
              className="inline-flex min-h-11 items-center hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Football
            </Link>
            <span className="mx-2 opacity-60" aria-hidden="true">
              /
            </span>
            <span className="text-white" aria-current="page">
              Records
            </span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-black text-white">{cat.h1}</h1>
          <p className="mt-2 text-white/90 max-w-2xl">{cat.intro}</p>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pt-6 space-y-6">
        {cat.slug === "top-scorers-all-time" && <TopScorersAllTime />}
        {cat.slug === "iconic-records" && (
          <CuratedList
            items={wcRecords.curated as CuratedItem[]}
            emptyTitle="No iconic records listed"
            emptyDescription="Curated World Cup records are not available right now."
          />
        )}
        {cat.slug === "2026-tournament" && <Live2026Records />}
        {cat.slug === "tournament-totals" && <TournamentTotals />}

        <section className="rounded-2xl border border-border bg-card/40 p-5">
          <h2 className="text-xl font-bold mb-3">Explore other records</h2>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.slug !== cat.slug).map((c) => (
              <Link
                key={c.slug}
                to="/football/records/$category"
                params={{ category: c.slug }}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-sm hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
    <section className="rounded-2xl border border-border bg-card/40 p-5">
      <h2 className="text-xl font-bold mb-3">All-time top scorers (5+ goals)</h2>
      {rows.length === 0 ? (
        <EmptyState
          title="No scorer data yet"
          description="All-time scoring records are not available right now."
        />
      ) : (
        <ol className="space-y-1 text-sm">
          {rows.map((r, i) => (
            <li key={r.slug} className="flex justify-between border-b border-border/40 py-1.5">
              <Link
                to="/football/players/$slug"
                params={{ slug: r.slug }}
                className="inline-flex min-h-11 items-center hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="tabular-nums text-muted-foreground mr-2 w-8 inline-block">
                  #{i + 1}
                </span>
                {r.name} <span className="text-muted-foreground">({r.team})</span>
              </Link>
              <span className="font-bold tabular-nums">{r.stats.goalsTotal}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

type CuratedItem = { title: string; value: string; context?: string };

function CuratedList({
  items,
  emptyTitle = "No records available",
  emptyDescription = "Records for this category have not been published yet.",
}: {
  items: CuratedItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {items.map((r) => (
        <div key={r.title} className="rounded-2xl border border-border bg-card/40 p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{r.title}</div>
          <div className="mt-1 text-lg font-bold">{r.value}</div>
          {r.context && <div className="text-xs text-muted-foreground mt-1">{r.context}</div>}
        </div>
      ))}
    </section>
  );
}

function TournamentTotals() {
  const { goals: GOALS } = useMergedGoals();
  const live2026Goals = GOALS.filter((g) => g.year === 2026 && !g.og).length;
  const rows = (
    (wcRecords.tournamentTotals ?? []) as Array<{
      year: number;
      goals: number;
      matches: number;
      note?: string;
    }>
  )
    .filter((r) => r.year !== 2026)
    .concat([{ year: 2026, goals: live2026Goals, matches: 104, note: "Live from ESPN events" }]);
  return (
    <section className="rounded-2xl border border-border bg-card/40 p-5">
      <h2 className="text-xl font-bold mb-3">Goals & matches by tournament</h2>
      {rows.length === 0 ? (
        <EmptyState
          title="No tournament totals"
          description="Tournament goal and match totals are not available right now."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Goals and matches by FIFA World Cup tournament</caption>
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th scope="col" className="text-left py-1">
                  Year
                </th>
                <th scope="col" className="text-right">
                  Goals
                </th>
                <th scope="col" className="text-right">
                  Matches
                </th>
                <th scope="col" className="text-right">
                  G/M
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.year} className="border-b border-border/40">
                  <td className="py-1.5">
                    <Link
                      to="/football/tournaments/$year"
                      params={{ year: String(r.year) }}
                      className="inline-flex min-h-11 items-center font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {r.year}
                    </Link>
                    {r.note && (
                      <span className="text-xs text-muted-foreground ml-2">({r.note})</span>
                    )}
                  </td>
                  <td className="text-right tabular-nums">{r.goals}</td>
                  <td className="text-right tabular-nums">{r.matches}</td>
                  <td className="text-right tabular-nums">
                    {r.matches > 0 ? (r.goals / r.matches).toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Live2026Records() {
  const { goals: GOALS } = useMergedGoals();
  const { cards: CARDS } = useMergedCards();
  const goals2026 = GOALS.filter((g) => g.year === 2026 && !g.og);
  const penalties2026 = goals2026.filter((g) => g.pen).length;
  const yellow2026 = CARDS.filter((c) => c.year === 2026 && c.type === "yellow").length;
  const red2026 = CARDS.filter((c) => c.year === 2026 && c.type === "red").length;
  const scorerMap = new Map<string, { name: string; team: string; goals: number }>();
  for (const g of goals2026) {
    const key = `${g.pid}|${g.pteam}`;
    const cur = scorerMap.get(key) ?? { name: g.name, team: g.pteam, goals: 0 };
    cur.goals += 1;
    scorerMap.set(key, cur);
  }
  const leaders = Array.from(scorerMap.values()).sort(
    (a, b) => b.goals - a.goals || a.name.localeCompare(b.name),
  );
  const top = leaders[0] ?? null;
  const cards: CuratedItem[] = [
    {
      title: "Golden Boot leader",
      value: top ? `${top.goals} — ${top.name}` : "No goals yet",
      context: top ? top.team : "Waiting for official scoring events",
    },
    {
      title: "Goals recorded",
      value: String(goals2026.length),
      context: "ESPN scoring events; own goals excluded from player scorer credit",
    },
    {
      title: "Penalty goals",
      value: String(penalties2026),
      context: "Converted penalties during match play only",
    },
    {
      title: "Cards recorded",
      value: `${yellow2026} yellow · ${red2026} red`,
      context: "Official match disciplinary events",
    },
  ];
  return <CuratedList items={cards} />;
}
