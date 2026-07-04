// Phase 2.1 — Historical NHL player landing page (SSR, slug-based).
// Sources honors (Conn Smythe / Playoffs MVP) from history.json.
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getNhlPlayerBySlug, getNhlTeamByName } from "@/lib/seo/nhl-entities";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForLeaguePlayer } from "@/lib/seo/related";

export const Route = createFileRoute("/nhl/players/$slug")({
  loader: ({ params }) => {
    const player = getNhlPlayerBySlug(params.slug);
    if (!player) throw notFound();
    return { player };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.player;
    const url = canonical(`/nhl/players/${params.slug}`);
    const smythe = p ? p.honors.length : 0;
    const title = p
      ? `${p.name} — NHL Career Honors, Conn Smythe & Stanley Cups`
      : "NHL Player — PlaySports";
    const desc = p
      ? `${p.name} — ${smythe}× Conn Smythe Trophy winner (Stanley Cup Playoffs MVP). Full career honors and championship recap on PlaySports.`
      : "NHL player career honors, awards and Stanley Cup records.";
    const faqs = p
      ? [
          {
            q: `How many Conn Smythe Trophies has ${p.name} won?`,
            a: `${p.name} has won the Conn Smythe Trophy (Stanley Cup Playoffs MVP) ${smythe} time${smythe === 1 ? "" : "s"} (${p.honors.map((h) => h.year).join(", ")}).`,
          },
          {
            q: `Which team did ${p.name} win the Conn Smythe with?`,
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
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            ldScript(athlete({ name: p.name, path: `/nhl/players/${p.slug}`, sport: "Ice Hockey" })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "NHL", path: "/nhl" },
              { name: "Players", path: "/nhl/leaders" },
              { name: p.name, path: `/nhl/players/${p.slug}` },
            ])),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: PlayerSlugPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      Player not found. <Link to="/nhl/leaders" className="underline">Browse NHL leaders</Link>.
    </div>
  ),
});

function PlayerSlugPage() {
  const { player } = Route.useLoaderData();
  const sorted = [...player.honors].sort((a, b) => b.year - a.year);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl ring-1 ring-border p-6 relative overflow-hidden bg-gradient-to-br from-[#041e42] to-[#c8102e]">
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">NHL · Career Honors</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{player.name}</h1>
          <p className="text-sm text-white/85 mt-1">
            {player.honors.length}× Conn Smythe Trophy (Stanley Cup Playoffs MVP)
          </p>
        </div>
      </header>

      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-sm font-bold text-white mb-3">Conn Smythe Trophy</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sorted.map((h, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.03] ring-1 ring-border p-2.5 text-sm">
              <span className="font-black tabular-nums text-orange-300 w-14">{h.year}</span>
              <span className="flex-1 text-white">Playoffs MVP</span>
              <TeamPill teamName={h.team} />
              <Link to="/nhl/stanley-cup/$year" params={{ year: String(h.year) }} className="text-[10px] uppercase tracking-wider text-orange-300 hover:text-orange-200">
                Series →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RelatedLinks title={`More NHL player pages`} links={relatedForLeaguePlayer("nhl", player.slug, undefined, 12)} />
    </div>
  );
}

function TeamPill({ teamName }: { teamName: string }) {
  const t = getNhlTeamByName(teamName);
  if (t) {
    return (
      <Link to="/nhl/teams/$slug" params={{ slug: t.slug }} className="text-xs font-bold text-white/80 hover:text-white">
        {t.abbr}
      </Link>
    );
  }
  return <span className="text-xs text-muted-foreground">{teamName}</span>;
}
