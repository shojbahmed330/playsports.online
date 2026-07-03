// Phase 2.1 — Historical MLB player landing page (SSR, slug-based).
// Sources honors (MVP / Cy Young / RoY / WS MVP / All-Time Leader) from history.json.
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getMlbPlayerBySlug, getMlbTeamByAbbr } from "@/lib/seo/mlb-entities";
import { athlete, breadcrumbList, faqPage, ldScript } from "@/lib/seo/jsonld";
import { canonical } from "@/lib/seo/canonical";

export const Route = createFileRoute("/mlb/players/$slug")({
  loader: ({ params }) => {
    const player = getMlbPlayerBySlug(params.slug);
    if (!player) throw notFound();
    return { player };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.player;
    const url = canonical(`/mlb/players/${params.slug}`);
    const bestLine = p ? buildHeadline(p) : "";
    const title = p ? `${p.name} — MLB Career Honors, MVPs, Cy Youngs & Records` : "MLB Player — PlaySports";
    const desc = p
      ? `${p.name} — ${bestLine}. Full MLB career honors, awards and all-time leaderboard rankings on PlaySports.`
      : "MLB player career honors, awards and records.";
    const faqs = p ? buildFaqs(p) : [];
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
            ldScript(athlete({ name: p.name, path: `/mlb/players/${p.slug}`, sport: "Baseball" })),
            ldScript(breadcrumbList([
              { name: "Home", path: "/" },
              { name: "MLB", path: "/mlb" },
              { name: "Players", path: "/mlb/players" },
              { name: p.name, path: `/mlb/players/${p.slug}` },
            ])),
            ldScript(faqPage(faqs)),
          ]
        : [],
    };
  },
  component: PlayerSlugPage,
  notFoundComponent: () => (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
      Player not found. <Link to="/mlb/players" className="underline">Browse MLB players</Link>.
    </div>
  ),
});

function buildHeadline(p: NonNullable<ReturnType<typeof getMlbPlayerBySlug>>): string {
  const bits: string[] = [];
  const mvps = p.honors.filter((h) => h.kind === "MVP");
  const cy = p.honors.filter((h) => h.kind === "Cy Young");
  const roy = p.honors.filter((h) => h.kind === "Rookie of the Year");
  const ws = p.honors.filter((h) => h.kind === "World Series MVP");
  const atl = p.honors.filter((h) => h.kind === "All-Time Leader");
  if (mvps.length) bits.push(`${mvps.length}× MVP`);
  if (cy.length) bits.push(`${cy.length}× Cy Young`);
  if (roy.length) bits.push(`${roy.length}× Rookie of the Year`);
  if (ws.length) bits.push(`${ws.length}× World Series MVP`);
  if (atl.length) bits.push(`ranked on ${atl.length} all-time leaderboard${atl.length === 1 ? "" : "s"}`);
  return bits.join(" · ") || "MLB career highlights";
}

function buildFaqs(p: NonNullable<ReturnType<typeof getMlbPlayerBySlug>>) {
  const faqs: Array<{ q: string; a: string }> = [];
  const mvps = p.honors.filter((h) => h.kind === "MVP");
  if (mvps.length) {
    faqs.push({
      q: `How many MVP awards has ${p.name} won?`,
      a: `${p.name} has won the MLB MVP award ${mvps.length} time${mvps.length === 1 ? "" : "s"} (${mvps.map((h) => h.year).join(", ")}).`,
    });
  }
  const cy = p.honors.filter((h) => h.kind === "Cy Young");
  if (cy.length) {
    faqs.push({
      q: `How many Cy Young awards has ${p.name} won?`,
      a: `${p.name} has won the Cy Young Award ${cy.length} time${cy.length === 1 ? "" : "s"} (${cy.map((h) => h.year).join(", ")}).`,
    });
  }
  const ws = p.honors.filter((h) => h.kind === "World Series MVP");
  if (ws.length) {
    faqs.push({
      q: `Has ${p.name} won a World Series MVP?`,
      a: `Yes — ${p.name} was named World Series MVP in ${ws.map((h) => `${h.year} with the ${h.team}`).join(", ")}.`,
    });
  }
  const atl = p.honors.filter((h) => h.kind === "All-Time Leader");
  if (atl.length) {
    const top = atl[0];
    faqs.push({
      q: `Where does ${p.name} rank in MLB all-time records?`,
      a: `${p.name} ranks #${top.rank} on the MLB all-time ${top.category} list with ${top.value}, and appears on ${atl.length} all-time leaderboard${atl.length === 1 ? "" : "s"}.`,
    });
  }
  return faqs;
}

function PlayerSlugPage() {
  const { player } = Route.useLoaderData();
  const groups = groupHonors(player.honors);
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15 p-6 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-40" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">MLB · Career Honors</div>
          <h1 className="text-3xl font-extrabold text-white mt-1">{player.name}</h1>
          <p className="text-sm text-white/80 mt-1">{buildHeadline(player)}</p>
        </div>
      </header>

      {groups.map((g) => (
        <section key={g.title} className="rounded-2xl bg-card ring-1 ring-border p-4">
          <h2 className="text-sm font-bold text-white mb-3">{g.title}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {g.rows.map((r, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.03] ring-1 ring-border p-2.5 text-sm">
                {r.year && <span className="font-black tabular-nums text-[#f7e6c4] w-14">{r.year}</span>}
                {r.rank != null && <span className="font-black tabular-nums text-[#f7e6c4] w-10">#{r.rank}</span>}
                <span className="flex-1 text-white">
                  {r.category ?? r.kind}
                  {r.league && <span className="text-muted-foreground"> · {r.league}</span>}
                </span>
                {r.value && <span className="tabular-nums text-white font-semibold">{r.value}</span>}
                {r.team && (
                  <TeamPill teamName={r.team} />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TeamPill({ teamName }: { teamName: string }) {
  // teamName can be full name (WS) or abbr (MVP/CY/RoY)
  const t = getMlbTeamByAbbr(teamName) ?? null;
  if (t) {
    return (
      <Link to="/mlb/teams/$slug" params={{ slug: t.slug }} className="text-xs font-bold text-white/80 hover:text-white">
        {t.abbr}
      </Link>
    );
  }
  // full name path
  return <span className="text-xs text-muted-foreground">{teamName}</span>;
}

type HonorGroup = { title: string; rows: NonNullable<ReturnType<typeof getMlbPlayerBySlug>>["honors"] };
function groupHonors(honors: NonNullable<ReturnType<typeof getMlbPlayerBySlug>>["honors"]): HonorGroup[] {
  const order: Array<HonorGroup["title"]> = [
    "Most Valuable Player",
    "Cy Young Award",
    "Rookie of the Year",
    "World Series MVP",
    "All-Time Leaderboards",
  ];
  const map = new Map<string, HonorGroup["rows"]>();
  for (const h of honors) {
    const key =
      h.kind === "MVP" ? "Most Valuable Player" :
      h.kind === "Cy Young" ? "Cy Young Award" :
      h.kind === "Rookie of the Year" ? "Rookie of the Year" :
      h.kind === "World Series MVP" ? "World Series MVP" :
      "All-Time Leaderboards";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(h);
  }
  return order
    .filter((k) => map.has(k))
    .map((title) => ({
      title,
      rows: map.get(title)!.sort((a, b) => (a.year && b.year ? b.year - a.year : (a.rank ?? 0) - (b.rank ?? 0))),
    }));
}
