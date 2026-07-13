import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCompetition, requireCompetition, formatSeasonLabel } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getEdition } from "@/data/competition-editions";
import { titleCounts, editionsByDecade, championsTimeline } from "@/lib/competition-history";
import { euroStats } from "@/lib/euro-history";
import { EuroHistoryHero } from "@/components/football/EuroHistoryHero";
import { EuroTitleRace } from "@/components/football/EuroTitleRace";
import { EuroChampionsTimelineDeluxe } from "@/components/football/EuroChampionsTimelineDeluxe";
import { EuroDecadeCards } from "@/components/football/EuroDecadeCards";
import { EuroOnThisDayHistory } from "@/components/football/EuroOnThisDayHistory";
import { EuroRecordBook } from "@/components/football/EuroRecordBook";
import { EuroHostsMap } from "@/components/football/EuroHostsMap";
import { EuroHistoryFilters, useEuroHistoryFilter } from "@/components/football/EuroHistoryFilters";
import { EuroHistoryJumpBar } from "@/components/football/EuroHistoryJumpBar";
import { LastEditionRecap } from "@/components/football/LastEditionRecap";
import { CopaHistoryPage } from "@/components/football/CopaHistoryPage";
import { copaStats } from "@/lib/copa-history";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/football/$comp/history")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "History" }, { name: "robots", content: "noindex" }] };
    if (comp.slug === "euro") {
      const s = euroStats();
      const title = `UEFA Euro History — ${s.tournaments} tournaments, ${s.champions} champions (${s.span})`;
      const description = `Every UEFA European Championship since 1960 — Spain's record 4 titles, every final, top scorer and host. Euro 2028 heads to UK & Ireland next.`;
      const url = `https://allsportslive.lovable.app/football/euro/history`;
      const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: championsTimeline("euro").map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `UEFA Euro ${c.year} — ${c.winner}`,
          url: `${url}/${c.year}`,
        })),
      };
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:url", content: url },
          { property: "og:type", content: "website" },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          { type: "application/ld+json", children: JSON.stringify(itemList) },
        ],
      };
    }
    if (comp.slug === "copa-america") {
      const s = copaStats();
      const title = `Copa América History — ${s.tournaments} tournaments, ${s.champions} champions (${s.span})`;
      const description = `Every Copa América since 1916 — Argentina's record 16 titles, Uruguay's 15, every final, top scorer and host. Next Copa América: 2028.`;
      const url = `https://allsportslive.lovable.app/football/copa-america/history`;
      const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: championsTimeline("copa-america").map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `Copa América ${c.year} — ${c.winner}`,
          url: `${url}/${c.year}`,
        })),
      };
      return {
        meta: [
          { title },
          { name: "description", content: description },
          { property: "og:title", content: title },
          { property: "og:description", content: description },
          { property: "og:url", content: url },
          { property: "og:type", content: "website" },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [{ type: "application/ld+json", children: JSON.stringify(itemList) }],
      };
    }
    return buildCompetitionHead({
      comp,
      section: "History",
      path: `/football/${comp.slug}/history`,
      descriptionOverride: `Every ${comp.name} edition since ${comp.years[0]} — winners, hosts, top scorers and full brackets.`,
    });
  },
  component: HistoryRoute,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function HistoryRoute() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  if (comp.slug === "euro") return <EuroHistoryPage />;
  if (comp.slug === "copa-america") return <CopaHistoryPage />;
  return <GenericHistoryPage />;
}

function EuroHistoryPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const [filter, setFilter] = useEuroHistoryFilter();

  return (
    <CompetitionPageShell comp={comp}>
      <div className="sm:hidden mb-4">
        <LastEditionRecap comp={comp} collapsible />
      </div>

      <EuroHistoryHero />
      <EuroHistoryFilters value={filter} onChange={setFilter} />

      <EuroTitleRace />
      <EuroChampionsTimelineDeluxe />
      <EuroOnThisDayHistory />
      <EuroRecordBook />
      <EuroHostsMap />

      <div className="mt-10">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground">
            By decade
          </h2>
          <Link
            to="/football/$comp"
            params={{ comp: "euro" }}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            ← Back to overview
          </Link>
        </div>
        <EuroDecadeCards filter={filter} />
      </div>

      <EuroHistoryJumpBar />
    </CompetitionPageShell>
  );
}

function GenericHistoryPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const decades = editionsByDecade(comp.slug);
  const titles = titleCounts(comp.slug).slice(0, 6);

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-1">{comp.name} — All Editions</h2>
      <p className="text-sm text-muted-foreground mb-6">
        {comp.years.length} {comp.kind === "league" ? "seasons" : "editions"} from {comp.years[0]} to {comp.years[comp.years.length - 1]}.
      </p>

      {titles.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Most titles</h3>
          <div className="flex flex-wrap gap-2">
            {titles.map((t) => (
              <span key={t.team} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs">
                <Trophy className="size-3.5 text-amber-300" />
                <span className="font-semibold">{t.team}</span>
                <span className="text-muted-foreground">×{t.titles}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {decades.map((bucket) => (
        <section key={bucket.decade} className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">{bucket.label}</h3>
            {bucket.champions[0] && (
              <span className="text-xs text-muted-foreground">
                Top of decade: <span className="text-foreground font-semibold">{bucket.champions[0].team}</span> ×{bucket.champions[0].titles}
              </span>
            )}
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[...bucket.editions].reverse().map((edition) => {
              const year = edition.year;
              const winnerLabel = comp.slug === "world-cup" ? null : (edition.winner && edition.winner !== "TBD" ? edition.winner : null) ?? getEdition(comp.slug, year)?.winner ?? null;
              const inner = (
                <>
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="size-8 shrink-0 rounded-full bg-gradient-to-br from-amber-500/30 to-rose-500/20 grid place-items-center ring-1 ring-white/10">
                      <Trophy className="size-4 text-amber-300" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{formatSeasonLabel(comp, year)}</span>
                      {winnerLabel && <span className="block text-[11px] text-muted-foreground truncate">{winnerLabel}</span>}
                    </span>
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground">View →</span>
                </>
              );
              const cls =
                "group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-white/20 hover:bg-white/[0.06] transition";
              return (
                <li key={year}>
                  {comp.slug === "world-cup" ? (
                    <Link to="/football/tournaments/$year" params={{ year: String(year) }} className={cls}>
                      {inner}
                    </Link>
                  ) : (
                    <Link
                      to="/football/$comp/history/$year"
                      params={{ comp: comp.slug, year: String(year) }}
                      className={cls}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </CompetitionPageShell>
  );
}
