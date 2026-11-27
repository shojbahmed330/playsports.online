// Phase 2.1 — Historical NBA player landing page (SSR, slug-based).
// Sources honors (Finals MVP) from history.json.
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getNbaPlayerBySlug, getNbaTeamByName } from "@/lib/seo/nba-entities";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeaguePlayer } from "@/lib/seo/related";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/nba/players/$slug")({
  loader: ({ params }) => {
    const player = getNbaPlayerBySlug(params.slug);
    if (!player) throw notFound();
    return { player };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.player;
    const url = canonical(`/nba/players/${params.slug}`);
    const count = p ? p.honors.length : 0;
    const title = p
      ? `${p.name} — NBA Career Honors, Finals MVP & Championships`
      : "NBA Player — PlaySports";
    const desc = p
      ? `${p.name} — ${count}× NBA Finals MVP (${p.honors.map((h) => h.year).join(", ")}). Championship recap and career honors on PlaySports.`
      : "NBA player career honors, awards and championship records.";
    const faqs = p
      ? [
          {
            q: `How many Finals MVP awards has ${p.name} won?`,
            a: `${p.name} has won the NBA Finals MVP ${count} time${count === 1 ? "" : "s"} (${p.honors.map((h) => h.year).join(", ")}).`,
          },
          {
            q: `Which teams did ${p.name} win the Finals MVP with?`,
            a: `${p.name} won with the ${p.honors.map((h) => `${h.team} (${h.year})`).join(", ")}.`,
          },
        ]
      : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(p ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            ldScript(
              athlete({ name: p.name, path: `/nba/players/${p.slug}`, sport: "Basketball" }),
            ),
            ldScript(
              breadcrumbList([
                { name: "Home", path: "/" },
                { name: "NBA", path: "/nba" },
                { name: "Players", path: "/nba/leaders" },
                { name: p.name, path: `/nba/players/${p.slug}` },
              ]),
            ),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: PlayerSlugPage,
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
    <div className="py-10">
      <EmptyState
        title="Player not found"
        description="This player is not in the NBA honors archive."
        action={
          <Link
            to="/nba/leaders"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Browse NBA leaders
          </Link>
        }
      />
    </div>
  ),
});

function PlayerSlugPage() {
  const { player } = Route.useLoaderData();
  const sorted = [...player.honors].sort((a, b) => b.year - a.year);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl ring-1 ring-border p-6 relative overflow-hidden bg-gradient-to-br from-[#17408b] to-[#f58426]">
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">
            NBA · Career Honors
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{player.name}</h1>
          <p className="text-sm text-white/85 mt-1">{player.honors.length}× NBA Finals MVP</p>
        </div>
      </header>

      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-sm font-bold text-foreground mb-3">Finals MVP</h2>
        {sorted.length === 0 ? (
          <EmptyState
            title="No Finals MVP honors"
            description={`No Finals MVP awards are recorded for ${player.name}.`}
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sorted.map((h, i) => (
              <li
                key={i}
                className="flex min-h-11 items-center gap-3 rounded-xl bg-muted/40 ring-1 ring-border p-2.5 text-sm"
              >
                <span className="font-black tabular-nums text-orange-300 w-14">{h.year}</span>
                <span className="flex-1 text-foreground">Finals MVP</span>
                <TeamPill teamName={h.team} />
                <Link
                  to="/nba/finals/$year"
                  params={{ year: String(h.year) }}
                  className="inline-flex min-h-11 items-center text-[10px] uppercase tracking-wider text-orange-300 hover:text-orange-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Series →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RelatedLinks
        title={`More NBA player pages`}
        links={relatedForLeaguePlayer("nba", player.slug, undefined, 12)}
      />
    </div>
  );
}

function TeamPill({ teamName }: { teamName: string }) {
  const t = getNbaTeamByName(teamName);
  if (t) {
    return (
      <Link
        to="/nba/teams/$slug"
        params={{ slug: t.slug }}
        className="inline-flex min-h-11 items-center rounded-lg px-1 text-xs font-bold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t.abbr}
      </Link>
    );
  }
  return <span className="text-xs text-muted-foreground">{teamName}</span>;
}
