import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getCompHeadToHead } from "@/lib/comp-head-to-head.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Loader2, Swords } from "lucide-react";

/** Parse "germany-vs-spain" → { a: "Germany", b: "Spain" }. */
function parseMatchup(slug: string): { a: string; b: string } | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  const cap = (s: string) =>
    s
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return { a: cap(parts[0]), b: cap(parts[1]) };
}

export const Route = createFileRoute("/football/$comp/h2h/$matchup")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    const teams = parseMatchup(params.matchup);
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
    <div className="p-10 text-center">Head-to-head not found.</div>
  ),
  component: H2HPage,
});

function H2HPage() {
  const data = Route.useLoaderData();
  const comp = requireCompetition(data.comp.slug);
  const { a, b } = data.teams;

  const q = useQuery({
    queryKey: ["comp-h2h", comp.slug, a, b],
    queryFn: () =>
      getCompHeadToHead({ data: { league: comp.espnLeague, teamA: a, teamB: b } }),
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
          className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          ← {comp.shortName}
        </Link>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold flex items-center gap-2 flex-wrap">
          {a} <Swords className="size-5 text-muted-foreground" /> {b}
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

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Fetching {comp.shortName} meetings…
        </div>
      ) : q.data?.error ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          {q.data.error}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
          No completed {comp.shortName} matches between {a} and {b} in ESPN&apos;s recent schedule window.
        </div>
      ) : (
        <ol className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 overflow-hidden">
          {matches.map((m, i) => (
            <li key={`${m.date}-${i}`} className="grid grid-cols-[7rem_1fr_auto] gap-3 items-center px-4 py-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground tabular-nums">
                {new Date(m.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
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
