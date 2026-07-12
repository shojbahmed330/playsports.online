import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findPlayerYear, playerYearStats, slugify } from "@/lib/seo/programmatic";
import { getTournament } from "@/data/wc_tournaments";
import { canonical } from "@/lib/seo/canonical";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { playerYearFaqs } from "@/lib/seo/faq-templates";
import { flagOf } from "@/lib/flags";

export const Route = createFileRoute("/football/players/$slug/world-cup-{$year}")({
  loader: ({ params }) => {
    const year = Number(params.year);
    if (!Number.isFinite(year)) throw notFound();
    const py = findPlayerYear(params.slug, year);
    if (!py) throw notFound();
    const stats = playerYearStats(py.playerName, year);
    const t = getTournament(year);
    const isTopScorer = t?.topScorer.split(" / ").some((n) => n.trim() === py.playerName) ?? false;
    return { player: py, stats, t, isTopScorer };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
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
  component: PlayerYearPage,
  notFoundComponent: () => <div className="p-6">No data for this player × year.</div>,
});

function PlayerYearPage() {
  const { player, stats, t, isTopScorer } = Route.useLoaderData();
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
