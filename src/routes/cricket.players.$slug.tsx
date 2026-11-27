import { errorMessage } from "@/lib/error-message";
// Phase 2.1 (cricket) — SSR-friendly player profile.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { getCricketPlayerBySlug, listCricketPlayers } from "@/lib/seo/cricket-entities";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForCricketPlayer } from "@/lib/seo/related";
import { EmptyState, ErrorState } from "@/components/ui/state";

export const Route = createFileRoute("/cricket/players/$slug")({
  loader: async ({ params }) => {
    const player = getCricketPlayerBySlug(params.slug);
    if (!player) throw notFound();
    const aiFaqs = await readCachedFaqs("cricket_player", params.slug);
    return { player, aiFaqs };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Player not found — Cricket" }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.player;
    const url = canonical(`/cricket/players/${params.slug}`);
    const image = "https://www.playsports.online/og-default.png";
    const title = `${p.name} — cricket career records, stats & history`;
    const summary = p.records
      .slice(0, 2)
      .map((r) => `${r.category} (${r.value})`)
      .join("; ");
    const desc = `${p.name}${p.country ? ` (${p.country})` : ""} — records: ${summary || "career cricket profile"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc.slice(0, 200) },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          athlete({
            name: p.name,
            path: `/cricket/players/${params.slug}`,
            sport: "Cricket",
            team: p.country,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Players", path: "/cricket/players" },
            { name: p.name, path: `/cricket/players/${params.slug}` },
          ]),
        ),
        ldScript(
          faqPage(loaderData.aiFaqs && loaderData.aiFaqs.length ? loaderData.aiFaqs : p.faqs),
        ),
      ],
    };
  },
  component: CricketPlayerProfile,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="Could not load this player"
          message={errorMessage(error)}
          onRetry={reset}
        />
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Player not found"
          description="This player is not in the cricket registry yet."
          action={
            <>
              <Link
                to="/cricket/players"
                className="inline-flex min-h-11 items-center rounded-full bg-emerald-500/15 px-4 text-sm font-bold text-emerald-200 ring-1 ring-emerald-500/30"
              >
                Browse players
              </Link>
              <Link
                to="/cricket"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-foreground"
              >
                Cricket hub
              </Link>
            </>
          }
        />
      </div>
    </div>
  ),
});

function CricketPlayerProfile() {
  const { player, aiFaqs } = Route.useLoaderData() as {
    player: import("@/lib/seo/cricket-entities").CricketPlayerEntity;
    aiFaqs: Array<{ q: string; a: string }> | null;
  };
  const related = listCricketPlayers()
    .filter((p) => p.slug !== player.slug && (!player.country || p.country === player.country))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">
            Cricket
          </Link>
          <span className="mx-1">/</span>
          <Link to="/cricket/players" className="hover:underline">
            Players
          </Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{player.name}</span>
        </nav>

        <header className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 grid place-items-center text-2xl font-bold"
            aria-hidden
          >
            {player.name
              .split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{player.name}</h1>
            {player.country && (
              <p className="text-sm text-muted-foreground mt-1">
                {player.flag ?? ""} {player.country}
              </p>
            )}
          </div>
        </header>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Career records ({player.records.length})</h2>
          {player.records.length === 0 ? (
            <EmptyState
              title="No career records yet"
              description="Records for this player are being compiled. Check back soon."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">Career records for {player.name}</caption>
                <thead className="bg-muted/40 text-xs uppercase tracking-wide">
                  <tr>
                    <th scope="col" className="text-left px-3 py-2">
                      Record
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Value
                    </th>
                    <th scope="col" className="text-left px-3 py-2">
                      Context
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {player.records.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2">{r.category}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{r.value}</td>
                      <td className="px-3 py-2 text-muted-foreground">{r.extra ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold">Explore cricket</h2>
          <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Explore cricket">
            <Link
              to="/cricket/rankings"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-emerald-500/40 hover:bg-white/[0.04]"
            >
              ICC rankings →
            </Link>
            <Link
              to="/cricket/records"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-emerald-500/40 hover:bg-white/[0.04]"
            >
              All-time records →
            </Link>
            <Link
              to="/cricket/teams"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-emerald-500/40 hover:bg-white/[0.04]"
            >
              Team profiles →
            </Link>
            <Link
              to="/cricket/players"
              className="inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold transition hover:border-emerald-500/40 hover:bg-white/[0.04]"
            >
              All players →
            </Link>
          </nav>
        </section>

        <FaqSection
          title={`Frequently asked about ${player.name}`}
          items={
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  ...player.faqs,
                  {
                    q: `What are ${player.name}'s best cricket records?`,
                    a: player.records.length
                      ? `${player.name}'s top records include ${player.records
                          .slice(0, 2)
                          .map((r) => `${r.category} with ${r.value}`)
                          .join(" and ")}.`
                      : "Records are currently being updated.",
                  },
                  {
                    q: `Which country does ${player.name} play for?`,
                    a: player.country
                      ? `${player.name} represents ${player.country} in international cricket.`
                      : `${player.name}'s international team is not recorded in this profile.`,
                  },
                ]
          }
        />

        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">Related players</h2>
            <ul className="flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/cricket/players/$slug"
                    params={{ slug: r.slug }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
                  >
                    {r.flag ?? ""} {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <RelatedLinks
          title={`More cricket player pages`}
          links={relatedForCricketPlayer(player.slug, 12)}
        />
      </main>
    </div>
  );
}
