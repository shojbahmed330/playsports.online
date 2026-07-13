import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findPlayerYear, playerYearStats, slugify } from "@/lib/seo/programmatic";
import { getTournament } from "@/data/wc_tournaments";
import { canonical } from "@/lib/seo/canonical";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { playerYearFaqs } from "@/lib/seo/faq-templates";
import { flagOf } from "@/lib/flags";
import { getPlayerStatHistory } from "@/lib/seo/leaderboards";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForFootballPlayer } from "@/lib/seo/related";

// The URL segment /world-cup-{param} collides with two conceptually
// different pages:
//   - /football/players/:slug/world-cup-2022 → per-year stats
//   - /football/players/:slug/world-cup-goals → career goals breakdown
//   - /football/players/:slug/world-cup-cards → career cards breakdown
// TanStack routes on the URL shape, not the loader outcome, so we handle
// both branches inside this one route.
const STAT_ALIAS: Record<string, "goals" | "cards"> = {
  goals: "goals",
  cards: "cards",
};

export const Route = createFileRoute("/football/players/$slug/world-cup-{$year}")({
  loader: ({ params }) => {
    const key = STAT_ALIAS[params.year];
    if (key) {
      const hist = getPlayerStatHistory(params.slug);
      if (!hist) throw notFound();
      const meta = key === "goals"
        ? { name: "World Cup Goals", metric: "goals" as const }
        : { name: "World Cup Cards", metric: "cards" as const };
      return { kind: "stat" as const, hist, meta, statSlug: `world-cup-${key}` };
    }
    const year = Number(params.year);
    if (!Number.isFinite(year)) throw notFound();
    const py = findPlayerYear(params.slug, year);
    if (!py) throw notFound();
    const stats = playerYearStats(py.playerName, year);
    const t = getTournament(year);
    const isTopScorer = t?.topScorer.split(" / ").some((n) => n.trim() === py.playerName) ?? false;
    return { kind: "year" as const, player: py, stats, t, isTopScorer };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    if (loaderData.kind === "stat") {
      const { hist, meta } = loaderData;
      const path = `/football/players/${params.slug}/world-cup-${params.year}`;
      const total = meta.metric === "goals" ? hist.totals.goals : hist.totals.yellows + hist.totals.reds;
      const title = `${hist.name} ${meta.name} — ${total} in ${hist.rows.length} tournaments | PlaySports`;
      const desc =
        meta.metric === "goals"
          ? `How many World Cup goals does ${hist.name} have? ${hist.totals.goals} total (${hist.totals.penalties} penalties). Year-by-year breakdown from ${hist.rows[0].year} to ${hist.rows[hist.rows.length - 1].year}.`
          : `${hist.name} World Cup disciplinary record: ${hist.totals.yellows} yellow cards, ${hist.totals.reds} red cards across ${hist.rows.length} tournaments.`;
      const faq = buildStatFaq(hist, meta);
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:url", content: canonical(path) },
          { property: "og:type", content: "profile" },
        ],
        links: [{ rel: "canonical", href: canonical(path) }],
        scripts: [
          ldScript(athlete({ name: hist.name, path, sport: "Football", team: hist.team })),
          ldScript(
            breadcrumbList([
              { name: "Home", path: "/" },
              { name: "Football", path: "/football" },
              { name: "Players", path: "/players" },
              { name: hist.name, path: `/football/players/${params.slug}` },
              { name: meta.name, path },
            ]),
          ),
          ldScript(faqPage(faq)),
        ],
      };
    }
    const { player, stats, isTopScorer } = loaderData;
    const path = `/football/players/${params.slug}/world-cup-${params.year}`;
    const title = `${player.playerName} at the ${player.year} FIFA World Cup — ${stats.goals} goal${stats.goals === 1 ? "" : "s"} for ${player.team} | PlaySports`;
    const desc = `${player.playerName} scored ${stats.goals} goal${stats.goals === 1 ? "" : "s"} for ${player.team} at the ${player.year} FIFA World Cup${isTopScorer ? " and won the Golden Boot" : ""}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "profile" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(athlete({ name: player.playerName, path, sport: "Football", team: player.team })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: "Players", path: "/football/players" },
          { name: player.playerName, path: `/football/players/${player.playerSlug}` },
          { name: `${player.year} World Cup`, path },
        ])),
        ldScript(faqPage(playerYearFaqs({
          name: player.playerName,
          team: player.team,
          year: player.year,
          goals: stats.goals,
          isTopScorer,
        }))),
      ],
    };
  },
  component: PlayerYearOrStatPage,
  notFoundComponent: () => <div className="p-6">No data for this page.</div>,
});

function buildStatFaq(
  hist: NonNullable<ReturnType<typeof getPlayerStatHistory>>,
  meta: { name: string; metric: "goals" | "cards" },
) {
  if (meta.metric === "goals") {
    const faqs = [
      {
        q: `How many World Cup goals does ${hist.name} have?`,
        a: `${hist.name} has scored ${hist.totals.goals} World Cup goals in ${hist.rows.length} tournaments, including ${hist.totals.penalties} from the penalty spot.`,
      },
    ];
    for (const r of hist.rows) {
      faqs.push({
        q: `How many goals did ${hist.name} score in the ${r.year} World Cup?`,
        a: `${hist.name} scored ${r.goals} goal${r.goals === 1 ? "" : "s"} at the ${r.year} FIFA World Cup for ${r.team}.`,
      });
    }
    return faqs.slice(0, 8);
  }
  return [
    {
      q: `How many yellow cards has ${hist.name} received in the World Cup?`,
      a: `${hist.name} has ${hist.totals.yellows} World Cup yellow card${hist.totals.yellows === 1 ? "" : "s"}.`,
    },
    {
      q: `Has ${hist.name} ever been sent off in a World Cup match?`,
      a: hist.totals.reds > 0
        ? `Yes — ${hist.name} received ${hist.totals.reds} red card${hist.totals.reds === 1 ? "" : "s"} across their World Cup career.`
        : `No — ${hist.name} has never been shown a red card in a World Cup match.`,
    },
  ];
}

function PlayerYearOrStatPage() {
  const data = Route.useLoaderData();
  if (data.kind === "stat") return <StatView />;
  return <YearView />;
}

function StatView() {
  const data = Route.useLoaderData();
  if (data.kind !== "stat") return null;
  const { hist, meta, statSlug } = data;
  const { slug } = Route.useParams();
  const isGoals = meta.metric === "goals";
  const total = isGoals ? hist.totals.goals : hist.totals.yellows + hist.totals.reds;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link>
        {" / "}
        <Link to="/football" className="hover:underline">Football</Link>
        {" / "}
        <Link to="/football/players/$slug" params={{ slug }} className="hover:underline">
          {hist.name}
        </Link>
        {" / "}
        <span className="text-foreground">{meta.name}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {hist.name} — {meta.name}
      </h1>
      <p className="text-muted-foreground mb-6">
        {hist.name} playing for {hist.team}: <strong>{total}</strong>{" "}
        {isGoals ? "World Cup goals" : "World Cup cards"} across {hist.rows.length} tournaments
        {isGoals && hist.totals.penalties > 0 ? ` (${hist.totals.penalties} from penalties)` : ""}.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Team</th>
              {isGoals ? (
                <>
                  <th className="px-3 py-2 text-right">Goals</th>
                  <th className="px-3 py-2 text-right">Penalties</th>
                  <th className="px-3 py-2 text-right">Own Goals</th>
                </>
              ) : (
                <>
                  <th className="px-3 py-2 text-right">Yellow</th>
                  <th className="px-3 py-2 text-right">Red</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {hist.rows.map((r: typeof hist.rows[number]) => (
              <tr key={r.year} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{r.year}</td>
                <td className="px-3 py-2">{r.team}</td>
                {isGoals ? (
                  <>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{r.goals}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.penalties}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.ownGoals}</td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 text-right tabular-nums">{r.yellows}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.reds}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <RelatedLinks
        title={`More World Cup stats for ${hist.name}`}
        links={relatedForFootballPlayer(slug, hist.team, 10).filter((l) => l.href !== `/football/players/${slug}/${statSlug}`)}
      />
    </main>
  );
}

function YearView() {
  const data = Route.useLoaderData();
  if (data.kind !== "year") return null;
  const { player, stats, t, isTopScorer } = data;
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <nav className="text-xs uppercase tracking-widest font-semibold text-white/80 mb-3">
            <Link to="/football/players" className="hover:text-white">Players</Link>
            <span className="mx-2">/</span>
            <Link to="/football/players/$slug" params={{ slug: player.playerSlug }} className="hover:text-white">{player.playerName}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{player.year} World Cup</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {player.playerName} — {player.year} FIFA World Cup
          </h1>
          <p className="mt-2 text-white/95 text-lg flex items-center gap-2 flex-wrap">
            <span>{flagOf(player.team)}</span>
            <span>{player.team}</span>
            <span className="opacity-70">·</span>
            <strong>{stats.goals} goal{stats.goals === 1 ? "" : "s"}</strong>
            {isTopScorer && <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-400 text-black text-xs font-bold">🥇 Golden Boot</span>}
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pt-6 space-y-6">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Goals" value={stats.goals} />
          <Stat label="Penalties" value={stats.pen} />
          <Stat label="Own Goals" value={stats.og} />
          <Stat label="Cards" value={stats.cards} />
        </section>

        {t && (
          <section className="rounded-xl bg-card border p-5">
            <h2 className="text-xl font-bold mb-2">{t.year} Tournament Context</h2>
            <p className="text-sm">
              Hosted by <strong>{t.host}</strong>. Champion: <strong>{t.champion}</strong>. Top scorer: <strong>{t.topScorer}</strong> ({t.topScorerGoals} goals).
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link to="/football/tournaments/$year" params={{ year: String(player.year) }} className="text-primary hover:underline">
                → Full {player.year} tournament page
              </Link>
              <Link
                to="/football/countries/$slug/world-cup-{$year}"
                params={{ slug: slugify(player.team), year: String(player.year) }}
                className="text-primary hover:underline"
              >
                → {player.team} at {player.year} World Cup
              </Link>
              <Link to="/football/players/$slug" params={{ slug: player.playerSlug }} className="text-primary hover:underline">
                → {player.playerName}'s full profile
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-card border p-4 text-center">
      <div className="text-xs uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-black tabular-nums">{value}</div>
    </div>
  );
}
