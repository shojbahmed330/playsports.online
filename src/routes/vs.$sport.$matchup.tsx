import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findH2H, h2hMatches } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
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
    // compute tallies for FAQ answers
    let aW = 0, bW = 0, dr = 0;
    let aW = 0, bW = 0, dr = 0;
    matches.forEach((m: { home_team: string; away_team: string; home_score: number; away_score: number; tournament_year: number }) => {
      const aHome = m.home_team === h2h.teamA;
      const aS = aHome ? m.home_score : m.away_score;
      const bS = aHome ? m.away_score : m.home_score;
      if (aS > bS) aW++; else if (aS < bS) bW++; else dr++;
    });
    const lastM = matches[matches.length - 1] as { home_team: string; away_team: string; home_score: number; away_score: number; tournament_year: number } | undefined;
    const lastStr = lastM
      ? `Their most recent World Cup meeting was at the ${lastM.tournament_year} tournament: ${lastM.home_team} ${lastM.home_score}–${lastM.away_score} ${lastM.away_team}.`
      : "No previous World Cup meeting on record.";
    const title = `${h2h.teamA} vs ${h2h.teamB} — World Cup Head-to-Head Record | PlaySports`;
    const desc = `${h2h.teamA} vs ${h2h.teamB} at the FIFA World Cup: ${matches.length} meeting${matches.length === 1 ? "" : "s"}, ${h2h.teamA} ${aW}W · ${dr}D · ${h2h.teamB} ${bW}W. Full history, scores and tournaments.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:image", content: canonical(`/og/vs/${params.matchup}.svg`) },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: canonical(`/og/vs/${params.matchup}.svg`) },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: `${h2h.teamA} vs ${h2h.teamB}`, path },
        ])),
        ldScript(faqPage([
          { q: `How many times have ${h2h.teamA} and ${h2h.teamB} met at the World Cup?`, a: `${h2h.teamA} and ${h2h.teamB} have met ${matches.length} time${matches.length === 1 ? "" : "s"} at the FIFA World Cup finals.` },
          { q: `What is the ${h2h.teamA} vs ${h2h.teamB} World Cup head-to-head record?`, a: `${h2h.teamA} ${aW} wins, ${h2h.teamB} ${bW} wins, ${dr} draw${dr === 1 ? "" : "s"} across ${matches.length} World Cup meeting${matches.length === 1 ? "" : "s"}.` },
          { q: `When did ${h2h.teamA} last play ${h2h.teamB} at the World Cup?`, a: last ? `Their most recent World Cup meeting was at the ${last.year} tournament: ${last.home} ${last.hs}–${last.as} ${last.away}.` : "No previous World Cup meeting on record." },
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

      <AffiliateStrip placement="inline" sport={Route.useParams().sport} />

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
