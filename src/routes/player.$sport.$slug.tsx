import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { findPlayer, playerStats } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, athlete, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { AdSlot } from "@/components/ads/AdSlot";

export const Route = createFileRoute("/player/$sport/$slug")({
  loader: ({ params }) => {
    const p = findPlayer(params.sport, params.slug);
    if (!p) throw notFound();
    return { player: p, stats: playerStats(p.name) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { player, stats } = loaderData;
    const path = `/player/${params.sport}/${params.slug}`;
    const title = `${player.name} (${player.team}) — World Cup Goals, Career Stats | AllSportsLive`;
    const desc = `${player.name} World Cup record: ${stats.goalsTotal} goals over ${stats.years.length} tournaments for ${player.team}. Goal-by-goal breakdown, penalty record, career timeline.`;
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
        ldScript(athlete({ name: player.name, path, sport: "Football", team: player.team })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Players", path: "/players" },
          { name: player.name, path },
        ])),
      ],
    };
  },
  component: PlayerPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Player not found.</div>,
});

function PlayerPage() {
  const { player, stats } = Route.useLoaderData();
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:underline">Home</Link> / <Link to="/players" className="hover:underline">Players</Link> / <span>{player.name}</span>
      </nav>
      <h1 className="text-3xl font-bold">{player.name}</h1>
      <p className="text-muted-foreground mb-6">
        <Link to="/team/$sport/$slug" params={{ sport: "football_wc", slug: slug(player.team) }} className="hover:underline">{player.team}</Link>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Goals" value={stats.goalsTotal} />
        <Stat label="Tournaments" value={stats.years.length} />
        <Stat label="Penalties" value={stats.pen} />
        <Stat label="Own goals" value={stats.og} />
      </div>

      <AffiliateStrip placement="inline" sport="football" />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Goals by Tournament</h2>
        <ul className="divide-y rounded-lg border">
          {stats.byYear.map((y: { year: number; goals: number }) => (
            <li key={y.year} className="flex justify-between px-4 py-2">
              <Link to="/archive/$sport/$year" params={{ sport: "football_wc", year: String(y.year) }} className="hover:underline">World Cup {y.year}</Link>
              <span className="font-mono">{y.goals} goal{y.goals === 1 ? "" : "s"}</span>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot slot="in_content" />

      <section className="mt-8 prose dark:prose-invert max-w-none">
        <h2>About {player.name} at the World Cup</h2>
        <p>
          {player.name} represented {player.team} at the FIFA World Cup, scoring {stats.goalsTotal} goal{stats.goalsTotal === 1 ? "" : "s"} across {stats.years.length} tournament appearance{stats.years.length === 1 ? "" : "s"}
          {stats.years.length ? ` (${stats.years.join(", ")})` : ""}.
          {stats.pen > 0 ? ` ${stats.pen} came from the penalty spot.` : ""}
        </p>
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
