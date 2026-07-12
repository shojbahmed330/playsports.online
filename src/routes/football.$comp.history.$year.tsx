import { createFileRoute, notFound, Link, redirect } from "@tanstack/react-router";
import { getCompetition, requireCompetition, formatSeasonLabel } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getEdition } from "@/data/competition-editions";
import { Trophy, MapPin, Target, Users } from "lucide-react";

export const Route = createFileRoute("/football/$comp/history/$year")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    // World Cup has its own dedicated edition pages already — bounce there.
    if (comp.slug === "world-cup") {
      throw redirect({ to: "/football/tournaments/$year", params: { year: params.year } });
    }
    const year = Number(params.year);
    if (!Number.isFinite(year) || !comp.years.includes(year)) throw notFound();
    const edition = getEdition(comp.slug, year);
    return { comp, year, edition };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp || !loaderData) {
      return { meta: [{ title: "Edition" }, { name: "robots", content: "noindex" }] };
    }
    const label = formatSeasonLabel(comp, loaderData.year);
    const winner = loaderData.edition?.winner;
    return buildCompetitionHead({
      comp,
      section: `${label} Edition`,
      path: `/football/${comp.slug}/history/${loaderData.year}`,
      descriptionOverride: winner && winner !== "TBD"
        ? `${comp.name} ${label} — ${winner} won. Full recap: final, top scorer, host and more.`
        : `${comp.name} ${label} — recap, winners, top scorer and full context.`,
    });
  },
  notFoundComponent: () => <div className="p-10 text-center">Edition not found.</div>,
  component: EditionPage,
});

function EditionPage() {
  const data = Route.useLoaderData();
  const comp = requireCompetition(data.comp.slug);
  const label = formatSeasonLabel(comp, data.year);
  const e = data.edition;

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-6">
        <Link
          to="/football/$comp/history"
          params={{ comp: comp.slug }}
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← All {comp.shortName} editions
        </Link>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold">
          {comp.shortName} {label}
        </h2>
        {e?.blurb && (
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{e.blurb}</p>
        )}
      </div>

      {e ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard icon={<Trophy className="size-4 text-amber-300" />} label="Winner" value={e.winner} sub={e.finalScore ? `Final: ${e.finalScore}` : undefined} />
          {e.runnerUp && <StatCard icon={<Users className="size-4" />} label="Runner-up" value={e.runnerUp} />}
          {e.host && <StatCard icon={<MapPin className="size-4" />} label="Host" value={e.host} />}
          {e.topScorer && <StatCard icon={<Target className="size-4" />} label="Top scorer" value={e.topScorer.name} sub={`${e.topScorer.goals} goals`} />}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          Detailed recap for {comp.shortName} {label} lands in the next update.
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2 text-xs">
        <Link
          to="/football/$comp/records"
          params={{ comp: comp.slug }}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
        >
          {comp.shortName} records →
        </Link>
        <Link
          to="/football/$comp/standings"
          params={{ comp: comp.slug }}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10"
        >
          Current {comp.kind === "league" ? "table" : "groups"} →
        </Link>
      </div>
    </CompetitionPageShell>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1.5 text-lg font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
