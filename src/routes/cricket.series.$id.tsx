import { createFileRoute, Link } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { ArrowLeft, Calendar, Trophy, MapPin } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { getCricketScoreboard, type CricketMatch } from "@/lib/cricket.functions";
import { CRICKET_LEAGUE_BY_ID } from "@/lib/cricket-leagues";
import { breadcrumbList, ldScript, sportsEvent, sportsOrganization } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/cricket/series/$id")({
  head: ({ params }) => {
    const l = CRICKET_LEAGUE_BY_ID[params.id];
    const name = l?.longName ?? "Cricket Series";
    const url = `https://www.playsports.online/cricket/series/${params.id}`;
    const title = `${name} — Fixtures, Results & Squads`;
    const desc = `Complete ${name} fixtures, live scores, standings and recent results on PlaySports.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — Cricket Hub` },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${name} — Cricket Hub` },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(sportsEvent({
          name,
          path: `/cricket/series/${params.id}`,
          sport: "Cricket",
          description: desc,
        })),
        ldScript(sportsOrganization({ name, path: `/cricket/series/${params.id}`, sport: "Cricket" })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" },
          { name: "Cricket", path: "/cricket" },
          { name: "Series", path: "/cricket/series" },
          { name, path: `/cricket/series/${params.id}` },
        ])),
      ],
    };
  },

  component: SeriesPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <p className="text-lg font-semibold">Couldn't load series</p>
        <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        <Link to="/cricket" className="mt-4 inline-block text-emerald-400 hover:underline text-sm">← Back to cricket</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center p-6 text-center">
      <p>Series not found.</p>
    </div>
  ),
});

function SeriesPage() {
  const { id } = Route.useParams();
  const meta = CRICKET_LEAGUE_BY_ID[id];
  const fn = useServerFn(getCricketScoreboard);
  const q = useQuery({
    queryKey: ["cricket", "series", id],
    queryFn: () => fn({ data: { leagueId: id } }),
    staleTime: 30_000,
    refetchInterval: (qq) => {
      const d = qq.state.data as { matches?: CricketMatch[] } | undefined;
      return d?.matches?.some((m) => m.status === "in") ? 25_000 : false;
    },
  });

  const matches = q.data?.matches ?? [];
  const buckets = useMemo(() => {
    return {
      live: matches.filter((m) => m.status === "in"),
      upcoming: matches.filter((m) => m.status === "pre").sort((a, b) => a.startTs - b.startTs),
      finished: matches.filter((m) => m.status === "post").sort((a, b) => b.startTs - a.startTs),
    };
  }, [matches]);

  // Derive a tiny points table from finished matches (wins/losses)
  const table = useMemo(() => {
    const rows = new Map<string, { team: CricketMatch["home"]; played: number; wins: number; losses: number }>();
    for (const m of buckets.finished) {
      for (const t of [m.home, m.away]) {
        const existing = rows.get(t.id) ?? { team: t, played: 0, wins: 0, losses: 0 };
        existing.played++;
        if (t.winner === true) existing.wins++;
        else if (t.winner === false) existing.losses++;
        rows.set(t.id, existing);
      }
    }
    return Array.from(rows.values()).sort((a, b) => b.wins - a.wins || b.played - a.played);
  }, [buckets.finished]);

  const liveCount = buckets.live.length;
  const heroBg = meta?.bgGrad ?? "from-emerald-900/40 via-slate-900 to-amber-900/20";

  return (
    <div className="min-h-screen">
      <SportNav liveCount={liveCount} />

      <section className={`relative overflow-hidden border-b border-border bg-gradient-to-br ${heroBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link to="/cricket" className="inline-flex items-center gap-1.5 text-xs text-emerald-300/90 hover:text-emerald-200 mb-3">
            <ArrowLeft className="size-3.5" /> All cricket
          </Link>
          <div className="flex items-center gap-4">
            <div className={`size-16 sm:size-20 rounded-2xl ${meta?.chipBg ?? "bg-emerald-500/15"} ring-1 ${meta?.ring ?? "ring-emerald-500/30"} grid place-items-center text-4xl shrink-0`}>
              {meta?.emoji ?? "🏏"}
            </div>
            <div className="min-w-0">
              <div className={`text-[11px] uppercase tracking-[0.2em] ${meta?.accent ?? "text-emerald-300"} font-bold`}>
                {q.data?.league.abbr || meta?.label || "Cricket"}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{q.data?.league.name || meta?.longName || "Series"}</h1>
              <p className="text-sm text-muted-foreground mt-1">{meta?.tagline ?? "Live scores, fixtures and results"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <Stat label="Matches" value={matches.length} />
                {buckets.live.length > 0 && <Stat label="Live" value={buckets.live.length} tone="red" />}
                {buckets.upcoming.length > 0 && <Stat label="Upcoming" value={buckets.upcoming.length} tone="amber" />}
                {buckets.finished.length > 0 && <Stat label="Played" value={buckets.finished.length} tone="muted" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {q.isLoading ? (
          <GameGridSkeleton />
        ) : matches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
            <Calendar className="mx-auto size-10 opacity-30 mb-3" />
            <p className="text-sm font-medium">No matches scheduled</p>
            <p className="text-xs text-muted-foreground mt-1">{q.data?.error ?? "Check back during the next series window."}</p>
          </div>
        ) : (
          <>
            {buckets.live.length > 0 && (
              <Block title="Live now" tone="red">
                <Grid matches={buckets.live} />
              </Block>
            )}
            {buckets.upcoming.length > 0 && (
              <Block title="Upcoming fixtures" tone="amber">
                <Grid matches={buckets.upcoming} />
              </Block>
            )}
            {table.length > 0 && (
              <Block title="Standings" tone="muted" icon={<Trophy className="size-4 text-amber-400" />}>
                <div className="overflow-x-auto rounded-xl border border-gray-800">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-900/60 text-[10px] uppercase tracking-wider text-gray-400">
                      <tr>
                        <th className="text-left px-3 py-2">#</th>
                        <th className="text-left px-3 py-2">Team</th>
                        <th className="text-right px-3 py-2">P</th>
                        <th className="text-right px-3 py-2">W</th>
                        <th className="text-right px-3 py-2">L</th>
                        <th className="text-right px-3 py-2">Win %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {table.map((r, i) => {
                        const pct = r.played ? Math.round((r.wins / r.played) * 100) : 0;
                        return (
                          <tr key={r.team.id} className="hover:bg-gray-900/40">
                            <td className="px-3 py-2 text-gray-500 tabular-nums">{i + 1}</td>
                            <td className="px-3 py-2 flex items-center gap-2">
                              <TeamCrest src={r.team.logo} abbr={r.team.abbr} name={r.team.name} className="size-5" />
                              <span className="font-medium">{r.team.shortName || r.team.name}</span>
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.played}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-emerald-300 font-bold">{r.wins}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-red-300">{r.losses}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Block>
            )}
            {buckets.finished.length > 0 && (
              <Block title="Recent results" tone="muted">
                <Grid matches={buckets.finished.slice(0, 12)} />
              </Block>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "red" | "amber" | "muted" }) {
  const cls = tone === "red"
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

function Block({ title, tone, icon, children }: { title: string; tone: "red" | "amber" | "muted"; icon?: React.ReactNode; children: React.ReactNode }) {
  const cls = tone === "red" ? "text-red-300" : tone === "amber" ? "text-amber-300" : "text-gray-400";
  return (
    <section className="space-y-3">
      <div className={`text-[11px] uppercase tracking-[0.18em] font-bold ${cls} flex items-center gap-2`}>
        {icon} {title}
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
