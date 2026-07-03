import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCampaignSummary, listCampaignSlugs, type CampaignSummary } from "@/lib/seo/programmatic-pages";
import { slugify } from "@/lib/seo/programmatic";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, articlePage, ldScript } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";
import { RelatedLinks } from "@/components/seo/RelatedLinks";


export const Route = createFileRoute("/football/campaigns/$slug")({
  loader: ({ params }) => {
    const c = getCampaignSummary(params.slug);
    if (!c) throw notFound();
    return c;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const c = loaderData;
    const path = `/football/campaigns/${params.slug}`;
    const title = `${c.team} at the ${c.year} FIFA World Cup — Campaign, Results & Top Scorers | PlaySports`;
    const summary = c.finalPosition
      ? `${c.team} finished as ${c.finalPosition} at the ${c.year} FIFA World Cup.`
      : `${c.team}'s ${c.year} FIFA World Cup campaign.`;
    const desc = `${summary} Record: ${c.wins}W–${c.draws}D–${c.losses}L, ${c.goalsFor} scored, ${c.goalsAgainst} conceded across ${c.matches.length} matches.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Campaigns", path: "/football/campaigns" },
            { name: `${c.team} ${c.year}`, path },
          ]),
        ),
        ldScript(
          faqPage([
            {
              q: `How did ${c.team} finish at the ${c.year} World Cup?`,
              a: c.finalPosition
                ? `${c.team} finished as ${c.finalPosition} with a record of ${c.wins} wins, ${c.draws} draws, and ${c.losses} losses.`
                : `${c.team} played ${c.matches.length} matches at the ${c.year} World Cup, going ${c.wins}W-${c.draws}D-${c.losses}L.`,
            },
            {
              q: `Who was ${c.team}'s top scorer at the ${c.year} World Cup?`,
              a: c.topScorers[0]
                ? `${c.topScorers[0].name} led ${c.team} with ${c.topScorers[0].goals} goal${c.topScorers[0].goals === 1 ? "" : "s"}.`
                : `Individual scorers for this ${c.team} campaign are not on record.`,
            },
            {
              q: `How many matches did ${c.team} play at the ${c.year} World Cup?`,
              a: `${c.team} played ${c.matches.length} match${c.matches.length === 1 ? "" : "es"} at the ${c.year} tournament, scoring ${c.goalsFor} and conceding ${c.goalsAgainst}.`,
            },
          ]),
        ),
      ],
    };
  },
  component: CampaignPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Campaign not found.</div>,
});

function CampaignPage() {
  const c = Route.useLoaderData();
  const otherYears = listCampaignSlugs()
    .filter((x) => x.team === c.team && x.year !== c.year)
    .slice(0, 12);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-20">
      <nav className="mb-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:underline">Home</Link> /{" "}
        <Link to="/football" className="hover:underline">Football</Link> /{" "}
        <Link to="/football/campaigns" className="hover:underline">Campaigns</Link>
      </nav>
      <h1 className="mb-2 text-2xl font-bold md:text-3xl">
        {c.team} at the {c.year} FIFA World Cup
      </h1>
      <p className="mb-6 text-muted-foreground">
        {c.finalPosition ? `Finished as ${c.finalPosition}. ` : ""}Record {c.wins}W–{c.draws}D–{c.losses}L across {c.matches.length} matches ({c.goalsFor} for, {c.goalsAgainst} against).
      </p>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Wins" value={c.wins} />
        <StatCard label="Draws" value={c.draws} />
        <StatCard label="Losses" value={c.losses} />
        <StatCard label="Goals For" value={c.goalsFor} />
        <StatCard label="Goals Against" value={c.goalsAgainst} />
        <StatCard label="Matches" value={c.matches.length} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Match results</h2>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card/40">
          {c.matches.map((m: CampaignSummary["matches"][number], i: number) => {
            const isHome = m.home_team === c.team;
            const my = isHome ? m.home_score : m.away_score;
            const op = isHome ? m.away_score : m.home_score;
            const opp = isHome ? m.away_team : m.home_team;
            const result = my > op ? "W" : my < op ? "L" : "D";
            const resultColor =
              result === "W" ? "bg-emerald-500/15 text-emerald-400" : result === "L" ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400";
            return (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${resultColor}`}>
                    {result}
                  </span>
                  <div>
                    <div className="font-semibold">
                      vs{" "}
                      <Link
                        to="/football/teams/$slug"
                        params={{ slug: slugify(opp) }}
                        className="hover:text-gold"
                      >
                        {opp}
                      </Link>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.round ?? "Group Stage"}
                      {m.match_date ? ` · ${m.match_date}` : ""}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold tabular-nums">
                  {my}–{op}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {c.topScorers.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Top scorers for {c.team} in {c.year}</h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card/40">
            {c.topScorers.map((s: CampaignSummary["topScorers"][number]) => (
              <li key={s.name} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link
                  to="/football/players/$slug"
                  params={{ slug: slugify(s.name) }}
                  className="font-medium hover:text-gold"
                >
                  {s.name}
                </Link>
                <span className="font-bold tabular-nums">{s.goals} goal{s.goals === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdSlot slot="in_content" />

      {otherYears.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Other {c.team} World Cup campaigns</h2>
          <div className="flex flex-wrap gap-2">
            {otherYears.map((o) => (
              <Link
                key={o.slug}
                to="/football/campaigns/$slug"
                params={{ slug: o.slug }}
                className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-accent"
              >
                {o.year}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <Link
          to="/football/top-scorers/$year"
          params={{ year: String(c.year) }}
          className="text-sm text-gold hover:underline"
        >
          → See the full {c.year} World Cup top scorers →
        </Link>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
