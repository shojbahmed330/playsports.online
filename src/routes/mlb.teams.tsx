import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getMlbTeams } from "@/lib/mlb.functions";
import { TeamCard } from "@/components/mlb/TeamCard";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/mlb/teams")({
  head: () => ({
    meta: [
      { title: "MLB Teams — All 30 Franchises" },
      {
        name: "description",
        content:
          "Every MLB team with logo, league, division, schedule, roster, leaders, injuries and season stats.",
      },
      { property: "og:title", content: "MLB Teams — All 30 Franchises" },
      {
        property: "og:description",
        content: "Every MLB team with schedule, roster, leaders and season stats.",
      },
      { property: "og:url", content: "https://www.playsports.online/mlb/teams" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLB Teams — All 30 Franchises" },
      {
        name: "twitter:description",
        content:
          "Every MLB team with logo, league, division, schedule, roster, leaders, injuries and season stats.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb/teams" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "MLB", path: "/mlb" },
          { name: "Teams", path: "/mlb/teams" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(TeamsPage, { sport: "mlb", currentPath: "/mlb/teams" }),
});

function TeamsPage() {
  const fn = useServerFn(getMlbTeams);
  const q = useQuery({
    queryKey: ["mlb", "teams"],
    queryFn: () => fn(),
    staleTime: 6 * 60 * 60_000,
  });
  const [search, setSearch] = useState("");

  const teams = q.data?.teams ?? [];
  const filtered = useMemo(() => {
    if (!search.trim()) return teams;
    const s = search.trim().toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(s) ||
        t.abbr.toLowerCase().includes(s) ||
        t.location.toLowerCase().includes(s),
    );
  }, [teams, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-extrabold tracking-tight">All 30 Teams</h2>
        <div className="relative">
          <label htmlFor="mlb-team-search" className="sr-only">
            Search MLB teams
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="mlb-team-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            className="min-h-11 w-full rounded-full bg-card pl-9 pr-3 text-sm ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-ring sm:w-64"
          />
        </div>
      </div>
      {q.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-card ring-1 ring-border animate-pulse" />
          ))}
        </div>
      ) : q.error ? (
        <ErrorState
          title="Could not load MLB teams"
          message={errorMessage(q.error)}
          onRetry={() => void q.refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={teams.length === 0 ? "No teams available" : `No teams match “${search}”`}
          description={
            teams.length === 0
              ? "The MLB team directory is temporarily unavailable."
              : "Try a team name, city or abbreviation."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}
