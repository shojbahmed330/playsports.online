import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Calendar, Trophy, Tv, Flame, ChevronRight, Newspaper } from "lucide-react";
import type { SportConfig } from "@/lib/sports-config";
import {
  getScoreboard,
  getStandings,
  getSportNews,
  type SportGame,
} from "@/lib/espn.functions";
import { GameCard } from "./GameCard";
import { DateScrubber, todayYmd } from "./DateScrubber";
import { StandingsTable } from "./StandingsTable";
import { NewsRail } from "./NewsRail";
import { SportNav } from "./SportNav";
import { Countdown } from "./Countdown";
import { GameGridSkeleton, StandingsSkeleton } from "./Skeletons";
import { AdSlot } from "@/components/ads/AdSlot";
import { formatLocalTime, relativeDay } from "@/lib/time";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";

type TabKey = "scores" | "standings" | "news";
type Filter = "all" | "live" | "upcoming" | "final";

export function LeaguePage({ sport }: { sport: SportConfig }) {
  const [day, setDay] = useState<string>(todayYmd());
  const [tab, setTab] = useState<TabKey>("scores");
  const [filter, setFilter] = useState<Filter>("all");

  const scoreboardFn = useServerFn(getScoreboard);
  const standingsFn = useServerFn(getStandings);
  const newsFn = useServerFn(getSportNews);

  const sbQ = useQuery({
    queryKey: ["espn", sport.slug, "scoreboard", day],
    queryFn: () => scoreboardFn({ data: { sportPath: sport.path, league: sport.label, yyyymmdd: day } }),
    staleTime: 30_000,
    retry: 1,
    // Poll every 30s while any game is live
    refetchInterval: (q) => {
      const data = q.state.data as { games?: SportGame[] } | undefined;
      return data?.games?.some((g) => g.status === "in") ? 30_000 : false;
    },
  });
  const stQ = useQuery({
    queryKey: ["espn", sport.slug, "standings"],
    queryFn: () => standingsFn({ data: { sportPath: sport.path } }),
    staleTime: 60 * 60_000,
    retry: 1,
  });
  const nwQ = useQuery({
    queryKey: ["espn", sport.slug, "news"],
    queryFn: () => newsFn({ data: { sportPath: sport.path } }),
    staleTime: 30 * 60_000,
    retry: 1,
  });

  const games = sbQ.data?.games ?? [];
  const liveCount = games.filter((g) => g.status === "in").length;
  const finalCount = games.filter((g) => g.status === "post").length;
  const upcomingCount = games.filter((g) => g.status === "pre").length;

  const filtered = useMemo(() => {
    if (filter === "all") return games;
    if (filter === "live") return games.filter((g) => g.status === "in");
    if (filter === "upcoming") return games.filter((g) => g.status === "pre");
    return games.filter((g) => g.status === "post");
  }, [games, filter]);

  // Featured: live game first, else next upcoming
  const featured: SportGame | null = useMemo(() => {
    return (
      games.find((g) => g.status === "in") ??
      games.filter((g) => g.status === "pre").sort((a, b) => a.startTs - b.startTs)[0] ??
      null
    );
  }, [games]);

  const showTies = sport.slug === "mls" || sport.slug === "nhl";
  const showOT = sport.slug === "nhl";

  return (
    <div className="min-h-screen">
      <SportNav />
      <Breadcrumbs />



      {/* HERO */}
      <section className={`relative overflow-hidden border-b border-border bg-gradient-to-br ${sport.bgGrad}`}>
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(70% 90% at 10% 0%, rgba(255,255,255,0.06), transparent 60%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className={`size-16 sm:size-20 rounded-2xl ${sport.chipBg} ring-1 ${sport.ring} grid place-items-center text-4xl sm:text-5xl shrink-0`}>
                {sport.emoji}
              </div>
              <div className="min-w-0">
                <div className={`text-[11px] uppercase tracking-[0.2em] ${sport.accent} font-bold`}>
                  {sport.label}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{sport.longName}</h1>
                <p className="text-sm text-muted-foreground mt-1">{sport.tagline}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <Stat label="Today" value={`${games.length} games`} />
                  {liveCount > 0 && <Stat label="Live now" value={liveCount} tone="red" />}
                  {upcomingCount > 0 && <Stat label="Upcoming" value={upcomingCount} tone="amber" />}
                  {finalCount > 0 && <Stat label="Final" value={finalCount} tone="muted" />}
                </div>
              </div>
            </div>

            {featured && (
              <FeaturedCard game={featured} accent={sport.accent} />
            )}
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="sticky top-16 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
          <TabBtn icon={<Calendar className="size-4" />} label="Scores" active={tab === "scores"} onClick={() => setTab("scores")} count={games.length} accent={sport.accent} />
          <TabBtn icon={<Trophy className="size-4" />} label="Standings" active={tab === "standings"} onClick={() => setTab("standings")} accent={sport.accent} />
          <TabBtn icon={<Newspaper className="size-4" />} label="News" active={tab === "news"} onClick={() => setTab("news")} count={nwQ.data?.items.length} accent={sport.accent} />
        </div>
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {tab === "scores" && (
          <section className="space-y-4 tab-slide">
            <DateScrubber selected={day} onChange={setDay} />

            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip label="All" count={games.length} active={filter === "all"} onClick={() => setFilter("all")} />
              <FilterChip label="Live" count={liveCount} active={filter === "live"} onClick={() => setFilter("live")} tone="red" />
              <FilterChip label="Upcoming" count={upcomingCount} active={filter === "upcoming"} onClick={() => setFilter("upcoming")} tone="amber" />
              <FilterChip label="Final" count={finalCount} active={filter === "final"} onClick={() => setFilter("final")} />
              {sbQ.isFetching && !sbQ.isLoading && (
                <span className="ml-auto text-[10px] text-gray-500 inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" /> Updating…
                </span>
              )}
            </div>

            {sbQ.isLoading ? (
              <GameGridSkeleton />
            ) : sbQ.data?.error && games.length === 0 ? (
              <ErrBox msg={sbQ.data.error} />
            ) : filtered.length === 0 ? (
              <EmptyBox
                icon={<Tv className="size-10 opacity-30" />}
                title={filter === "all" ? "No games on this date" : `No ${filter} games right now`}
                body="Try another day from the scrubber above, or switch filters."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map((g) => <GameCard key={g.id} game={g} />)}
              </div>
            )}

            <AdSlot slot="in_content" layout="in-article" />
          </section>
        )}

        {tab === "standings" && (
          <section className="space-y-4 tab-slide">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className={`size-4 ${sport.accent}`} /> Standings
            </h2>
            {stQ.isLoading ? (
              <StandingsSkeleton />
            ) : stQ.data?.error && (stQ.data?.groups?.length ?? 0) === 0 ? (
              <ErrBox msg={stQ.data.error} />
            ) : (
              <StandingsTable groups={stQ.data?.groups ?? []} showTies={showTies} showOT={showOT} />
            )}
          </section>
        )}

        {tab === "news" && (
          <section className="tab-slide">
            {nwQ.isLoading ? (
              <GameGridSkeleton count={6} />
            ) : (nwQ.data?.items?.length ?? 0) === 0 ? (
              <EmptyBox
                icon={<Newspaper className="size-10 opacity-30" />}
                title="No news right now"
                body="Check back soon."
              />
            ) : (
              <NewsRail items={nwQ.data!.items} />
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Data from ESPN's public sports feed · Auto-refreshes while games are live
      </footer>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "red" | "amber" | "muted";
}) {
  const cls =
    tone === "red"
      ? "bg-red-500/15 text-red-300 ring-red-500/30"
      : tone === "amber"
      ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
      : tone === "muted"
      ? "bg-gray-800/60 text-gray-400 ring-gray-700/60"
      : "bg-white/5 text-gray-200 ring-white/10";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ring-1 font-semibold ${cls}`}>
      {tone === "red" && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
      <span className="text-[10px] uppercase tracking-wider opacity-80">{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

function TabBtn({
  icon,
  label,
  active,
  onClick,
  count,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors
        ${active ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
    >
      {icon} {label}
      {count != null && count > 0 && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 tabular-nums">
          {count}
        </span>
      )}
      {active && (
        <span className={`absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-current ${accent}`} />
      )}
    </button>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  tone = "default",
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "default" | "red" | "amber";
}) {
  const base = active
    ? tone === "red"
      ? "bg-red-500 text-white ring-red-400"
      : tone === "amber"
      ? "bg-amber-500 text-black ring-amber-400"
      : "bg-white text-black ring-white"
    : "bg-gray-900 text-gray-300 ring-gray-800 hover:ring-gray-700";
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 transition-colors ${base}`}
    >
      {tone === "red" && !active && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
      {label}
      <span className="tabular-nums opacity-70 text-[10px]">{count}</span>
    </button>
  );
}

function FeaturedCard({ game, accent }: { game: SportGame; accent: string }) {
  const isLive = game.status === "in";
  return (
    <div className="w-full lg:w-[420px] rounded-2xl bg-black/40 backdrop-blur ring-1 ring-white/10 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accent} inline-flex items-center gap-1.5`}>
          {isLive ? (
            <>
              <Flame className="size-3" /> Featured · Live
            </>
          ) : (
            <>
              <ChevronRight className="size-3" /> Next up
            </>
          )}
        </span>
        {isLive ? (
          <span className="text-[10px] font-bold text-red-300 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> {game.shortDetail}
          </span>
        ) : (
          <Countdown ts={game.startTs} />
        )}
      </div>
      <div className="space-y-2">
        <FeaturedRow t={game.away} live={isLive} />
        <FeaturedRow t={game.home} live={isLive} />
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-400">
        <span>{relativeDay(game.startTs)} · {formatLocalTime(game.startTs)}</span>
        {game.venue && <span className="truncate ml-2">{game.venue}</span>}
      </div>
    </div>
  );
}

function FeaturedRow({ t, live }: { t: import("@/lib/espn.functions").SportTeam; live: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-9 rounded-lg bg-white/5 grid place-items-center overflow-hidden ring-1 ring-white/10">
        {t.logo ? <img loading="lazy" decoding="async" src={t.logo} alt="" className="size-7 object-contain" /> : <span className="text-[10px] text-gray-400">{t.abbr}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{t.name}</div>
        {t.record && <div className="text-[10px] text-gray-500">{t.record}</div>}
      </div>
      <div className="text-2xl font-extrabold text-white tabular-nums">{live ? (t.score ?? 0) : "–"}</div>
    </div>
  );
}

function ErrBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
      ⚠️ {msg}
    </div>
  );
}
function EmptyBox({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
      <div className="mx-auto mb-3 inline-block">{icon}</div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
