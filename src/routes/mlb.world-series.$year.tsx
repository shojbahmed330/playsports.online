// Phase 2.1 — World Series edition landing page (SSR, indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getWorldSeriesByYear, listWorldSeriesYears, listWorldSeries } from "@/lib/seo/mlb-entities";
import { breadcrumbList, faqPage, ldScript, sportsEvent } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { slugify } from "@/lib/seo/programmatic";

export const Route = createFileRoute("/mlb/world-series/$year")({
  loader: ({ params }) => {
    const year = Number(params.year);
    if (!Number.isFinite(year)) throw notFound();
    const edition = getWorldSeriesByYear(year);
    if (!edition) throw notFound();
    return { edition, year };
  },
  head: ({ params, loaderData }) => {
    const e = loaderData?.edition;
    const url = canonical(`/mlb/world-series/${params.year}`);
    const title = e
      ? `${e.year} World Series — ${e.champion} vs ${e.runnerUp} (${e.result})`
      : `${params.year} World Series`;
    const desc = e
      ? `${e.year} MLB World Series: ${e.champion} defeated the ${e.runnerUp} ${e.result}. World Series MVP: ${e.mvp}. Full series recap on PlaySports.`
      : "MLB World Series recap.";
    const faqs = e
      ? [
          { q: `Who won the ${e.year} World Series?`, a: `The ${e.champion} won the ${e.year} World Series, defeating the ${e.runnerUp} ${e.result}.` },
          { q: `Who was the ${e.year} World Series MVP?`, a: `${e.mvp} was named World Series MVP of the ${e.year} Fall Classic.` },
          { q: `What was the score of the ${e.year} World Series?`, a: `The ${e.champion} won the series ${e.result} over the ${e.runnerUp}.` },
        ]
      : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: e
        ? [
            ldScript(sportsEvent({
              name: `${e.year} World Series`,
              path: `/mlb/world-series/${e.year}`,
              sport: "Baseball",
              startDate: `${e.year}-10-01`,
              homeTeam: e.champion,
              awayTeam: e.runnerUp,
              status: "ended",
            })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "MLB", path: "/mlb" },
              { name: "History", path: "/mlb/history" },
              { name: `${e.year} World Series`, path: `/mlb/world-series/${e.year}` },
            ])),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: WorldSeriesPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      Edition not found. <Link to="/mlb/history" className="underline">Browse MLB history</Link>.
    </div>
  ),
});

function WorldSeriesPage() {
  const { edition, year } = Route.useLoaderData();
  const years = listWorldSeriesYears();
  const idx = years.indexOf(year);
  const prev = years[idx + 1];
  const next = years[idx - 1];
  const related = listWorldSeries()
    .filter((w) => w.champion === edition.champion && w.year !== year)
    .slice(0, 6);

  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15 p-6 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-40" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">MLB · World Series</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{edition.year} World Series</h1>
          <p className="text-sm text-white/80 mt-1">
            <TeamLink name={edition.champion} /> defeated <TeamLink name={edition.runnerUp} /> {edition.result}
          </p>
          <p className="text-xs text-[#f7e6c4] mt-2 font-semibold uppercase tracking-wider">
            MVP: <PlayerLink name={edition.mvp} />
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Champion" value={edition.champion} />
        <Stat label="Runner-up" value={edition.runnerUp} />
        <Stat label="Series result" value={edition.result} />
      </section>

      <div className="flex items-center justify-between text-sm">
        {prev ? (
          <Link to="/mlb/world-series/$year" params={{ year: String(prev) }} className="text-[#f7e6c4] font-semibold">
            ← {prev} World Series
          </Link>
        ) : <span />}
        {next ? (
          <Link to="/mlb/world-series/$year" params={{ year: String(next) }} className="text-[#f7e6c4] font-semibold">
            {next} World Series →
          </Link>
        ) : <span />}
      </div>

      {related.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[#f7e6c4] mb-3">
            Other {edition.champion} championships
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {related.map((w) => (
              <li key={w.year}>
                <Link to="/mlb/world-series/$year" params={{ year: String(w.year) }}
                  className="block rounded-xl bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-border p-2.5 text-sm">
                  <span className="font-black tabular-nums text-[#f7e6c4]">{w.year}</span>
                  <span className="ml-2 text-white">vs {w.runnerUp}</span>
                  <span className="ml-2 text-muted-foreground">({w.result})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className="mt-1 text-lg font-extrabold text-white">{value}</div>
    </div>
  );
}

function TeamLink({ name }: { name: string }) {
  // Historical franchise names may not match current entity (e.g. "Cleveland Indians", "Anaheim Angels", "Florida Marlins").
  // Attempt slug lookup by current mapping first; fall back to plain text.
  const guess = slugify(name);
  return (
    <Link to="/mlb/teams/$slug" params={{ slug: guess }} className="font-bold text-white hover:text-[#f7e6c4]">
      {name}
    </Link>
  );
}

function PlayerLink({ name }: { name: string }) {
  if (name.includes(" & ") || name.includes(",")) return <span className="text-white">{name}</span>;
  return (
    <Link to="/mlb/players/$slug" params={{ slug: slugify(name) }} className="text-white hover:text-[#f7e6c4]">
      {name}
    </Link>
  );
}
