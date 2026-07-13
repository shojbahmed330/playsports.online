import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Users, Calendar, AlertCircle, BarChart3 } from "lucide-react";
import { getNbaTeam } from "@/lib/nba.functions";

type Tab = "schedule" | "roster" | "leaders" | "injuries";

/** Shared NBA team view — used by both /nba/team/$id (legacy) and /nba/teams/$slug (canonical). */
export function NbaTeamView({ id }: { id: string }) {
  const fn = useServerFn(getNbaTeam);
  const q = useQuery({ queryKey: ["nba", "team", id], queryFn: () => fn({ data: { id } }), staleTime: 30 * 60_000 });
  const [tab, setTab] = useState<Tab>("schedule");

  if (q.isLoading) return <div className="h-64 rounded-2xl ring-1 ring-border bg-card animate-pulse" />;
  const data = q.data;
  if (!data?.team) return <div className="text-sm text-muted-foreground">Team not found.</div>;

  const { team, schedule, roster, leaders, injuries } = data;
  const upcoming = schedule.filter((g) => g.status !== "post").slice(0, 12);
  const completed = schedule.filter((g) => g.status === "post").slice(-12).reverse();

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl ring-1 ring-border overflow-hidden p-5 sm:p-7 relative"
        style={{ background: `linear-gradient(135deg, ${team.color ?? "#17408b"} 0%, ${team.alt ?? "#f58426"} 100%)` }}
      >
        <div aria-hidden className="absolute inset-0 bg-black/30" />
        <div className="relative flex items-center gap-4">
          {team.logo && <img src={team.logo} alt={team.name} className="size-20 sm:size-24 object-contain drop-shadow-2xl"  decoding="async" loading="lazy" />}
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/70 font-bold">{team.conference ?? team.division ?? "NBA"}</div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white truncate">{team.name}</h1>
            <div className="flex items-center gap-3 text-xs text-white/85 mt-1">
              {team.record && <span className="font-bold">{team.record}</span>}
              {team.venue && <span>· {team.venue}</span>}
            </div>
            {team.standingSummary && <div className="text-[11px] text-white/75 mt-0.5">{team.standingSummary}</div>}
          </div>
        </div>
      </div>

      <div className="inline-flex rounded-xl bg-card ring-1 ring-border p-1 flex-wrap">
        <TabBtn active={tab === "schedule"} onClick={() => setTab("schedule")} icon={<Calendar className="size-3.5" />}>Schedule</TabBtn>
        <TabBtn active={tab === "roster"} onClick={() => setTab("roster")} icon={<Users className="size-3.5" />}>Roster</TabBtn>
        <TabBtn active={tab === "leaders"} onClick={() => setTab("leaders")} icon={<BarChart3 className="size-3.5" />}>Leaders</TabBtn>
        <TabBtn active={tab === "injuries"} onClick={() => setTab("injuries")} icon={<AlertCircle className="size-3.5" />}>Injuries</TabBtn>
      </div>

      {tab === "schedule" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ScheduleList title="Upcoming" rows={upcoming} />
          <ScheduleList title="Recent" rows={completed} />
        </div>
      )}

      {tab === "roster" && (
        <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 pl-3">Player</th>
                  <th className="text-center w-12">#</th>
                  <th className="text-center w-14">Pos</th>
                  <th className="text-center w-14">Ht</th>
                  <th className="text-center w-14">Wt</th>
                  <th className="text-center w-12">Age</th>
                  <th className="text-center w-16 pr-3">Exp</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p) => (
                  <tr key={p.id} className="border-b border-border/40 hover:bg-white/[0.03]">
                    <td className="py-2 pl-3">
                      <Link to="/nba/player/$id" params={{ id: p.id }} className="flex items-center gap-2 font-medium text-white hover:text-orange-300 transition">
                        {p.headshot && <img src={p.headshot} alt="" className="size-7 rounded-full bg-muted object-cover" loading="lazy"  decoding="async" />}
                        <span className="truncate">{p.name}</span>
                      </Link>
                    </td>
                    <td className="text-center tabular-nums text-muted-foreground">{p.jersey ?? "—"}</td>
                    <td className="text-center text-muted-foreground">{p.position ?? "—"}</td>
                    <td className="text-center text-muted-foreground">{p.height ?? "—"}</td>
                    <td className="text-center text-muted-foreground">{p.weight ?? "—"}</td>
                    <td className="text-center tabular-nums text-muted-foreground">{p.age ?? "—"}</td>
                    <td className="text-center text-muted-foreground pr-3">{p.experience ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "leaders" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {leaders.length === 0 && <div className="text-sm text-muted-foreground col-span-full">No leaders available.</div>}
          {leaders.map((l, i) => (
            <div key={i} className="rounded-2xl ring-1 ring-border bg-card p-4 flex items-center gap-3">
              {l.headshot && <img src={l.headshot} alt="" className="size-12 rounded-full bg-muted object-cover" loading="lazy"  decoding="async" />}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-orange-300/80 font-bold">{l.category}</div>
                <Link to={l.athleteId ? "/nba/player/$id" : "/nba"} params={l.athleteId ? { id: l.athleteId } : ({} as any)} className="text-sm font-bold text-white hover:text-orange-300 transition truncate block">
                  {l.athleteName}
                </Link>
                <div className="text-xs text-muted-foreground">{l.position ?? "—"}</div>
              </div>
              <div className="text-lg font-extrabold tabular-nums text-orange-300">{l.displayValue}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "injuries" && (
        <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
          {injuries.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No injuries reported.</div>
          ) : (
            <ul className="divide-y divide-border">
              {injuries.map((inj, i) => (
                <li key={i} className="flex items-center gap-3 p-3">
                  {inj.headshot && <img src={inj.headshot} alt="" className="size-9 rounded-full bg-muted object-cover" loading="lazy"  decoding="async" />}
                  <div className="min-w-0 flex-1">
                    {inj.athleteId ? (
                      <Link to="/nba/player/$id" params={{ id: inj.athleteId }} className="text-sm font-semibold text-white hover:text-orange-300 transition">
                        {inj.athleteName}
                      </Link>
                    ) : <span className="text-sm font-semibold text-white">{inj.athleteName}</span>}
                    <div className="text-[11px] text-muted-foreground">{inj.position ?? "—"}{inj.type ? ` · ${inj.type}` : ""}</div>
                    {inj.detail && <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{inj.detail}</div>}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-1 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30">{inj.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/40" : "text-muted-foreground hover:text-white"
      }`}
    >{icon}{children}</button>
  );
}

function ScheduleList({ title, rows }: { title: string; rows: any[] }) {
  return (
    <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">No games.</div>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((g) => (
            <li key={g.id} className="px-3 py-2.5 flex items-center gap-3 text-sm">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-12">{g.homeAway === "home" ? "vs" : "@"}</span>
              {g.opponent.logo && <img src={g.opponent.logo} alt="" className="size-6 object-contain" loading="lazy"  decoding="async" />}
              <Link to="/nba/team/$id" params={{ id: g.opponent.id }} className="flex-1 truncate font-medium text-white hover:text-orange-300 transition">
                {g.opponent.name}
              </Link>
              {g.result ? (
                <span className={`text-xs font-bold tabular-nums ${g.result.startsWith("W") ? "text-emerald-300" : "text-rose-300"}`}>{g.result}</span>
              ) : (
                <span className="text-[11px] text-muted-foreground">{new Date(g.startTs).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
              )}
              <Link to={"/nba/game/" + g.id} className="text-[10px] uppercase tracking-wider text-orange-300 hover:text-orange-200">Box →</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
