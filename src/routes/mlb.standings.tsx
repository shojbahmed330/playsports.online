import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStandings } from "@/lib/espn.functions";
import { StandingsTable } from "@/components/sports/StandingsTable";
import { StandingsSkeleton } from "@/components/sports/Skeletons";

export const Route = createFileRoute("/mlb/standings")({
  component: StandingsPage,
});

function StandingsPage() {
  const fn = useServerFn(getStandings);
  const q = useQuery({
    queryKey: ["mlb", "standings"],
    queryFn: () => fn({ data: { sportPath: "baseball/mlb" } }),
    staleTime: 60 * 60_000,
  });
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold tracking-tight">AL · NL Divisions</h2>
      {q.isLoading ? <StandingsSkeleton /> : (
        <StandingsTable groups={q.data?.groups ?? []} />
      )}
    </div>
  );
}
