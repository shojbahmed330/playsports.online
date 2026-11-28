import { useMemo, lazy, Suspense } from "react";
import { createFileRoute, Link, useNavigate, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@/lib/zod-validator";
import { useQuery } from "@tanstack/react-query";

import { Trophy, ShieldCheck, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AdSlot } from "@/components/ads/AdSlot";

import { useMergedGoals, type GoalRow } from "@/lib/use-merged-goals";
import { useMergedCards } from "@/lib/use-merged-cards";
import { breadcrumbList, collectionPage, ldScript } from "@/lib/seo/jsonld";

import {
  playersSearchSchema,
  playersDefaults,
  parseList,
  parsePlayerKey,
  playerKey,
  ERA_YEARS,
  fuzzyMatch,
  type PlayersSearch,
} from "@/lib/players-filters";
import { confederationLabel } from "@/lib/confederations";
import { PlayerSubNav } from "@/components/players/PlayerSubNav";
import { FilterBar, ActiveFilterChips } from "@/components/players/FilterBar";
import { FilterSheet } from "@/components/players/FilterSheet";
import { PlayerProfileSheet } from "@/components/players/PlayerProfileSheet";
import {
  OverviewTab,
  ScorersTab,
  DisciplineTab,
  CountriesTab,
  RankingsTab,
  buildCardLeaderboard,
  type ScorerRow,
} from "@/components/players/PlayersTabs";

const CompareView = lazy(() =>
  import("@/components/players/CompareView").then((m) => ({ default: m.CompareView })),
);
const RecordsPanel = lazy(() =>
  import("@/components/players/RecordsPanel").then((m) => ({ default: m.RecordsPanel })),
);

export const Route = createFileRoute("/players")({
  validateSearch: zodValidator(playersSearchSchema),
  search: {
    middlewares: [stripSearchParams(playersDefaults)],
  },
  head: () => ({
    meta: [
      { title: "Player Statistics — FIFA World Cup Archive (1930–2026)" },
      {
        name: "description",
        content:
          "FIFA World Cup player statistics including the live 2026 Golden Boot race, top scorers, hat-tricks, card leaders, country stats and player comparisons across every edition from 1930 to 2026.",
      },
      {
        property: "og:title",
        content: "Player Statistics & Records — FIFA World Cup 1930–2026",
      },
      {
        property: "og:description",
        content:
          "Live 2026 top scorers, hat-tricks, Golden Boot race, and all-time records across every FIFA World Cup edition.",
      },
      { property: "og:url", content: "https://www.playsports.online/players" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Player Statistics & Records — FIFA World Cup 1930–2026",
      },
      {
        name: "twitter:description",
        content:
          "Live 2026 top scorers, hat-tricks, Golden Boot race, and all-time records across every FIFA World Cup edition.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/players" }],
    scripts: [
      ldScript(
        collectionPage({
          name: "Player Statistics — FIFA World Cup",
          description:
            "All-time and live FIFA World Cup top scorers, card leaders and player records.",
          path: "/players",
        }),
      ),
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Players", path: "/players" },
        ]),
      ),
      ldScript({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Who is the top scorer of the 2026 FIFA World Cup?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The 2026 FIFA World Cup top scorer table is generated from live ESPN match events and updates as official scoring events are available.",
            },
          },
          {
            "@type": "Question",
            name: "How many goals have been scored at the 2026 FIFA World Cup so far?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "2026 goal totals are calculated from official ESPN match scoring events. Shoot-out goals and own-goal scorer credits are not counted in player scoring totals.",
            },
          },
          {
            "@type": "Question",
            name: "How many World Cup goals does Cristiano Ronaldo have (2006–2026)?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Career totals on this page combine the verified historical World Cup dataset with live 2026 ESPN scoring events when available.",
            },
          },
          {
            "@type": "Question",
            name: "Who is the all-time top scorer at the FIFA World Cup?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "All-time scorer rankings are computed from verified historical data plus official live 2026 match events, so the leaderboard reflects the current source data.",
            },
          },
        ],
      }),
    ],
  }),

  component: PlayersPage,
});

function PlayersPage() {
  const { isAdmin } = useAuth();
  const search = Route.useSearch() as PlayersSearch;
  const navigate = useNavigate({ from: "/players" });
  const { goals: GOALS, live2026Goals } = useMergedGoals();
  const { cards: CARDS } = useMergedCards();

  const countries = useMemo(() => {
    const s = new Set<string>();
    for (const g of GOALS) s.add(g.pteam);
    return Array.from(s).sort();
  }, [GOALS]);

  // (Live 2026 scorers come from useMergedGoals above — shared query cache.)

  // Resolve filters
  const selectedYears = useMemo(() => {
    const ys = parseList(search.years).map(Number).filter(Boolean);
    if (ys.length) return new Set(ys);
    if (search.era !== "ALL") return new Set(ERA_YEARS[search.era]);
    return null;
  }, [search.years, search.era]);

  const selectedCountries = useMemo(() => new Set(parseList(search.countries)), [search.countries]);
  const selectedConfeds = useMemo(() => new Set(parseList(search.confeds)), [search.confeds]);

  const countryAllowed = (c: string) => {
    if (selectedCountries.size && !selectedCountries.has(c)) return false;
    if (selectedConfeds.size) {
      const conf = confederationLabel(c);
      if (!conf || !selectedConfeds.has(conf)) return false;
    }
    return true;
  };
  const yearAllowed = (y: number) => !selectedYears || selectedYears.has(y);

  const filteredGoals = useMemo(() => {
    return GOALS.filter((g) => {
      if (search.goalType === "open" && (g.og || g.pen)) return false;
      if (search.goalType === "penalty" && !g.pen) return false;
      if (search.goalType === "og" && !g.og) return false;
      if (search.goalType === "ALL" && g.og) return false; // exclude OG from scorer credit by default
      if (!yearAllowed(g.year)) return false;
      if (!countryAllowed(g.pteam)) return false;
      if (search.pos !== "ALL" && g.pos !== search.pos) return false;
      if (search.q && !fuzzyMatch(g.name, search.q)) return false;
      return true;
    });
  }, [
    GOALS,
    search.goalType,
    search.pos,
    search.q,
    selectedYears,
    selectedCountries,
    selectedConfeds,
  ]);

  const filteredCards = useMemo(() => {
    return CARDS.filter((c) => {
      if (!yearAllowed(c.year)) return false;
      if (!countryAllowed(c.team)) return false;
      if (search.pos !== "ALL" && c.pos !== search.pos) return false;
      if (search.q && !fuzzyMatch(c.name, search.q)) return false;
      return true;
    });
  }, [search.pos, search.q, selectedYears, selectedCountries, selectedConfeds]);

  // Top scorers — GOALS already includes live 2026 rows from useMergedGoals.
  const topScorers = useMemo(() => {
    const agg = new Map<
      string,
      { name: string; country: string; goals: number; years: Set<number>; live2026: number }
    >();

    for (const g of filteredGoals) {
      const key = `${g.pid}|${g.pteam}`;
      const ex = agg.get(key);
      if (ex) {
        ex.goals++;
        ex.years.add(g.year);
        if (g.live) ex.live2026++;
      } else {
        agg.set(key, {
          name: g.name,
          country: g.pteam,
          goals: 1,
          years: new Set([g.year]),
          live2026: g.live ? 1 : 0,
        });
      }
    }

    const enriched = Array.from(agg.values())
      .filter((r) => r.goals >= search.minGoals)
      .map((r) => ({
        ...r,
        tournaments: r.years.size,
        yearsList: Array.from(r.years).sort(),
        gpt: r.years.size ? r.goals / r.years.size : 0,
      }));

    type Enriched = (typeof enriched)[number];
    const sorters: Record<string, (a: Enriched, b: Enriched) => number> = {
      goals: (a, b) => b.goals - a.goals || a.name.localeCompare(b.name),
      goals_per_tournament: (a, b) => b.gpt - a.gpt || b.goals - a.goals,
      tournaments: (a, b) => b.tournaments - a.tournaments || b.goals - a.goals,
      name: (a, b) => a.name.localeCompare(b.name),
      recent: (a, b) =>
        (b.yearsList[b.yearsList.length - 1] ?? 0) - (a.yearsList[a.yearsList.length - 1] ?? 0) ||
        b.goals - a.goals,
    };
    const sorter = sorters[search.sort] ?? sorters.goals;
    return enriched.sort(sorter).slice(0, 100);
  }, [filteredGoals, search.minGoals, search.sort]);

  const topYellow = useMemo(
    () => buildCardLeaderboard(filteredCards, "yellow", 15),
    [filteredCards],
  );
  const topRed = useMemo(() => buildCardLeaderboard(filteredCards, "red", 15), [filteredCards]);

  const countryStats = useMemo(() => {
    const agg = new Map<
      string,
      {
        country: string;
        years: Set<number>;
        goals: number;
        players: Set<string>;
        topScorer: { name: string; goals: number } | null;
        scorerCount: Map<string, { name: string; goals: number }>;
      }
    >();
    for (const g of GOALS) {
      if (g.og) continue;
      if (selectedConfeds.size) {
        const conf = confederationLabel(g.pteam);
        if (!conf || !selectedConfeds.has(conf)) continue;
      }
      const key = g.pteam;
      let ex = agg.get(key);
      if (!ex) {
        ex = {
          country: g.pteam,
          years: new Set(),
          goals: 0,
          players: new Set(),
          topScorer: null,
          scorerCount: new Map(),
        };
        agg.set(key, ex);
      }
      ex.goals++;
      ex.years.add(g.year);
      ex.players.add(g.pid);
      const sc = ex.scorerCount.get(g.pid);
      if (sc) sc.goals++;
      else ex.scorerCount.set(g.pid, { name: g.name, goals: 1 });
    }
    const out = Array.from(agg.values()).map((c) => {
      let top: { name: string; goals: number } | null = null;
      for (const s of c.scorerCount.values()) {
        if (!top || s.goals > top.goals) top = s;
      }
      return {
        country: c.country,
        tournaments: c.years.size,
        goals: c.goals,
        playerCount: c.players.size,
        topScorer: top,
      };
    });
    out.sort((a, b) => b.tournaments - a.tournaments || b.goals - a.goals);
    return out;
  }, [GOALS, selectedConfeds]);

  const openPlayer = (name: string, country: string) =>
    navigate({
      search: (prev: PlayersSearch) => ({ ...prev, player: playerKey(name, country) }),
      replace: true,
    });

  const activePlayer = parsePlayerKey(search.player);
  void activePlayer; // sheet reads it itself

  const sharePage = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard access can be blocked by the browser; sharing still works.
    }
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-gold/15 grid place-items-center ring-1 ring-gold/30">
              <Trophy className="size-5 text-gold" aria-hidden="true" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">FIFA World Cup</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-gold">Archive</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1.5 sm:gap-2 text-sm">
            <Link
              to="/"
              className="group relative inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-muted-foreground ring-1 ring-border bg-muted hover:text-foreground hover:bg-accent hover:ring-ring/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span aria-hidden>🏠</span>
              <span>Home</span>
            </Link>
            <Link
              to="/players"
              aria-current="page"
              className="relative inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-3 text-caption font-extrabold text-primary-foreground ring-1 ring-primary/60 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Trophy className="size-3.5" aria-hidden="true" />
              <span>Players</span>
              <span
                className="ml-0.5 inline-flex size-1.5 rounded-full bg-primary-foreground/70 animate-pulse motion-reduce:animate-none"
                aria-hidden="true"
              />
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-positive/10 px-3 text-caption font-semibold text-positive ring-1 ring-positive/30 transition-colors hover:bg-positive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ShieldCheck className="size-3.5" aria-hidden="true" /> Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 relative">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-gold mb-2">Players</div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
                The World Cup, <span className="text-gold">player by player.</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl">
                Every goal and card from 1930–2022, merged live with the 2026 tournament.
              </p>
            </div>
            <button
              onClick={sharePage}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Share2 className="size-3.5" /> Share view
            </button>
          </div>

          <KpiStrip
            totalPlayers={countCountUnique(GOALS)}
            totalGoals={GOALS.filter((g) => !g.og).length}
            tournaments={new Set(GOALS.map((g) => g.year)).size}
            live2026={live2026Goals.length}
          />
        </div>
      </section>

      <PlayerSubNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Filters: desktop bar + mobile sheet trigger */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2 md:hidden">
            <FilterSheet countries={countries} />
            <div className="text-xs text-muted-foreground tabular-nums">
              {topScorers.length} players
            </div>
          </div>
          <div className="hidden md:block">
            <FilterBar countries={countries} />
          </div>
          <ActiveFilterChips />
        </section>

        {/* Tab content */}
        {search.tab === "overview" && (
          <OverviewTab
            topScorers={topScorers}
            countryStats={countryStats}
            onPickPlayer={openPlayer}
            live2026Count={new Set(live2026Goals.map((g) => g.pid)).size}
          />
        )}

        {search.tab === "scorers" && <ScorersTab rows={topScorers} onPick={openPlayer} />}

        {search.tab === "discipline" && <DisciplineTab yellow={topYellow} red={topRed} />}

        {search.tab === "countries" && <CountriesTab rows={countryStats} />}

        {search.tab === "rankings" && <RankingsTab />}

        {search.tab === "compare" && (
          <Suspense fallback={<SectionSkeleton />}>
            <CompareView />
          </Suspense>
        )}

        {search.tab === "records" && (
          <Suspense fallback={<SectionSkeleton />}>
            <RecordsPanel />
          </Suspense>
        )}

        <AdSlot slot="in_content" layout="in-article" />
      </main>

      <PlayerProfileSheet />
    </div>
  );
}

function countCountUnique(rows: GoalRow[]): number {
  const s = new Set<string>();
  for (const g of rows) s.add(`${g.pid}|${g.pteam}`);
  return s.size;
}

/* ---- KPI strip ---- */
function KpiStrip({
  totalPlayers,
  totalGoals,
  tournaments,
  live2026,
}: {
  totalPlayers: number;
  totalGoals: number;
  tournaments: number;
  live2026: number;
}) {
  const items = [
    { label: "Players tracked", value: totalPlayers.toLocaleString() },
    { label: "Goals recorded", value: totalGoals.toLocaleString() },
    { label: "Tournaments", value: tournaments },
    { label: "2026 live goals", value: live2026, live: true },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
      {items.map((i) => (
        <div key={i.label} className="rounded-xl border border-border bg-card/60 backdrop-blur p-4">
          <div className="text-2xl sm:text-3xl font-extrabold tabular-nums text-gold flex items-center gap-2">
            {i.value}
            {i.live && Number(i.value) > 0 && (
              <span
                className="size-2 rounded-full bg-live animate-pulse motion-reduce:animate-none"
                aria-hidden="true"
              />
            )}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
            {i.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-32 rounded-2xl bg-card/60" />
      <div className="h-64 rounded-2xl bg-card/60" />
    </div>
  );
}

void playersDefaults;
