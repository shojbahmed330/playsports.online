import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { IplHero } from "@/components/ipl/IplHero";
import { IplSubNav } from "@/components/ipl/IplSubNav";
import { OrangePurpleCap } from "@/components/ipl/OrangePurpleCap";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { toCricketMatch } from "@/components/ipl/toCricketMatch";
import {
  getIplOverview,
  getIplHistory,
  getIplLeaders,
} from "@/lib/ipl.functions";
import { formatLocalTime, relativeDay } from "@/lib/time";

const overviewQO = queryOptions({
  queryKey: ["ipl", "overview"],
  queryFn: () => getIplOverview(),
  staleTime: 20_000,
  refetchInterval: 30_000,
});
const historyQO = queryOptions({
  queryKey: ["ipl", "history"],
  queryFn: () => getIplHistory(),
  staleTime: 60 * 60_000,
});
const orangeQO = queryOptions({
  queryKey: ["ipl", "leaders", "runs", "current"],
  queryFn: () => getIplLeaders({ data: { metric: "runs" } }),
  staleTime: 5 * 60_000,
});
const purpleQO = queryOptions({
  queryKey: ["ipl", "leaders", "wickets", "current"],
  queryFn: () => getIplLeaders({ data: { metric: "wickets" } }),
  staleTime: 5 * 60_000,
});

export const Route = createFileRoute("/cricket/ipl")({
  head: () => ({
    meta: [
      { title: "Indian Premier League — Live IPL Scores, Standings & Stats" },
      { name: "description", content: "IPL hub with live scores, standings, Orange & Purple Cap leaderboards, franchise titles and full season history from 2008." },
      { property: "og:title", content: "IPL — Live Scores, Standings & Records" },
      { property: "og:description", content: "Live IPL action, franchise stats, Orange and Purple Cap leaders and complete history." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(overviewQO),
      context.queryClient.ensureQueryData(historyQO),
      context.queryClient.ensureQueryData(orangeQO),
      context.queryClient.ensureQueryData(purpleQO),
    ]),
  component: IplHome,
});

function IplHome() {
  const { data: overview } = useSuspenseQuery(overviewQO);
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
            Live IPL feed temporarily unavailable — historical sections remain available.
          </div>
        )}

        {overview.live.length > 0 && (
          <Section title="Live now" accent="text-rose-300" linkTo="/cricket/ipl/scores" linkLabel="All scores →">
            <Grid>
              {overview.live.map((m) => (
                <CricketMatchCard key={m.id} match={toCricketMatch(m, overview.seasonId, overview.seasonLabel)} />
              ))}
            </Grid>
          </Section>
        )}

        {overview.upcoming.length > 0 && (
          <Section title="Upcoming" accent="text-amber-300" linkTo="/cricket/ipl/scores" linkLabel="Full schedule →">
            <Grid>
              {overview.upcoming.slice(0, 3).map((m) => (
                <CricketMatchCard key={m.id} match={toCricketMatch(m, overview.seasonId, overview.seasonLabel)} />
              ))}
            </Grid>
          </Section>
        )}

        {overview.recent.length > 0 && (
          <Section title="Recent results" accent="text-emerald-300" linkTo="/cricket/ipl/scores" linkLabel="All results →">
            <Grid>
              {overview.recent.slice(0, 3).map((m) => (
                <CricketMatchCard key={m.id} match={toCricketMatch(m, overview.seasonId, overview.seasonLabel)} />
              ))}
            </Grid>
          </Section>
        )}

        <Section title="Orange & Purple Cap" accent="text-amber-300" linkTo="/cricket/ipl/players" linkLabel="Full leaderboards →">
          <OrangePurpleCap
            seasonYear="current"
            orange={orangeData.leaders}
            purple={purpleData.leaders}
            fallbackOrange={lastSeason?.orangeCap ?? null}
            fallbackPurple={lastSeason?.purpleCap ?? null}
          />
        </Section>

        {overview.standings.length > 0 && (
          <Section title="Points table — preview" accent="text-sky-300" linkTo="/cricket/ipl/standings" linkLabel="Full standings →">
            <MiniStandings rows={overview.standings.slice(0, 6)} />
          </Section>
        )}

        <Section title="Champions through the years" accent="text-yellow-300" linkTo="/cricket/ipl/history" linkLabel="Complete history →">
          <div className="overflow-hidden rounded-xl border border-white/5 bg-gray-900/60">
            <ul className="divide-y divide-white/5">
              {historyData.seasons.slice(0, 5).map((s) => (
                <li key={s.year} className="grid grid-cols-[60px_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 px-3 py-2.5 text-sm">
                  <div className="font-black text-white/80">{s.year}</div>
                  <div className="min-w-0 truncate font-semibold text-white">{s.champion}</div>
                  <div className="min-w-0 truncate text-right text-white/60">def. {s.runnerUp}</div>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({
  title, accent, linkTo, linkLabel, children,
}: {
  title: string; accent: string; linkTo?: string; linkLabel?: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">{title}</h2>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${accent}`}>IPL</span>
        </div>
        {linkTo && linkLabel && (
          <Link to={linkTo} className="text-xs font-semibold text-white/60 hover:text-white">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function MiniStandings({ rows }: { rows: import("@/lib/ipl.functions").IplStandingsRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-gray-900/60">
      <div className="grid grid-cols-[28px_minmax(0,1fr)_40px_40px_56px] gap-2 border-b border-white/5 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/50">
        <div>#</div><div>Team</div><div className="text-right">W</div><div className="text-right">L</div><div className="text-right">Pts</div>
      </div>
      <ul className="divide-y divide-white/5">
        {rows.map((r, i) => (
          <li key={r.teamId} className="grid grid-cols-[28px_minmax(0,1fr)_40px_40px_56px] items-center gap-2 px-3 py-2 text-sm">
            <div className="text-white/50 font-bold">{i + 1}</div>
            <div className="min-w-0 flex items-center gap-2">
              {r.logo && <img src={r.logo} alt="" className="h-5 w-5 shrink-0 object-contain" loading="lazy" />}
              <span className="truncate font-semibold text-white">{r.shortName || r.teamName}</span>
            </div>
            <div className="text-right text-emerald-300 font-bold">{r.wins}</div>
            <div className="text-right text-rose-300 font-bold">{r.losses}</div>
            <div className="text-right font-black text-white">{r.points}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
