import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getMlbTeam, type MlbScheduleGame } from "@/lib/mlb.functions";
import { formatLocalTime, relativeDay } from "@/lib/time";

export const Route = createFileRoute("/mlb/team/$id")({
  component: TeamPage,
});

function TeamPage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getMlbTeam);
  const q = useQuery({ queryKey: ["mlb", "team", id], queryFn: () => fn({ data: { id } }), staleTime: 10 * 60_000 });
  const [tab, setTab] = useState<"schedule" | "roster">("schedule");

  if (q.isLoading) {
    return <div className="h-40 rounded-2xl bg-card ring-1 ring-border animate-pulse" />;
  }
  const team = q.data?.team;
  if (!team) {
    return <div className="text-sm text-muted-foreground">Team not found.</div>;
  }

  const schedule = q.data?.schedule ?? [];
  const roster = q.data?.roster ?? [];

  return (
    <div className="space-y-6">
      {/* Team header */}
      <div
        className="relative overflow-hidden rounded-2xl ring-1 ring-border p-5"
        style={{ background: team.color ? `linear-gradient(135deg, ${team.color} 0%, ${team.alt ?? team.color} 100%)` : undefined }}
      >
        <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="size-20 sm:size-24 rounded-2xl bg-white/15 ring-1 ring-white/20 grid place-items-center shrink-0">
            {team.logo ? <img src={team.logo} alt="" className="size-16 object-contain" /> : <span className="text-xl font-bold">{team.abbr}</span>}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">{team.division ?? "MLB"}</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{team.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/80">
              {team.record && <span className="px-2 py-0.5 rounded bg-black/30 font-bold tabular-nums">{team.record}</span>}
              {team.venue && <span>🏟 {team.venue}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <TabBtn label={`Schedule (${schedule.length})`} active={tab === "schedule"} onClick={() => setTab("schedule")} />
        <TabBtn label={`Roster (${roster.length})`} active={tab === "roster"} onClick={() => setTab("roster")} />
      </div>

      {tab === "schedule" && (
        <div className="space-y-2">
          {schedule.length === 0 ? (
            <div className="text-sm text-muted-foreground">No upcoming games.</div>
          ) : (
            schedule.map((g) => <ScheduleRow key={g.id} g={g} />)
          )}
        </div>
      )}

      {tab === "roster" && (
        <div className="overflow-x-auto rounded-2xl bg-card ring-1 ring-border">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Player</th>
                <th className="text-left px-3 py-2">Pos</th>
                <th className="text-left px-3 py-2">B/T</th>
                <th className="text-right px-3 py-2">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roster.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.03]">
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">{p.jersey ?? "—"}</td>
                  <td className="px-3 py-2">
                    <Link to="/mlb/player/$id" params={{ id: p.id }} className="font-semibold text-white hover:text-[#f7e6c4] inline-flex items-center gap-2">
                      {p.headshot && <img src={p.headshot} alt="" className="size-6 rounded-full object-cover" loading="lazy" />}
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-gray-300">{p.position ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-400">{p.bats ?? "—"}/{p.throws ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.age ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-bold transition-colors ${active ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
    >
      {label}
      {active && <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-[#d50032]" />}
    </button>
  );
}

function ScheduleRow({ g }: { g: MlbScheduleGame }) {
  const isLive = g.status === "in";
  const isPost = g.status === "post";
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card ring-1 ring-border px-4 py-2.5">
      <div className="w-20 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {relativeDay(g.startTs)}
      </div>
      <div className="w-16 text-[11px] text-gray-300">{formatLocalTime(g.startTs)}</div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-[10px] uppercase font-bold text-muted-foreground w-6 shrink-0">{g.homeAway === "home" ? "vs" : "@"}</span>
        {g.opponent.logo && <img src={g.opponent.logo} alt="" className="size-5 object-contain" />}
        <span className="text-sm font-semibold text-white truncate">{g.opponent.name}</span>
      </div>
      <div className="text-xs font-bold tabular-nums w-20 text-right">
        {isLive ? <span className="text-red-300">{g.statusDetail}</span>
          : isPost && g.result ? <span className={g.result.startsWith("W") ? "text-emerald-300" : "text-red-300"}>{g.result}</span>
          : <span className="text-muted-foreground">{g.statusDetail}</span>}
      </div>
    </div>
  );
}
