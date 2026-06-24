import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Flame, ArrowRight, MapPin, Clock, CheckCircle2, X } from "lucide-react";
import { SPORT_LIST, type SportConfig } from "@/lib/sports-config";
import { getMultiSportToday, type SportGame } from "@/lib/espn.functions";
import { getWc2026Fixtures, type Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { GameCard } from "@/components/sports/GameCard";
import { SportNav } from "@/components/sports/SportNav";
import { LiveTicker } from "@/components/sports/LiveTicker";
import { Countdown } from "@/components/sports/Countdown";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { formatLocalTime, relativeDay } from "@/lib/time";
import { AdSlot } from "@/components/ads/AdSlot";
import { CricketSlate } from "@/components/cricket/CricketSlate";
import { HeroSpotlight } from "@/components/home/HeroSpotlight";
import { PulseStrip } from "@/components/home/PulseStrip";
import { SportCard, FifaCard, CricketCard } from "@/components/home/SportCard";
import { SiteFooter } from "@/components/home/SiteFooter";
import { WatchLivePanel } from "@/components/wc/WatchLivePanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sports Hub — Live Scores, Standings & News" },
      {
        name: "description",
        content:
          "Your home for live MLB, NBA, NHL, MLS scores and the complete FIFA World Cup archive — all in one place.",
      },
      { property: "og:title", content: "Sports Hub — Live Scores Across MLB, NBA, NHL, MLS & FIFA" },
      { property: "og:description", content: "Live scoreboards, standings, news and the full FIFA World Cup archive 1930–2026." },
    ],
  }),
  component: HubPage,
});

function HubPage() {
  const multiFn = useServerFn(getMultiSportToday);
  const sportsInput = SPORT_LIST.map((s) => ({ path: s.path, league: s.label }));

  const liveQ = useQuery({
    queryKey: ["hub", "today", sportsInput.map((s) => s.league).join(",")],
    queryFn: () => multiFn({ data: { sports: sportsInput } }),
    staleTime: 30_000,
    retry: 1,
    refetchInterval: (q) => {
      const data = q.state.data as { byLeague?: Record<string, SportGame[]> } | undefined;
      const any = Object.values(data?.byLeague ?? {}).flat().some((g) => g.status === "in");
      return any ? 30_000 : false;
    },
  });

  const byLeague = liveQ.data?.byLeague ?? {};

  // Flatten everything into a single tagged list
  type Tagged = { sport: SportConfig; game: SportGame };
  const all: Tagged[] = SPORT_LIST.flatMap((s) =>
    (byLeague[s.label] ?? []).map((g) => ({ sport: s, game: g })),
  );
  const liveGames = all.filter((x) => x.game.status === "in");
  const upcomingGames = all.filter((x) => x.game.status === "pre").sort((a, b) => a.game.startTs - b.game.startTs);
  const finalGames = all.filter((x) => x.game.status === "post");
  const totalLive = liveGames.length;

  // Use fixtures for WC2026 spotlight in hero
  const wcFn = useServerFn(getWc2026Fixtures);
  const wcQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => wcFn(),
    staleTime: 20_000,
    retry: 1,
  });
  const wcFeatured = useMemo<Wc2026Fixture | null>(() => {
    const list = wcQ.data?.fixtures ?? [];
    return (
      list.find((f) => f.status === "inprogress") ??
      list.filter((f) => f.status === "notstarted").sort((a, b) => a.startTs - b.startTs)[0] ??
      null
    );
  }, [wcQ.data]);

  const totalToday = all.length;

  return (
    <div className="min-h-screen">
      <SportNav liveCount={totalLive} />
      <LiveTicker items={liveGames} />

      <HeroSpotlight
        liveGames={liveGames}
        upcomingGames={upcomingGames}
        totalToday={totalToday}
        wcFeatured={wcFeatured}
      />

      <PulseStrip items={liveGames} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* SPORT CARDS 2.0 */}
        <section className="space-y-4 animate-fade-in">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Choose a sport
              </h2>
              <p className="text-lg sm:text-xl font-extrabold mt-1">Jump into any league</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <FifaCard />
            <CricketCard />
            {SPORT_LIST.map((s) => {
              const games = byLeague[s.label] ?? [];
              const next = games.filter((g) => g.status === "pre").sort((a, b) => a.startTs - b.startTs)[0] ?? null;
              const recent = games.filter((g) => g.status === "post").sort((a, b) => b.startTs - a.startTs)[0] ?? null;
              return (
                <SportCard
                  key={s.slug}
                  sport={s}
                  liveCount={games.filter((g) => g.status === "in").length}
                  next={next}
                  recent={recent}
                />
              );
            })}
          </div>
        </section>

        {/* LIVE NOW (full grid below pulse strip) */}
        {liveGames.length > 0 && (
          <Section
            icon={<Flame className="size-5 text-red-400" />}
            title="Live right now"
            badge={`${liveGames.length} game${liveGames.length === 1 ? "" : "s"}`}
            badgeTone="red"
          >
            <TaggedGrid items={liveGames} />
          </Section>
        )}

        {/* FIFA SLATE */}
        <FootballSlate />

        {/* CRICKET SLATE */}
        <CricketSlate />

        <AdSlot slot="in_content" layout="in-article" />

        {/* UPCOMING TODAY */}
        {liveQ.isLoading ? (
          <Section icon={<Clock className="size-5 text-amber-400" />} title="Loading today's slate…">
            <GameGridSkeleton />
          </Section>
        ) : upcomingGames.length > 0 ? (
          <Section
            icon={<Clock className="size-5 text-amber-400" />}
            title="Upcoming today"
            badge={`${upcomingGames.length} game${upcomingGames.length === 1 ? "" : "s"}`}
            badgeTone="amber"
          >
            <TaggedGrid items={upcomingGames.slice(0, 9)} />
          </Section>
        ) : null}

        {/* RECENT FINALS */}
        {finalGames.length > 0 && (
          <Section
            icon={<CheckCircle2 className="size-5 text-gray-400" />}
            title="Recent finals"
            badge={`${finalGames.length}`}
            badgeTone="muted"
          >
            <TaggedGrid items={finalGames.slice(0, 6)} />
          </Section>
        )}
      </main>

      {/* Floating Watch Live */}
      <div className="fixed bottom-4 right-4 z-40">
        <WatchLivePanel compact />
      </div>

      <SiteFooter />
    </div>
  );
}

function Section({
  icon,
  title,
  badge,
  badgeTone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeTone?: "red" | "amber" | "muted";
  children: React.ReactNode;
}) {
  const tone =
    badgeTone === "red"
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

function TaggedGrid({ items }: { items: { sport: SportConfig; game: SportGame }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(({ sport, game }) => (
        <div key={`${sport.slug}-${game.id}`} className="relative">
          <Link
            to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
            className={`absolute -top-2 -right-2 z-10 px-2 py-0.5 rounded-full ${sport.chipBg} ring-1 ${sport.ring} text-[10px] font-bold ${sport.accent} hover:scale-105 transition-transform`}
          >
            {sport.emoji} {sport.label}
          </Link>
          <GameCard game={game} />
        </div>
      ))}
    </div>
  );
}

function FootballTile() {
  return (
    <a
      href="/football"
      className="group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-900/50 via-gray-900 to-red-900/30 border border-amber-500/30 hover:border-amber-400/60 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="size-12 rounded-xl bg-amber-500/20 ring-1 ring-amber-500/40 grid place-items-center text-2xl">
          <Trophy className="size-6 text-amber-400" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Archive</div>
          <div className="text-base font-extrabold leading-tight">FIFA</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 leading-snug">
        Complete World Cup history 1930 → 2026, with live data for the 2026 tournament.
      </div>
      <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 group-hover:gap-2 transition-all">
        Explore <ArrowRight className="size-3" />
      </div>
    </a>
  );
}

function SportTile({
  sport,
  liveCount,
  nextStartTs,
}: {
  sport: SportConfig;
  liveCount: number;
  nextStartTs: number | null;
}) {
  return (
    <a
      href={`/${sport.slug}`}
      className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${sport.bgGrad} border border-gray-800 hover:border-gray-700 transition-all hover:-translate-y-0.5`}
    >
      {liveCount > 0 ? (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
          <span className="size-1 rounded-full bg-red-500 animate-pulse" /> {liveCount} live
        </span>
      ) : nextStartTs ? (
        <span className="absolute top-3 right-3">
          <Countdown ts={nextStartTs} compact />
        </span>
      ) : null}
      <div className="flex items-start gap-3 mb-3">
        <div className={`size-12 rounded-xl ${sport.chipBg} ring-1 ${sport.ring} grid place-items-center text-2xl`}>
          {sport.emoji}
        </div>
        <div className="min-w-0">
          <div className={`text-[10px] uppercase tracking-wider font-bold ${sport.accent}`}>
            {liveCount > 0 ? "Live" : "Open"}
          </div>
          <div className="text-base font-extrabold leading-tight">{sport.label}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 leading-snug line-clamp-2">{sport.tagline}</div>
      <div className={`mt-3 inline-flex items-center gap-1 text-[11px] font-bold ${sport.accent} group-hover:gap-2 transition-all`}>
        Open <ArrowRight className="size-3" />
      </div>
    </a>
  );
}

function FootballSlate() {
  const fn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fn(),
    staleTime: 20_000,
    retry: 1,
    refetchInterval: (qq) => {
      const data = qq.state.data as { fixtures?: Wc2026Fixture[] } | undefined;
      const live = (data?.fixtures ?? []).some((f) => f.status === "inprogress");
      return live ? 20_000 : 5 * 60_000;
    },
  });

  const buckets = useMemo(() => {
    const list = q.data?.fixtures ?? [];
    const now = Date.now() / 1000;
    const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
    const tStart = dayStart.getTime() / 1000;
    const tEndToday = tStart + 24 * 3600;
    const tEndTomorrow = tEndToday + 24 * 3600;
    const tEndWeek = tStart + 7 * 24 * 3600;

    const live = list.filter((f) => f.status === "inprogress");
    const today = list.filter((f) => f.status === "notstarted" && f.startTs >= tStart && f.startTs < tEndToday);
    const tomorrow = list.filter((f) => f.status === "notstarted" && f.startTs >= tEndToday && f.startTs < tEndTomorrow);
    const later = list.filter((f) => f.status === "notstarted" && f.startTs >= tEndTomorrow && f.startTs < tEndWeek);
    const upcoming = [...live, ...today, ...tomorrow, ...later];
    const recent = list
      .filter((f) => f.status === "finished" && f.startTs >= now - 48 * 3600)
      .sort((a, b) => b.startTs - a.startTs)
      .slice(0, 3);
    return { live, today, tomorrow, later, upcoming, recent };
  }, [q.data]);

  const featured = buckets.live[0] ?? buckets.today[0] ?? buckets.tomorrow[0] ?? buckets.upcoming[0] ?? null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link
          to="/football"
          search={{ year: 2026 }}
          className="group inline-flex items-center gap-2 text-lg font-bold text-amber-400 hover:underline"
        >
          <span className="text-base">⚽</span> FIFA World Cup 2026
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <div className="flex items-center gap-2 text-[11px]">
          {buckets.live.length > 0 && (
            <span className="inline-flex items-center gap-1 text-red-300 bg-red-500/15 ring-1 ring-red-500/30 rounded-full px-2 py-0.5 font-bold">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> {buckets.live.length} live
            </span>
          )}
          <span className="text-gray-500">{buckets.upcoming.length} upcoming · next 7 days</span>
        </div>
      </div>

      {/* FEATURED SPOTLIGHT */}
      {featured && <FeaturedFootballCard f={featured} />}

      {q.isLoading ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500 bg-gray-900/40">
          Loading fixtures…
        </div>
      ) : buckets.upcoming.length === 0 && buckets.recent.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-xs text-gray-500 bg-gray-900/40">
          No World Cup matches scheduled.
        </div>
      ) : (
        <div className="space-y-5">
          {buckets.live.length > 0 && (
            <FixtureBucket label="🔴 Live now" tone="red" fixtures={buckets.live} />
          )}
          {buckets.today.length > 0 && (
            <FixtureBucket label="Today" tone="amber" fixtures={buckets.today} />
          )}
          {buckets.tomorrow.length > 0 && (
            <FixtureBucket label="Tomorrow" tone="muted" fixtures={buckets.tomorrow} />
          )}
          {buckets.later.length > 0 && (
            <FixtureBucket label="This week" tone="muted" fixtures={buckets.later.slice(0, 6)} />
          )}
          {buckets.recent.length > 0 && (
            <FixtureBucket label="Recent results" tone="muted" fixtures={buckets.recent} />
          )}
        </div>
      )}
    </section>
  );
}

function FixtureBucket({
  label, tone, fixtures,
}: { label: string; tone: "red" | "amber" | "muted"; fixtures: Wc2026Fixture[] }) {
  const toneClass =
    tone === "red"
      ? "text-red-300"
      : tone === "amber"
      ? "text-amber-300"
      : "text-gray-400";
  return (
    <div className="space-y-2">
      <div className={`text-[11px] uppercase tracking-[0.18em] font-bold ${toneClass}`}>{label}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fixtures.map((f) => <Wc2026FixtureCard key={f.id} f={f} />)}
      </div>
    </div>
  );
}

function FeaturedFootballCard({ f }: { f: Wc2026Fixture }) {
  const live = f.status === "inprogress";
  const finished = f.status === "finished";
  const startMs = f.startTs * 1000;
  return (
    <Link
      to="/football"
      search={{ year: 2026 }}
      className="group block relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/40 via-gray-900 to-red-900/30 hover:border-amber-400/60 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(245,158,11,0.18)]"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden style={{
        background: "radial-gradient(60% 60% at 50% 0%, oklch(0.78 0.16 75 / 0.35), transparent 65%)",
      }} />
      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-300">
            {live ? "🔴 Live" : finished ? "Recent" : "Featured · Up next"} · {f.group}
          </span>
          {live ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> {f.minute ? `${f.minute}'` : "LIVE"}
            </span>
          ) : finished ? (
            <span className="text-[10px] font-bold text-gray-400">FT</span>
          ) : (
            <span className="text-[10px] font-semibold text-amber-200">
              {relativeDay(startMs)} · {formatLocalTime(startMs)}
            </span>
          )}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl sm:text-4xl shrink-0">{flagOf(f.home.name)}</span>
            <span className="truncate text-base sm:text-lg font-bold">{f.home.name}</span>
          </div>
          <div className="text-2xl sm:text-4xl font-black text-amber-400 tabular-nums whitespace-nowrap">
            {f.home.goals ?? "-"} <span className="text-gray-600">:</span> {f.away.goals ?? "-"}
          </div>
          <div className="flex items-center gap-3 min-w-0 justify-end">
            <span className="truncate text-base sm:text-lg font-bold text-right">{f.away.name}</span>
            <span className="text-3xl sm:text-4xl shrink-0">{flagOf(f.away.name)}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400 gap-2">
          <span className="truncate inline-flex items-center gap-1.5">
            {f.venue && <><MapPin className="size-3" /> {f.venue}{f.city ? `, ${f.city}` : ""}</>}
          </span>
          {!live && !finished && <Countdown ts={startMs} />}
        </div>
      </div>
    </Link>
  );
}

function Wc2026FixtureCard({ f }: { f: Wc2026Fixture }) {
  const live = f.status === "inprogress";
  const finished = f.status === "finished";
  const startMs = f.startTs * 1000;
  return (
    <Link
      to="/football"
      search={{ year: 2026 }}
      className="block rounded-xl bg-gray-900 border border-white/[0.08] hover:border-amber-500/50 transition-all overflow-hidden hover:-translate-y-0.5"
    >
      <div className="h-[3px] bg-gradient-to-r from-amber-500 to-yellow-400" />
      <div className="flex items-center justify-between px-3 pt-2 gap-2">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 truncate">{f.group}</span>
        {live ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-300">
            <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE {f.minute ? `${f.minute}'` : ""}
          </span>
        ) : finished ? (
          <span className="text-[10px] font-bold text-gray-500">FT</span>
        ) : (
          <span className="text-[10px] font-semibold text-amber-300">
            {relativeDay(startMs)} · {formatLocalTime(startMs)}
          </span>
        )}
      </div>
      <TeamLine name={f.home.name} score={f.home.goals} />
      <div className="h-px bg-white/[0.05]" />
      <TeamLine name={f.away.name} score={f.away.goals} />
      <div className="bg-gray-800/40 px-3 py-1.5 text-[10px] text-gray-500 flex items-center justify-between gap-2">
        {f.venue ? (
          <span className="truncate inline-flex items-center gap-1">
            <MapPin className="size-3" /> {f.venue}
          </span>
        ) : <span />}
        {!live && !finished && <Countdown ts={startMs} compact />}
      </div>
    </Link>
  );
}

function TeamLine({ name, score }: { name: string; score: number | null }) {
  return (
    <div className="flex items-center gap-2 px-3 h-10">
      <span className="text-lg leading-none shrink-0">{flagOf(name)}</span>
      <span className="flex-1 min-w-0 truncate text-sm text-white font-medium">{name}</span>
      <span className="shrink-0 tabular-nums font-bold text-amber-400">{score ?? "-"}</span>
    </div>
  );
}

