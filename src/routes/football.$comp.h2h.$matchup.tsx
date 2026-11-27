import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getCompHeadToHead } from "@/lib/comp-head-to-head.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { parseMatchupSlug } from "@/lib/matchup";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";
import { Loader2, Swords } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/football/$comp/h2h/$matchup")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    const teams = parseMatchupSlug(params.matchup);
    if (!teams) throw notFound();
    return { comp, teams };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp || !loaderData) {
      return { meta: [{ title: "Head-to-Head" }, { name: "robots", content: "noindex" }] };
    }
    const { a, b } = loaderData.teams;
    return buildCompetitionHead({
      comp,
      section: `${a} vs ${b} — Head to Head`,
      path: `/football/${comp.slug}/h2h/${params.matchup}`,
      descriptionOverride: `${a} vs ${b} in ${comp.name} — every completed meeting, scores and dates.`,
    });
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState
        title="Head-to-head not found"
        description="This matchup is not in the competition feed."
      />
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load head-to-head"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
  component: H2HPage,
});

function H2HPage() {
  const data = Route.useLoaderData();
  const comp = requireCompetition(data.comp.slug);
  const { a, b } = data.teams;
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const q = useQuery({
    queryKey: ["comp-h2h", comp.slug, a, b],
    queryFn: () => getCompHeadToHead({ data: { league: comp.espnLeague, teamA: a, teamB: b } }),
    staleTime: 30 * 60_000,
  });

  const matches = q.data?.matches ?? [];

  const summary = matches.reduce(
    (acc, m) => {
      if (m.homeScore == null || m.awayScore == null) return acc;
      const aIsHome = m.home.toLowerCase() === a.toLowerCase();
      const aScore = aIsHome ? m.homeScore : m.awayScore;
      const bScore = aIsHome ? m.awayScore : m.homeScore;
      if (aScore > bScore) acc.aWins++;
      else if (bScore > aScore) acc.bWins++;
      else acc.draws++;
      return acc;
    },
    { aWins: 0, bWins: 0, draws: 0 },
  );

  return (
    <CompetitionPageShell comp={comp}>
      <div className="mb-6">
        <Link
          to="/football/$comp"
          params={{ comp: comp.slug }}
          className="inline-flex min-h-11 items-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← {comp.shortName}
        </Link>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold flex items-center gap-2 flex-wrap">
          {a} <Swords aria-hidden="true" className="size-5 text-muted-foreground" /> {b}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Restricted to {comp.name} meetings only — no other competitions.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <SummaryCell label={`${a} wins`} value={summary.aWins} tone="a" />
        <SummaryCell label="Draws" value={summary.draws} tone="d" />
        <SummaryCell label={`${b} wins`} value={summary.bWins} tone="b" />
      </div>

      {q.isError || q.data?.error ? (
        <ErrorState
          title="Head-to-head temporarily unavailable"
          message={
            q.isError ? errorMessage(q.error) : (q.data?.error ?? "Please refresh in a moment.")
          }
          onRetry={() => void q.refetch()}
          className="border-white/10 bg-white/[0.02]"
        />
      ) : q.isLoading ? (
        <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />{" "}
          Fetching {comp.shortName} meetings…
        </div>
      ) : matches.length === 0 ? (
        <EmptyState
          title="No completed meetings found"
          description={`No completed ${comp.shortName} matches between ${a} and ${b} in the available ESPN schedule window.`}
          className="border-white/10 bg-white/[0.02]"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/football/$comp/fixtures"
                params={{ comp: comp.slug }}
                className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/5 px-3 text-xs hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {comp.shortName} fixtures →
              </Link>
              <Link
                to="/football/$comp/history"
                params={{ comp: comp.slug }}
                className="inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/5 px-3 text-xs hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {comp.shortName} history →
              </Link>
            </div>
          }
        />
      ) : (
        <ol className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {matches.map((m, i) => (
            <li
              key={`${m.date}-${i}`}
              className="grid grid-cols-[7rem_1fr_auto] gap-3 items-center px-4 py-3"
            >
              <span className="text-xs uppercase tracking-widest text-muted-foreground tabular-nums">
                {hydrated
                  ? new Date(m.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </span>
              <span className="text-sm truncate">
                <span className="font-medium">{m.home}</span>{" "}
                <span className="text-muted-foreground">vs</span>{" "}
                <span className="font-medium">{m.away}</span>
              </span>
              <span className="tabular-nums font-bold text-sm">
                {m.homeScore ?? "–"}–{m.awayScore ?? "–"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </CompetitionPageShell>
  );
}

function SummaryCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "a" | "b" | "d";
}) {
  const cls =
    tone === "a"
      ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
      : tone === "b"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
        : "border-white/10 bg-white/5 text-muted-foreground";
  return (
    <div className={`rounded-2xl border p-3 text-center ${cls}`}>
      <div className="text-2xl sm:text-3xl font-extrabold tabular-nums text-foreground">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest mt-1 truncate">{label}</div>
    </div>
  );
}
