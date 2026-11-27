// Phase 3 — NHL all-time Stanley Cup champions programmatic SEO page.
import { createFileRoute, Link } from "@tanstack/react-router";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, faqPage, ldScript, itemList } from "@/lib/seo/jsonld";
import { withHubLinks } from "@/components/seo/withHubLinks";
import {
  aggregateNhlChampions,
  listNhlChampions,
  listNhlTeamHistories,
} from "@/lib/seo/multisport-programmatic";
import { EmptyState } from "@/components/ui/state";

export const Route = createFileRoute("/nhl/champions")({
  head: () => {
    const url = canonical("/nhl/champions");
    const rows = listNhlChampions();
    const agg = aggregateNhlChampions();
    const title = `Stanley Cup Champions — Every NHL Winner (${rows[rows.length - 1]?.seasonLabel} → ${rows[0]?.seasonLabel})`;
    const desc = `Complete list of every Stanley Cup champion, runner-up and Conn Smythe winner. ${agg[0]?.name} lead with ${agg[0]?.titles} Cups. Full winners table on PlaySports.`;
    const faqs = [
      {
        q: "Which NHL team has the most Stanley Cup wins?",
        a: `The ${agg[0]?.name} lead all franchises with ${agg[0]?.titles} Stanley Cup titles.`,
      },
      {
        q: "Who won the most recent Stanley Cup?",
        a: `The ${rows[0]?.champion} won the ${rows[0]?.seasonLabel} Stanley Cup, defeating the ${rows[0]?.runnerUp} ${rows[0]?.result}.`,
      },
      {
        q: "How many franchises have won the Stanley Cup?",
        a: `${agg.length} different franchises have won the Stanley Cup across ${rows.length} finals on record.`,
      },
    ];
    return {
      meta: [
        { title },
        { name: "description", content: desc.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: desc.slice(0, 200) },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc.slice(0, 200) },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "NHL", path: "/nhl" },
            { name: "Champions", path: "/nhl/champions" },
          ]),
        ),
        ldScript(
          itemList({
            name: "Stanley Cup champions",
            path: "/nhl/champions",
            items: agg
              .slice(0, 20)
              .map((a) => ({
                name: `${a.name} (${a.titles})`,
                path: `/nhl/team-history/${a.slug}`,
              })),
          }),
        ),
        ldScript(faqPage(faqs)),
      ],
    };
  },
  component: withHubLinks(NhlChampionsPage, { sport: "nhl", currentPath: "/nhl/champions" }),
});

function NhlChampionsPage() {
  const rows = listNhlChampions();
  const agg = aggregateNhlChampions();
  const teams = listNhlTeamHistories();
  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-2xl bg-card ring-1 ring-border p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-bold">
          NHL · All-time
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mt-1">Stanley Cup Champions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Every Stanley Cup winner from {rows[rows.length - 1]?.seasonLabel} to{" "}
          {rows[0]?.seasonLabel} · {agg.length} franchises · {rows.length} finals.
        </p>
      </header>
      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">Most Cups</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {agg.slice(0, 12).map((a, i) => (
            <li
              key={a.slug}
              className="flex items-center justify-between rounded-xl bg-muted/40 ring-1 ring-border px-3 py-2"
            >
              <Link
                to="/nhl/team-history/$slug"
                params={{ slug: a.slug }}
                className="inline-flex min-h-11 items-center font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="tabular-nums text-muted-foreground mr-2">#{i + 1}</span>
                {a.name}
              </Link>
              <span className="text-primary font-black tabular-nums">{a.titles}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">
          All winners by season
        </h2>
        {rows.length === 0 ? (
          <EmptyState
            title="No champions on record"
            description="Stanley Cup winners are not available right now."
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.seasonLabel} className="py-2 flex items-baseline gap-3 text-sm">
                <Link
                  to="/nhl/stanley-cup/$year"
                  params={{ year: String(r.year) }}
                  className="inline-flex min-h-11 w-20 items-center tabular-nums font-black text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {r.seasonLabel}
                </Link>
                <span className="text-foreground font-semibold">{r.champion}</span>
                <span className="text-muted-foreground">
                  def. {r.runnerUp} · {r.result}
                </span>
                {r.extra ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    Conn Smythe: {r.extra}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-2xl bg-card ring-1 ring-border p-4">
        <h2 className="text-xs uppercase tracking-wider font-bold text-primary mb-3">
          Team histories
        </h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          {teams.map((t) => (
            <li key={t.slug}>
              <Link
                to="/nhl/team-history/$slug"
                params={{ slug: t.slug }}
                className="flex min-h-11 items-center rounded-xl bg-muted/40 hover:bg-accent ring-1 ring-border px-3 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {t.championships.length}W · {t.runnerUps.length}L
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
