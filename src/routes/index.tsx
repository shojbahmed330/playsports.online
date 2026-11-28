import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, ArrowRight, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { CompactHero } from "@/components/home/CompactHero";
import { StatusBar } from "@/components/home/StatusBar";
import { SportChipTabs, type SportFilter } from "@/components/home/SportChipTabs";
import { ForYouStrip } from "@/components/home/ForYouStrip";
import { ShowMore } from "@/components/home/ShowMore";

import { SPORT_LIST, type SportConfig } from "@/lib/sports-config";
import { getMultiSportToday, type SportGame } from "@/lib/espn.functions";
import { getWc2026Fixtures, type Wc2026Fixture } from "@/lib/wc2026.functions";
import { flagOf } from "@/lib/flags";
import { GameCard } from "@/components/sports/GameCard";
import { SportNav } from "@/components/sports/SportNav";
import { LiveTicker } from "@/components/sports/LiveTicker";
import { Countdown } from "@/components/sports/Countdown";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { LocalTime } from "@/components/ui/local-time";
import { AdSlot } from "@/components/ads/AdSlot";
import { SponsoredHero } from "@/components/affiliates/SponsoredHero";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { CricketSlate } from "@/components/cricket/CricketSlate";
import { getMultiCricketToday, type CricketMatch } from "@/lib/cricket.functions";
import { CRICKET_LEAGUES } from "@/lib/cricket-leagues";
import { PulseStrip } from "@/components/home/PulseStrip";
import { SportCard, FifaCard, CricketCard } from "@/components/home/SportCard";
import { LeagueCard } from "@/components/home/LeagueCard";
import { PopularSearches } from "@/components/seo/PopularSearches";
import { TodayInZoneStrip } from "@/components/home/TodayInZoneStrip";
import { HallOfChampionsStrip } from "@/components/home/HallOfChampionsStrip";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { ErrorState, EmptyState, LoadingState, SectionHeader } from "@/components/ui/state";

const SITE_TITLE = "PlaySports — Live Cricket & Football Scores, Stats & History";
const HOME_DESCRIPTION =
  "Live cricket and football scores, fixtures, tables and stats — internationals, IPL, Premier League, Champions League and more.";
const HOME_OG_IMAGE = "https://www.playsports.online/og-default.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: HOME_DESCRIPTION },
      { property: "og:url", content: "https://www.playsports.online/" },
      { property: "og:image", content: HOME_OG_IMAGE },
      { name: "twitter:image", content: HOME_OG_IMAGE },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: HOME_DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/" }],
  }),
  loader: async ({ context }) => {
    // SSR prefetch — prime React Query cache so HTML arrives with live scores already rendered.
    // Each prime is independent and never throws (server fns already return {error} shapes).
    const sportsInput = SPORT_LIST.map((s) => ({ path: s.path, league: s.label }));
    // The hero and live sections must be in the SSR HTML so the first client
    // render matches and there is no empty-hero layout swap. Cricket is below
    // the fold, so it stays a background prefetch.
    await Promise.allSettled([
      context.queryClient.ensureQueryData({
        queryKey: ["hub", "today", sportsInput.map((s) => s.league).join(",")],
        queryFn: () => getMultiSportToday({ data: { sports: sportsInput } }),
        staleTime: 30_000,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["wc2026", "fixtures"],
        queryFn: () => getWc2026Fixtures(),
        staleTime: 20_000,
      }),
    ]);
    return null;
  },
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
    placeholderData: keepPreviousData,
    refetchInterval: (q) => {
      const data = q.state.data as { byLeague?: Record<string, SportGame[]> } | undefined;
      const any = Object.values(data?.byLeague ?? {})
        .flat()
        .some((g) => g.status === "in");
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
  const upcomingGames = all
    .filter((x) => x.game.status === "pre")
    .sort((a, b) => a.game.startTs - b.game.startTs);
  const finalGames = all.filter((x) => x.game.status === "post");
  const totalLive = liveGames.length;

  // Use fixtures for WC2026 spotlight in hero
  const wcFn = useServerFn(getWc2026Fixtures);
  const wcQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => wcFn(),
    staleTime: 20_000,
    retry: 1,
    placeholderData: keepPreviousData,
  });

  const wcFeatured = useMemo<Wc2026Fixture | null>(() => {
    const list = wcQ.data?.fixtures ?? [];
    return (
      list.find((f) => f.status === "inprogress") ??
      list.filter((f) => f.status === "notstarted").sort((a, b) => a.startTs - b.startTs)[0] ??
      null
    );
  }, [wcQ.data]);

  // Cricket slate for the cross-sport "In your zone" strip
  const cricketFn = useServerFn(getMultiCricketToday);
  const cricketIds = useMemo(() => CRICKET_LEAGUES.map((l) => l.id), []);
  const cricketQ = useQuery({
    queryKey: ["cricket", "slate", cricketIds.join(",")],
    queryFn: () => cricketFn({ data: { leagueIds: cricketIds } }),
    staleTime: 30_000,
    retry: 1,
    placeholderData: keepPreviousData,
    refetchInterval: (qq) => {
      const d = qq.state.data as { matches?: CricketMatch[] } | undefined;
      return d?.matches?.some((m) => m.status === "in") ? 25_000 : false;
    },
  });

  const totalToday = all.length;

  const [filter, setFilter] = useState<SportFilter>("all");

  // Per-sport counts for chip tabs
  const wcLiveCount = (wcQ.data?.fixtures ?? []).filter((f) => f.status === "inprogress").length;
  const cricketLiveCount = (cricketQ.data?.matches ?? []).filter((m) => m.status === "in").length;
  const counts: Partial<Record<SportFilter, number>> = {
    all: totalLive + wcLiveCount + cricketLiveCount,
    football: wcLiveCount,
    cricket: cricketLiveCount,
    mlb: (byLeague["MLB"] ?? []).filter((g) => g.status === "in").length,
    nba: (byLeague["NBA"] ?? []).filter((g) => g.status === "in").length,
    nhl: (byLeague["NHL"] ?? []).filter((g) => g.status === "in").length,
    mls: (byLeague["MLS"] ?? []).filter((g) => g.status === "in").length,
  };

  // Filter ESPN tagged lists by selected sport
  const espnSlugs: SportFilter[] = ["mlb", "nba", "nhl", "mls"];
  const filterMatches = (slug: string): boolean => {
    if (filter === "all") return true;
    if (espnSlugs.includes(filter)) return slug === filter;
    return false; // football/cricket filter hides ESPN games
  };
  const filteredLive = liveGames.filter((x) => filterMatches(x.sport.slug));
  const filteredUpcoming = upcomingGames.filter((x) => filterMatches(x.sport.slug));
  const filteredFinals = finalGames.filter((x) => filterMatches(x.sport.slug));

  const showFootball = filter === "all" || filter === "football";
  const showCricket = filter === "all" || filter === "cricket";
  const showEspn = filter === "all" || espnSlugs.includes(filter);
  const hasWcMatches = (wcQ.data?.fixtures ?? []).some(
    (f) => f.status === "inprogress" || f.status === "notstarted",
  );

  return (
    <div className="min-h-screen">
      <SportNav liveCount={totalLive + wcLiveCount + cricketLiveCount} />
      <LiveTicker items={liveGames} />

      {/* 1. COMPACT HERO — single most important match */}
      <CompactHero liveGames={liveGames} upcomingGames={upcomingGames} wcFeatured={wcFeatured} />

      {/* 2. STATUS BAR — thin one-liner with TZ + counts */}
      <StatusBar
        liveCount={totalLive + wcLiveCount + cricketLiveCount}
        upcomingCount={upcomingGames.length}
        totalToday={totalToday + (wcQ.data?.fixtures?.length ?? 0)}
      />

      {/* 3. STICKY SPORT TABS */}
      <SportChipTabs value={filter} onChange={setFilter} counts={counts} />

      {liveQ.isError && wcQ.isError && !liveQ.data && !wcQ.data && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <ErrorState
            title="Live scores are temporarily unavailable"
            message="The sports feed did not respond. You can still browse the cricket and football hubs."
            onRetry={() => {
              void liveQ.refetch();
              void wcQ.refetch();
            }}
          />
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-2 sm:pb-4 space-y-8 sm:space-y-10">
        {/* FOR YOU — quick-scan 3 cards (only on All filter) */}
        {filter === "all" && (
          <ForYouStrip
            liveGames={liveGames}
            upcomingGames={upcomingGames}
            finalGames={finalGames}
            wcFixtures={wcQ.data?.fixtures ?? []}
          />
        )}

        {/* PULSE STRIP — live matches mini-cards */}
        {filter === "all" && liveGames.length > 0 && <PulseStrip items={liveGames} />}

        {/* LIVE NOW — full grid */}
        {filteredLive.length > 0 && (
          <Section
            icon={<Flame className="size-5 text-live" aria-hidden="true" />}
            title="Live right now"
            badge={`${filteredLive.length} game${filteredLive.length === 1 ? "" : "s"}`}
            badgeTone="red"
          >
            <TaggedGrid items={filteredLive} />
          </Section>
        )}

        {/* TODAY IN YOUR ZONE — TZ-aware cross-sport strip (only on All) */}
        {filter === "all" && (
          <TodayInZoneStrip
            espnByLeague={byLeague}
            wcFixtures={wcQ.data?.fixtures ?? []}
            cricketMatches={cricketQ.data?.matches ?? []}
            sports={SPORT_LIST}
          />
        )}

        {/* FIFA SLATE — only when there are real upcoming/live matches */}
        {showFootball && hasWcMatches && <FootballSlate />}

        {/* CRICKET SLATE */}
        {showCricket && <CricketSlate />}

        {/* UPCOMING TODAY (ESPN) — progressive disclosure */}
        {showEspn &&
          (!liveQ.data && liveQ.isLoading ? (
            <Section
              icon={<Clock className="size-5 text-primary" aria-hidden="true" />}
              title="Loading today's slate…"
            >
              <GameGridSkeleton />
            </Section>
          ) : filteredUpcoming.length > 0 ? (
            <Section
              icon={<Clock className="size-5 text-primary" aria-hidden="true" />}
              title="Upcoming today"
              badge={`${filteredUpcoming.length} game${filteredUpcoming.length === 1 ? "" : "s"}`}
              badgeTone="amber"
            >
              <ShowMore initialCount={6} step={6} totalCount={filteredUpcoming.length}>
                {(n) => <TaggedGrid items={filteredUpcoming.slice(0, n)} />}
              </ShowMore>
            </Section>
          ) : null)}

        {/* RECENT FINALS (ESPN) — progressive disclosure */}
        {showEspn && filteredFinals.length > 0 && (
          <Section
            icon={<CheckCircle2 className="size-5 text-muted-foreground" aria-hidden="true" />}
            title="Recent finals"
            badge={`${filteredFinals.length}`}
            badgeTone="muted"
          >
            <ShowMore initialCount={6} step={6} totalCount={filteredFinals.length}>
              {(n) => <TaggedGrid items={filteredFinals.slice(0, n)} />}
            </ShowMore>
          </Section>
        )}

        {/* SPONSORED — moved below content */}
        <SponsoredHero slotType="banner" />

        <AdSlot slot="in_content" layout="in-article" />

        {/* SPORT HUB CARDS — doors into every league */}
        {filter === "all" && (
          <section className="space-y-4 animate-fade-in motion-reduce:animate-none">
            <SectionHeader
              kicker="Choose a sport"
              title="Jump into any league"
              className="mb-0"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <LeagueCard
                slug="premier-league"
                name="Premier League"
                emoji="🦁"
                season="2026/27"
                accent="pl"
              />
              <LeagueCard
                slug="champions-league"
                name="Champions League"
                emoji="⭐"
                season="2026/27"
                accent="ucl"
              />
              <FifaCard />
              <CricketCard />
              {SPORT_LIST.map((s) => {
                const games = byLeague[s.label] ?? [];
                const next =
                  games
                    .filter((g) => g.status === "pre")
                    .sort((a, b) => a.startTs - b.startTs)[0] ?? null;
                const recent =
                  games
                    .filter((g) => g.status === "post")
                    .sort((a, b) => b.startTs - a.startTs)[0] ?? null;
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
        )}

        {/* HALL OF CHAMPIONS */}
        {filter === "all" && <HallOfChampionsStrip />}

        <AffiliateStrip placement="homepage" heading="Fan shop & partners" />

        {/* Phase 2.2 — long-tail SEO discovery */}
        <PopularSearches className="mt-8" />

        {/* NEWSLETTER */}
        <NewsletterCard source="homepage" />
      </main>
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
      ? "text-live bg-live/15 ring-live/30"
      : badgeTone === "amber"
        ? "text-primary bg-primary/15 ring-primary/30"
        : "text-muted-foreground bg-muted ring-border";
  return (
    <section className="space-y-4">
      <SectionHeader
        icon={icon}
        title={title}
        action={
          badge ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-bold ring-1 ${tone}`}
            >
              {badgeTone === "red" && (
                <span className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" />
              )}
              {badge}
            </span>
          ) : undefined
        }
        className="mb-0"
      />
      {children}
    </section>
  );
}

function TaggedGrid({ items }: { items: { sport: SportConfig; game: SportGame }[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ sport, game }) => (
        <div key={`${sport.slug}-${game.id}`}>
          <div className="mb-1 flex justify-end">
            <Link
              to={`/${sport.slug}` as "/mlb" | "/nba" | "/nhl" | "/mls"}
              className={`inline-flex min-h-11 items-center rounded-full px-3 text-micro font-bold ${sport.chipBg} ring-1 ${sport.ring} ${sport.accent} transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
            >
              <span aria-hidden="true">{sport.emoji}</span>
              <span className="ml-1">{sport.label}</span>
            </Link>
          </div>
          <GameCard game={game} />
        </div>
      ))}
    </div>
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
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const tStart = dayStart.getTime() / 1000;
    const tEndToday = tStart + 24 * 3600;
    const tEndTomorrow = tEndToday + 24 * 3600;
    const tEndWeek = tStart + 7 * 24 * 3600;

    const live = list.filter((f) => f.status === "inprogress");
    const today = list.filter(
      (f) => f.status === "notstarted" && f.startTs >= tStart && f.startTs < tEndToday,
    );
    const tomorrow = list.filter(
      (f) => f.status === "notstarted" && f.startTs >= tEndToday && f.startTs < tEndTomorrow,
    );
    const later = list.filter(
      (f) => f.status === "notstarted" && f.startTs >= tEndTomorrow && f.startTs < tEndWeek,
    );
    const upcoming = [...live, ...today, ...tomorrow, ...later];
    const recent = list
      .filter((f) => f.status === "finished" && f.startTs >= now - 48 * 3600)
      .sort((a, b) => b.startTs - a.startTs)
      .slice(0, 3);
    return { live, today, tomorrow, later, upcoming, recent };
  }, [q.data]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/football"
          search={{ year: 2026 }}
          className="inline-flex min-h-11 items-center gap-2 text-h3 text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-base" aria-hidden="true">⚽</span> FIFA World Cup 2026
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-2 text-caption">
          {buckets.live.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-live/15 px-2.5 py-0.5 font-bold text-live ring-1 ring-live/30">
              <span className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" />{" "}
              {buckets.live.length} live
            </span>
          )}
          <span className="text-muted-foreground">{buckets.upcoming.length} upcoming · next 7 days</span>
        </div>
      </div>

      {q.isLoading ? (
        <LoadingState rows={1} label="Loading fixtures" />
      ) : buckets.upcoming.length === 0 && buckets.recent.length === 0 ? (
        <EmptyState
          title="No World Cup matches scheduled"
          description="Fixtures appear here once the 2026 schedule is live."
        />
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
  label,
  tone,
  fixtures,
}: {
  label: string;
  tone: "red" | "amber" | "muted";
  fixtures: Wc2026Fixture[];
}) {
  const toneClass =
    tone === "red"
      ? "text-live"
      : tone === "amber"
        ? "text-primary"
        : "text-muted-foreground";
  return (
    <div className="space-y-2">
      <div className={`text-micro uppercase ${toneClass}`}>
        {label}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fixtures.map((f) => (
          <Wc2026FixtureCard key={f.id} f={f} />
        ))}
      </div>
    </div>
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
      className="block overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="h-[3px] bg-primary" aria-hidden="true" />
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        <span className="truncate text-micro uppercase text-muted-foreground">
          {f.group}
        </span>
        {live ? (
          <span className="inline-flex items-center gap-1 text-micro font-bold text-live">
            <span className="size-1.5 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" /> LIVE{" "}
            {f.minute ? `${f.minute}'` : ""}
          </span>
        ) : finished ? (
          <span className="text-micro font-bold text-muted-foreground">FT</span>
        ) : (
          <span className="text-micro font-semibold text-primary">
            <LocalTime ts={startMs} mode="day" /> · <LocalTime ts={startMs} />
          </span>
        )}
      </div>
      <TeamLine name={f.home.name} score={f.home.goals} />
      <div className="h-px bg-border" aria-hidden="true" />
      <TeamLine name={f.away.name} score={f.away.goals} />
      <div className="flex items-center justify-between gap-2 bg-muted/50 px-3 py-1.5 text-micro text-muted-foreground">
        {f.venue ? (
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            <MapPin className="size-3 shrink-0" aria-hidden="true" /> {f.venue}
          </span>
        ) : (
          <span />
        )}
        {!live && !finished && <Countdown ts={startMs} compact />}
      </div>
    </Link>
  );
}

function TeamLine({ name, score }: { name: string; score: number | null }) {
  return (
    <div className="flex h-11 items-center gap-2 px-3">
      <span className="shrink-0 text-lg leading-none" aria-hidden="true">{flagOf(name)}</span>
      <span className="min-w-0 flex-1 truncate text-body font-medium text-foreground">{name}</span>
      <span className="shrink-0 font-bold tabular-nums text-primary">{score ?? "-"}</span>
    </div>
  );
}
