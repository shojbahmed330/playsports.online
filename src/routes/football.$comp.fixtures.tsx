import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCompetition, requireCompetition } from "@/lib/competitions";
import { getScoreboard } from "@/lib/espn.functions";
import { CompetitionPageShell } from "@/components/football/CompetitionPageShell";
import { CompetitionMatchList } from "@/components/football/CompetitionMatchList";
import { buildCompetitionHead } from "@/lib/competition-head";
import { Loader2 } from "lucide-react";

/** Format YYYYMMDD from a Date (UTC). */
function ymd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function buildDateRange(daysAhead: number): string[] {
  const out: string[] = [];
  const start = new Date();
  for (let i = 0; i <= daysAhead; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    out.push(ymd(d));
  }
  return out;
}

export const Route = createFileRoute("/football/$comp/fixtures")({
  loader: ({ params }) => {
    const comp = getCompetition(params.comp);
    if (!comp) throw notFound();
    return { comp };
  },
  head: ({ params, loaderData }) => {
    const comp = loaderData?.comp ?? getCompetition(params.comp);
    if (!comp) return { meta: [{ title: "Fixtures" }, { name: "robots", content: "noindex" }] };
    return buildCompetitionHead({
      comp,
      section: "Fixtures",
      path: `/football/${comp.slug}/fixtures`,
    });
  },
  component: FixturesPage,
  notFoundComponent: () => <div className="p-10 text-center">Competition not found.</div>,
});

function FixturesPage() {
  const { comp: raw } = Route.useLoaderData();
  const comp = requireCompetition(raw.slug);
  // Wider 60-day scan so tournaments with sparse schedules (WC 2026, Euro,
  // Copa) reliably surface upcoming matches without an empty 2-week fallback.
  const dates = buildDateRange(60);

  const q = useQuery({
    queryKey: ["comp-fixtures", comp.slug],
    queryFn: async () => {
      const results = await Promise.all([
        // Base scoreboard (no date param) — catches whatever the league feed
        // considers "current" even when it falls outside the date-range scan.
        getScoreboard({
          data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name },
        }).catch(() => null),
        ...dates.map((d) =>
          getScoreboard({
            data: { sportPath: `soccer/${comp.espnLeague}`, league: comp.name, yyyymmdd: d },
          }).catch(() => null),
        ),
      ]);
      const all = results.flatMap((r) => r?.games ?? []);
      const seen = new Set<string>();
      const upcoming = all
        .filter((g) => {
          if (seen.has(g.id)) return false;
          seen.add(g.id);
          return g.status !== "post";
        })
        .sort((a, b) => a.startTs - b.startTs);
      return upcoming;
    },
    staleTime: 5 * 60_000,
  });

  return (
    <CompetitionPageShell comp={comp}>
      <h2 className="text-lg sm:text-xl font-bold mb-4">Upcoming Fixtures</h2>
      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading fixtures…
        </div>
      ) : (
        <CompetitionMatchList
          games={q.data ?? []}
          emptyLabel={`No upcoming ${comp.shortName} matches in the next 60 days.`}
          h2hCompSlug={comp.slug}
        />
      )}
    </CompetitionPageShell>
  );
}
