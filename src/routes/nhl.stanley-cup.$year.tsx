// Phase 2.1 — Stanley Cup Finals edition landing page (SSR, indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getStanleyCupByYear, listStanleyCupYears, listStanleyCups, getNhlTeamByName } from "@/lib/seo/nhl-entities";
import { breadcrumbList, faqPage, ldScript, sportsEvent } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { slugify } from "@/lib/seo/programmatic";

import { withYearNav } from "@/components/seo/withYearNav";
export const Route = createFileRoute("/nhl/stanley-cup/$year")({
  loader: ({ params }) => {
    const year = Number(params.year);
    if (!Number.isFinite(year)) throw notFound();
    const edition = getStanleyCupByYear(year);
    if (!edition) throw notFound();
    return { edition, year };
  },
  head: ({ params, loaderData }) => {
    const e = loaderData?.edition;
    const url = canonical(`/nhl/stanley-cup/${params.year}`);
    const title = e
      ? `${e.year} Stanley Cup Finals — ${e.champion} vs ${e.runnerUp} (${e.result})`
      : `${params.year} Stanley Cup Finals`;
    const desc = e
      ? `${e.year} NHL Stanley Cup Finals: ${e.champion} defeated the ${e.runnerUp} ${e.result}. Conn Smythe: ${e.fmvp}. Full series recap on PlaySports.`
      : "NHL Stanley Cup Finals recap.";
    const faqs = e
      ? [
          { q: `Who won the ${e.year} Stanley Cup?`, a: `The ${e.champion} won the ${e.year} Stanley Cup, defeating the ${e.runnerUp} ${e.result}.` },
          { q: `Who won the ${e.year} Conn Smythe Trophy?`, a: `${e.fmvp} was awarded the Conn Smythe Trophy as MVP of the ${e.year} Stanley Cup Playoffs.` },
          { q: `What was the score of the ${e.year} Stanley Cup Finals?`, a: `The ${e.champion} won the series ${e.result} over the ${e.runnerUp}.` },
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
              name: `${e.year} Stanley Cup Finals`,
              path: `/nhl/stanley-cup/${e.year}`,
              sport: "Ice Hockey",
              startDate: `${e.year}-06-01`,
              homeTeam: e.champion,
              awayTeam: e.runnerUp,
              status: "ended",
            })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "NHL", path: "/nhl" },
              { name: "History", path: "/nhl/history" },
              { name: `${e.year} Stanley Cup`, path: `/nhl/stanley-cup/${e.year}` },
            ])),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: withYearNav(StanleyCupPage, { basePath: "/nhl/stanley-cup", minYear: 1918, maxYear: 2025, label: "Stanley Cup" }),
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      Edition not found. <Link to="/nhl/history" className="underline">Browse NHL history</Link>.
    </div>
  ),
});

function StanleyCupPage() {
  const { edition, year } = Route.useLoaderData();
  const years = listStanleyCupYears();
  const idx = years.indexOf(year);
  const prev = years[idx + 1];
  const next = years[idx - 1];
  const related = listStanleyCups().filter((w) => w.champion === edition.champion && w.year !== year).slice(0, 6);

  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl ring-1 ring-border p-6 relative overflow-hidden bg-gradient-to-br from-[#041e42] to-[#c8102e]">
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">NHL · Stanley Cup Finals</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{edition.year} Stanley Cup Finals</h1>
          <p className="text-sm text-white/85 mt-1">
            <TeamLink name={edition.champion} /> defeated <TeamLink name={edition.runnerUp} /> {edition.result}
          </p>
          <p className="text-xs text-orange-200 mt-2 font-semibold uppercase tracking-wider">
            Conn Smythe: <PlayerLink name={edition.fmvp} />
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
          <Link to="/nhl/stanley-cup/$year" params={{ year: String(prev) }} className="text-orange-300 font-semibold">
            ← {prev} Stanley Cup
          </Link>
        ) : <span />}
        {next ? (
          <Link to="/nhl/stanley-cup/$year" params={{ year: String(next) }} className="text-orange-300 font-semibold">
            {next} Stanley Cup →
          </Link>
        ) : <span />}
      </div>

      {related.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-orange-300 mb-3">
            Other {edition.champion} championships
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {related.map((w) => (
              <li key={w.year}>
                <Link to="/nhl/stanley-cup/$year" params={{ year: String(w.year) }}
                  className="block rounded-xl bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-border p-2.5 text-sm">
                  <span className="font-black tabular-nums text-orange-300">{w.year}</span>
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
  const t = getNhlTeamByName(name);
  if (t) {
    return (
      <Link to="/nhl/teams/$slug" params={{ slug: t.slug }} className="font-bold text-white hover:text-orange-200">
        {name}
      </Link>
    );
  }
  return <span className="font-bold text-white">{name}</span>;
}

function PlayerLink({ name }: { name: string }) {
  if (name.includes(" & ") || name.includes(",")) return <span className="text-white">{name}</span>;
  return (
    <Link to="/nhl/players/$slug" params={{ slug: slugify(name) }} className="text-white hover:text-orange-200">
      {name}
    </Link>
  );
}
