import { createFileRoute, notFound, redirect, Link } from "@tanstack/react-router";
import { findTeam, teamStats, listTeams } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, sportsTeam, faqPage, itemList, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { AdSlot } from "@/components/ads/AdSlot";


export const Route = createFileRoute("/team/$sport/$slug")({
  loader: ({ params }) => {
    if (params.sport === "football_wc") {
      throw redirect({ to: "/football/teams/$slug", params: { slug: params.slug } });
    }
    const team = findTeam(params.sport, params.slug);
    if (!team) throw notFound();
    return { team, stats: teamStats(team.name) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { team, stats } = loaderData;
    const path = `/team/${params.sport}/${params.slug}`;
    const title = `${team.name} — World Cup History, Stats, Top Scorers | PlaySports`;
    const desc = `${team.name} at the FIFA World Cup: ${stats.matchesPlayed} matches, ${stats.w}W-${stats.d}D-${stats.l}L, ${stats.goalsTotal} goals scored. Tournament appearances, leading goal-scorers, recent results.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "profile" },
        { property: "og:image", content: canonical(`/og/team/${params.slug}.svg`) },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: canonical(`/og/team/${params.slug}.svg`) },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(sportsTeam({ name: team.name, path, sport: "Football", league: "FIFA World Cup" })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Football", path: "/football" },
          { name: team.name, path },
        ])),
        ldScript(itemList({
          name: `${team.name} top World Cup scorers`,
          path,
          items: stats.topScorers.slice(0, 10).map((p: { name: string; goals: number }) => ({
            name: `${p.name} (${p.goals} goals)`,
            path: `/player/football_wc/${p.name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
          })),
        })),
        ldScript(faqPage([
          { q: `How many World Cup matches has ${team.name} played?`, a: `${team.name} has played ${stats.matchesPlayed} FIFA World Cup matches across ${stats.years.length} tournament appearances, with a record of ${stats.w} wins, ${stats.d} draws and ${stats.l} losses.` },
          { q: `Who is ${team.name}'s all-time top World Cup scorer?`, a: stats.topScorers[0] ? `${stats.topScorers[0].name} leads ${team.name} with ${stats.topScorers[0].goals} World Cup goals.` : `${team.name} does not yet have a leading World Cup scorer on record.` },
          { q: `How many World Cup goals has ${team.name} scored?`, a: `${team.name} has scored ${stats.gf} goals and conceded ${stats.ga} at the FIFA World Cup finals.` },
          { q: `When did ${team.name} appear at the World Cup?`, a: stats.years.length ? `${team.name} appeared at the FIFA World Cup in ${stats.years.join(", ")}.` : `${team.name} has no recorded World Cup appearances yet.` },
        ])),
      ],

    };
  },
  component: TeamPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Team not found.</div>,
});

function TeamPage() {
  const { team, stats } = Route.useLoaderData();
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-5xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> / <Link to="/football" className="hover:underline">Football</Link> / <span>{team.name}</span>
      </nav>
      <h1 className="text-3xl font-bold mb-2">{team.name} — FIFA World Cup</h1>
      <p className="text-muted-foreground mb-6">{stats.matchesPlayed} matches played across {stats.years.length} tournaments.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Stat label="Played" value={stats.matchesPlayed} />
        <Stat label="Wins" value={stats.w} />
        <Stat label="Draws" value={stats.d} />
        <Stat label="Losses" value={stats.l} />
        <Stat label="Goals (GF-GA)" value={`${stats.gf}-${stats.ga}`} />
      </div>

      <AffiliateStrip placement="inline" sport={Route.useParams().sport} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Top Scorers for {team.name}</h2>
        <ul className="divide-y rounded-lg border">
          {stats.topScorers.map((p: { name: string; goals: number }) => (
            <li key={p.name} className="flex justify-between px-4 py-2">
              <Link to="/player/$sport/$slug" params={{ sport: "football_wc", slug: slug(p.name) }} className="hover:underline">{p.name}</Link>
              <span className="font-mono">{p.goals}</span>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="in_content" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Recent World Cup Matches</h2>
        <ul className="space-y-2">
          {stats.recentMatches.map((m: any, i: number) => (
            <li key={i} className="flex justify-between border rounded px-3 py-2 text-sm">
              <span>{m.match_date} · {m.round}</span>
              <span className="font-medium">{m.home_team} {m.home_score}–{m.away_score} {m.away_team}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Tournament Appearances</h2>
        <div className="flex flex-wrap gap-2">
          {stats.years.map((y: number) => (
            <Link key={y} to="/archive/$sport/$year" params={{ sport: "football_wc", year: String(y) }} className="px-3 py-1 rounded-full bg-muted text-sm hover:bg-accent">{y}</Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Frequently asked about {team.name} at the World Cup</h2>
        <div className="space-y-3">
          {[
            { q: `How many World Cup matches has ${team.name} played?`, a: `${team.name} has played ${stats.matchesPlayed} FIFA World Cup matches across ${stats.years.length} tournament appearances, with a record of ${stats.w} wins, ${stats.d} draws and ${stats.l} losses.` },
            { q: `Who is ${team.name}'s all-time top World Cup scorer?`, a: stats.topScorers[0] ? `${stats.topScorers[0].name} leads ${team.name} with ${stats.topScorers[0].goals} World Cup goals.` : `${team.name} does not yet have a leading World Cup scorer on record.` },
            { q: `How many World Cup goals has ${team.name} scored?`, a: `${team.name} has scored ${stats.gf} goals and conceded ${stats.ga} at the FIFA World Cup finals.` },
          ].map((f) => (
            <details key={f.q} className="rounded-lg border px-4 py-3">
              <summary className="font-medium cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Explore more World Cup teams</h2>
        <div className="flex flex-wrap gap-2">
          {listTeams().filter((t) => t.slug !== Route.useParams().slug).slice(0, 20).map((t) => (
            <Link key={t.slug} to="/team/$sport/$slug" params={{ sport: "football_wc", slug: t.slug }} className="px-3 py-1 rounded-full bg-muted text-xs hover:bg-accent">{t.name}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}


function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
