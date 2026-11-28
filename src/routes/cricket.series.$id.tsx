import { errorMessage } from "@/lib/error-message";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TeamCrest } from "@/components/cricket/TeamCrest";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { ArrowLeft, Calendar, Trophy, MapPin } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { GameGridSkeleton } from "@/components/sports/Skeletons";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { getCricketScoreboard, type CricketMatch } from "@/lib/cricket.functions";
import { CRICKET_LEAGUE_BY_ID } from "@/lib/cricket-leagues";
import { breadcrumbList, ldScript, sportsEvent, sportsOrganization } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/cricket/series/$id")({
  head: ({ params }) => {
    const l = CRICKET_LEAGUE_BY_ID[params.id];
    const name = l?.longName ?? "Cricket Series";
    const url = `https://www.playsports.online/cricket/series/${params.id}`;
    const title = `${name} â€” Fixtures, Results & Squads`;
    const desc = `Complete ${name} fixtures, live scores, standings and recent results on PlaySports.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} â€” Cricket Hub` },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "PlaySports" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${name} â€” Cricket Hub` },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          sportsEvent({
            name,
            path: `/cricket/series/${params.id}`,
            sport: "Cricket",
            description: desc,
          }),
        ),
        ldScript(
          sportsOrganization({ name, path: `/cricket/series/${params.id}`, sport: "Cricket" }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "Cricket", path: "/cricket" },
            { name: "Series", path: "/cricket/series" },
            { name, path: `/cricket/series/${params.id}` },
          ]),
        ),
      ],
    };
  },

  component: SeriesPage,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <ErrorState
          title="Could not load this series"
          message={errorMessage(error)}
          onRetry={reset}
        />
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SportNav />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          title="Series not found"
          description="This series is not in the cricket directory."
          action={
            <Link
              to="/cricket/series"
              className="inline-flex min-h-11 items-center rounded-full bg-[var(--color-accent-cricket)]/15 px-4 text-sm font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/30"
            >
              Browse all series
            </Link>
          }
        />
      </div>
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
    const rows = new Map<
      string,
      { team: CricketMatch["home"]; played: number; wins: number; losses: number }
    >();
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
  const heroBg = meta?.bgGrad ?? "from-[var(--color-accent-cricket)]/40 via-background to-[var(--color-gold)]/20";

  return (
    <div className="min-h-screen">
      <SportNav liveCount={liveCount} />

      <section
        className={`relative overflow-hidden border-b border-border bg-gradient-to-br ${heroBg}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link
            to="/cricket"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-accent-cricket)]/90 hover:text-[var(--color-accent-cricket)] mb-3"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" /> All cricket
          </Link>
          <div className="flex items-center gap-4">
            <div
              className={`size-16 sm:size-20 rounded-2xl ${meta?.chipBg ?? "bg-[var(--color-accent-cricket)]/15"} ring-1 ${meta?.ring ?? "ring-[var(--color-accent-cricket)]/30"} grid place-items-center text-4xl shrink-0`}
              aria-hidden="true"
            >
              {meta?.emoji ?? "ðŸ"}
            </div>
            <div className="min-w-0">
              <div
                className={`text-[11px] uppercase tracking-[0.2em] ${meta?.accent ?? "text-[var(--color-accent-cricket)]"} font-bold`}
              >
                {q.data?.league.abbr || meta?.label || "Cricket"}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {q.data?.league.name || meta?.longName || "Series"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {meta?.tagline ?? "Live scores, fixtures and results"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <Stat label="Matches" value={matches.length} />
                {buckets.live.length > 0 && (
                  <Stat label="Live" value={buckets.live.length} tone="red" />
                )}
                {buckets.upcoming.length > 0 && (
                  <Stat label="Upcoming" value={buckets.upcoming.length} tone="amber" />
                )}
                {buckets.finished.length > 0 && (
                  <Stat label="Played" value={buckets.finished.length} tone="muted" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {q.isError && !q.data ? (
          <ErrorState
            title="Could not load this series"
            message={errorMessage(q.error)}
            onRetry={() => void q.refetch()}
          />
        ) : q.isLoading ? (
          <GameGridSkeleton />
        ) : matches.length === 0 ? (
          <EmptyState
            title="No matches scheduled"
            description={q.data?.error ?? "Check back during the next series window."}
            icon={<Calendar aria-hidden="true" className="size-5" />}
          />
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
              <Block
                title="Standings"
                tone="muted"
                icon={<Trophy aria-hidden="true" className="size-4 text-[var(--color-gold)]" />}
              >
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <caption className="sr-only">
                      Derived series standings from completed matches
                    </caption>
                    <thead className="bg-background text-[10px] uppercase tracking-wider text-foreground">
                      <tr>
                        <th scope="col" className="text-left px-3 py-2">
                          #
                        </th>
                        <th scope="col" className="text-left px-3 py-2">
                          Team
                        </th>
                        <th scope="col" className="text-right px-3 py-2">
                          P
                        </th>
                        <th scope="col" className="text-right px-3 py-2">
                          W
                        </th>
                        <th scope="col" className="text-right px-3 py-2">
                          L
                        </th>
                        <th scope="col" className="text-right px-3 py-2">
                          Win %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {table.map((r, i) => {
                        const pct = r.played ? Math.round((r.wins / r.played) * 100) : 0;
                        return (
                          <tr key={r.team.id} className="hover:bg-background">
                            <td className="px-3 py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                            <td className="px-3 py-2 flex items-center gap-2">
                              <TeamCrest
                                src={r.team.logo}
                                abbr={r.team.abbr}
                                name={r.team.name}
                                className="size-5"
                              />
                              <span className="font-medium">{r.team.shortName || r.team.name}</span>
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.played}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-[var(--color-accent-cricket)] font-bold">
                              {r.wins}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums text-[var(--color-live)]">
                              {r.losses}
                            </td>
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
      ? "bg-[var(--color-live)]/15 text-[var(--color-live)] ring-[var(--color-live)]/30"
      : tone === "amber"
        ? "bg-[var(--color-gold)]/15 text-[var(--color-gold)] ring-[var(--color-gold)]/30"
        : tone === "muted"
          ? "bg-card text-foreground ring-border"
          : "bg-muted text-foreground ring-border";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ring-1 font-semibold ${cls}`}
    >
      {tone === "red" && (
        <span className="size-1.5 rounded-full bg-[var(--color-live)] animate-pulse motion-reduce:animate-none" />
      )}
      <span className="text-[10px] uppercase tracking-wider opacity-80">{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

function Block({
  title,
  tone,
  icon,
  children,
}: {
  title: string;
  tone: "red" | "amber" | "muted";
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls =
    tone === "red" ? "text-[var(--color-live)]" : tone === "amber" ? "text-[var(--color-gold)]" : "text-foreground";
  return (
    <section className="space-y-3">
      <h2
        className={`text-[11px] uppercase tracking-[0.18em] font-bold ${cls} flex items-center gap-2`}
      >
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ matches }: { matches: CricketMatch[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {matches.map((m) => (
        <CricketMatchCard key={m.id} match={m} />
      ))}
    </div>
  );
}
