import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { SportNav } from "@/components/sports/SportNav";
import { CricketPlayerSheet } from "@/components/cricket/CricketPlayerSheet";
import { getCricketMatchDetail } from "@/lib/cricket.functions";
import { breadcrumbList, sportsEvent, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { AdSlot } from "@/components/ads/AdSlot";
import { MatchHero } from "@/components/cricket/match/MatchHero";
import { MatchStickyBar } from "@/components/cricket/match/MatchStickyBar";
import { MatchTabs, type TabDef } from "@/components/cricket/match/MatchTabs";
import { SummaryTab } from "@/components/cricket/match/SummaryTab";
import { ScorecardTab } from "@/components/cricket/match/ScorecardTab";
import { CommentaryTab } from "@/components/cricket/match/CommentaryTab";
import { InfoTab } from "@/components/cricket/match/InfoTab";
import { MatchFaqBlock } from "@/components/seo/MatchFaqBlock";


const searchSchema = z.object({
  leagueId: z.string().default("8048"),
});

const detailOpts = (leagueId: string, eventId: string) =>
  queryOptions({
    queryKey: ["cricket", "match", leagueId, eventId],
    queryFn: () => getCricketMatchDetail({ data: { leagueId, eventId } }),
    staleTime: 15_000,
  });

export const Route = createFileRoute("/cricket/match/$id")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ leagueId: search.leagueId }),
  loader: async ({ params, deps, context }) => {
    try {
      return await context.queryClient.ensureQueryData(detailOpts(deps.leagueId, params.id));
    } catch {
      return { match: null, innings: [], commentary: [], error: null } as unknown as Awaited<ReturnType<typeof getCricketMatchDetail>>;
    }
  },
  head: ({ params, loaderData }) => {
    const url = `https://www.playsports.online/cricket/match/${params.id}`;
    const m = loaderData?.match;
    let title = "Live Cricket Scorecard — PlaySports";
    let desc = "Live cricket scorecard, batting and bowling figures, commentary and lineups.";
    const jsonld: unknown[] = [];
    if (m) {
      const vs = `${m.away.abbr || m.away.name} vs ${m.home.abbr || m.home.name}`;
      const ctx = m.leagueAbbr || m.leagueName || "Cricket";
      const statusTag = m.status === "in" ? "Live" : m.status === "post" ? "Result" : "Preview";
      const rawTitle = `${vs} — ${ctx} ${statusTag} Scorecard`;
      title = rawTitle.length > 60 ? rawTitle.slice(0, 57) + "…" : rawTitle;
      const resultPart = m.status === "post" && m.result?.marginText ? `${m.result.marginText}. ` : m.status === "post" && m.note ? `${m.note}. ` : "";
      desc = `${m.away.name} vs ${m.home.name} in ${m.leagueName || ctx}${m.venue ? ` at ${m.venue}${m.city ? `, ${m.city}` : ""}` : ""}. ${resultPart}Live scorecard, batting/bowling figures, commentary and lineups.`;
      jsonld.push(sportsEvent({
        name: `${vs} — ${ctx}`,
        path: `/cricket/match/${params.id}`,
        sport: "Cricket",
        startDate: m.startTs ? new Date(m.startTs).toISOString() : undefined,
        homeTeam: m.home.name,
        awayTeam: m.away.name,
        location: m.venue ? `${m.venue}${m.city ? `, ${m.city}` : ""}` : undefined,
        status: m.status === "in" ? "live" : m.status === "post" ? "ended" : "scheduled",
      }));
    } else {
      jsonld.push(sportsEvent({ name: `Cricket Match ${params.id}`, path: `/cricket/match/${params.id}`, sport: "Cricket" }));
    }
    jsonld.push(breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Cricket", path: "/cricket" },
      { name: "Scores", path: "/cricket/scores" },
      { name: m ? `${m.away.abbr} vs ${m.home.abbr}` : "Match", path: `/cricket/match/${params.id}` },
    ]));
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: jsonld.map((n) => ldScript(n)),
    };
  },

  component: MatchPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="text-lg font-semibold">Couldn't load match</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        <Link to="/cricket" className="mt-4 inline-block text-emerald-400 hover:underline text-sm">← Back to cricket</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">Match not found.</div>
  ),
});

function MatchPage() {
  const { id } = Route.useParams();
  const { leagueId } = Route.useSearch();
  const fn = useServerFn(getCricketMatchDetail);
  const q = useSuspenseQuery({
    ...detailOpts(leagueId, id),
    queryFn: () => fn({ data: { leagueId, eventId: id } }),
    refetchInterval: (qq) => {
      const d = qq.state.data as { match?: { status: string } | null } | undefined;
      return d?.match?.status === "in" ? 10_000 : false;
    },
    refetchOnWindowFocus: true,
  });

  const match = q.data?.match ?? null;
  const innings = q.data?.innings ?? [];
  const commentary = q.data?.commentary ?? [];
  const [playerId, setPlayerId] = useState<string | null>(null);

  if (!match) {
    return (
      <div className="min-h-screen">
        <SportNav />
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-sm">Match data unavailable.</p>
          <p className="text-xs text-muted-foreground mt-1">{q.data?.error}</p>
          <Link to="/cricket" className="mt-4 inline-block text-emerald-400 hover:underline text-sm">← Back to cricket</Link>
        </div>
      </div>
    );
  }

  const isLive = match.status === "in";
  const tabs: TabDef[] = [
    { id: "summary", label: "Summary" },
    { id: "scorecard", label: "Scorecard", badge: innings.length || undefined },
    { id: "commentary", label: "Commentary", badge: commentary.length || undefined },
    { id: "info", label: "Info" },
    { id: "faqs", label: "FAQs" },
  ];

  const faqs = buildMatchFaqs({
    sport: "Cricket",
    leagueName: match.leagueName,
    home: match.home.name,
    away: match.away.name,
    venue: match.venue ?? undefined,
    startDate: match.startTs ? new Date(match.startTs).toISOString() : undefined,
    status: match.status === "in" ? "live" : match.status === "post" ? "ended" : "scheduled",
    broadcast: match.broadcast ?? undefined,
  });

  return (
    <div className="min-h-screen pb-16 sm:pb-0">
      <SportNav liveCount={isLive ? 1 : 0} />
      <MatchStickyBar match={match} />
      <MatchHero match={match} />

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <MatchTabs
          tabs={tabs}
          render={(active) => {
            if (active === "summary") return <SummaryTab match={match} innings={innings} onPlayer={setPlayerId} />;
            if (active === "scorecard") return <ScorecardTab match={match} innings={innings} onPlayer={setPlayerId} />;
            if (active === "commentary") return <CommentaryTab commentary={commentary} />;
            if (active === "info") return <InfoTab match={match} />;
            if (active === "faqs") return <MatchFaqBlock faqs={faqs} />;
            return null;
          }}
        />

        <CricketPlayerSheet athleteId={playerId} leagueId={leagueId} onClose={() => setPlayerId(null)} />

        <div className="mt-10 space-y-6">
          <AffiliateStrip placement="match_footer" sport="cricket" heading="Cricket gear & partners" />
          <AdSlot slot="in_content" layout="in-article" />
        </div>
      </main>

      <footer className="border-t border-border mt-10 py-8 text-center text-xs text-muted-foreground">
        Cricket data from ESPN · Live scorecards refresh every 15s
      </footer>
    </div>
  );
}
