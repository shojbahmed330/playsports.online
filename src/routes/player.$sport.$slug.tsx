import { errorMessage } from "@/lib/error-message";
import { createFileRoute, notFound, redirect, Link } from "@tanstack/react-router";
import { findPlayer, playerStats } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, athlete, faqPage, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { AdSlot } from "@/components/ads/AdSlot";
import { EmptyState, ErrorState } from "@/components/ui/state";

export const Route = createFileRoute("/player/$sport/$slug")({
  loader: ({ params }) => {
    if (params.sport === "football_wc") {
      throw redirect({ to: "/football/players/$slug", params: { slug: params.slug } });
    }
    const p = findPlayer(params.sport, params.slug);
    if (!p) throw notFound();
    return { player: p, stats: playerStats(p.name) };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return {};
    const { player, stats } = loaderData;
    const path = `/player/${params.sport}/${params.slug}`;
    const title = `${player.name} (${player.team}) — World Cup Goals, Career Stats | PlaySports`;
    const desc = `${player.name} World Cup record: ${stats.goalsTotal} goals over ${stats.years.length} tournaments for ${player.team}. Goal-by-goal breakdown, penalty record, career timeline.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "profile" },
        { property: "og:site_name", content: "PlaySports" },
        { property: "og:image", content: canonical(`/og/player/${params.slug}.svg`) },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: canonical(`/og/player/${params.slug}.svg`) },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(athlete({ name: player.name, path, sport: "Football", team: player.team })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Players", path: "/players" },
            { name: player.name, path },
          ]),
        ),
        ldScript(
          faqPage([
            {
              q: `How many World Cup goals has ${player.name} scored?`,
              a: `${player.name} has scored ${stats.goalsTotal} goal${stats.goalsTotal === 1 ? "" : "s"} at the FIFA World Cup${stats.pen > 0 ? `, including ${stats.pen} from the penalty spot` : ""}.`,
            },
            {
              q: `Which country does ${player.name} play for?`,
              a: `${player.name} represents ${player.team} at the FIFA World Cup.`,
            },
            {
              q: `In which World Cups has ${player.name} played?`,
              a: stats.years.length
                ? `${player.name} appeared at the FIFA World Cup in ${stats.years.join(", ")}.`
                : `${player.name}'s World Cup appearances are not on record.`,
            },
          ]),
        ),
      ],
    };
  },
  component: PlayerPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this player"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <EmptyState
        title="Player not found"
        description="This player is not in the World Cup archive."
        action={
          <Link
            to="/players"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Browse players
          </Link>
        }
      />
    </div>
  ),
});

function PlayerPage() {
  const { player, stats } = Route.useLoaderData();
  return (
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <nav
        aria-label="Breadcrumb"
        className="mb-3 flex flex-wrap items-center text-xs text-muted-foreground"
      >
        <Link
          to="/"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Home
        </Link>
        <span aria-hidden="true"> / </span>
        <Link
          to="/players"
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Players
        </Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground" aria-current="page">
          {player.name}
        </span>
      </nav>
      <h1 className="text-3xl font-bold">{player.name}</h1>
      <p className="text-muted-foreground mb-6">
        <Link
          to="/team/$sport/$slug"
          params={{ sport: "football_wc", slug: slug(player.team) }}
          className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {player.team}
        </Link>
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Goals" value={stats.goalsTotal} />
        <Stat label="Tournaments" value={stats.years.length} />
        <Stat label="Penalties" value={stats.pen} />
        <Stat label="Own goals" value={stats.og} />
      </div>

      <AffiliateStrip placement="inline" sport={Route.useParams().sport} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Goals by Tournament</h2>
        {stats.byYear.length === 0 ? (
          <EmptyState
            title="No goals on record"
            description={`No World Cup goals are recorded for ${player.name}.`}
          />
        ) : (
          <ul className="divide-y rounded-xl border border-border bg-card/40">
            {stats.byYear.map((y: { year: number; goals: number }) => (
              <li key={y.year} className="flex justify-between px-4 py-2">
                <Link
                  to="/archive/$sport/$year"
                  params={{ sport: "football_wc", year: String(y.year) }}
                  className="inline-flex min-h-11 items-center hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  World Cup {y.year}
                </Link>
                <span className="font-mono">
                  {y.goals} goal{y.goals === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdSlot slot="in_content" />

      <section className="mt-8 prose dark:prose-invert max-w-none">
        <h2>About {player.name} at the World Cup</h2>
        <p>
          {player.name} represented {player.team} at the FIFA World Cup, scoring {stats.goalsTotal}{" "}
          goal{stats.goalsTotal === 1 ? "" : "s"} across {stats.years.length} tournament appearance
          {stats.years.length === 1 ? "" : "s"}
          {stats.years.length ? ` (${stats.years.join(", ")})` : ""}.
          {stats.pen > 0 ? ` ${stats.pen} came from the penalty spot.` : ""}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Frequently asked about {player.name}</h2>
        <div className="space-y-3">
          {[
            {
              q: `How many World Cup goals has ${player.name} scored?`,
              a: `${player.name} has scored ${stats.goalsTotal} goal${stats.goalsTotal === 1 ? "" : "s"} at the FIFA World Cup${stats.pen > 0 ? `, including ${stats.pen} from the penalty spot` : ""}.`,
            },
            {
              q: `Which country does ${player.name} play for?`,
              a: `${player.name} represents ${player.team} at the FIFA World Cup.`,
            },
            {
              q: `In which World Cups has ${player.name} played?`,
              a: stats.years.length
                ? `${player.name} appeared at the FIFA World Cup in ${stats.years.join(", ")}.`
                : `${player.name}'s World Cup appearances are not on record.`,
            },
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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
