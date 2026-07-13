import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { getCompetitionMatch } from "@/lib/espn.functions";
import { matchupSlug } from "@/lib/matchup";
import { Loader2, MapPin, Users, Radio, Swords } from "lucide-react";

export const Route = createFileRoute("/football/$comp/matches/$matchId")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp, matchId: params.matchId };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Match" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Match Center",
      path: `/football/${comp.slug}/matches/${params.matchId}`,
      descriptionOverride: `${comp.name} match center — live score, goals, lineups, officials and venue.`,
    });
  },
  component: MatchDetailPage,
  notFoundComponent: () => <div className="p-10 text-center">Match not found.</div>,
});

function MatchDetailPage() {
  const { comp: raw, matchId } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  const q = useQuery({
    queryKey: ["comp-match", comp.slug, matchId],
    queryFn: () =>
      getCompetitionMatch({ data: { sportPath: `soccer/${comp.espnLeague}`, matchId } }),
    staleTime: 20_000,
    refetchInterval: (query) => (query.state.data?.match?.status === "in" ? 20_000 : false),
  });
  const m = q.data?.match;

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-4 text-sm">
        <Link
          to="/football/$comp/scores"
          params={{ comp: comp.slug }}
          className="text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          ← {comp.shortName} scores
        </Link>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading match…
        </div>
      ) : q.data?.error || !m ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          {q.data?.error ?? "Match details are unavailable right now."}
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground text-center mb-4">
              {m.status === "in" && <span className="text-red-300 font-bold">● Live · {m.statusDetail}</span>}
              {m.status === "post" && <span>Final · {m.statusDetail}</span>}
              {m.status === "pre" && (
                <span>
                  {new Date(m.date).toLocaleString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <TeamBlock team={m.home} />
              <div className="text-center">
                {m.status === "pre" ? (
                  <div className="text-2xl font-black text-muted-foreground">vs</div>
                ) : (
                  <div className="text-4xl sm:text-5xl font-black tabular-nums">
                    {m.home.score ?? 0}
                    <span className="text-muted-foreground mx-2">–</span>
                    {m.away.score ?? 0}
                  </div>
                )}
              </div>
              <TeamBlock team={m.away} align="right" />
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              {m.venue && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {m.venue}
                </span>
              )}
              {m.attendance && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" /> {m.attendance.toLocaleString()}
                </span>
              )}
              {m.broadcast && (
                <span className="inline-flex items-center gap-1.5">
                  <Radio className="size-3.5" /> {m.broadcast}
                </span>
              )}
            </div>
          </section>

          {m.goals.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Goals
              </h3>
              <ol className="grid gap-2">
                {m.goals.map((g, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                  >
                    <span className="w-12 tabular-nums text-muted-foreground">{g.minute || "—"}</span>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground w-14">
                      {g.team === "home" ? m.home.abbr || "Home" : g.team === "away" ? m.away.abbr || "Away" : ""}
                    </span>
                    <span className="font-semibold flex-1">{g.scorer}</span>
                    {g.assist && (
                      <span className="text-xs text-muted-foreground">assist: {g.assist}</span>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {m.officials.length > 0 && (
            <section className="mt-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Officials
              </h3>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {m.officials.map((o, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{o.name}</span> · {o.role}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {m.home.name && m.away.name && (
            <section className="mt-8">
              <Link
                to="/football/$comp/h2h/$matchup"
                params={{ comp: comp.slug, matchup: matchupSlug(m.home.name, m.away.name) }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06] px-4 py-2 text-sm font-semibold"
              >
                <Swords className="size-4" /> Full {m.home.name} vs {m.away.name} history
              </Link>
            </section>
          )}
        </>
      )}
    </CompetitionPageShell>
  );
}

function TeamBlock({
  team,
  align = "left",
}: {
  team: { name: string; logo: string | null; record: string | null };
  align?: "left" | "right";
}) {
  return (
    <div className={`flex items-center gap-3 ${align === "right" ? "justify-end flex-row-reverse text-right" : ""}`}>
      {team.logo ? (
        <img src={team.logo} alt="" className="size-12 sm:size-16 object-contain"  decoding="async" loading="lazy" />
      ) : (
        <span className="size-12 sm:size-16 rounded-full bg-white/10" />
      )}
      <div className={align === "right" ? "text-right" : ""}>
        <div className="text-base sm:text-lg font-bold leading-tight">{team.name}</div>
        {team.record && <div className="text-xs text-muted-foreground">{team.record}</div>}
      </div>
    </div>
  );
}
