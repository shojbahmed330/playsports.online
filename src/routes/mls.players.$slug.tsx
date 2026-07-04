// Phase 2.1 — Historical MLS player landing page (SSR, slug-based).
// Sources MLS Cup MVP honors from src/data/mls/history.json.
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getMlsPlayerBySlug, getMlsTeamByName } from "@/lib/seo/mls-entities";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeaguePlayer } from "@/lib/seo/related";

export const Route = createFileRoute("/mls/players/$slug")({
  loader: ({ params }) => {
    const player = getMlsPlayerBySlug(params.slug);
    if (!player) throw notFound();
    return { player };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.player;
    const url = canonical(`/mls/players/${params.slug}`);
    const mvps = p ? p.honors.length : 0;
    const title = p
      ? `${p.name} — MLS Career Honors, MLS Cup MVP Awards`
      : "MLS Player — PlaySports";
    const desc = p
      ? `${p.name} — ${mvps}× MLS Cup MVP. Full career honors and MLS Cup Final recap on PlaySports.`
      : "MLS player career honors, awards and MLS Cup records.";
    const faqs = p
      ? [
          {
            q: `How many MLS Cup MVP awards has ${p.name} won?`,
            a: `${p.name} has won the MLS Cup Most Valuable Player award ${mvps} time${mvps === 1 ? "" : "s"} (${p.honors.map((h) => h.year).join(", ")}).`,
          },
          {
            q: `Which team did ${p.name} win the MLS Cup MVP with?`,
            a: `${p.name} won with ${p.honors.map((h) => `${h.team} (${h.year})`).join(", ")}.`,
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
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            ldScript(athlete({ name: p.name, path: `/mls/players/${p.slug}`, sport: "Soccer" })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "MLS", path: "/mls" },
              { name: "Players", path: "/mls/leaders" },
              { name: p.name, path: `/mls/players/${p.slug}` },
            ])),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: PlayerSlugPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      Player not found. <Link to="/mls/leaders" className="underline">Browse MLS leaders</Link>.
    </div>
  ),
});

function PlayerSlugPage() {
  const { player } = Route.useLoaderData();
  const sorted = [...player.honors].sort((a, b) => b.year - a.year);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl ring-1 ring-border p-6 relative overflow-hidden bg-gradient-to-br from-[#001f5b] to-[#ed1c24]">
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">MLS · Career Honors</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{player.name}</h1>
          <p className="text-sm text-white/85 mt-1">{player.honors.length}× MLS Cup MVP</p>
        </div>
      </header>

      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-sm font-bold text-white mb-3">MLS Cup Most Valuable Player</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sorted.map((h, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.03] ring-1 ring-border p-2.5 text-sm">
              <span className="font-black tabular-nums text-orange-300 w-14">{h.year}</span>
              <span className="flex-1 text-white">MLS Cup MVP</span>
              <TeamPill teamName={h.team} />
              <Link to="/mls/cup/$year" params={{ year: String(h.year) }} className="text-[10px] uppercase tracking-wider text-orange-300 hover:text-orange-200">
                Final →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RelatedLinks title={`More MLS player pages`} links={relatedForLeaguePlayer("mls", player.slug, undefined, 12)} />
    </div>
  );
}

function TeamPill({ teamName }: { teamName: string }) {
  const t = getMlsTeamByName(teamName);
  if (t) {
    return (
      <Link to="/mls/teams/$slug" params={{ slug: t.slug }} className="text-xs font-bold text-white/80 hover:text-white">
        {t.abbr}
      </Link>
    );
  }
  return <span className="text-xs text-muted-foreground">{teamName}</span>;
}
