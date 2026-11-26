import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { findPlayer, playerStats, listPlayers, slugify } from "@/lib/seo/programmatic";
import { getPlayerStatHistory } from "@/lib/seo/leaderboards";
import { canonical } from "@/lib/seo/canonical";
import { breadcrumbList, athlete, faqPage, ldScript } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/ads/AdSlot";
import { readCachedFaqs } from "@/lib/ai-faqs.server";
import { FaqSection } from "@/components/seo/FaqSection";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { relatedForFootballPlayer } from "@/lib/seo/related";
import { flagOf } from "@/lib/flags";
import { Trophy, Target, Flag, ShieldAlert, Goal as GoalIcon } from "lucide-react";
import { useMergedGoals } from "@/lib/use-merged-goals";
import { useMergedCards } from "@/lib/use-merged-cards";

export const Route = createFileRoute("/football/players/$slug/")({
  loader: async ({ params }) => {
    const p = findPlayer("football_wc", params.slug);
    if (!p) throw notFound();
    const aiFaqs = await readCachedFaqs("football_player", params.slug);
    return {
      player: p,
      stats: playerStats(p.name),
      hist: getPlayerStatHistory(params.slug),
      aiFaqs,
    };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Player not found" }, { name: "robots", content: "noindex" }] };
    }
    const { player, stats, aiFaqs } = loaderData;
    const path = `/football/players/${params.slug}`;
    const title = `${player.name} — ${stats.goalsTotal} World Cup Goals for ${player.team} | PlaySports`;
    const desc = `${player.name} World Cup record: ${stats.goalsTotal} goals over ${stats.years.length} tournaments${stats.years.includes(2026) ? ", including the 2026 FIFA World Cup" : ""}. Year-by-year goals, cards, and career timeline.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical(path) },
        { property: "og:type", content: "profile" },
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
      scripts: [
        ldScript(athlete({ name: player.name, path, sport: "Football", team: player.team })),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Football", path: "/football" },
            { name: "Players", path: "/players" },
            { name: player.name, path },
          ]),
        ),
        ldScript(
          faqPage(
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  { q: `How many World Cup goals has ${player.name} scored?`, a: `${player.name} has scored ${stats.goalsTotal} World Cup goal${stats.goalsTotal === 1 ? "" : "s"}${stats.pen > 0 ? `, including ${stats.pen} from the penalty spot` : ""}.` },
                  { q: `Which country does ${player.name} play for?`, a: `${player.name} represents ${player.team}.` },
                  { q: `In which World Cups has ${player.name} played?`, a: stats.years.length ? `${player.name} appeared in ${stats.years.join(", ")}.` : `Not on record.` },
                ],
          ),
        ),
      ],
    };
  },
  component: FootballPlayerPage,
  errorComponent: ({ error }) => <div className="p-6">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-6">Player not found.</div>,
});

function FootballPlayerPage() {
  const { player, stats: loaderStats, hist: loaderHist, aiFaqs } = Route.useLoaderData();
  const { goals: ALL_GOALS } = useMergedGoals();
  const { cards: ALL_CARDS } = useMergedCards();
  const { stats, hist } = useMemo(() => {
    const goals = ALL_GOALS.filter((g) => g.name === player.name && g.pteam === player.team);
    const cards = ALL_CARDS.filter((c) => c.name === player.name && c.team === player.team);
    if (goals.length === 0 && cards.length === 0) return { stats: loaderStats, hist: loaderHist };
    const goalYears = Array.from(new Set(goals.map((g) => g.year))).sort((a, b) => a - b);
    const years = new Set<number>([...goalYears, ...cards.map((c) => c.year)]);
    const rows = Array.from(years).sort((a, b) => a - b).map((year) => {
      const yg = goals.filter((g) => g.year === year);
      const yc = cards.filter((c) => c.year === year);
      return {
        year,
        goals: yg.filter((g) => !g.og).length,
        penalties: yg.filter((g) => g.pen).length,
        ownGoals: yg.filter((g) => g.og).length,
        yellows: yc.filter((c) => c.type === "yellow").length,
        reds: yc.filter((c) => c.type === "red").length,
        team: player.team,
      };
    });
    const nextStats = {
      ...loaderStats,
      goalsTotal: goals.filter((g) => !g.og).length,
      cardsTotal: cards.length,
      years: goalYears,
      byYear: goalYears.map((year) => ({ year, goals: goals.filter((g) => g.year === year && !g.og).length })),
      pen: goals.filter((g) => g.pen).length,
      og: goals.filter((g) => g.og).length,
    };
    const totals = {
      year: 0,
      goals: rows.reduce((s, r) => s + r.goals, 0),
      penalties: rows.reduce((s, r) => s + r.penalties, 0),
      ownGoals: rows.reduce((s, r) => s + r.ownGoals, 0),
      yellows: rows.reduce((s, r) => s + r.yellows, 0),
      reds: rows.reduce((s, r) => s + r.reds, 0),
      team: player.team,
    };
    return { stats: nextStats, hist: { name: player.name, team: player.team, rows, totals } };
  }, [ALL_GOALS, ALL_CARDS, player, loaderStats, loaderHist]);
  const related = listPlayers()
    .filter((p) => p.team === player.team && p.slug !== player.slug)
    .slice(0, 12);
  const teamSlug = slugify(player.team);
  const has2026 = stats.years.includes(2026);
  const yellows = hist?.totals.yellows ?? 0;
  const reds = hist?.totals.reds ?? 0;
  const initials = player.name
    .split(/\s+/)
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-background pb-20">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-transparent" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.18),transparent_60%)]" aria-hidden />
        <div className="relative container mx-auto max-w-5xl px-4 pt-6 pb-8 sm:pt-10 sm:pb-12">
          <nav aria-label="Breadcrumb" className="text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground mb-4 sm:mb-6 truncate">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-1.5 opacity-50">/</span>
            <Link to="/football" className="hover:text-foreground">Football</Link>
            <span className="mx-1.5 opacity-50">/</span>
            <Link to="/players" className="hover:text-foreground">Players</Link>
            <span className="mx-1.5 opacity-50">/</span>
            <span className="text-foreground">{player.name}</span>
          </nav>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:gap-6">
            <div
              aria-hidden
              className="shrink-0 grid place-items-center size-16 sm:size-24 rounded-2xl bg-gradient-to-br from-amber-500/25 to-rose-500/25 ring-1 ring-inset ring-white/10 text-xl sm:text-3xl font-black tracking-tight"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] truncate">
                {player.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base text-muted-foreground">
                <span className="text-lg leading-none" aria-hidden>{flagOf(player.team)}</span>
                <Link
                  to="/football/teams/$slug"
                  params={{ slug: teamSlug }}
                  className="font-semibold text-foreground hover:underline underline-offset-4"
                >
                  {player.team}
                </Link>
                <span className="opacity-40">·</span>
                <span>FIFA World Cup Career</span>
                {has2026 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ring-emerald-500/30">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> WC 2026
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <HeroStat icon={<Target className="size-4" />} label="Goals" value={stats.goalsTotal} accent="amber" />
            <HeroStat icon={<Trophy className="size-4" />} label="Tournaments" value={stats.years.length} accent="rose" />
            <HeroStat icon={<Flag className="size-4" />} label="Penalties" value={stats.pen} accent="sky" />
            <HeroStat icon={<ShieldAlert className="size-4" />} label={reds ? "Cards (Y/R)" : "Yellow cards"} value={reds ? `${yellows}/${reds}` : yellows} accent="orange" />
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* Tournament-by-tournament */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <GoalIcon className="size-4 text-amber-500" />
              Tournament breakdown
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">{stats.byYear.length} appearances</span>
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {stats.byYear.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No World Cup goals on record.</div>
            ) : (
              <ul className="divide-y divide-border">
                {stats.byYear.map((y: { year: number; goals: number }) => {
                  const row = hist?.rows.find((r: { year: number }) => r.year === y.year);
                  const isLive = y.year === 2026;
                  return (
                    <li key={y.year}>
                      <Link
                        to="/football/players/$slug/world-cup-{$year}"
                        params={{ slug: player.slug, year: String(y.year) }}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 hover:bg-accent/40 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base sm:text-lg">World Cup {y.year}</span>
                            {isLive && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ring-emerald-500/30">
                                Live
                              </span>
                            )}
                          </div>
                          {row && (row.penalties > 0 || row.yellows > 0 || row.reds > 0) && (
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                              {row.penalties > 0 && <span>{row.penalties} pen</span>}
                              {row.yellows > 0 && <span className="text-yellow-500">🟨 {row.yellows}</span>}
                              {row.reds > 0 && <span className="text-red-500">🟥 {row.reds}</span>}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="tabular-nums font-black text-lg sm:text-xl">{y.goals}</span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            goal{y.goals === 1 ? "" : "s"}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* About */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-2">About {player.name} at the World Cup</h2>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            {player.name} has represented <strong className="text-foreground">{player.team}</strong> at the FIFA World Cup, scoring{" "}
            <strong className="text-foreground">{stats.goalsTotal} goal{stats.goalsTotal === 1 ? "" : "s"}</strong>{" "}
            across {stats.years.length} tournament{stats.years.length === 1 ? "" : "s"}
            {stats.years.length ? ` (${stats.years.join(", ")})` : ""}.
            {stats.pen > 0 ? ` ${stats.pen} came from the penalty spot.` : ""}
            {has2026 ? ` Currently active in the 2026 FIFA World Cup.` : ""}
          </p>
        </section>

        <AdSlot slot="in_content" />

        <FaqSection
          title={`Frequently asked about ${player.name}`}
          items={
            aiFaqs && aiFaqs.length
              ? aiFaqs
              : [
                  { q: `How many World Cup goals has ${player.name} scored?`, a: `${player.name} has scored ${stats.goalsTotal} FIFA World Cup goals for ${player.team}${stats.pen > 0 ? `, including ${stats.pen} from the penalty spot` : ""}.` },
                  { q: `Which country does ${player.name} play for?`, a: `${player.name} represents ${player.team} in international football.` },
                  { q: `In which World Cups has ${player.name} played?`, a: stats.years.length ? `${player.name} appeared in the ${stats.years.join(", ")} FIFA World Cup tournament${stats.years.length === 1 ? "" : "s"}.` : `Not on record.` },
                  { q: `When was ${player.name}'s last World Cup goal?`, a: stats.byYear.length ? `${player.name} last scored in the ${stats.byYear[stats.byYear.length - 1].year} World Cup.` : "No goals on record." },
                ]
          }
        />

        {related.length > 0 && (
          <section>
            <h2 className="text-lg sm:text-xl font-bold mb-3">Other {player.team} players</h2>
            <div className="flex flex-wrap gap-2">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/football/players/$slug"
                  params={{ slug: p.slug }}
                  className="px-3 py-1.5 rounded-full bg-muted text-xs sm:text-sm font-medium hover:bg-accent hover:-translate-y-0.5 transition-all"
                >
                  {p.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        <RelatedLinks
          title={`More World Cup stats for ${player.name}`}
          links={relatedForFootballPlayer(player.slug, player.team, 10)}
        />
      </main>
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: "amber" | "rose" | "sky" | "orange";
}) {
  const ring: Record<string, string> = {
    amber: "ring-amber-500/25 text-amber-400",
    rose: "ring-rose-500/25 text-rose-400",
    sky: "ring-sky-500/25 text-sky-400",
    orange: "ring-orange-500/25 text-orange-400",
  };
  return (
    <div className={`rounded-xl bg-card/70 backdrop-blur border border-border p-3 sm:p-4 ring-1 ring-inset ${ring[accent]}`}>
      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 text-2xl sm:text-3xl font-black tabular-nums text-foreground">{value}</div>
    </div>
  );
}
