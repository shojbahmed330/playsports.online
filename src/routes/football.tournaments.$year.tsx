import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getTournament, WC_TOURNAMENTS } from "@/data/wc_tournaments";
import { archiveStats, slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, itemList, ldScript, sportsEvent } from "@/lib/seo/jsonld";
import { tournamentFaqs } from "@/lib/seo/faq-templates";
import { flagOf } from "@/lib/flags";

export const Route = createFileRoute("/football/tournaments/$year")({
  loader: ({ params }) => {
    const year = Number(params.year);
    const t = getTournament(year);
    if (!t) throw notFound();
    const arch = archiveStats(year);
    return { t, arch };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const { t } = loaderData;
    const path = `/football/tournaments/${params.year}`;
    const title = `${t.year} FIFA World Cup — ${t.host} · Champion ${t.champion} · Top Scorer ${t.topScorer} | PlaySports`;
    const desc = `${t.year} FIFA World Cup in ${t.host}: ${t.champion} beat ${t.runnerUp} ${t.finalScore}. ${t.topScorer} won the Golden Boot with ${t.topScorerGoals} goals. ${t.teams} teams · ${t.matches} matches · ${t.totalGoals} goals.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(sportsEvent({
          name: `${t.year} FIFA World Cup`,
          sport: "Soccer",
          startDate: t.startDate,
          location: t.host,
        } as Parameters<typeof sportsEvent>[0])),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: "Tournaments", path: "/football/tournaments" },
          { name: `${t.year} World Cup`, path },
        ])),
        ldScript(faqPage(tournamentFaqs(t))),
      ],
    };
  },
  component: TournamentPage,
  notFoundComponent: () => <div className="p-6">Tournament not found.</div>,
});

function TournamentPage() {
  const { t, arch } = Route.useLoaderData();
  const podium: Array<{ pos: string; name?: string }> = [
    { pos: "🥇 Champion", name: t.champion },
    { pos: "🥈 Runner-up", name: t.runnerUp },
    { pos: "🥉 Third", name: t.third },
    { pos: "4th", name: t.fourth },
  ];
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-800 via-purple-700 to-rose-700 py-10 px-4">
        <div className="container mx-auto max-w-5xl relative">
          <nav className="text-xs uppercase tracking-widest font-semibold text-white/80 mb-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2 opacity-60">/</span>
            <Link to="/football" className="hover:text-white">Football</Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="text-white">{t.year} World Cup</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            {t.year} FIFA World Cup — {t.host}
          </h1>
          <p className="mt-2 text-white/90 text-lg">
            Quick Answer: <strong>{t.champion}</strong> won the {t.year} FIFA World Cup, beating <strong>{t.runnerUp}</strong> {t.finalScore} in the final held in {t.host}.
          </p>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pt-6 space-y-6">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {podium.filter((p) => p.name).map((p) => (
            <div key={p.pos} className="rounded-xl bg-card border p-4">
              <div className="text-xs uppercase text-muted-foreground">{p.pos}</div>
              <div className="mt-1 font-semibold flex items-center gap-2">
                <span>{flagOf(p.name!)}</span>
                <span>{p.name}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Teams" value={t.teams} />
          <Stat label="Matches" value={t.matches} />
          <Stat label="Goals" value={t.totalGoals || "TBD"} />
          <Stat label="Goals/Match" value={t.goalsPerMatch} />
        </section>

        <section className="rounded-xl bg-card border p-5">
          <h2 className="text-xl font-bold mb-3">Golden Boot & Golden Ball</h2>
          <p className="text-sm">
            <strong>Top Scorer:</strong> {t.topScorer} ({t.topScorerTeam}) — {t.topScorerGoals} goals
          </p>
          {t.goldenBall && (
            <p className="text-sm mt-1"><strong>Best Player (Golden Ball):</strong> {t.goldenBall}</p>
          )}
        </section>

        {arch.topScorers.length > 0 && (
          <section className="rounded-xl bg-card border p-5">
            <h2 className="text-xl font-bold mb-3">Top Scorers of {t.year}</h2>
            <ol className="space-y-1.5 text-sm">
              {arch.topScorers.slice(0, 15).map((s: { name: string; team: string; goals: number }, i: number) => (
                <li key={s.name} className="flex justify-between border-b border-border/50 pb-1">
                  <Link to="/football/players/$slug" params={{ slug: slugify(s.name) }} className="hover:text-primary">
                    <span className="tabular-nums text-muted-foreground mr-2">#{i + 1}</span>
                    {s.name} <span className="text-muted-foreground">({s.team})</span>
                  </Link>
                  <span className="font-semibold tabular-nums">{s.goals}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="rounded-xl bg-card border p-5">
          <h2 className="text-xl font-bold mb-3">Other Tournaments</h2>
          <div className="flex flex-wrap gap-2">
            {WC_TOURNAMENTS.map((x) => (
              <Link
                key={x.year}
                to="/football/tournaments/$year"
                params={{ year: String(x.year) }}
                className={`px-3 py-1.5 rounded-full text-sm border ${x.year === t.year ? "bg-primary text-primary-foreground border-primary" : "hover:border-primary/60"}`}
              >
                {x.year}
              </Link>
            ))}
          </div>
        </section>
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
