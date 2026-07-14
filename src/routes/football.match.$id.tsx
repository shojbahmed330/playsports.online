import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronLeft, Loader2, ChevronDown, Tv, Flame } from "lucide-react";
import { getWc2026Match, getWc2026Fixtures, type Wc2026Fixture } from "@/lib/wc2026.functions";
import { LiveMatchCenter } from "@/components/wc/LiveMatchCenter";
import { WatchLivePanel } from "@/components/wc/WatchLivePanel";
import { breadcrumbList, faqPage, ldScript, sportsEvent } from "@/lib/seo/jsonld";
import { buildMatchFaqs } from "@/lib/seo/match-faqs";
import { MatchFaqBlock } from "@/components/seo/MatchFaqBlock";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { AdSlot } from "@/components/ads/AdSlot";
import { flagOf } from "@/lib/flags";
import { formatLocalTime } from "@/lib/time";
import { AddToCalendarButton } from "@/components/football/AddToCalendarButton";
import { MatchReminderBell } from "@/components/football/MatchReminderBell";
import { HeadToHeadStrip } from "@/components/football/HeadToHeadStrip";
import { FormGuide } from "@/components/football/FormGuide";
import { VenueCard } from "@/components/football/VenueCard";
import { MomentumChart } from "@/components/football/MomentumChart";
import { WinProbabilityChart } from "@/components/football/WinProbabilityChart";
import { OfficialsCard } from "@/components/football/OfficialsCard";
import { MatchPrediction } from "@/components/football/MatchPrediction";
import { MatchComments } from "@/components/football/MatchComments";
import { HandleSetup } from "@/components/football/HandleSetup";
import { useGoalAlerts } from "@/hooks/use-goal-alerts";
import { MatchHighlightCard } from "@/components/wc/MatchHighlightCard";

export const Route = createFileRoute("/football/match/$id")({
  loader: async ({ context, params }) => {
    const matchId = Number(params.id);
    if (!Number.isFinite(matchId)) return { fixture: null };
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["wc2026", "match", matchId],
      queryFn: () => getWc2026Match({ data: { matchId } }),
      staleTime: 30_000,
    }).catch(() => null);
    return { fixture: data?.fixture ?? null };
  },
  head: ({ params, loaderData }) => {
    const fx = loaderData?.fixture;
    const url = `https://www.playsports.online/football/match/${params.id}`;
    const matchup = fx ? `${fx.home.name} vs ${fx.away.name}` : "FIFA World Cup 2026 Match";
    const title = fx
      ? `${matchup} — FIFA World Cup 2026 Live Score & Lineups`
      : "FIFA World Cup 2026 Match — Live Score & Lineups";
    const desc = fx
      ? `${matchup}${fx.venue ? ` at ${fx.venue}` : ""} — live World Cup 2026 score, lineups, key events and where to watch on PlaySports.`
      : "Live FIFA World Cup 2026 match: score, lineups, key events, broadcast info and where to watch.";
    const ogImage = `https://www.playsports.online/og/match/match-${params.id}--FIFA%20World%20Cup%202026%20%C2%B7%20Live%20score%20%26%20lineups.svg`;
    const status = fx?.status === "inprogress" ? "live" : fx?.status === "finished" ? "ended" : "scheduled";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: matchup },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(sportsEvent({
          name: matchup,
          path: `/football/match/${params.id}`,
          sport: "Soccer",
          startDate: fx?.startTs ? new Date(fx.startTs).toISOString() : undefined,
          homeTeam: fx?.home.name,
          awayTeam: fx?.away.name,
          location: fx?.venue ?? undefined,
          status,
        })),
        ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "Football", path: "/football" }, { name: matchup, path: `/football/match/${params.id}` }])),
        ldScript(faqPage(buildMatchFaqs({
          sport: "Soccer", leagueName: "FIFA World Cup 2026",
          home: fx?.home.name, away: fx?.away.name,
          venue: fx?.venue ?? undefined,
          startDate: fx?.startTs ? new Date(fx.startTs).toISOString() : undefined,
          status,
          homeScore: fx?.home.goals ?? null, awayScore: fx?.away.goals ?? null,
        }))),
      ],
    };
  },
  component: MatchPage,
});

function MatchPage() {
  const { id } = useParams({ from: "/football/match/$id" });
  const matchId = Number(id);
  const [watchOpen, setWatchOpen] = useState(false);

  const q = useQuery({
    queryKey: ["wc2026", "match", matchId],
    queryFn: () => getWc2026Match({ data: { matchId } }),
    refetchInterval: 30_000,
    enabled: Number.isFinite(matchId),
  });

  const fx = q.data?.fixture;
  const title = fx ? `${fx.home.name} v ${fx.away.name}` : "Match Centre";
  const isLive = fx?.status === "inprogress";
  useGoalAlerts(fx);

  return (
    <div className="min-h-dvh bg-black text-foreground pb-16 sm:pb-0">
      {/* Single slim header — no nested look */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-black/80 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-3 py-2.5 flex items-center gap-2">
          <Link
            to="/football"
            search={(prev: Record<string, unknown>) => ({ ...prev, year: prev.year ?? 2026, tab: prev.tab ?? "today" })}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white shrink-0"
            aria-label="Back to Football"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Football</span>
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-sm font-bold text-white text-center">
            {title}
          </h1>
          {isLive ? (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
              <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> Live
            </span>
          ) : fx?.status === "notstarted" ? (
            <div className="flex items-center gap-1.5">
              <MatchReminderBell fx={fx} />
              <AddToCalendarButton fx={fx} compact />
            </div>
          ) : (
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-gray-600">2026</span>
          )}
        </div>
      </header>

      <main id="main-content" className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {q.isLoading && (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="size-5 animate-spin mr-2" /> Loading match…
          </div>
        )}
        {q.data?.error && !q.data.fixture && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            Match unavailable: {q.data.error}
          </div>
        )}
        {fx && (
          <>
            <LiveMatchCenter fixture={fx} />

            <MatchHighlightCard home={fx.home.name} away={fx.away.name} />


            <WinProbabilityChart fx={fx} />
            <MomentumChart fx={fx} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VenueCard fx={fx} />
              <FormGuide fx={fx} />
            </div>
            <HeadToHeadStrip fx={fx} />
            <OfficialsCard matchId={matchId} />

            {/* Watch live — collapsible disclosure, not a second stacked card */}
            <section className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03]">
              <button
                type="button"
                onClick={() => setWatchOpen((v) => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-amber-200 hover:bg-amber-500/10 rounded-xl"
                aria-expanded={watchOpen}
              >
                <Tv className="size-4" />
                <span>Watch live</span>
                <span className="ml-auto text-[10px] uppercase tracking-widest text-amber-200/60">
                  {watchOpen ? "Hide" : "Show"}
                </span>
                <ChevronDown className={`size-4 transition-transform ${watchOpen ? "rotate-180" : ""}`} />
              </button>
              {watchOpen && (
                <div className="border-t border-amber-500/15 px-3 py-3">
                  <WatchLivePanel compact />
                </div>
              )}
            </section>

            <OtherMatchesToday currentId={matchId} />

            <HandleSetup />
            <MatchPrediction fx={fx} />
            <MatchComments matchId={matchId} />

            <AffiliateStrip placement="match_footer" sport="football" heading="Shop the matchup" />
            <AdSlot slot="in_content" layout="in-article" />
          </>
        )}
      </main>
    </div>
  );
}

function OtherMatchesToday({ currentId }: { currentId: number }) {
  const fn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fn(),
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: 1,
  });
  const fixtures = q.data?.fixtures ?? [];
  const now = Date.now();

  // Priority: other live matches → today's remaining kickoffs → today's finished.
  const live = fixtures.filter((f) => f.status === "inprogress" && f.id !== currentId);
  const today = fixtures
    .filter((f) => f.id !== currentId && isSameDay(f.startTs * 1000, now))
    .sort((a, b) => a.startTs - b.startTs);
  const upcomingToday = today.filter((f) => f.status === "notstarted");
  const finishedToday = today.filter((f) => f.status === "finished");

  const list = [...live, ...upcomingToday, ...finishedToday].slice(0, 6);
  if (list.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="size-4 text-red-400" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">
          Also on today
        </h2>
        <span className="text-[10px] text-gray-500 tabular-nums">{list.length}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {list.map((f) => <OtherCard key={f.id} f={f} />)}
      </div>
    </section>
  );
}

function OtherCard({ f }: { f: Wc2026Fixture }) {
  const live = f.status === "inprogress";
  const final = f.status === "finished";
  return (
    <Link
      to="/football/match/$id"
      params={{ id: String(f.id) }}
      className={`group block rounded-xl border p-2.5 transition-all hover:-translate-y-0.5 ${
        live
          ? "border-red-500/40 bg-red-500/[0.05] hover:border-red-400/60"
          : "border-white/10 bg-black/30 hover:border-amber-500/40"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-[9px] uppercase tracking-widest font-bold text-amber-300/80 truncate min-w-0">{f.group}</span>
        <span className={`text-[10px] font-bold shrink-0 ${live ? "text-red-300" : final ? "text-gray-400" : "text-sky-300"}`}>
          {live ? (f.minute ? `${f.minute}'` : "LIVE") : final ? "FT" : formatLocalTime(f.startTs * 1000)}
        </span>
      </div>
      <MiniRow name={f.home.name} score={live || final ? f.home.goals : null} />
      <MiniRow name={f.away.name} score={live || final ? f.away.goals : null} />
    </Link>
  );
}

function MiniRow({ name, score }: { name: string; score: number | null }) {
  return (
    <div className="flex items-center gap-2 py-0.5 min-w-0">
      <span className="text-base leading-none shrink-0">{flagOf(name)}</span>
      <span className="truncate flex-1 text-xs font-semibold text-gray-200">{name}</span>
      <span className="shrink-0 text-xs font-black tabular-nums text-white">{score ?? "-"}</span>
    </div>
  );
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
