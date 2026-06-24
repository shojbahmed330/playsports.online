import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { getMlbTeams } from "@/lib/mlb.functions";
import { TeamCard } from "@/components/mlb/TeamCard";

export const Route = createFileRoute("/mlb/teams")({
  component: TeamsPage,
});

function TeamsPage() {
  const fn = useServerFn(getMlbTeams);
  const q = useQuery({ queryKey: ["mlb", "teams"], queryFn: () => fn(), staleTime: 6 * 60 * 60_000 });
  const [search, setSearch] = useState("");

  const teams = q.data?.teams ?? [];
  const filtered = useMemo(() => {
    if (!search.trim()) return teams;
    const s = search.trim().toLowerCase();
    return teams.filter((t) => t.name.toLowerCase().includes(s) || t.abbr.toLowerCase().includes(s) || t.location.toLowerCase().includes(s));
  }, [teams, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-extrabold tracking-tight">All 30 Teams</h2>
        <div className="relative">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            className="pl-9 pr-3 py-2 rounded-full bg-card ring-1 ring-border text-sm focus:outline-none focus:ring-[#d50032]/50 w-full sm:w-64"
          />
        </div>
      </div>
      {q.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-card ring-1 ring-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((t) => <TeamCard key={t.id} team={t} />)}
        </div>
      )}
    </div>
  );
}
