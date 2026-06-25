import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { getIplTeams } from "@/lib/ipl.functions";

const teamsQO = queryOptions({
  queryKey: ["ipl", "teams"],
  queryFn: () => getIplTeams(),
  staleTime: 60 * 60_000,
});

export const Route = createFileRoute("/cricket/ipl/teams/")({
  head: () => ({
    meta: [
      { title: "IPL Teams — Franchises, Captains & Titles" },
      { name: "description", content: "All ten IPL franchises with colors, captains, head coaches, home grounds and title counts." },
      { property: "og:title", content: "IPL Franchises" },
      { property: "og:description", content: "Every IPL franchise with full team metadata and title history." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(teamsQO),
  component: TeamsPage,
});

function TeamsPage() {
  const { data } = useSuspenseQuery(teamsQO);
  const sorted = [...data.teams].sort((a, b) => b.titles - a.titles || a.name.localeCompare(b.name));

  return (
    <IplPageShell title="Franchises" subtitle={`${data.teams.length} teams · tap a card for full profile`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((t) => (
          <Link
            key={t.id}
            to="/cricket/ipl/teams/$teamId"
            params={{ teamId: t.id }}
            className="group relative overflow-hidden rounded-2xl border border-white/5 p-5 transition-transform hover:-translate-y-0.5 hover:shadow-2xl"
            style={{
              background: `linear-gradient(160deg, ${t.primary} 0%, color-mix(in oklab, ${t.primary} 55%, #07080f) 100%)`,
              color: t.ink,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{t.short}</div>
                <h2 className="mt-1 truncate text-lg font-black leading-tight">{t.name}</h2>
                <div className="mt-0.5 text-xs opacity-80">{t.city}</div>
              </div>
              {t.logo && (
                <img
                  src={t.logo}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg bg-black/20 object-contain p-1.5 ring-1 ring-white/20"
                  loading="lazy"
                />
              )}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <Stat label="Captain" value={t.captain} />
              <Stat label="Coach" value={t.headCoach} />
              <Stat label="Founded" value={String(t.founded)} />
              <Stat label="Titles" value={String(t.titles)} highlight />
            </dl>

            <div className="mt-3 truncate text-[11px] opacity-80">
              <span className="opacity-70">Home: </span>{t.homeGround}
            </div>
            {t.titleYears.length > 0 && (
              <div className="mt-2 text-[11px] font-semibold opacity-90">
                🏆 {t.titleYears.join(" · ")}
              </div>
            )}
            <div className="pointer-events-none absolute -bottom-6 right-0 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
          </Link>
        ))}
      </div>
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
