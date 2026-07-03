// Phase 2.1 — MLS Cup Final edition landing page (SSR, indexable).
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getMlsCupByYear, listMlsCupYears, listMlsCups, getMlsTeamByName, getMlsPlayerBySlug } from "@/lib/seo/mls-entities";
import { breadcrumbList, faqPage, ldScript, sportsEvent } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { slugify } from "@/lib/seo/programmatic";

export const Route = createFileRoute("/mls/cup/$year")({
  loader: ({ params }) => {
    const year = Number(params.year);
    if (!Number.isFinite(year)) throw notFound();
    const edition = getMlsCupByYear(year);
    if (!edition) throw notFound();
    return { edition, year };
  },
  head: ({ params, loaderData }) => {
    const e = loaderData?.edition;
    const url = canonical(`/mls/cup/${params.year}`);
    const title = e
      ? `${e.year} MLS Cup Final — ${e.champion} vs ${e.runnerUp} (${e.result})`
      : `${params.year} MLS Cup Final`;
    const desc = e
      ? `${e.year} MLS Cup Final: ${e.champion} defeated ${e.runnerUp} ${e.result}. MVP: ${e.fmvp}. Full match recap on PlaySports.`
      : "MLS Cup Final recap.";
    const faqs = e
      ? [
          { q: `Who won the ${e.year} MLS Cup?`, a: `${e.champion} won the ${e.year} MLS Cup, defeating ${e.runnerUp} ${e.result}.` },
          { q: `Who won the ${e.year} MLS Cup MVP?`, a: `${e.fmvp} was named MVP of the ${e.year} MLS Cup Final.` },
          { q: `What was the score of the ${e.year} MLS Cup Final?`, a: `${e.champion} beat ${e.runnerUp} ${e.result} in the ${e.year} MLS Cup Final.` },
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
              name: `${e.year} MLS Cup Final`,
              path: `/mls/cup/${e.year}`,
              sport: "Soccer",
              startDate: `${e.year}-12-01`,
              homeTeam: e.champion,
              awayTeam: e.runnerUp,
              status: "ended",
            })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "MLS", path: "/mls" },
              { name: "History", path: "/mls/history" },
              { name: `${e.year} MLS Cup`, path: `/mls/cup/${e.year}` },
            ])),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: MlsCupPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      Edition not found. <Link to="/mls/history" className="underline">Browse MLS history</Link>.
    </div>
  ),
});

function MlsCupPage() {
  const { edition, year } = Route.useLoaderData();
  const years = listMlsCupYears();
  const idx = years.indexOf(year);
  const prev = years[idx + 1];
  const next = years[idx - 1];
  const related = listMlsCups().filter((w) => w.champion === edition.champion && w.year !== year).slice(0, 6);

  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl ring-1 ring-border p-6 relative overflow-hidden bg-gradient-to-br from-[#001f5b] to-[#ed1c24]">
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">MLS · Cup Final</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{edition.year} MLS Cup Final</h1>
          <p className="text-sm text-white/85 mt-1">
            <TeamLink name={edition.champion} /> defeated <TeamLink name={edition.runnerUp} /> {edition.result}
          </p>
          <p className="text-xs text-orange-200 mt-2 font-semibold uppercase tracking-wider">
            MVP: <PlayerLink name={edition.fmvp} />
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stat label="Champion" value={edition.champion} />
        <Stat label="Runner-up" value={edition.runnerUp} />
        <Stat label="Result" value={edition.result} />
      </section>

      <div className="flex items-center justify-between text-sm">
        {prev ? (
          <Link to="/mls/cup/$year" params={{ year: String(prev) }} className="text-orange-300 font-semibold">
            ← {prev} MLS Cup
          </Link>
        ) : <span />}
        {next ? (
          <Link to="/mls/cup/$year" params={{ year: String(next) }} className="text-orange-300 font-semibold">
            {next} MLS Cup →
          </Link>
        ) : <span />}
      </div>

      {related.length > 0 && (
        <section className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-xs uppercase tracking-wider font-bold text-orange-300 mb-3">
            Other {edition.champion} MLS Cup titles
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {related.map((r) => (
              <li key={r.year}>
                <Link to="/mls/cup/$year" params={{ year: String(r.year) }} className="block rounded-xl bg-white/[0.03] hover:bg-white/[0.07] ring-1 ring-border p-2.5 text-sm">
                  <span className="font-black tabular-nums text-orange-300 mr-2">{r.year}</span>
                  <span className="text-white/85">def. {r.runnerUp} {r.result}</span>
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
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</div>
      <div className="text-lg font-extrabold text-white mt-1">{value}</div>
    </div>
  );
}

function TeamLink({ name }: { name: string }) {
  const t = getMlsTeamByName(name);
  if (t) {
    return <Link to="/mls/teams/$slug" params={{ slug: t.slug }} className="font-bold text-white hover:text-orange-200 underline underline-offset-4">{name}</Link>;
  }
  return <span className="font-bold text-white">{name}</span>;
}

function PlayerLink({ name }: { name: string }) {
  if (!name || name.includes(",") || name.includes(" & ")) return <span>{name}</span>;
  const p = getMlsPlayerBySlug(slugify(name));
  if (p) {
    return <Link to="/mls/players/$slug" params={{ slug: p.slug }} className="text-white hover:text-orange-100 underline underline-offset-4">{name}</Link>;
  }
  return <span>{name}</span>;
}
