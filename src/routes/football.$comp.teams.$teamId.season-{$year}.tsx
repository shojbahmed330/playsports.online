import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition, formatSeasonLabel } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionTeamSeason, type TeamSeasonMatch } from "@/lib/espn.functions";
import { matchupSlug } from "@/lib/matchup";
import { Loader2, Swords } from "lucide-react";

/**
 * `/football/$comp/teams/$teamId/season-$year` — a team's run in one
 * edition/season of the competition. Uses ESPN's team schedule endpoint with
 * `?season={year}` — no ESPN "opaque tournament id" needed.
 */
export const Route = createFileRoute("/football/$comp/teams/$teamId/season-{$year}")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    const year = Number(params.year);
    if (!Number.isFinite(year) || !comp.years.includes(year)) throw notFound();
    return { comp, teamId: params.teamId, year };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp || !loaderData) {
      return { meta: [{ title: "Team season" }, { name: "robots", content: "noindex" }] };
    }
    const label = formatSeasonLabel(comp, loaderData.year);
    return buildCompetitionHead({
      comp,
      section: `Team — ${label}`,
      path: `/football/${comp.slug}/teams/${params.teamId}/season-${params.year}`,
      descriptionOverride: `Team's ${comp.name} ${label} run — every match, result and total.`,
    });
  },
  notFoundComponent: () => <div className="p-10 text-center">Season not found.</div>,
  component: TeamSeasonPage,
});

function TeamSeasonPage() {
  const data = Route.useLoaderData();
  const comp = requireCompetition(data.comp.slug);
  const label = formatSeasonLabel(comp, data.year);

  const q = useQuery({
    queryKey: ["comp-team-season", comp.slug, data.teamId, data.year],
    queryFn: () =>
      getCompetitionTeamSeason({
        data: { sportPath: `soccer/${comp.espnLeague}`, teamId: data.teamId, year: data.year },
      }),
    staleTime: 30 * 60_000,
  });

  const s = q.data?.season;

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-4 text-sm">
        <Link
          to="/football/$comp/teams/$teamId"
          params={{ comp: comp.slug, teamId: data.teamId }}
          className="text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          ← Team profile
        </Link>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading {label} season…
        </div>
      ) : q.data?.error || !s ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          {q.data?.error ?? `No ${label} data available for this team in ${comp.name}.`}
        </div>
      ) : (
        <>
          <header className="flex items-center gap-4 mb-6">
            {s.logo && (
              <img src={s.logo} alt="" className="size-14 rounded-2xl bg-white/5 ring-1 ring-white/10 p-1 object-contain" />
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{s.teamName}</h1>
              <div className="text-sm text-muted-foreground">
                {comp.name} — {label}
              </div>
            </div>
          </header>

          <dl className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-6">
            <Stat label="P" value={s.summary.played} />
            <Stat label="W" value={s.summary.wins} tone="pos" />
            <Stat label="D" value={s.summary.draws} />
            <Stat label="L" value={s.summary.losses} tone="neg" />
            <Stat label="GF" value={s.summary.goalsFor} />
            <Stat label="GA" value={s.summary.goalsAgainst} />
          </dl>

          {s.matches.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
              ESPN has no {label} schedule for this team.
            </div>
          ) : (
            <ol className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
              {s.matches.map((m) => (
                <MatchRow key={m.id || `${m.date}-${m.home.name}`} m={m} compSlug={comp.slug} />
              ))}
            </ol>
          )}
        </>
      )}
    </CompetitionPageShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "pos" | "neg" }) {
  const cls =
    tone === "pos"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
      : tone === "neg"
      ? "border-rose-500/25 bg-rose-500/10 text-rose-200"
      : "border-white/10 bg-white/5 text-muted-foreground";
  return (
    <div className={`rounded-xl border p-3 text-center ${cls}`}>
      <div className="text-xl font-extrabold tabular-nums text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  );
}

function MatchRow({ m, compSlug }: { m: TeamSeasonMatch; compSlug: string }) {
  const date = m.date
    ? new Date(m.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "";
  const isFinal = m.status === "post";
  const isLive = m.status === "in";
  return (
    <li className="grid grid-cols-[7rem_1fr_auto_auto] gap-3 items-center px-4 py-3">
      <span className="text-xs uppercase tracking-widest text-muted-foreground tabular-nums">{date}</span>
      <span className="text-sm truncate">
        <span className={m.home.winner ? "font-bold" : "font-medium"}>{m.home.name || "TBD"}</span>{" "}
        <span className="text-muted-foreground">vs</span>{" "}
        <span className={m.away.winner ? "font-bold" : "font-medium"}>{m.away.name || "TBD"}</span>
      </span>
      <span className="tabular-nums font-bold text-sm">
        {isFinal || isLive ? `${m.home.score ?? "-"}–${m.away.score ?? "-"}` : "—"}
      </span>
      {m.home.name && m.away.name ? (
        <Link
          to="/football/$comp/h2h/$matchup"
          params={{ comp: compSlug, matchup: matchupSlug(m.home.name, m.away.name) }}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          title="Head-to-head"
        >
          <Swords className="size-3.5" /> H2H
        </Link>
      ) : (
        <span />
      )}
    </li>
  );
}
