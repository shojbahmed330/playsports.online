import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { getCompetition, requireCompetition, formatSeasonLabel } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getEdition } from "@/data/competition-editions";
import type { SquadPick, EditionSummary } from "@/data/competition-editions";
import { getTournament } from "@/data/wc_tournaments";
import { sportsEvent, ldScript } from "@/lib/seo/jsonld";
import { Trophy, MapPin, Target, Users, Award, Shield, Sparkles, Calendar } from "lucide-react";

export const Route = createFileRoute("/football/$comp/history/$year")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    const year = Number(params.year);
    if (!Number.isFinite(year) || !comp.years.includes(year)) throw notFound();
    let edition = getEdition(comp.slug, year);
    // World Cup: no per-year seed rows in COMPETITION_EDITIONS — synthesize
    // from wc_tournaments.ts so the comp-scoped page renders alongside the
    // richer /football/tournaments/$year page.
    if (!edition && comp.slug === "world-cup") {
      const t = getTournament(year);
      if (t) {
        edition = {
          year: t.year,
          winner: t.champion,
          runnerUp: t.runnerUp,
          host: t.host,
          finalScore: t.finalScore,
          topScorer: t.topScorer && t.topScorer !== "TBD"
            ? { name: t.topScorer, goals: t.topScorerGoals }
            : undefined,
          bestPlayer: t.goldenBall ? { name: t.goldenBall, award: "Golden Ball" } : undefined,
          format: `${t.teams} teams · ${t.matches} matches`,
          teams: t.teams,
          matches: t.matches,
          goals: t.totalGoals || undefined,
        } as EditionSummary;
      }
    }
    return { comp, year, edition };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp || !loaderData) {
      return { meta: [{ title: "Edition" }, { name: "robots", content: "noindex" }] };
    }
    const label = formatSeasonLabel(comp, loaderData.year);
    const edition = loaderData.edition;
    const winner = edition?.winner;
    const base = buildCompetitionHead({
      comp,
      section: `${label} Edition`,
      path: `/football/${comp.slug}/history/${loaderData.year}`,
      descriptionOverride: winner && winner !== "TBD"
        ? `${comp.name} ${label} — ${winner} won. Full recap: final, top scorer, host and more.`
        : `${comp.name} ${label} — recap, winners, top scorer and full context.`,
    });
    if (edition && winner && winner !== "TBD") {
      base.scripts = [
        ...base.scripts,
        ldScript(
          sportsEvent({
            name: `${comp.name} ${label}`,
            path: `/football/${comp.slug}/history/${loaderData.year}`,
            sport: "Football",
            startDate: `${loaderData.year}-01-01`,
            location: edition.host,
            description: edition.blurb ??
              `${comp.name} ${label}${edition.host ? ` in ${edition.host}` : ""}: ${winner} won${edition.runnerUp ? ` beating ${edition.runnerUp}` : ""}${edition.finalScore ? ` ${edition.finalScore}` : ""}.`,
            homeTeam: winner,
            awayTeam: edition.runnerUp,
            status: loaderData.year <= new Date().getFullYear() ? "ended" : "scheduled",
          }),
        ),
      ];
    }
    return base;
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
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard icon={<Trophy className="size-4 text-amber-300" />} label="Winner" value={e.winner} sub={e.finalScore ? `Final: ${e.finalScore}` : undefined} />
            {e.runnerUp && <StatCard icon={<Users className="size-4" />} label="Runner-up" value={e.runnerUp} />}
            {e.host && <StatCard icon={<MapPin className="size-4" />} label="Host" value={e.host} />}
            {e.topScorer && <StatCard icon={<Target className="size-4" />} label="Top scorer" value={e.topScorer.name} sub={`${e.topScorer.goals} goals`} />}
            {e.bestPlayer && <StatCard icon={<Award className="size-4 text-amber-300" />} label={e.bestPlayer.award ?? "Best player"} value={e.bestPlayer.name} sub={e.bestPlayer.team} />}
            {e.bestKeeper && <StatCard icon={<Shield className="size-4" />} label={e.bestKeeper.award ?? "Best keeper"} value={e.bestKeeper.name} sub={e.bestKeeper.team} />}
            {e.youngPlayer && <StatCard icon={<Sparkles className="size-4" />} label={e.youngPlayer.award ?? "Young player"} value={e.youngPlayer.name} sub={e.youngPlayer.team} />}
            {e.finalVenue && <StatCard icon={<MapPin className="size-4" />} label="Final venue" value={e.finalVenue} sub={e.finalAttendance ? `${e.finalAttendance.toLocaleString()} attendance` : undefined} />}
            {e.winningCoach && <StatCard icon={<Users className="size-4" />} label="Winning coach" value={e.winningCoach} sub={e.winningCaptain ? `Captain: ${e.winningCaptain}` : undefined} />}
            {e.format && <StatCard icon={<Calendar className="size-4" />} label="Format" value={e.format} sub={[e.teams && `${e.teams} teams`, e.matches && `${e.matches} matches`, e.goals && `${e.goals} goals`].filter(Boolean).join(" · ") || undefined} />}
          </div>

          {e.squadOfTournament && e.squadOfTournament.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Squad of the tournament</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {e.squadOfTournament.map((p: SquadPick) => (
                  <div key={p.name} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      {p.team && <div className="text-xs text-muted-foreground">{p.team}</div>}
                    </div>
                    {p.position && (
                      <span className="text-[10px] uppercase tracking-widest rounded-full bg-white/10 px-2 py-0.5">{p.position}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {e.notableMoments && e.notableMoments.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Notable moments</h3>
              <ul className="space-y-2">
                {e.notableMoments.map((m: string, i: number) => (
                  <li key={i} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                    {m}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : data.year > new Date().getFullYear() ? (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/5 px-6 py-8 space-y-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-blue-200 font-bold">
            <Calendar className="size-4" /> Future edition
          </div>
          <div className="text-lg font-bold">
            {comp.shortName} {label} — recap lands after the tournament.
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {comp.slug === "euro" && data.year === 2028
              ? "UK & Ireland host UEFA Euro 2028 from 9 June to 9 July 2028. Qualifying draw is in December 2026; qualifying matches begin March 2027. Full draw, group tables, squads and results will populate here as they happen."
              : `${comp.shortName} ${label} hasn't been played yet. Bookmark this page — winner, top scorer, squad-of-tournament and full recap will land as soon as the edition is played.`}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              to="/football/$comp/history"
              params={{ comp: comp.slug }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
            >
              All {comp.shortName} editions →
            </Link>
            <Link
              to="/football/$comp/records"
              params={{ comp: comp.slug }}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
            >
              {comp.shortName} records →
            </Link>
          </div>
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
