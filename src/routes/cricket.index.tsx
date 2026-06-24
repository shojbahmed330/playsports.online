import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Clock, CheckCircle2, Calendar, ChevronRight, Trophy } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { AdSlot } from "@/components/ads/AdSlot";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { getMultiCricketToday, type CricketMatch } from "@/lib/cricket.functions";
import { CRICKET_LEAGUES, FORMAT_META, type CricketLeague } from "@/lib/cricket-leagues";

type FormatFilter = "any" | "t20" | "odi" | "test";

export const Route = createFileRoute("/cricket/")({
  head: () => ({
    meta: [
      { title: "Live Cricket Scores, Fixtures & Stats — Sports Hub" },
      { name: "description", content: "Live cricket scoreboards, fixtures and results across IPL, ICC World Cup, Big Bash, Sheffield Shield and more — all formats, every match." },
      { property: "og:title", content: "Cricket — Live Scores & Fixtures" },
      { property: "og:description", content: "Live scores, upcoming fixtures and recent results from every major cricket competition." },
    ],
  }),
  component: CricketIndex,
});

function CricketIndex() {
  const [activeLeagueId, setActiveLeagueId] = useState<string | "all">("all");
  const [fmt, setFmt] = useState<FormatFilter>("any");

  const multiFn = useServerFn(getMultiCricketToday);
  const leagueIds = CRICKET_LEAGUES.map((l) => l.id);

  const q = useQuery({
    queryKey: ["cricket", "today", leagueIds.join(",")],
    queryFn: () => multiFn({ data: { leagueIds } }),
    staleTime: 20_000,
    retry: 1,
    refetchInterval: (qq) => {
      const data = qq.state.data as { matches?: CricketMatch[] } | undefined;
      return data?.matches?.some((m) => m.status === "in") ? 20_000 : false;
    },
  });

  const allMatches = q.data?.matches ?? [];

  const filtered = useMemo(() => {
    let m = allMatches;
    if (activeLeagueId !== "all") m = m.filter((x) => x.leagueId === activeLeagueId);
    if (fmt !== "any") {
      m = m.filter((x) => {
        const f = (x.format || "").toUpperCase();
        if (fmt === "t20") return f.includes("T20");
        if (fmt === "odi") return f === "ODI" || f.includes("ONE");
        if (fmt === "test") return f === "TEST";
        return true;
      });
    }
    return m;
  }, [allMatches, activeLeagueId, fmt]);

  const live = filtered.filter((m) => m.status === "in");
  const upcoming = filtered.filter((m) => m.status === "pre").sort((a, b) => a.startTs - b.startTs);
  const finished = filtered.filter((m) => m.status === "post").sort((a, b) => b.startTs - a.startTs);
  const liveAll = allMatches.filter((m) => m.status === "in").length;

  return (
    <div className="min-h-screen">
      <SportNav liveCount={liveAll} />
      <CricketSubNav />


      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border cricket-hero">
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            background: "radial-gradient(60% 80% at 50% 0%, rgba(251,191,36,0.35), transparent 60%), radial-gradient(40% 60% at 80% 100%, rgba(16,185,129,0.25), transparent 60%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-amber-300 mb-3">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            {liveAll > 0 ? `${liveAll} match${liveAll === 1 ? "" : "es"} live now` : "Live across every format"}
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            <span className="text-emerald-300">Cricket</span> — every ball, every series.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-emerald-100/80 max-w-2xl">
            Live scores and fixtures from <strong className="text-white">IPL</strong>, <strong className="text-white">ICC World Cup</strong>, <strong className="text-white">Big Bash</strong>, <strong className="text-white">Sheffield Shield</strong> and the international calendar — auto-refreshing while play is on.
          </p>
        </div>
      </section>

      {/* LEAGUE TABS — horizontal snap rail (mobile + desktop) */}
      <div className="sticky top-16 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-0.5">
            <LeaguePill
              label="All"
              emoji="🏏"
              active={activeLeagueId === "all"}
              onClick={() => setActiveLeagueId("all")}
              count={allMatches.length}
            />
            {CRICKET_LEAGUES.map((l) => {
              const c = allMatches.filter((m) => m.leagueId === l.id).length;
              return (
                <LeaguePill
                  key={l.id}
                  label={l.label}
                  emoji={l.emoji}
                  active={activeLeagueId === l.id}
                  onClick={() => setActiveLeagueId(l.id)}
                  count={c}
                  accent={l.accent}
                />
              );
            })}
            <span className="shrink-0 w-px h-5 bg-gray-700 mx-1" />
            {(["any", "t20", "odi", "test"] as const).map((f) => (
              <FormatChip key={f} value={f} active={fmt === f} onClick={() => setFmt(f)} />
            ))}
            {q.isFetching && !q.isLoading && (
              <span className="ml-3 shrink-0 text-[10px] text-gray-500 inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" /> Updating…
              </span>
            )}
          </div>
        </div>
      </div>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Quick series tiles */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {CRICKET_LEAGUES.map((l) => (
            <SeriesTile key={l.id} league={l} liveCount={allMatches.filter((m) => m.leagueId === l.id && m.status === "in").length} totalCount={allMatches.filter((m) => m.leagueId === l.id).length} />
          ))}
        </section>

        {q.isLoading ? (
          <Section icon={<Clock className="size-5 text-amber-400" />} title="Loading cricket slate…">
            <GameGridSkeleton />
          </Section>
        ) : (
          <>
            {live.length > 0 && (
              <Section icon={<Flame className="size-5 text-red-400" />} title="Live right now" badge={`${live.length}`} badgeTone="red">
                <Grid matches={live} />
              </Section>
            )}

            <AdSlot slot="in_content" layout="in-article" />

            {upcoming.length > 0 && (
              <Section icon={<Clock className="size-5 text-amber-400" />} title="Upcoming" badge={`${upcoming.length}`} badgeTone="amber">
                <Grid matches={upcoming.slice(0, 12)} />
              </Section>
            )}

            {finished.length > 0 && (
              <Section icon={<CheckCircle2 className="size-5 text-gray-400" />} title="Recent results" badge={`${Math.min(finished.length, 9)}`} badgeTone="muted">
                <Grid matches={finished.slice(0, 9)} />
              </Section>
            )}

            {live.length === 0 && upcoming.length === 0 && finished.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
                <Calendar className="mx-auto size-10 opacity-30 mb-3" />
                <p className="text-sm font-medium">No matches in this slice</p>
                <p className="text-xs text-muted-foreground mt-1">Try switching the league or format filter above.</p>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Cricket data from ESPN's public feed · Auto-refreshes every 20s while play is live
      </footer>
    </div>
  );
}

function LeaguePill({
  label, emoji, active, onClick, count, accent,
}: { label: string; emoji: string; active: boolean; onClick: () => void; count?: number; accent?: string }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 transition-all",
        active
          ? "bg-gradient-to-r from-emerald-500 to-amber-500 text-black ring-amber-300 shadow-[0_4px_18px_-4px_rgba(245,158,11,0.5)]"
          : `bg-white/[0.04] hover:bg-white/[0.09] ring-white/10 hover:ring-white/20 ${accent ?? "text-gray-200"}`,
      ].join(" ")}
    >
      <span aria-hidden>{emoji}</span>
      <span>{label}</span>
      {typeof count === "number" && (
        <span className={`tabular-nums text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-black/15" : "bg-white/10 text-gray-400"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function FormatChip({ value, active, onClick }: { value: keyof typeof FORMAT_META; active: boolean; onClick: () => void }) {
  const meta = FORMAT_META[value];
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-bold ring-1 transition-all",
        active ? `${meta.color} ring-1` : "bg-white/[0.04] hover:bg-white/[0.09] text-gray-300 ring-white/10",
      ].join(" ")}
    >
      {meta.label}
    </button>
  );
}

function SeriesTile({ league, liveCount, totalCount }: { league: CricketLeague; liveCount: number; totalCount: number }) {
  return (
    <Link
      to="/cricket/series/$id"
      params={{ id: league.id }}
      className={`group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${league.bgGrad} border border-gray-800 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5`}
    >
      {liveCount > 0 && (
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
          <span className="size-1 rounded-full bg-red-500 animate-pulse" /> {liveCount} live
        </span>
      )}
      <div className="flex items-start gap-3 mb-2">
        <div className={`size-10 rounded-xl ${league.chipBg} ring-1 ${league.ring} grid place-items-center text-xl shrink-0`}>
          {league.emoji}
        </div>
        <div className="min-w-0">
          <div className={`text-[10px] uppercase tracking-wider font-bold ${league.accent}`}>{league.format.toUpperCase()}</div>
          <div className="text-sm font-extrabold leading-tight truncate">{league.label}</div>
        </div>
      </div>
      <div className="text-[11px] text-gray-400 leading-snug line-clamp-2">{league.tagline}</div>
      <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold ${league.accent} group-hover:gap-2 transition-all`}>
        {totalCount > 0 ? `${totalCount} match${totalCount === 1 ? "" : "es"}` : "View series"} <ChevronRight className="size-3" />
      </div>
    </Link>
  );
}

function Section({
  icon, title, badge, badgeTone, children,
}: { icon: React.ReactNode; title: string; badge?: string; badgeTone?: "red" | "amber" | "muted"; children: React.ReactNode }) {
  const tone = badgeTone === "red"
    ? "text-red-300 bg-red-500/15 ring-red-500/30"
    : badgeTone === "amber"
    ? "text-amber-300 bg-amber-500/15 ring-amber-500/30"
    : "text-gray-400 bg-gray-800/60 ring-gray-700/60";
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">{icon} {title}</h2>
        {badge && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ring-1 ${tone}`}>
            {badgeTone === "red" && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({ matches }: { matches: CricketMatch[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {matches.map((m) => <CricketMatchCard key={m.id} match={m} />)}
    </div>
  );
}
