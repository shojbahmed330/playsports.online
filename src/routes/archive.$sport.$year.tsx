import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { archiveStats } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/archive/$sport/$year")({
  loader: ({ params }) => {
    const y = Number(params.year);
    if (!Number.isFinite(y)) throw notFound();
    const stats = archiveStats(y);
    if (!stats.matches.length && !stats.goals.length && !stats.champion) throw notFound();
    return { year: y, stats };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { year, stats } = loaderData;
    const path = `/archive/${params.sport}/${params.year}`;
    const title = `FIFA World Cup ${year} — Results, Top Scorers, Champion | PlaySports`;
    const desc = `Complete archive of the ${year} FIFA World Cup: ${stats.matches.length} matches, ${stats.goals.length} goals, top scorers${stats.champion ? `, champion ${stats.champion.champion}` : ""}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
        { property: "og:image", content: canonical(`/og/archive/${params.year}--${params.sport}.svg`) },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: canonical(`/og/archive/${params.year}--${params.sport}.svg`) },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: `World Cup ${year}`, path },
        ])),
        ldScript(itemList({
          name: `${year} World Cup top scorers`,
          path,
          items: stats.topScorers.slice(0, 10).map((p: { name: string; team: string; goals: number }) => ({
            name: `${p.name} (${p.team}, ${p.goals} goals)`,
            path: `/player/football_wc/${p.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
          })),
        })),
        ldScript(faqPage([
          { q: `Who won the ${year} FIFA World Cup?`, a: stats.champion ? `${stats.champion.champion} won the ${year} FIFA World Cup${stats.champion.runnerUp ? `, beating ${stats.champion.runnerUp} in the final` : ""}.` : `The ${year} FIFA World Cup champion is not yet on record.` },
          { q: `Who was the top scorer at the ${year} World Cup?`, a: stats.topScorers[0] ? `${stats.topScorers[0].name} of ${stats.topScorers[0].team} was the leading scorer of the ${year} World Cup with ${stats.topScorers[0].goals} goals.` : `Top scorer for ${year} is not on record.` },
          { q: `How many matches were played at the ${year} World Cup?`, a: `${stats.matches.length} matches and ${stats.goals.length} goals were recorded at the ${year} FIFA World Cup finals.` },
        ])),
      ],

    };
  },
  component: ArchivePage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Season not found.</div>,
});

function ArchivePage() {
  const { year, stats } = Route.useLoaderData();
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> / <Link to="/football" className="hover:underline">Football</Link> / <span>WC {year}</span>
      </nav>
      <h1 className="text-3xl font-bold mb-2">FIFA World Cup {year}</h1>
      {stats.champion && (
        <p className="text-lg mb-4">
          🏆 Champion: <strong>{stats.champion.champion}</strong>
          {stats.champion.runnerUp ? <> · Runner-up: {stats.champion.runnerUp}</> : null}
          {stats.champion.thirdPlace ? <> · 3rd: {stats.champion.thirdPlace}</> : null}
        </p>
      )}

      <AffiliateStrip placement="inline" sport={Route.useParams().sport} />

      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Top Scorers</h2>
        <ul className="divide-y rounded-lg border">
          {stats.topScorers.map((p: { name: string; team: string; goals: number }) => (
            <li key={p.name} className="flex justify-between px-4 py-2">
              <Link to="/player/$sport/$slug" params={{ sport: "football_wc", slug: slug(p.name) }} className="hover:underline">{p.name} <span className="text-muted-foreground text-xs">· {p.team}</span></Link>
              <span className="font-mono">{p.goals}</span>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="in_content" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">All Matches ({stats.matches.length})</h2>
        <ul className="space-y-2">
          {stats.matches.map((m: any, i: number) => (
            <li key={i} className="flex justify-between border rounded px-3 py-2 text-sm">
              <span>{m.match_date} · {m.round}</span>
              <span className="font-medium">{m.home_team} {m.home_score}–{m.away_score} {m.away_team}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Frequently asked about the {year} World Cup</h2>
        <div className="space-y-3">
          {[
            { q: `Who won the ${year} FIFA World Cup?`, a: stats.champion ? `${stats.champion.champion} won the ${year} FIFA World Cup${stats.champion.runnerUp ? `, beating ${stats.champion.runnerUp} in the final` : ""}.` : `The ${year} FIFA World Cup champion is not yet on record.` },
            { q: `Who was the top scorer at the ${year} World Cup?`, a: stats.topScorers[0] ? `${stats.topScorers[0].name} of ${stats.topScorers[0].team} was the leading scorer of the ${year} World Cup with ${stats.topScorers[0].goals} goals.` : `Top scorer for ${year} is not on record.` },
            { q: `How many matches were played at the ${year} World Cup?`, a: `${stats.matches.length} matches and ${stats.goals.length} goals were recorded at the ${year} FIFA World Cup finals.` },
          ].map((f) => (
            <details key={f.q} className="rounded-lg border px-4 py-3">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}


function slug(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
