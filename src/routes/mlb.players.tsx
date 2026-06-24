import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMlbLeaders } from "@/lib/mlb.functions";
import { LeaderBoard } from "@/components/mlb/LeaderBoard";

export const Route = createFileRoute("/mlb/players")({
  component: LeadersPage,
});

function LeadersPage() {
  const fn = useServerFn(getMlbLeaders);
  const [season, setSeason] = useState(new Date().getFullYear());
  const [group, setGroup] = useState<"batting" | "pitching">("batting");
  const q = useQuery({
    queryKey: ["mlb", "leaders", season],
    queryFn: () => fn({ data: { season } }),
    staleTime: 60 * 60_000,
  });
  const cats = group === "batting" ? (q.data?.batting ?? []) : (q.data?.pitching ?? []);

  const years = [season, season - 1, season - 2];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight">League Leaders · {season}</h2>
        <div className="flex items-center gap-2">
          <select
            value={season}
            onChange={(e) => setSeason(Number(e.target.value))}
            className="bg-card ring-1 ring-border rounded-full px-3 py-1.5 text-xs font-semibold"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex rounded-full bg-card ring-1 ring-border p-0.5">
            <button onClick={() => setGroup("batting")} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${group === "batting" ? "bg-gradient-to-r from-[#002d72] to-[#d50032] text-white" : "text-muted-foreground"}`}>Batting</button>
            <button onClick={() => setGroup("pitching")} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${group === "pitching" ? "bg-gradient-to-r from-[#002d72] to-[#d50032] text-white" : "text-muted-foreground"}`}>Pitching</button>
          </div>
        </div>
      </div>

      {q.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-80 rounded-2xl bg-card ring-1 ring-border animate-pulse" />)}
        </div>
      ) : cats.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No leader data for this season yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map((c) => <LeaderBoard key={c.key} category={c} />)}
        </div>
      )}
    </div>
  );
}
