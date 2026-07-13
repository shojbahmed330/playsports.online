import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Clock, CheckCircle2, Calendar, ChevronRight, Trophy, Globe2 } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { CricketHero } from "@/components/cricket/CricketHero";
import { LivePulseStrip } from "@/components/cricket/LivePulseStrip";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { AdSlot } from "@/components/ads/AdSlot";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { getMultiCricketToday, type CricketMatch } from "@/lib/cricket.functions";
import { CRICKET_LEAGUES, CRICKET_LEAGUE_BY_ID, type CricketLeague } from "@/lib/cricket-leagues";
import { breadcrumbList, collectionPage, sportsOrganization, faqPage, ldScript } from "@/lib/seo/jsonld";


export const Route = createFileRoute("/cricket/")({
  head: () => ({
    meta: [
      { title: "Live Cricket Scores, Fixtures & Stats — PlaySports" },
      { name: "description", content: "Live cricket scoreboards, fixtures, series, players, rankings and records across IPL, ICC World Cup, Big Bash, PSL and more." },
      { property: "og:title", content: "Cricket — Live Scores, Series & Players" },
      { property: "og:description", content: "Live scores, fixtures, results, players and records from every major cricket competition." },
      { property: "og:url", content: "https://www.playsports.online/cricket" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Live Cricket Scores, Fixtures & Stats — PlaySports" },
      { name: "twitter:description", content: "Live cricket scoreboards, fixtures, series, players, rankings and records across IPL, ICC World Cup, Big Bash, PSL and more." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/cricket" }],
    scripts: [
      ldScript(collectionPage({ name: "Cricket — Live Scores, Series & Players", description: "Cricket hub: live scores, series, players, rankings and records.", path: "/cricket" })),
      ldScript(sportsOrganization({ name: "International Cricket", path: "/cricket", sport: "Cricket" })),
      ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Cricket", path: "/cricket" }])),
      ldScript(faqPage([
        { q: "Which cricket competitions does PlaySports cover?", a: "PlaySports covers international cricket (ICC World Cup, Champions Trophy, bilateral series), T20 leagues (IPL, PSL, BBL, CPL, The Hundred) and domestic first-class competitions with live scores and full scorecards." },
        { q: "How often do cricket scores update?", a: "Live cricket scorecards on PlaySports refresh every 10–15 seconds while play is in progress, with ball-by-ball commentary when available." },
        { q: "Can I see player career stats?", a: "Yes — batting and bowling career records from ESPNcricinfo Statsguru are shown on every player profile linked from live scorecards." },
      ])),
    ],

  }),
  loader: async ({ context }) => {
    const leagueIds = CRICKET_LEAGUES.map((l) => l.id);
    await context.queryClient
      .prefetchQuery({
        queryKey: ["cricket", "today", leagueIds.join(",")],
        queryFn: () => getMultiCricketToday({ data: { leagueIds } }),
        staleTime: 20_000,
      })
      .catch(() => null);
    return null;
  },
  component: CricketIndex,
});


function CricketIndex() {
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
  const liveAll = allMatches.filter((m) => m.status === "in").length;

  const buckets = useMemo(() => {
    const now = Date.now();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const live = allMatches.filter((m) => m.status === "in");
    const today = allMatches
      .filter((m) => m.status === "pre" && m.startTs >= todayStart.getTime() && m.startTs <= todayEnd.getTime())
      .sort((a, b) => a.startTs - b.startTs);
    const upcoming = allMatches
      .filter((m) => m.status === "pre" && m.startTs > todayEnd.getTime())
      .sort((a, b) => a.startTs - b.startTs);
    const finished = allMatches
      .filter((m) => m.status === "post")
      .sort((a, b) => b.startTs - a.startTs);
    return { live, today, upcoming, finished, now };
  }, [allMatches]);

  const internationals = useMemo(() => {
    const now = Date.now();
    const bil = allMatches.filter((m) => m.kind === "bilateral");
    const live = bil.filter((m) => m.status === "in");
    const next = bil
      .filter((m) => m.status === "pre" && m.startTs > now)
      .sort((a, b) => a.startTs - b.startTs)
      .slice(0, 3);
    return { all: bil, live, next };
  }, [allMatches]);

  // Auto-discovered series: any league appearing in live ESPN data that
  // isn't in our curated CRICKET_LEAGUES list. Keeps the hub current
  // when ESPN launches a new tour/franchise season without a code update.
  const discovered = useMemo(() => {
    const map = new Map<string, { id: string; name: string; abbr: string; live: number; total: number }>();
    for (const m of allMatches) {
      if (!m.leagueId || m.leagueId === "global") continue;
      if (CRICKET_LEAGUE_BY_ID[m.leagueId]) continue;
      const key = m.leagueId;
      const existing = map.get(key) ?? { id: key, name: m.leagueName || "International series", abbr: m.leagueAbbr || "", live: 0, total: 0 };
      existing.total += 1;
      if (m.status === "in") existing.live += 1;
      if (!existing.name && m.leagueName) existing.name = m.leagueName;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => (b.live - a.live) || (b.total - a.total)).slice(0, 8);
  }, [allMatches]);


  return (
    <div className="min-h-screen">
      <SportNav liveCount={liveAll} />
      <CricketSubNav />

      <CricketHero matches={allMatches} liveCount={liveAll} />
      <LivePulseStrip matches={allMatches} />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* International Cricket — bilateral tours */}
        {(internationals.live.length > 0 || internationals.next.length > 0) && (
          <section className="relative overflow-hidden rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-950/40 via-background to-emerald-950/30 p-4 sm:p-5">
            <div className="absolute -top-16 -right-16 size-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="relative flex items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe2 className="size-5 text-sky-300" />
                International Cricket
                {internationals.live.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
                    <span className="size-1 rounded-full bg-red-500 animate-pulse" /> {internationals.live.length} live
                  </span>
                )}
              </h2>
              <Link to="/cricket/scores" search={{ tab: "live", date: "", league: "internationals", fmt: "any" }} className="text-xs font-bold text-sky-300 hover:text-sky-200 inline-flex items-center gap-1 shrink-0">
                All internationals <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <p className="relative text-xs text-muted-foreground mb-4">Country vs country tours — NZ v ENG, IND v AUS, and every bilateral series.</p>
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...internationals.live, ...internationals.next].slice(0, 3).map((m) => (
                <CricketMatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        )}


        {/* Quick-jump series tiles */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2"><Trophy className="size-5 text-amber-400" /> Featured series</h2>
            <Link to="/cricket/series" className="text-xs font-bold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-1">
              All series <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {CRICKET_LEAGUES.slice(0, 10).map((l) => (
              <SeriesTile
                key={l.id}
                league={l}
                liveCount={allMatches.filter((m) => m.leagueId === l.id && m.status === "in").length}
                totalCount={allMatches.filter((m) => m.leagueId === l.id).length}
              />
            ))}
          </div>
        </section>

        {/* Auto-discovered active series (not in the curated registry). */}
        {discovered.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Globe2 className="size-5 text-sky-300" /> Also active now
                <span className="text-[10px] uppercase tracking-wider font-bold text-sky-300/80 px-1.5 py-0.5 rounded bg-sky-500/10 ring-1 ring-sky-500/30">auto</span>
              </h2>
              <Link to="/cricket/series" className="text-xs font-bold text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">
                All series <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {discovered.map((d) => (
                <Link
                  key={d.id}
                  to="/cricket/series/$id"
                  params={{ id: d.id }}
                  className="group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-sky-950/40 via-slate-900 to-emerald-950/30 border border-gray-800 hover:border-sky-500/40 transition-all hover:-translate-y-0.5"
                >
                  {d.live > 0 && (
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
                      <span className="size-1 rounded-full bg-red-500 animate-pulse" /> {d.live} live
                    </span>
                  )}
                  <div className="text-[10px] uppercase tracking-wider font-bold text-sky-300 mb-1">{d.abbr || "Series"}</div>
                  <div className="text-sm font-extrabold leading-tight line-clamp-2">{d.name}</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 group-hover:gap-2 transition-all">
                    {d.total} match{d.total === 1 ? "" : "es"} <ChevronRight className="size-3" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}



        {q.isLoading ? (
          <Section icon={<Clock className="size-5 text-amber-400" />} title="Loading cricket slate…">
            <GameGridSkeleton />
          </Section>
        ) : (
          <>
            {buckets.live.length > 0 && (
              <Section
                icon={<Flame className="size-5 text-red-400" />}
                title="Live right now"
                badge={`${buckets.live.length}`}
                badgeTone="red"
                seeAll="/cricket/scores"
              >
                <Grid matches={buckets.live} />
              </Section>
            )}

            <AdSlot slot="in_content" layout="in-article" />

            {buckets.today.length > 0 && (
              <Section
                icon={<Calendar className="size-5 text-emerald-400" />}
                title="Today"
                badge={`${buckets.today.length}`}
                badgeTone="emerald"
                seeAll="/cricket/scores"
              >
                <Grid matches={buckets.today.slice(0, 6)} />
              </Section>
            )}

            {buckets.upcoming.length > 0 && (
              <Section
                icon={<Clock className="size-5 text-amber-400" />}
                title="Upcoming"
                badge={`${buckets.upcoming.length}`}
                badgeTone="amber"
                seeAll="/cricket/scores"
              >
                <Grid matches={buckets.upcoming.slice(0, 6)} />
              </Section>
            )}

            {buckets.finished.length > 0 && (
              <Section
                icon={<CheckCircle2 className="size-5 text-gray-400" />}
                title="Recent results"
                badge={`${Math.min(buckets.finished.length, 6)}`}
                badgeTone="muted"
                seeAll="/cricket/scores"
              >
                <Grid matches={buckets.finished.slice(0, 6)} />
              </Section>
            )}

            {buckets.live.length === 0 && buckets.today.length === 0 && buckets.upcoming.length === 0 && buckets.finished.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
                <Calendar className="mx-auto size-10 opacity-30 mb-3" />
                <p className="text-sm font-medium">No matches in the current window</p>
                <p className="text-xs text-muted-foreground mt-1">Browse <Link to="/cricket/series" className="text-emerald-300 underline">series</Link> or <Link to="/cricket/players" className="text-emerald-300 underline">players</Link>.</p>
              </div>
            )}
          </>
        )}

        <AffiliateStrip placement="homepage" sport="cricket" heading="Cricket gear & partners" />
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Cricket data from ESPN's public feed · Auto-refreshes every 20s while play is live
      </footer>
    </div>
  );
}

function SeriesTile({ league, liveCount, totalCount }: { league: CricketLeague; liveCount: number; totalCount: number }) {
  const isIpl = league.slug === "ipl" || league.id === "8048" || /indian premier league/i.test(league.longName);
  const className = `group relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${league.bgGrad} border border-gray-800 hover:border-emerald-500/40 transition-all hover:-translate-y-0.5`;
  const inner = (
    <>
      {liveCount > 0 && (
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
          <span className="size-1 rounded-full bg-red-500 animate-pulse" /> {liveCount} live
        </span>
      )}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 mb-2">
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
    </>
  );
  if (isIpl) {
    return <Link to="/cricket/ipl" className={className}>{inner}</Link>;
  }
  return (
    <Link to="/cricket/series/$id" params={{ id: league.id }} className={className}>
      {inner}
    </Link>
  );
}


function Section({
  icon, title, badge, badgeTone, children, seeAll,
}: {
  icon: React.ReactNode; title: string; badge?: string;
  badgeTone?: "red" | "amber" | "emerald" | "muted";
  children: React.ReactNode; seeAll?: string;
}) {
  const tone =
    badgeTone === "red" ? "text-red-300 bg-red-500/15 ring-red-500/30" :
    badgeTone === "amber" ? "text-amber-300 bg-amber-500/15 ring-amber-500/30" :
    badgeTone === "emerald" ? "text-emerald-300 bg-emerald-500/15 ring-emerald-500/30" :
    "text-gray-400 bg-gray-800/60 ring-gray-700/60";
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 min-w-0 truncate">{icon}<span className="truncate">{title}</span></h2>
        <div className="shrink-0 flex items-center gap-2">
          {badge && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ring-1 ${tone}`}>
              {badgeTone === "red" && <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
              {badge}
            </span>
          )}
          {seeAll && (
            <Link to={seeAll} className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 inline-flex items-center gap-0.5">
              See all <ChevronRight className="size-3" />
            </Link>
          )}
        </div>
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
