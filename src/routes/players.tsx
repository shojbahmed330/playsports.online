import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Search, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { flagOf } from "@/lib/flags";
import { WC_YEARS } from "@/lib/supabase";
import { AdSlot } from "@/components/ads/AdSlot";
import goalsData from "@/data/wc_goals.json";
import cardsData from "@/data/wc_cards.json";
import fifaRankings from "@/data/fifa_rankings.json";
import { getFifaRankings, wc2026TeamLogo } from "@/lib/wc2026.functions";

type GoalRow = {
  pid: string;
  name: string;
  team: string;   // team the goal was scored FOR
  pteam: string;  // player's actual country
  year: number;
  og: boolean;
  pen: boolean;
  pos: string;
};
type CardRow = {
  pid: string;
  name: string;
  team: string;
  year: number;
  type: "yellow" | "red";
  pos: string;
};

const GOALS = goalsData as GoalRow[];
const CARDS = cardsData as CardRow[];

type Position = "ALL" | "GK" | "DEF" | "MID" | "FWD";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Player Statistics — FIFA World Cup Archive" },
      {
        name: "description",
        content:
          "Complete World Cup player records 1930-2022. Top scorers, most-booked players, country statistics and tournament-by-tournament filters.",
      },
      { property: "og:title", content: "Player Statistics — FIFA World Cup" },
      { property: "og:description", content: "Top scorers and player records 1930-2022" },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const { isAdmin } = useAuth();
  const [year, setYear] = useState<"ALL" | number>("ALL");
  const [country, setCountry] = useState<string>("ALL");
  const [position, setPosition] = useState<Position>("ALL");
  const [search, setSearch] = useState("");

  const countries = useMemo(() => {
    const s = new Set<string>();
    for (const g of GOALS) s.add(g.pteam);
    return Array.from(s).sort();
  }, []);

  const filteredGoals = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GOALS.filter((g) => {
      if (g.og) return false; // exclude own goals from scorer credit
      if (year !== "ALL" && g.year !== year) return false;
      if (country !== "ALL" && g.pteam !== country) return false;
      if (position !== "ALL" && g.pos !== position) return false;
      if (q && !g.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [year, country, position, search]);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CARDS.filter((c) => {
      if (year !== "ALL" && c.year !== year) return false;
      if (country !== "ALL" && c.team !== country) return false;
      if (position !== "ALL" && c.pos !== position) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [year, country, position, search]);

  // Top scorers leaderboard
  const topScorers = useMemo(() => {
    const agg = new Map<
      string,
      { name: string; country: string; goals: number; years: Set<number> }
    >();
    for (const g of filteredGoals) {
      const key = `${g.pid}|${g.pteam}`;
      const ex = agg.get(key);
      if (ex) {
        ex.goals++;
        ex.years.add(g.year);
      } else {
        agg.set(key, {
          name: g.name,
          country: g.pteam,
          goals: 1,
          years: new Set([g.year]),
        });
      }
    }
    return Array.from(agg.values())
      .map((r) => ({
        ...r,
        tournaments: r.years.size,
        yearsList: Array.from(r.years).sort(),
      }))
      .sort((a, b) => b.goals - a.goals || a.name.localeCompare(b.name))
      .slice(0, 50);
  }, [filteredGoals]);

  const topYellow = useMemo(
    () => buildCardLeaderboard(filteredCards, "yellow", 10),
    [filteredCards],
  );
  const topRed = useMemo(
    () => buildCardLeaderboard(filteredCards, "red", 10),
    [filteredCards],
  );

  // Country stats — always all-time (independent of year filter so the section is meaningful)
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
  }, []);

  const [activePlayer, setActivePlayer] = useState<{
    name: string;
    country: string;
  } | null>(null);

  const resetFilters = () => {
    setYear("ALL");
    setCountry("ALL");
    setPosition("ALL");
    setSearch("");
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
            <Link
              to="/"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Home
            </Link>
            <Link
              to="/players"
              className="px-3 py-1.5 rounded-md text-gold bg-gold/10"
            >
              Players
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="ml-1 px-3 py-1.5 rounded-md text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-colors inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="size-3.5" /> Admin
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* TOP BAR */}
        <section className="text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            ⚽ Player <span className="text-gold">Statistics</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Complete World Cup player records 1930–2022
          </p>
        </section>

        {/* FILTERS */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={year === "ALL" ? "ALL" : String(year)}
              onChange={(e) =>
                setYear(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
              }
              className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            >
              <option value="ALL">All Years</option>
              {WC_YEARS.slice().reverse().map((y) => (
                <option key={y} value={y}>{y} World Cup</option>
              ))}
            </select>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            >
              <option value="ALL">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{flagOf(c)} {c}</option>
              ))}
            </select>

            <div className="relative">
              <Search className="size-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player name..."
                className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-800"
                  aria-label="Clear search"
                >
                  <X className="size-3.5 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-gray-500 mr-1">
              Position
            </span>
            {(["ALL", "GK", "DEF", "MID", "FWD"] as Position[]).map((p) => (
              <button
                key={p}
                onClick={() => setPosition(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  position === p
                    ? "bg-gold text-black"
                    : "bg-gray-800/60 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {p === "ALL" ? "All" : p}
              </button>
            ))}
            {(year !== "ALL" || country !== "ALL" || position !== "ALL" || search) && (
              <button
                onClick={resetFilters}
                className="ml-auto text-xs text-gray-400 hover:text-gold underline underline-offset-4"
              >
                Reset filters
              </button>
            )}
          </div>
        </section>

        {/* TOP SCORERS */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">
              🥇 All-Time Top Scorers
            </h2>
            <span className="text-xs text-gray-500">
              {topScorers.length} player{topScorers.length === 1 ? "" : "s"}
            </span>
          </div>

          {topScorers.length === 0 ? (
            <EmptyBlock label="No goal data matches the current filters." />
          ) : (
            <div className="rounded-2xl border border-gray-800 overflow-hidden">
              <div className="hidden md:grid grid-cols-[60px_1fr_180px_80px_110px_1fr] gap-4 px-5 py-3 bg-gray-900/80 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                <div>Rank</div>
                <div>Player</div>
                <div>Country</div>
                <div className="text-right">Goals</div>
                <div className="text-right">Tournaments</div>
                <div>Years Active</div>
              </div>
              <ul className="divide-y divide-gray-800">
                {topScorers.map((r, i) => (
                  <ScorerRow
                    key={r.name + r.country + i}
                    rank={i + 1}
                    row={r}
                    onPick={() => setActivePlayer({ name: r.name, country: r.country })}
                  />
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* AD SLOT */}
        <AdSlot slot="in_content" layout="in-article" />

        {/* CARDS LEADERBOARD */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">🟨 Most Disciplined Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardTable
              title="Most Yellow Cards"
              accent="yellow"
              rows={topYellow}
            />
            <CardTable
              title="Most Red Cards"
              accent="red"
              rows={topRed}
            />
          </div>
        </section>

        {/* COUNTRY STATS */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">🌍 Country Statistics</h2>
            <span className="text-xs text-gray-500">
              All-time totals across every World Cup
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryStats.map((c) => (
              <CountryCard key={c.country} stats={c} />
            ))}
          </div>
        </section>

        {/* CURRENT FIFA RANKINGS — live from Sofascore */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-bold">🏆 Current FIFA Rankings</h2>
            <LiveRankingsHeader />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
              <h3 className="text-sm font-bold mb-3 text-amber-400">Men's National Teams — WC 2026 Qualifiers</h3>
              <LiveFifaRankings />
            </div>
            <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
              <h3 className="text-sm font-bold mb-3 text-amber-400">Top Current Players</h3>
              <div className="space-y-1.5 text-sm">
                {fifaRankings.players.map((p) => (
                  <div key={p.rank} className="flex items-center justify-between gap-2 py-1 border-b border-gray-800/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-500 w-6 tabular-nums">#{p.rank}</span>
                      <span className="text-lg">{flagOf(p.country)}</span>
                      <span className="font-medium truncate">{p.name}</span>
                    </div>
                    <span className="text-xs text-gray-400 truncate">{p.club}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-500 mt-3">
                Curated based on 2024 Ballon d'Or shortlist and recent form. FIFA does not publish an official player ranking.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Player data sourced from the open jfjelstul/worldcup dataset (1930–2022).
      </footer>

      {activePlayer && (
        <PlayerModal
          player={activePlayer}
          onClose={() => setActivePlayer(null)}
        />
      )}
    </div>
  );
}

function ScorerRow({
  rank,
  row,
  onPick,
}: {
  rank: number;
  row: {
    name: string;
    country: string;
    goals: number;
    tournaments: number;
    yearsList: number[];
  };
  onPick: () => void;
}) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const rowClass =
    rank === 1
      ? "bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent"
      : rank === 2
        ? "bg-gradient-to-r from-zinc-300/15 via-zinc-300/5 to-transparent"
        : rank === 3
          ? "bg-gradient-to-r from-orange-700/20 via-orange-700/5 to-transparent"
          : "bg-gray-950";

  const rankColor =
    rank === 1
      ? "text-amber-400"
      : rank === 2
        ? "text-zinc-200"
        : rank === 3
          ? "text-orange-400"
          : "text-gray-500";

  return (
    <li
      onClick={onPick}
      className={`grid grid-cols-[50px_1fr_auto] md:grid-cols-[60px_1fr_180px_80px_110px_1fr] gap-3 md:gap-4 items-center px-4 md:px-5 py-3 md:py-3.5 cursor-pointer hover:bg-gray-800/50 transition-colors ${rowClass}`}
    >
      <div className={`text-lg md:text-xl font-extrabold ${rankColor} flex items-center gap-1`}>
        {medal ? <span className="text-2xl leading-none">{medal}</span> : `#${rank}`}
      </div>
      <div className="min-w-0">
        <div className="text-white font-semibold truncate">{row.name}</div>
        <div className="md:hidden text-xs text-gray-400 truncate">
          {flagOf(row.country)} {row.country} • {row.tournaments} WC
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-gray-400 text-sm min-w-0">
        <span className="text-base">{flagOf(row.country)}</span>
        <span className="truncate">{row.country}</span>
      </div>
      <div className="text-right text-amber-400 font-extrabold text-lg md:text-xl tabular-nums">
        {row.goals}
        <span className="md:hidden text-[10px] uppercase text-gray-500 ml-1">G</span>
      </div>
      <div className="hidden md:block text-right text-gray-300 tabular-nums">
        {row.tournaments}
      </div>
      <div className="hidden md:block text-xs text-gray-500 truncate">
        {row.yearsList.join(", ")}
      </div>
    </li>
  );
}

function buildCardLeaderboard(
  rows: CardRow[],
  type: "yellow" | "red",
  limit: number,
) {
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

function CardTable({
  title,
  accent,
  rows,
}: {
  title: string;
  accent: "yellow" | "red";
  rows: { name: string; country: string; total: number }[];
}) {
  const badgeClass =
    accent === "yellow"
      ? "bg-yellow-400 text-black"
      : "bg-red-600 text-white";
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-bold">{title}</h3>
        <span className={`w-5 h-7 rounded-sm shadow ${badgeClass}`} aria-hidden />
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-6 text-xs text-gray-500 text-center">No data.</div>
      ) : (
        <ol className="divide-y divide-gray-800">
          {rows.map((r, i) => (
            <li
              key={r.name + r.country + i}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-800/40"
            >
              <span className="w-6 text-gray-500 font-semibold tabular-nums">
                {i + 1}
              </span>
              <span className="text-white font-medium truncate flex-1">
                {r.name}
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline truncate max-w-[120px]">
                {flagOf(r.country)} {r.country}
              </span>
              <span
                className={`inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded text-xs font-bold ${
                  accent === "yellow"
                    ? "bg-yellow-400/15 text-yellow-300 ring-1 ring-yellow-400/40"
                    : "bg-red-500/15 text-red-300 ring-1 ring-red-500/40"
                }`}
              >
                {r.total}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function CountryCard({
  stats,
}: {
  stats: {
    country: string;
    tournaments: number;
    goals: number;
    playerCount: number;
    topScorer: { name: string; goals: number } | null;
  };
}) {
  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 hover:border-amber-500/30 hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl leading-none">{flagOf(stats.country)}</span>
        <h3 className="text-base font-bold text-white truncate">{stats.country}</h3>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center mb-3">
        <Stat label="WC" value={stats.tournaments} />
        <Stat label="Goals" value={stats.goals} accent />
        <Stat label="Players" value={stats.playerCount} />
      </dl>
      {stats.topScorer && (
        <div className="pt-3 border-t border-gray-800 text-xs text-gray-400">
          <span className="text-gray-500">Top scorer: </span>
          <span className="text-white font-semibold">{stats.topScorer.name}</span>
          <span className="text-amber-400 font-bold ml-1.5">
            {stats.topScorer.goals}⚽
          </span>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        className={`text-xl font-extrabold tabular-nums ${
          accent ? "text-amber-400" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500">
        {label}
      </div>
    </div>
  );
}

function EmptyBlock({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-800 p-10 text-center text-sm text-gray-500 bg-gray-900/40">
      {label}
    </div>
  );
}

function PlayerModal({
  player,
  onClose,
}: {
  player: { name: string; country: string };
  onClose: () => void;
}) {
  const goals = useMemo(
    () =>
      GOALS.filter(
        (g) =>
          !g.og &&
          g.name === player.name &&
          g.pteam === player.country,
      ),
    [player],
  );
  const cards = useMemo(
    () =>
      CARDS.filter(
        (c) => c.name === player.name && c.team === player.country,
      ),
    [player],
  );

  const byYear = useMemo(() => {
    const m = new Map<number, { goals: number; pen: number; yellow: number; red: number }>();
    for (const g of goals) {
      const r = m.get(g.year) ?? { goals: 0, pen: 0, yellow: 0, red: 0 };
      r.goals++;
      if (g.pen) r.pen++;
      m.set(g.year, r);
    }
    for (const c of cards) {
      const r = m.get(c.year) ?? { goals: 0, pen: 0, yellow: 0, red: 0 };
      if (c.type === "yellow") r.yellow++;
      else r.red++;
      m.set(c.year, r);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a - b);
  }, [goals, cards]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-950 border border-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
              Player Profile
            </div>
            <h3 className="text-2xl font-bold text-white">{player.name}</h3>
            <div className="text-sm text-gray-400 mt-1">
              {flagOf(player.country)} {player.country}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat label="Goals" value={goals.length} accent />
          <Stat label="Penalties" value={goals.filter((g) => g.pen).length} />
          <Stat label="Yellow" value={cards.filter((c) => c.type === "yellow").length} />
          <Stat label="Red" value={cards.filter((c) => c.type === "red").length} />
        </div>

        {byYear.length > 0 && (
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-900 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              <div>Year</div>
              <div className="text-right">Goals</div>
              <div className="text-right">Pen</div>
              <div className="text-right">🟨</div>
              <div className="text-right">🟥</div>
            </div>
            <ul className="divide-y divide-gray-800 max-h-60 overflow-y-auto">
              {byYear.map(([y, r]) => (
                <li key={y} className="grid grid-cols-5 gap-2 px-3 py-2 text-sm tabular-nums">
                  <div className="text-white font-semibold">{y}</div>
                  <div className="text-right text-amber-400 font-bold">{r.goals || ""}</div>
                  <div className="text-right text-gray-400">{r.pen || ""}</div>
                  <div className="text-right text-yellow-300">{r.yellow || ""}</div>
                  <div className="text-right text-red-400">{r.red || ""}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
