import { useMemo, lazy, Suspense } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, ShieldCheck, Share2, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { flagOf } from "@/lib/flags";
import { AdSlot } from "@/components/ads/AdSlot";
import cardsData from "@/data/wc_cards.json";
import fifaRankings from "@/data/fifa_rankings.json";
import { getFifaRankings } from "@/lib/wc2026.functions";
import { useMergedGoals, type GoalRow } from "@/lib/use-merged-goals";

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
import { Wc2026Podium } from "@/components/players/Wc2026Podium";

const CompareView = lazy(() =>
  import("@/components/players/CompareView").then((m) => ({ default: m.CompareView })),
);
const RecordsPanel = lazy(() =>
  import("@/components/players/RecordsPanel").then((m) => ({ default: m.RecordsPanel })),
);

type CardRow = {
  pid: string; name: string; team: string; year: number;
  type: "yellow" | "red"; pos: string;
};

const CARDS = cardsData as CardRow[];

export const Route = createFileRoute("/players")({
  validateSearch: zodValidator(playersSearchSchema),
  head: () => ({
    meta: [
      { title: "Player Statistics — FIFA World Cup Archive" },
      {
        name: "description",
        content:
          "All-time World Cup top scorers, card leaders, country stats, live 2026 leaders, player comparisons and records. Filter by year, country, confederation, era, position and goal type.",
      },
      { property: "og:title", content: "Player Statistics — FIFA World Cup" },
      {
        property: "og:description",
        content: "Top scorers, records, player comparisons — 1930 to 2026.",
      },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const { isAdmin } = useAuth();
  const search = Route.useSearch() as PlayersSearch;
  const navigate = useNavigate({ from: "/players" });
  const { goals: GOALS, live2026Goals } = useMergedGoals();

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

  const selectedCountries = useMemo(
    () => new Set(parseList(search.countries)),
    [search.countries],
  );
  const selectedConfeds = useMemo(
    () => new Set(parseList(search.confeds)),
    [search.confeds],
  );

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
  }, [GOALS, search.goalType, search.pos, search.q, selectedYears, selectedCountries, selectedConfeds]);

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

    type Enriched = typeof enriched[number];
    const sorters: Record<string, (a: Enriched, b: Enriched) => number> = {
      goals: (a, b) => b.goals - a.goals || a.name.localeCompare(b.name),
      goals_per_tournament: (a, b) => b.gpt - a.gpt || b.goals - a.goals,
      tournaments: (a, b) => b.tournaments - a.tournaments || b.goals - a.goals,
      name: (a, b) => a.name.localeCompare(b.name),
      recent: (a, b) =>
        (b.yearsList[b.yearsList.length - 1] ?? 0) -
          (a.yearsList[a.yearsList.length - 1] ?? 0) || b.goals - a.goals,
    };
    const sorter = sorters[search.sort] ?? sorters.goals;
    return enriched.sort(sorter).slice(0, 100);
  }, [filteredGoals, search.minGoals, search.sort]);

  const topYellow = useMemo(() => buildCardLeaderboard(filteredCards, "yellow", 15), [filteredCards]);
  const topRed = useMemo(() => buildCardLeaderboard(filteredCards, "red", 15), [filteredCards]);

  const countryStats = useMemo(() => {
    const agg = new Map<string, {
      country: string; years: Set<number>; goals: number;
      players: Set<string>; topScorer: { name: string; goals: number } | null;
      scorerCount: Map<string, { name: string; goals: number }>;
    }>();
    for (const g of GOALS) {
      if (g.og) continue;
      if (selectedConfeds.size) {
        const conf = confederationLabel(g.pteam);
        if (!conf || !selectedConfeds.has(conf)) continue;
      }
      const key = g.pteam;
      let ex = agg.get(key);
      if (!ex) {
        ex = { country: g.pteam, years: new Set(), goals: 0,
               players: new Set(), topScorer: null, scorerCount: new Map() };
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
        country: c.country, tournaments: c.years.size, goals: c.goals,
        playerCount: c.players.size, topScorer: top,
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
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
  };

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-gold/15 grid place-items-center ring-1 ring-gold/30">
              <Trophy className="size-5 text-gold" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">FIFA World Cup</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-gold">Archive</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2 text-sm">
            <Link to="/" className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Home</Link>
            <Link to="/players" className="px-3 py-1.5 rounded-md text-gold bg-gold/10">Players</Link>
            {isAdmin && (
              <Link to="/admin" className="ml-1 px-3 py-1.5 rounded-md text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Admin
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

        {search.tab === "scorers" && (
          <ScorersTab rows={topScorers} onPick={openPlayer} />
        )}

        {search.tab === "discipline" && (
          <DisciplineTab yellow={topYellow} red={topRed} />
        )}

        {search.tab === "countries" && (
          <CountriesTab rows={countryStats} />
        )}

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

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Player data: jfjelstul/worldcup (1930–2022) · Live 2026 from Sofascore
      </footer>

      <PlayerProfileSheet />
    </div>
  );
}

function countCountUnique(rows: GoalRow[]): number {
  const s = new Set<string>();
  for (const g of rows) s.add(`${g.pid}|${g.pteam}`);
  return s.size;
}

/* ───────── KPI strip ───────── */
function KpiStrip({
  totalPlayers, totalGoals, tournaments, live2026,
}: { totalPlayers: number; totalGoals: number; tournaments: number; live2026: number }) {
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
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
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

/* ───────── Overview tab ───────── */
type ScorerRow = {
  name: string; country: string; goals: number; tournaments: number;
  yearsList: number[]; live2026: number; gpt: number;
};

function OverviewTab({
  topScorers, countryStats, onPickPlayer, live2026Count,
}: {
  topScorers: ScorerRow[];
  countryStats: { country: string; tournaments: number; goals: number; playerCount: number; topScorer: { name: string; goals: number } | null }[];
  onPickPlayer: (n: string, c: string) => void;
  live2026Count: number;
}) {
  const navigate = useNavigate({ from: "/players" });
  const go = (tab: PlayersSearch["tab"]) =>
    navigate({ search: (prev: PlayersSearch) => ({ ...prev, tab }), replace: true });

  const top5 = topScorers.slice(0, 5);
  const topCountries = countryStats.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp className="size-4 text-gold" /> Top 5 scorers
            </h3>
            <button onClick={() => go("scorers")} className="text-xs text-gold hover:underline">
              See all →
            </button>
          </div>
          <ol className="divide-y divide-border">
            {top5.map((s, i) => (
              <li
                key={s.name + s.country}
                onClick={() => onPickPlayer(s.name, s.country)}
                className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-accent/40 -mx-2 px-2 rounded-md"
              >
                <span className="w-6 text-muted-foreground font-bold tabular-nums">{i + 1}</span>
                <span className="text-xl">{flagOf(s.country)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {s.country} • {s.tournaments} WC
                  </div>
                </div>
                <span className="text-gold font-extrabold text-lg tabular-nums">{s.goals}</span>
              </li>
            ))}
            {top5.length === 0 && <EmptyBlock label="No data for current filters." />}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">🌍 Top nations</h3>
            <button onClick={() => go("countries")} className="text-xs text-gold hover:underline">
              See all →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topCountries.map((c) => (
              <div key={c.country} className="rounded-lg bg-background border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{flagOf(c.country)}</span>
                  <span className="font-semibold text-sm truncate">{c.country}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {c.tournaments} WC · <span className="text-gold font-bold">{c.goals}</span> goals
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {live2026Count > 0 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center gap-3">
          <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex-1">
            <div className="font-bold">2026 World Cup is live</div>
            <div className="text-sm text-muted-foreground">
              {live2026Count} active scorers are merged into the leaderboards above.
            </div>
          </div>
          <button onClick={() => go("scorers")} className="text-xs text-emerald-300 hover:underline">
            View leaderboard →
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────── Scorers tab ───────── */
function ScorersTab({
  rows, onPick,
}: { rows: ScorerRow[]; onPick: (n: string, c: string) => void }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">🥇 Top Scorers</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          Showing {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <EmptyBlock label="No goal data matches the current filters." />
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden bg-card/40">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[60px_1fr_180px_80px_90px_110px_1fr] gap-4 px-5 py-3 bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
            <div>Rank</div>
            <div>Player</div>
            <div>Country</div>
            <div className="text-right">Goals</div>
            <div className="text-right">G/WC</div>
            <div className="text-right">Tournaments</div>
            <div>Years</div>
          </div>
          <ul className="divide-y divide-border">
            {rows.map((r, i) => <ScorerRowItem key={r.name + r.country + i} rank={i + 1} row={r} onPick={() => onPick(r.name, r.country)} />)}
          </ul>
        </div>
      )}
    </section>
  );
}

function ScorerRowItem({
  rank, row, onPick,
}: { rank: number; row: ScorerRow; onPick: () => void }) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const tint =
    rank === 1 ? "bg-gradient-to-r from-amber-500/15 via-amber-500/[0.03] to-transparent"
    : rank === 2 ? "bg-gradient-to-r from-zinc-300/10 to-transparent"
    : rank === 3 ? "bg-gradient-to-r from-orange-700/15 to-transparent"
    : "";

  return (
    <li
      onClick={onPick}
      className={`grid grid-cols-[44px_1fr_auto] md:grid-cols-[60px_1fr_180px_80px_90px_110px_1fr] gap-3 md:gap-4 items-center px-4 md:px-5 py-3 cursor-pointer hover:bg-accent/40 transition-colors ${tint}`}
    >
      <div className="text-base md:text-lg font-extrabold text-muted-foreground flex items-center">
        {medal ? <span className="text-2xl">{medal}</span> : `#${rank}`}
      </div>
      <div className="min-w-0">
        <div className="font-semibold truncate flex items-center gap-2">
          {row.name}
          {row.live2026 > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/15 ring-1 ring-emerald-500/30 px-1.5 py-0.5 rounded">
              <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
              {row.live2026} · 2026
            </span>
          )}
        </div>
        <div className="md:hidden text-xs text-muted-foreground truncate">
          {flagOf(row.country)} {row.country} • {row.tournaments} WC
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm min-w-0">
        <span className="text-base">{flagOf(row.country)}</span>
        <span className="truncate">{row.country}</span>
      </div>
      <div className="text-right text-gold font-extrabold text-lg md:text-xl tabular-nums">
        {row.goals}
        <span className="md:hidden text-[10px] uppercase text-muted-foreground ml-1">G</span>
      </div>
      <div className="hidden md:block text-right text-foreground/80 tabular-nums">
        {row.gpt.toFixed(1)}
      </div>
      <div className="hidden md:block text-right text-muted-foreground tabular-nums">
        {row.tournaments}
      </div>
      <div className="hidden md:block text-xs text-muted-foreground truncate">
        {row.yearsList.join(", ")}
      </div>
    </li>
  );
}

/* ───────── Discipline tab ───────── */
function DisciplineTab({
  yellow, red,
}: {
  yellow: { name: string; country: string; total: number }[];
  red: { name: string; country: string; total: number }[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold">🟨 Most Disciplined Players</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CardTable title="Most Yellow Cards" accent="yellow" rows={yellow} />
        <CardTable title="Most Red Cards" accent="red" rows={red} />
      </div>
    </section>
  );
}

function CardTable({
  title, accent, rows,
}: {
  title: string; accent: "yellow" | "red";
  rows: { name: string; country: string; total: number }[];
}) {
  const badge = accent === "yellow" ? "bg-yellow-400" : "bg-red-600";
  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        <span className={`w-5 h-7 rounded-sm shadow ${badge}`} aria-hidden />
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-6 text-xs text-muted-foreground text-center">No data.</div>
      ) : (
        <ol className="divide-y divide-border">
          {rows.map((r, i) => (
            <li key={r.name + r.country + i} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/40">
              <span className="w-6 text-muted-foreground font-semibold tabular-nums">{i + 1}</span>
              <span className="text-base">{flagOf(r.country)}</span>
              <span className="font-medium truncate flex-1">{r.name}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[120px]">
                {r.country}
              </span>
              <span className={`inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded text-xs font-bold ${
                accent === "yellow"
                  ? "bg-yellow-400/15 text-yellow-300 ring-1 ring-yellow-400/40"
                  : "bg-red-500/15 text-red-300 ring-1 ring-red-500/40"
              }`}>
                {r.total}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function buildCardLeaderboard(rows: CardRow[], type: "yellow" | "red", limit: number) {
  const agg = new Map<string, { name: string; country: string; total: number }>();
  for (const r of rows) {
    if (r.type !== type) continue;
    const key = `${r.pid}|${r.team}`;
    const ex = agg.get(key);
    if (ex) ex.total++;
    else agg.set(key, { name: r.name, country: r.team, total: 1 });
  }
  return Array.from(agg.values())
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, limit);
}

/* ───────── Countries tab ───────── */
function CountriesTab({
  rows,
}: {
  rows: { country: string; tournaments: number; goals: number; playerCount: number; topScorer: { name: string; goals: number } | null }[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">🌍 Country Statistics</h2>
        <span className="text-xs text-muted-foreground">All-time totals · {rows.length} nations</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((c) => (
          <div
            key={c.country}
            className="rounded-2xl border border-border bg-card/60 p-5 hover:border-gold/30 hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{flagOf(c.country)}</span>
              <h3 className="text-base font-bold truncate">{c.country}</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              <CStat label="WC" value={c.tournaments} />
              <CStat label="Goals" value={c.goals} accent />
              <CStat label="Players" value={c.playerCount} />
            </div>
            {c.topScorer && (
              <div className="pt-3 border-t border-border text-xs text-muted-foreground">
                <span>Top scorer: </span>
                <span className="text-foreground font-semibold">{c.topScorer.name}</span>
                <span className="text-gold font-bold ml-1.5">{c.topScorer.goals}⚽</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <div className={`text-xl font-extrabold tabular-nums ${accent ? "text-gold" : ""}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

/* ───────── Rankings tab ───────── */
function RankingsTab() {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">🏆 Current FIFA Rankings</h2>
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live from Sofascore
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <h3 className="text-sm font-bold mb-3 text-gold">Men's National Teams</h3>
          <LiveFifaRankings />
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <h3 className="text-sm font-bold mb-3 text-gold">Top Current Players</h3>
          <div className="space-y-1.5 text-sm">
            {fifaRankings.players.map((p) => (
              <div key={p.rank} className="flex items-center justify-between gap-2 py-1 border-b border-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-6 tabular-nums">#{p.rank}</span>
                  <span className="text-lg">{flagOf(p.country)}</span>
                  <span className="font-medium truncate">{p.name}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">{p.club}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Curated from 2024 Ballon d'Or shortlist + recent form. FIFA does not publish an official player ranking.
          </p>
        </div>
      </div>
    </section>
  );
}

function LiveFifaRankings() {
  const fn = useServerFn(getFifaRankings);
  const q = useQuery({
    queryKey: ["fifa_rankings_2026"],
    queryFn: () => fn(),
    staleTime: 60 * 60 * 1000,
  });
  if (q.isLoading) return <div className="text-xs text-muted-foreground py-2">Loading…</div>;
  const rows = q.data?.rows ?? [];
  if (rows.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {fifaRankings.countries.map((c) => (
          <div key={c.rank} className="flex items-center justify-between gap-2 py-1 border-b border-border/60">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground w-6 tabular-nums">#{c.rank}</span>
              <span className="text-lg">{flagOf(c.country)}</span>
              <span className="truncate">{c.country}</span>
            </div>
            <span className="text-xs text-gold tabular-nums">{c.points}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
      {rows.map((r) => (
        <div key={r.team.id} className="flex items-center justify-between gap-2 py-1 border-b border-border/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-muted-foreground w-6 tabular-nums">#{r.rank}</span>
            <span className="text-base leading-none">{flagOf(r.team.name)}</span>
            <span className="truncate">{r.team.name}</span>
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">{r.group}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground bg-card/30">
      {label}
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
