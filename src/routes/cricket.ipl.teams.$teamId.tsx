import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { CricketMatchCard } from "@/components/cricket/CricketMatchCard";
import { toCricketMatch } from "@/components/ipl/toCricketMatch";
import { getIplTeam } from "@/lib/ipl.functions";
import history from "@/data/cricket/ipl/history.json";

const qo = (teamId: string) =>
  queryOptions({
    queryKey: ["ipl", "team", teamId],
    queryFn: () => getIplTeam({ data: { teamId } }),
    staleTime: 60_000,
  });

export const Route = createFileRoute("/cricket/ipl/teams/$teamId")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(qo(params.teamId));
    if (!data.team) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.team
      ? [
          { title: `${loaderData.team.name} — IPL Franchise` },
          { name: "description", content: `${loaderData.team.name} squad, fixtures, titles and franchise stats.` },
          { property: "og:title", content: `${loaderData.team.name} — IPL` },
          { property: "og:image", content: loaderData.team.logo },
        ]
      : [{ title: "IPL Team" }],
  }),
  notFoundComponent: () => (
    <IplPageShell title="Team not found">
      <p className="text-white/60">That franchise does not exist. <Link to="/cricket/ipl/teams" className="underline">Back to teams</Link>.</p>
    </IplPageShell>
  ),
  errorComponent: ({ error }) => (
    <IplPageShell title="Could not load team">
      <p className="text-rose-300">{error.message}</p>
    </IplPageShell>
  ),
  component: TeamPage,
});

function TeamPage() {
  const { teamId } = Route.useParams();
  const { data } = useSuspenseQuery(qo(teamId));
  const t = data.team!;
  // Title-by-title timeline pulled from static history.
  const titleSeasons = (history as Array<{ year: number; championId: string | null; mom: string }>)
    .filter((s) => s.championId === t.id)
    .sort((a, b) => b.year - a.year);

  return (
    <IplPageShell
      title={t.name}
      subtitle={`${t.city} · founded ${t.founded}`}
      right={
        <Link to="/cricket/ipl/teams" className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/[0.12]">
          ← All teams
        </Link>
      }
    >
      <section
        className="overflow-hidden rounded-2xl p-5"
        style={{
          background: `linear-gradient(140deg, ${t.primary} 0%, color-mix(in oklab, ${t.primary} 55%, #07080f) 100%)`,
          color: t.ink,
        }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t.short}</div>
            <h2 className="mt-1 truncate text-2xl font-black">{t.name}</h2>
            <p className="mt-1 text-sm opacity-80">{t.homeGround}</p>
          </div>
          {t.logo && (
            <img src={t.logo} alt="" className="h-20 w-20 shrink-0 rounded-xl bg-black/20 object-contain p-2 ring-1 ring-white/20" />
          )}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <Stat label="Captain" value={t.captain} />
          <Stat label="Head coach" value={t.headCoach} />
          <Stat label="Owner" value={t.owner} />
          <Stat label="Titles" value={String(t.titles)} highlight />
        </dl>
      </section>

      <section className="mt-8">
        <h3 className="mb-3 px-1 text-base font-black tracking-tight text-white">Title-winning seasons</h3>
        {titleSeasons.length === 0 ? (
          <p className="px-1 text-sm text-white/60">No championships yet — every season is a fresh shot.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {titleSeasons.map((s) => (
              <li key={s.year} className="rounded-xl border border-amber-300/20 bg-amber-400/5 px-3 py-2.5 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="font-black text-amber-200">{s.year}</span>
                  <span className="text-[11px] text-white/60">MoF · {s.mom}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h3 className="mb-3 px-1 text-base font-black tracking-tight text-white">
          This season's fixtures
        </h3>
        {data.fixtures.length === 0 ? (
          <p className="px-1 text-sm text-white/60">No fixtures published yet for the current season.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.fixtures.map((m) => (
              <CricketMatchCard key={m.id} match={toCricketMatch(m, "8048", "IPL")} />
            ))}
          </div>
        )}
      </section>
    </IplPageShell>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-md bg-black/15 px-2 py-1.5 ring-1 ring-white/10">
      <dt className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</dt>
      <dd className={`mt-0.5 truncate ${highlight ? "text-base font-black" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}
