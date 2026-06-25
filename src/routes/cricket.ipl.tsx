import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { IplHero } from "@/components/ipl/IplHero";
import { IplSubNav } from "@/components/ipl/IplSubNav";
import { OrangePurpleCap } from "@/components/ipl/OrangePurpleCap";
import { IplTitlesBoard } from "@/components/ipl/IplTitlesBoard";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import {
  getIplOverview,
  getIplTeams,
  getIplLeaders,
  getIplHistory,
} from "@/lib/ipl.functions";
import { formatLocalTime, relativeDay } from "@/lib/time";

const overviewQO = queryOptions({
  queryKey: ["ipl", "overview"],
  queryFn: () => getIplOverview(),
  staleTime: 20_000,
  refetchInterval: 30_000,
});
const teamsQO = queryOptions({
  queryKey: ["ipl", "teams"],
  queryFn: () => getIplTeams(),
  staleTime: 60 * 60_000,
});
const historyQO = queryOptions({
  queryKey: ["ipl", "history"],
  queryFn: () => getIplHistory(),
  staleTime: 60 * 60_000,
});
const orangeQO = queryOptions({
  queryKey: ["ipl", "leaders", "runs"],
  queryFn: () => getIplLeaders({ data: { metric: "runs" } }),
  staleTime: 5 * 60_000,
});
const purpleQO = queryOptions({
  queryKey: ["ipl", "leaders", "wickets"],
  queryFn: () => getIplLeaders({ data: { metric: "wickets" } }),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/cricket/ipl")({
  head: () => ({
    meta: [
      { title: "Indian Premier League — Live IPL Scores, Standings & Stats" },
      {
        name: "description",
        content:
          "IPL hub with live scores, standings, Orange & Purple Cap leaderboards, franchise titles and full season history from 2008.",
      },
      { property: "og:title", content: "IPL — Live Scores, Standings & Records" },
      {
        property: "og:description",
        content: "Live IPL action, franchise stats, Orange and Purple Cap leaders and complete history.",
      },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(overviewQO),
      context.queryClient.ensureQueryData(teamsQO),
      context.queryClient.ensureQueryData(historyQO),
      context.queryClient.ensureQueryData(orangeQO),
      context.queryClient.ensureQueryData(purpleQO),
    ]),
  component: IplHome,
});

function IplHome() {
  const { data: overview } = useSuspenseQuery(overviewQO);
  const { data: teamsData } = useSuspenseQuery(teamsQO);
  const { data: historyData } = useSuspenseQuery(historyQO);
  const { data: orangeData } = useSuspenseQuery(orangeQO);
  const { data: purpleData } = useSuspenseQuery(purpleQO);

  const next = overview.next;
  const nextLabel = next
    ? `${next.away.abbr || next.away.shortName} v ${next.home.abbr || next.home.shortName} · ${relativeDay(next.startTs)} ${formatLocalTime(next.startTs)}`
    : null;

  const lastSeason = historyData.seasons[0];

  return (
    <div className="min-h-screen bg-background text-white">
      <CricketSubNav />
      <IplSubNav />

      <IplHero
        seasonLabel={overview.seasonLabel}
        liveCount={overview.live.length}
        nextMatchLabel={nextLabel}
        totalTitles={historyData.seasons.length}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-8">
        {overview.error && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Live IPL feed temporarily unavailable — historical sections are shown below.
          </div>
        )}

        {overview.live.length > 0 && (
          <section>
            <SectionTitle title="Live now" accent="text-rose-300" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.live.map((m) => (
                <CricketMatchCard
                  key={m.id}
                  match={toCricketMatch(m, overview.seasonId, overview.seasonLabel)}
                />
              ))}
            </div>
          </section>
        )}

        {overview.upcoming.length > 0 && (
          <section>
            <SectionTitle title="Upcoming" accent="text-amber-300" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.upcoming.map((m) => (
                <CricketMatchCard
                  key={m.id}
                  match={toCricketMatch(m, overview.seasonId, overview.seasonLabel)}
                />
              ))}
            </div>
          </section>
        )}

        {overview.recent.length > 0 && (
          <section>
            <SectionTitle title="Recent results" accent="text-emerald-300" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.recent.map((m) => (
                <CricketMatchCard
                  key={m.id}
                  match={toCricketMatch(m, overview.seasonId, overview.seasonLabel)}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle title="Orange & Purple Cap" accent="text-amber-300" />
          <OrangePurpleCap
            seasonYear="current"
            orange={orangeData.leaders}
            purple={purpleData.leaders}
            fallbackOrange={lastSeason?.orangeCap ? { player: lastSeason.orangeCap.player, team: lastSeason.orangeCap.team, runs: lastSeason.orangeCap.runs } : null}
            fallbackPurple={lastSeason?.purpleCap ? { player: lastSeason.purpleCap.player, team: lastSeason.purpleCap.team, wickets: lastSeason.purpleCap.wickets } : null}
          />
        </section>

        <IplTitlesBoard teams={teamsData.teams} />

        <section>
          <SectionTitle title="Past champions" accent="text-yellow-300" />
          <div className="overflow-hidden rounded-xl border border-white/5 bg-gray-900/60">
            <div className="grid grid-cols-[60px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 border-b border-white/5 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/50">
              <div>Year</div>
              <div>Champion</div>
              <div className="hidden sm:block">Runner-up</div>
              <div className="text-right">Player of the Final</div>
            </div>
            <ul className="divide-y divide-white/5">
              {historyData.seasons.map((s) => (
                <li
                  key={s.year}
                  className="grid grid-cols-[60px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 px-3 py-2.5 text-sm"
                >
                  <div className="font-black text-white/80">{s.year}</div>
                  <div className="min-w-0 truncate font-semibold text-white">{s.champion}</div>
                  <div className="hidden min-w-0 truncate text-white/70 sm:block">{s.runnerUp}</div>
                  <div className="min-w-0 truncate text-right text-white/70">{s.mom}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2 px-1">
      <h2 className="text-base sm:text-lg font-black tracking-tight text-white">{title}</h2>
      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${accent}`}>IPL</span>
    </div>
  );
}

// Map IPL DTO → CricketMatchCard input. The shared card expects a richer
// shape (innings array, league slug, format chip), so we synthesize the
// minimum fields it reads. Card never mutates the object.
function toCricketMatch(
  m: import("@/lib/ipl.functions").IplMatchLite,
  leagueId: string,
  leagueName: string,
): import("@/lib/cricket.functions").CricketMatch {
  const mapSide = (s: import("@/lib/ipl.functions").IplTeamScore) => ({
    id: s.id,
    name: s.name,
    shortName: s.shortName,
    abbr: s.abbr,
    logo: s.logo,
    color: s.color,
    scoreSummary: s.scoreSummary,
    winner: s.winner,
    innings: s.totalRuns > 0
      ? [{ runs: s.totalRuns, wickets: s.wickets, overs: s.overs }]
      : [],
  });
  return {
    id: m.id,
    startTs: m.startTs,
    status: m.status,
    statusDetail: m.statusDetail,
    shortDetail: m.shortDetail,
    description: m.description,
    venue: m.venue,
    city: m.city,
    broadcast: m.broadcast,
    note: m.note,
    leagueId,
    leagueName,
    leagueSlug: "ipl",
    format: "T20",
    home: mapSide(m.home),
    away: mapSide(m.away),
  } as unknown as import("@/lib/cricket.functions").CricketMatch;
}
