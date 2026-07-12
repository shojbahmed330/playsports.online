import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findCountryYear, teamYearStats, slugify } from "@/lib/seo/programmatic";
import { getTournament } from "@/data/wc_tournaments";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, sportsTeam } from "@/lib/seo/jsonld";
import { countryYearFaqs } from "@/lib/seo/faq-templates";
import { flagOf } from "@/lib/flags";

export const Route = createFileRoute("/football/countries/$slug/world-cup-{$year}")({
  loader: ({ params }) => {
    const year = Number(params.year);
    if (!Number.isFinite(year)) throw notFound();
    const cy = findCountryYear(params.slug, year);
    if (!cy) throw notFound();
    const stats = teamYearStats(cy.countryName, year);
    const t = getTournament(year);
    return { country: cy, stats, t };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const { country, stats, t } = loaderData;
    const path = `/football/countries/${params.slug}/world-cup-${params.year}`;
    const host = t?.host ?? "";
    const finish = deriveFinish(country.countryName, country.year, t);
    const title = `${country.countryName} at the ${country.year} FIFA World Cup — ${finish} | PlaySports`;
    const desc = `${country.countryName} at the ${country.year} World Cup${host ? ` in ${host}` : ""}: ${stats.played} matches, ${stats.w}W-${stats.d}D-${stats.l}L, ${stats.gf} scored, ${stats.ga} conceded.`;
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
        ldScript(sportsTeam({ name: country.countryName, path, sport: "Football", league: `FIFA World Cup ${country.year}` })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: "Countries", path: "/football/countries" },
          { name: country.countryName, path: `/football/teams/${country.countrySlug}` },
          { name: `${country.year} World Cup`, path },
        ])),
        ldScript(faqPage(countryYearFaqs({
          name: country.countryName,
          year: country.year,
          host: host || "TBD",
          finish,
          played: stats.played,
          w: stats.w, d: stats.d, l: stats.l,
          gf: stats.gf, ga: stats.ga,
          topScorer: stats.topScorers[0],
        }))),
      ],
    };
  },
  component: CountryYearPage,
  notFoundComponent: () => <div className="p-6">No data for this nation × year.</div>,
});

function deriveFinish(name: string, year: number, t: ReturnType<typeof getTournament>): string {
  if (!t) return "participated";
  if (t.champion === name) return "won the title";
  if (t.runnerUp === name) return "finished runners-up";
  if (t.third === name) return "finished third";
  if (t.fourth === name) return "finished fourth";
  return "participated";
}

function CountryYearPage() {
  const { country, stats, t } = Route.useLoaderData();
  const finish = deriveFinish(country.countryName, country.year, t);
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <nav className="text-xs uppercase tracking-widest font-semibold text-white/70 mb-3">
            <Link to="/football/countries" className="hover:text-white">Countries</Link>
            <span className="mx-2">/</span>
            <Link to="/football/teams/$slug" params={{ slug: country.countrySlug }} className="hover:text-white">{country.countryName}</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{country.year} World Cup</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="text-6xl">{flagOf(country.countryName)}</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white">
                {country.countryName} at the {country.year} FIFA World Cup
              </h1>
              <p className="mt-2 text-white/90 text-lg">
                Quick Answer: {country.countryName} <strong>{finish}</strong> at the {country.year} World Cup{t?.host ? ` in ${t.host}` : ""} — {stats.played} matches, {stats.w}W-{stats.d}D-{stats.l}L, {stats.gf} scored, {stats.ga} conceded.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 pt-6 space-y-6">
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Stat label="Played" value={stats.played} />
          <Stat label="Won" value={stats.w} />
          <Stat label="Drawn" value={stats.d} />
          <Stat label="Lost" value={stats.l} />
          <Stat label="GF – GA" value={`${stats.gf} – ${stats.ga}`} />
        </section>

        {stats.matches.length > 0 && (
          <section className="rounded-xl bg-card border p-5">
            <h2 className="text-xl font-bold mb-3">Match Results</h2>
            <ol className="space-y-1.5 text-sm">
              {stats.matches.map((m: { home_team: string; away_team: string; home_score: number; away_score: number }, i: number) => (
                <li key={i} className="flex justify-between border-b border-border/50 pb-1">
                  <span>{m.home_team} vs {m.away_team}</span>
                  <span className="font-semibold tabular-nums">{m.home_score} – {m.away_score}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {stats.topScorers.length > 0 && (
          <section className="rounded-xl bg-card border p-5">
            <h2 className="text-xl font-bold mb-3">Goalscorers</h2>
            <ol className="space-y-1.5 text-sm">
              {stats.topScorers.map((s: { name: string; goals: number }) => (
                <li key={s.name} className="flex justify-between">
                  <Link
                    to="/football/players/$slug/world-cup-{$year}"
                    params={{ slug: slugify(s.name), year: String(country.year) }}
                    className="hover:text-primary"
                  >
                    {s.name}
                  </Link>
                  <span className="font-semibold tabular-nums">{s.goals}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="text-sm text-muted-foreground">
          <Link to="/football/teams/$slug" params={{ slug: country.countrySlug }} className="text-primary hover:underline">
            → See {country.countryName}'s complete World Cup history
          </Link>
          {" · "}
          {t && (
            <Link to="/football/tournaments/$year" params={{ year: String(country.year) }} className="text-primary hover:underline">
              → Full {country.year} tournament summary
            </Link>
          )}
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
