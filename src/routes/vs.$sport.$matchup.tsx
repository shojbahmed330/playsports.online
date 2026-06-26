import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findH2H, h2hMatches } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/vs/$sport/$matchup")({
  loader: ({ params }) => {
    const h = findH2H(params.sport, params.matchup);
    if (!h) throw notFound();
    return { h2h: h, matches: h2hMatches(h.teamA, h.teamB) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { h2h, matches } = loaderData;
    const path = `/vs/${params.sport}/${params.matchup}`;
    const title = `${h2h.teamA} vs ${h2h.teamB} — Head-to-Head Record at the FIFA World Cup`;
    const desc = `${h2h.teamA} and ${h2h.teamB} have met ${matches.length} time${matches.length === 1 ? "" : "s"} at the FIFA World Cup. Full historical record, last meeting, scores and tournaments.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: `${h2h.teamA} vs ${h2h.teamB}`, path },
        ])),
      ],
    };
  },
  component: H2HPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Matchup not found.</div>,
});

function H2HPage() {
  const { h2h, matches } = Route.useLoaderData();
  // tally
  let aW = 0, bW = 0, dr = 0, aG = 0, bG = 0;
  matches.forEach((m: any) => {
    const aHome = m.home_team === h2h.teamA;
    const aScore = aHome ? m.home_score : m.away_score;
    const bScore = aHome ? m.away_score : m.home_score;
    aG += aScore; bG += bScore;
    if (aScore > bScore) aW++;
    else if (aScore < bScore) bW++;
    else dr++;
  });

  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> / <Link to="/football" className="hover:underline">Football</Link> / <span>H2H</span>
      </nav>
      <h1 className="text-3xl font-bold mb-2">{h2h.teamA} vs {h2h.teamB}</h1>
      <p className="text-muted-foreground mb-6">FIFA World Cup head-to-head record across {matches.length} meeting{matches.length === 1 ? "" : "s"}.</p>

      <div className="grid grid-cols-3 gap-3 mb-6 text-center">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">{h2h.teamA} wins</div>
          <div className="text-3xl font-bold">{aW}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">Draws</div>
          <div className="text-3xl font-bold">{dr}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground">{h2h.teamB} wins</div>
          <div className="text-3xl font-bold">{bW}</div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">Aggregate goals: {h2h.teamA} {aG} — {bG} {h2h.teamB}</p>

      <AffiliateStrip placement="inline" sport="football" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">All Meetings</h2>
        <ul className="space-y-2">
          {matches.map((m: any, i: number) => (
            <li key={i} className="flex justify-between border rounded px-3 py-2 text-sm">
              <span>{m.match_date} · WC {m.tournament_year}</span>
              <span className="font-medium">{m.home_team} {m.home_score}–{m.away_score} {m.away_team}</span>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="in_content" />

      <section className="mt-8 flex gap-2">
        <Link to="/team/$sport/$slug" params={{ sport: "football_wc", slug: slug(h2h.teamA) }} className="px-3 py-2 rounded border hover:bg-accent">View {h2h.teamA}</Link>
        <Link to="/team/$sport/$slug" params={{ sport: "football_wc", slug: slug(h2h.teamB) }} className="px-3 py-2 rounded border hover:bg-accent">View {h2h.teamB}</Link>
      </section>
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
