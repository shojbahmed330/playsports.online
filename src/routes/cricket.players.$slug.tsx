// Phase 2.1 (cricket) — SSR-friendly player profile.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import {
  athlete,
  breadcrumbList,
  faqPage,
  ldScript,
} from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import {
  getCricketPlayerBySlug,
  listCricketPlayers,
} from "@/lib/seo/cricket-entities";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";

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
        meta: [
          { title: "Player not found — Cricket" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const p = loaderData.player;
    const url = canonical(`/cricket/players/${params.slug}`);
    const title = `${p.name} — cricket career records, stats & history`;
    const summary = p.records.slice(0, 2).map((r) => `${r.category} (${r.value})`).join("; ");
    const desc = `${p.name}${p.country ? ` (${p.country})` : ""} — records: ${summary || "career cricket profile"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
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
        ldScript(faqPage(loaderData.aiFaqs && loaderData.aiFaqs.length ? loaderData.aiFaqs : p.faqs)),
      ],
    };
  },
  component: CricketPlayerProfile,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <p className="text-lg font-semibold">Couldn't load player</p>
      <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="text-lg font-semibold">Player not found</p>
        <Link to="/cricket/players" className="mt-4 inline-block text-emerald-400 hover:underline text-sm">
          ← Browse cricket players
        </Link>
      </div>
    </div>
  ),
});

function CricketPlayerProfile() {
  const { player, aiFaqs } = Route.useLoaderData() as { player: import("@/lib/seo/cricket-entities").CricketPlayerEntity; aiFaqs: Array<{ q: string; a: string }> | null };
  const related = listCricketPlayers()
    .filter((p) => p.slug !== player.slug && (!player.country || p.country === player.country))
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SportNav />
      <CricketSubNav />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <nav className="text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:underline">Home</Link>
          <span className="mx-1">/</span>
          <Link to="/cricket" className="hover:underline">Cricket</Link>
          <span className="mx-1">/</span>
          <Link to="/cricket/players" className="hover:underline">Players</Link>
          <span className="mx-1">/</span>
          <span className="text-foreground">{player.name}</span>
        </nav>

        <header className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600 grid place-items-center text-2xl font-bold"
            aria-hidden
          >
            {player.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
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
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-3 py-2">Record</th>
                  <th className="text-left px-3 py-2">Value</th>
                  <th className="text-left px-3 py-2">Context</th>
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
        </section>

        <FaqSection
          title="Frequently asked"
          items={aiFaqs && aiFaqs.length ? aiFaqs : player.faqs}
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
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/60"
                  >
                    {r.flag ?? ""} {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
