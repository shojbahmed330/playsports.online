import { useNavigate } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { flagOf } from "@/lib/flags";
import { EmptyState } from "@/components/ui/state";
import { Wc2026Podium } from "@/components/players/Wc2026Podium";
import type { PlayersSearch } from "@/lib/players-filters";
import type { CardRow } from "@/lib/use-merged-cards";
import fifaRankings from "@/data/fifa_rankings.json";

export type ScorerRow = {
  name: string;
  country: string;
  goals: number;
  tournaments: number;
  yearsList: number[];
  live2026: number;
  gpt: number;
};

export type CountryStat = {
  country: string;
  tournaments: number;
  goals: number;
  playerCount: number;
  topScorer: { name: string; goals: number } | null;
};

function EmptyBlock({ label }: { label: string }) {
  return <EmptyState title="No data" description={label} />;
}

/* ───────── Overview tab ───────── */
export function OverviewTab({
  topScorers,
  countryStats,
  onPickPlayer,
  live2026Count,
}: {
  topScorers: ScorerRow[];
  countryStats: CountryStat[];
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
      <Wc2026Podium onPick={onPickPlayer} />
      {void live2026Count}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold">
              <TrendingUp className="size-4 text-gold" aria-hidden="true" /> Top 5 scorers
            </h3>
            <button
              type="button"
              onClick={() => go("scorers")}
              className="inline-flex min-h-11 items-center text-micro text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all →
            </button>
          </div>
          <ol className="divide-y divide-border">
            {top5.map((s, i) => (
              <li
                key={s.name + s.country}
                onClick={() => onPickPlayer(s.name, s.country)}
                className="-mx-2 flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 hover:bg-accent/40"
              >
                <span className="w-6 font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="text-xl" aria-hidden="true">
                  {flagOf(s.country)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{s.name}</div>
                  <div className="truncate text-micro text-muted-foreground">
                    {s.country} • {s.tournaments} WC
                  </div>
                </div>
                <span className="text-lg font-extrabold tabular-nums text-gold">{s.goals}</span>
              </li>
            ))}
            {top5.length === 0 && <EmptyBlock label="No data for current filters." />}
          </ol>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">
              <span aria-hidden="true">🌍</span> Top nations
            </h3>
            <button
              type="button"
              onClick={() => go("countries")}
              className="inline-flex min-h-11 items-center text-micro text-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topCountries.map((c) => (
              <div key={c.country} className="rounded-lg border border-border bg-background p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">
                    {flagOf(c.country)}
                  </span>
                  <span className="truncate text-caption font-semibold">{c.country}</span>
                </div>
                <div className="text-micro text-muted-foreground">
                  {c.tournaments} WC · <span className="font-bold text-gold">{c.goals}</span> goals
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {live2026Count > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-live/30 bg-live/5 p-5">
          <span
            className="size-2.5 rounded-full bg-live animate-pulse motion-reduce:animate-none"
            aria-hidden="true"
          />
          <div className="flex-1">
            <div className="font-bold">2026 World Cup is live</div>
            <div className="text-caption text-muted-foreground">
              {live2026Count} active scorers are merged into the leaderboards above.
            </div>
          </div>
          <button
            type="button"
            onClick={() => go("scorers")}
            className="inline-flex min-h-11 items-center text-caption text-live hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View leaderboard →
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────── Scorers tab ───────── */
export function ScorersTab({
  rows,
  onPick,
}: {
  rows: ScorerRow[];
  onPick: (n: string, c: string) => void;
}) {
  return (
    <section className="space-y-4">
      <Wc2026Podium onPick={onPick} />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold sm:text-2xl">
          <span aria-hidden="true">🥇</span> Top Scorers
        </h2>
        <span className="text-caption tabular-nums text-muted-foreground">
          Showing {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <EmptyBlock label="No goal data matches the current filters." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card/40">
          {/* Desktop header */}
          <div className="hidden grid-cols-[60px_1fr_180px_80px_90px_110px_1fr] gap-4 bg-muted/50 px-5 py-3 text-micro uppercase text-muted-foreground md:grid">
            <div>Rank</div>
            <div>Player</div>
            <div>Country</div>
            <div className="text-right">Goals</div>
            <div className="text-right">G/WC</div>
            <div className="text-right">Tournaments</div>
            <div>Years</div>
          </div>
          <ul className="divide-y divide-border">
            {rows.map((r, i) => (
              <ScorerRowItem
                key={r.name + r.country + i}
                rank={i + 1}
                row={r}
                onPick={() => onPick(r.name, r.country)}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function ScorerRowItem({
  rank,
  row,
  onPick,
}: {
  rank: number;
  row: ScorerRow;
  onPick: () => void;
}) {
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  const tint =
    rank === 1
      ? "bg-gradient-to-r from-gold/15 via-gold/[0.03] to-transparent"
      : rank === 2
        ? "bg-gradient-to-r from-muted-foreground/10 to-transparent"
        : rank === 3
          ? "bg-gradient-to-r from-primary/15 to-transparent"
          : "";

  return (
    <li
      onClick={onPick}
      className={`grid cursor-pointer grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/40 md:grid-cols-[60px_1fr_180px_80px_90px_110px_1fr] md:gap-4 md:px-5 ${tint}`}
    >
      <div className="flex items-center text-base font-extrabold text-muted-foreground md:text-lg">
        {medal ? (
          <span className="text-2xl" aria-hidden="true">
            {medal}
          </span>
        ) : (
          `#${rank}`
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 truncate font-semibold">
          {row.name}
          {row.live2026 > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-live/15 px-1.5 py-0.5 text-micro font-bold uppercase text-live ring-1 ring-live/30">
              <span
                className="size-1 rounded-full bg-live animate-pulse motion-reduce:animate-none"
                aria-hidden="true"
              />
              {row.live2026} · 2026
            </span>
          )}
        </div>
        <div className="truncate text-micro text-muted-foreground md:hidden">
          <span aria-hidden="true">{flagOf(row.country)}</span> {row.country} • {row.tournaments} WC
        </div>
      </div>
      <div className="hidden min-w-0 items-center gap-2 text-caption text-muted-foreground md:flex">
        <span className="text-base" aria-hidden="true">
          {flagOf(row.country)}
        </span>
        <span className="truncate">{row.country}</span>
      </div>
      <div className="text-right text-lg font-extrabold tabular-nums text-gold md:text-xl">
        {row.goals}
        <span className="ml-1 text-micro uppercase text-muted-foreground md:hidden">G</span>
      </div>
      <div className="hidden text-right tabular-nums text-foreground/80 md:block">
        {row.gpt.toFixed(1)}
      </div>
      <div className="hidden text-right tabular-nums text-muted-foreground md:block">
        {row.tournaments}
      </div>
      <div className="hidden truncate text-micro text-muted-foreground md:block">
        {row.yearsList.join(", ")}
      </div>
    </li>
  );
}

/* ───────── Discipline tab ───────── */
export function buildCardLeaderboard(rows: CardRow[], type: "yellow" | "red", limit: number) {
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

export function DisciplineTab({
  yellow,
  red,
}: {
  yellow: { name: string; country: string; total: number }[];
  red: { name: string; country: string; total: number }[];
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold sm:text-2xl">
        <span aria-hidden="true">🟨</span> Most Disciplined Players
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CardTable title="Most Yellow Cards" accent="yellow" rows={yellow} />
        <CardTable title="Most Red Cards" accent="red" rows={red} />
      </div>
    </section>
  );
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
  const badge = accent === "yellow" ? "bg-gold" : "bg-live";
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/60">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-caption font-bold">{title}</h3>
        <span className={`h-7 w-5 rounded-sm shadow ${badge}`} aria-hidden="true" />
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-micro text-muted-foreground">No data.</div>
      ) : (
        <ol className="divide-y divide-border">
          {rows.map((r, i) => (
            <li
              key={r.name + r.country + i}
              className="flex items-center gap-3 px-4 py-2.5 text-caption hover:bg-accent/40"
            >
              <span className="w-6 font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
              <span className="text-base" aria-hidden="true">
                {flagOf(r.country)}
              </span>
              <span className="flex-1 truncate font-medium">{r.name}</span>
              <span className="hidden max-w-[120px] truncate text-micro text-muted-foreground sm:inline">
                {r.country}
              </span>
              <span
                className={`inline-flex min-w-[36px] items-center justify-center rounded px-2 py-0.5 text-micro font-bold ${
                  accent === "yellow"
                    ? "bg-gold/15 text-gold ring-1 ring-gold/40"
                    : "bg-live/15 text-live ring-1 ring-live/40"
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

/* ───────── Countries tab ───────── */
export function CountriesTab({ rows }: { rows: CountryStat[] }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold sm:text-2xl">
          <span aria-hidden="true">🌍</span> Country Statistics
        </h2>
        <span className="text-caption text-muted-foreground">
          All-time totals · {rows.length} nations
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div
            key={c.country}
            className="rounded-2xl border border-border bg-card/60 p-5 transition-all hover:-translate-y-0.5 hover:border-gold/30"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                {flagOf(c.country)}
              </span>
              <h3 className="truncate text-body font-bold">{c.country}</h3>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              <CStat label="WC" value={c.tournaments} />
              <CStat label="Goals" value={c.goals} accent />
              <CStat label="Players" value={c.playerCount} />
            </div>
            {c.topScorer && (
              <div className="border-t border-border pt-3 text-micro text-muted-foreground">
                <span>Top scorer: </span>
                <span className="font-semibold text-foreground">{c.topScorer.name}</span>
                <span className="ml-1.5 font-bold text-gold">{c.topScorer.goals}⚽</span>
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
      <div className={`text-xl font-extrabold tabular-nums ${accent ? "text-gold" : ""}`}>
        {value}
      </div>
      <div className="text-micro uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

/* ───────── Rankings tab ───────── */
export function RankingsTab() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold sm:text-2xl">
          <span aria-hidden="true">🏆</span> Current FIFA Rankings
        </h2>
        <span className="text-caption text-muted-foreground">
          Updated June 2026 · Source: FIFA.com
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <h3 className="mb-3 text-caption font-bold text-gold">Men's National Teams</h3>
          <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 text-caption sm:grid-cols-2">
            {fifaRankings.countries.map((c) => (
              <div
                key={c.rank}
                className="flex items-center justify-between gap-2 border-b border-border/60 py-1"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-6 text-micro tabular-nums text-muted-foreground">
                    #{c.rank}
                  </span>
                  <span className="text-lg" aria-hidden="true">
                    {flagOf(c.country)}
                  </span>
                  <span className="truncate">{c.country}</span>
                </div>
                <span className="text-micro tabular-nums text-gold">{c.points}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <h3 className="mb-3 text-caption font-bold text-gold">Top Current Players</h3>
          <div className="space-y-1.5 text-caption">
            {fifaRankings.players.map((p) => (
              <div
                key={p.rank}
                className="flex items-center justify-between gap-2 border-b border-border/60 py-1"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-6 text-micro tabular-nums text-muted-foreground">
                    #{p.rank}
                  </span>
                  <span className="text-lg" aria-hidden="true">
                    {flagOf(p.country)}
                  </span>
                  <span className="truncate font-medium">{p.name}</span>
                </div>
                <span className="truncate text-micro text-muted-foreground">{p.club}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-micro text-muted-foreground">
            Curated from 2024 Ballon d'Or shortlist + recent form. FIFA does not publish an official
            player ranking.
          </p>
        </div>
      </div>
    </section>
  );
}
