import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  getMlbTeam,
  type MlbScheduleGame,
  type MlbRosterPlayer,
  type MlbTeamStat,
  type MlbTeamLeader,
  type MlbInjury,
} from "@/lib/mlb.functions";
import { formatLocalTime, relativeDay } from "@/lib/time";

type Tab = "overview" | "schedule" | "roster" | "stats" | "injuries";

export function MlbTeamView({ id }: { id: string }) {
  const fn = useServerFn(getMlbTeam);
  const q = useQuery({
    queryKey: ["mlb", "team", id],
    queryFn: () => fn({ data: { id } }),
    staleTime: 10 * 60_000,
  });
  const [tab, setTab] = useState<Tab>("overview");

  if (q.isLoading) {
    return <div className="h-40 rounded-2xl bg-card ring-1 ring-border animate-pulse" />;
  }
  const team = q.data?.team;
  if (!team) {
    return <div className="text-sm text-muted-foreground">Team not found.</div>;
  }

  const schedule = q.data?.schedule ?? [];
  const roster = q.data?.roster ?? [];
  const stats = q.data?.stats ?? [];
  const leaders = q.data?.leaders ?? [];
  const injuries = q.data?.injuries ?? [];

  return (
    <div className="space-y-6 pb-16">
      <div
        className="relative overflow-hidden rounded-2xl ring-1 ring-border p-5"
        style={{
          background: team.color
            ? `linear-gradient(135deg, ${team.color} 0%, ${team.alt ?? team.color} 100%)`
            : undefined,
        }}
      >
        <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-50" />
        <div className="relative flex items-center gap-4">
          <div className="size-20 sm:size-24 rounded-2xl bg-white/15 ring-1 ring-white/20 grid place-items-center shrink-0">
            {team.logo ? (
              <img loading="lazy" decoding="async" src={team.logo} alt="" className="size-16 object-contain" />
            ) : (
              <span className="text-xl font-bold">{team.abbr}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/70 font-bold">
              {team.division ?? "MLB"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white truncate">
              {team.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/80">
              {team.record && (
                <span className="px-2 py-0.5 rounded bg-black/30 font-bold tabular-nums">
                  {team.record}
                </span>
              )}
              {team.standingSummary && (
                <span className="px-2 py-0.5 rounded bg-black/20">{team.standingSummary}</span>
              )}
              {team.venue && <span>🏟 {team.venue}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto no-scrollbar">
        <TabBtn label="Overview" active={tab === "overview"} onClick={() => setTab("overview")} />
        <TabBtn label={`Schedule (${schedule.length})`} active={tab === "schedule"} onClick={() => setTab("schedule")} />
        <TabBtn label={`Roster (${roster.length})`} active={tab === "roster"} onClick={() => setTab("roster")} />
        <TabBtn label="Stats" active={tab === "stats"} onClick={() => setTab("stats")} />
        <TabBtn label={`Injuries (${injuries.length})`} active={tab === "injuries"} onClick={() => setTab("injuries")} />
      </div>

      {tab === "overview" && <OverviewTab schedule={schedule} stats={stats} leaders={leaders} />}
      {tab === "schedule" && (
        <div className="space-y-2">
          {schedule.length === 0 ? (
            <div className="text-sm text-muted-foreground">No upcoming games.</div>
          ) : (
            schedule.map((g) => <ScheduleRow key={g.id} g={g} />)
          )}
        </div>
      )}
      {tab === "roster" && <RosterTab roster={roster} />}
      {tab === "stats" && <StatsTab stats={stats} />}
      {tab === "injuries" && <InjuriesTab injuries={injuries} />}
    </div>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
        active ? "text-white" : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {label}
      {active && <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-[#d50032]" />}
    </button>
  );
}

function OverviewTab({
  schedule,
  stats,
  leaders,
}: {
  schedule: MlbScheduleGame[];
  stats: MlbTeamStat[];
  leaders: MlbTeamLeader[];
}) {
  const now = Date.now();
  const lastGame = [...schedule].reverse().find((g) => g.status === "post");
  const nextGame = schedule.find((g) => g.startTs >= now && g.status !== "post");
  const liveGame = schedule.find((g) => g.status === "in");

  const highlightStats = useMemo(() => {
    const wanted = ["AVG", "HR", "RBI", "OBP", "SLG", "OPS", "ERA", "WHIP", "SO"];
    const found: MlbTeamStat[] = [];
    for (const a of wanted) {
      const s = stats.find((x) => x.abbr.toUpperCase() === a);
      if (s) found.push(s);
    }
    return found.slice(0, 6);
  }, [stats]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        {liveGame && <Section title="Live now" tone="live"><ScheduleRow g={liveGame} /></Section>}
        {nextGame && <Section title="Next game"><ScheduleRow g={nextGame} /></Section>}
        {lastGame && <Section title="Last result"><ScheduleRow g={lastGame} /></Section>}
        {!liveGame && !nextGame && !lastGame && (
          <div className="text-sm text-muted-foreground">No schedule data yet.</div>
        )}
      </div>
      <div className="space-y-4">
        {highlightStats.length > 0 && (
          <Section title="Season at a glance">
            <div className="grid grid-cols-3 gap-2">
              {highlightStats.map((s) => (
                <div key={s.abbr} className="rounded-xl bg-white/[0.03] ring-1 ring-border p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{s.abbr}</div>
                  <div className="mt-1 text-lg font-extrabold tabular-nums text-white">{s.value}</div>
                </div>
              ))}
            </div>
          </Section>
        )}
        {leaders.length > 0 && (
          <Section title="Team leaders">
            <div className="space-y-1.5">
              {leaders.slice(0, 6).map((l) => <LeaderRow key={l.category + l.athleteName} l={l} />)}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, tone, children }: { title: string; tone?: "live"; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[11px] uppercase tracking-[0.18em] font-bold text-muted-foreground">{title}</div>
        {tone === "live" && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-300">
            <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />LIVE
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function LeaderRow({ l }: { l: MlbTeamLeader }) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] ring-1 ring-border p-2">
      {l.headshot ? (
        <img loading="lazy" decoding="async" src={l.headshot} alt="" className="size-9 rounded-full object-cover bg-white/10" />
      ) : (
        <div className="size-9 rounded-full bg-white/10" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{l.category}</div>
        <div className="text-sm font-semibold text-white truncate">{l.athleteName}</div>
      </div>
      <div className="text-base font-extrabold tabular-nums text-[#f7e6c4]">{l.displayValue}</div>
    </div>
  );
  return l.athleteId ? (
    <Link to="/mlb/player/$id" params={{ id: l.athleteId }} className="block">{inner}</Link>
  ) : inner;
}

function RosterTab({ roster }: { roster: MlbRosterPlayer[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, MlbRosterPlayer[]>();
    const order = ["Pitcher", "Catcher", "Infielder", "Outfielder", "Designated Hitter", "Other"];
    const bucketFor = (p: MlbRosterPlayer) => {
      const pos = (p.position ?? "").toLowerCase();
      if (pos.includes("p") && !pos.includes("of") && !pos.includes("if")) return "Pitcher";
      if (pos === "c" || pos.includes("catch")) return "Catcher";
      if (["1b", "2b", "3b", "ss", "if", "inf"].some((k) => pos.includes(k))) return "Infielder";
      if (pos.includes("of") || pos === "lf" || pos === "cf" || pos === "rf") return "Outfielder";
      if (pos === "dh") return "Designated Hitter";
      return "Other";
    };
    for (const p of roster) {
      const b = bucketFor(p);
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(p);
    }
    return order
      .filter((o) => map.has(o))
      .map((o) => ({ name: o, players: map.get(o)!.sort((a, b) => a.name.localeCompare(b.name)) }));
  }, [roster]);

  if (roster.length === 0) return <div className="text-sm text-muted-foreground">Roster unavailable.</div>;

  return (
    <div className="space-y-4">
      {grouped.map((g) => (
        <div key={g.name} className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
          <div className="px-4 py-2.5 bg-white/[0.04] flex items-center justify-between">
            <div className="text-sm font-bold text-white">{g.name}s</div>
            <div className="text-[11px] text-muted-foreground tabular-nums">{g.players.length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 w-10">#</th>
                  <th className="text-left px-3 py-2">Player</th>
                  <th className="text-left px-3 py-2">Pos</th>
                  <th className="text-left px-3 py-2">B/T</th>
                  <th className="text-right px-3 py-2">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {g.players.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.03]">
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">{p.jersey ?? "—"}</td>
                    <td className="px-3 py-2">
                      <Link to="/mlb/player/$id" params={{ id: p.id }} className="font-semibold text-white hover:text-[#f7e6c4] inline-flex items-center gap-2">
                        {p.headshot && <img src={p.headshot} alt="" className="size-6 rounded-full object-cover bg-white/10" loading="lazy" / decoding="async">}
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
        </div>
      ))}
    </div>
  );
}

function StatsTab({ stats }: { stats: MlbTeamStat[] }) {
  if (stats.length === 0) return <div className="text-sm text-muted-foreground">Team statistics unavailable.</div>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {stats.map((s) => (
        <div key={s.abbr + s.name} className="rounded-xl bg-card ring-1 ring-border p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{s.abbr}</div>
          <div className="mt-1 text-lg font-extrabold tabular-nums text-white">{s.value}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground truncate">{s.name}</div>
        </div>
      ))}
    </div>
  );
}

function InjuriesTab({ injuries }: { injuries: MlbInjury[] }) {
  if (injuries.length === 0) return <div className="text-sm text-muted-foreground">No reported injuries.</div>;
  const tone = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("out") || s.includes("60-day") || s.includes("season")) return "bg-red-500/15 text-red-300 ring-red-500/30";
    if (s.includes("day-to-day") || s.includes("questionable")) return "bg-amber-500/15 text-amber-300 ring-amber-500/30";
    if (s.includes("15-day") || s.includes("10-day")) return "bg-orange-500/15 text-orange-300 ring-orange-500/30";
    return "bg-white/10 text-gray-200 ring-white/20";
  };
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden divide-y divide-border">
      {injuries.map((i, idx) => {
        const inner = (
          <div className="flex items-start gap-3 p-3 hover:bg-white/[0.03]">
            {i.headshot ? (
              <img loading="lazy" decoding="async" src={i.headshot} alt="" className="size-10 rounded-full object-cover bg-white/10 shrink-0" />
            ) : (
              <div className="size-10 rounded-full bg-white/10 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-semibold text-white truncate">{i.athleteName}</div>
                {i.position && <span className="text-[10px] text-muted-foreground">{i.position}</span>}
                <span className={`ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded ring-1 ${tone(i.status)}`}>{i.status}</span>
              </div>
              {(i.type || i.detail) && (
                <div className="mt-1 text-xs text-gray-300">
                  {i.type && <span className="font-semibold">{i.type}</span>}
                  {i.type && i.detail && <span className="text-muted-foreground"> — </span>}
                  {i.detail && <span className="text-muted-foreground">{i.detail}</span>}
                </div>
              )}
            </div>
          </div>
        );
        return i.athleteId ? (
          <Link key={idx} to="/mlb/player/$id" params={{ id: i.athleteId }}>{inner}</Link>
        ) : (
          <div key={idx}>{inner}</div>
        );
      })}
    </div>
  );
}

function ScheduleRow({ g }: { g: MlbScheduleGame }) {
  const isLive = g.status === "in";
  const isPost = g.status === "post";
  return (
    <Link
      to="/mlb/game/$id"
      params={{ id: g.id }}
      className="flex items-center gap-3 rounded-xl bg-card hover:bg-white/[0.04] ring-1 ring-border px-4 py-2.5"
    >
      <div className="w-20 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{relativeDay(g.startTs)}</div>
      <div className="w-16 text-[11px] text-gray-300">{formatLocalTime(g.startTs)}</div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-[10px] uppercase font-bold text-muted-foreground w-6 shrink-0">
          {g.homeAway === "home" ? "vs" : "@"}
        </span>
        {g.opponent.logo && <img loading="lazy" decoding="async" src={g.opponent.logo} alt="" className="size-5 object-contain" />}
        <span className="text-sm font-semibold text-white truncate">{g.opponent.name}</span>
      </div>
      <div className="text-xs font-bold tabular-nums w-20 text-right">
        {isLive ? (
          <span className="text-red-300">{g.statusDetail}</span>
        ) : isPost && g.result ? (
          <span className={g.result.startsWith("W") ? "text-emerald-300" : "text-red-300"}>{g.result}</span>
        ) : (
          <span className="text-muted-foreground">{g.statusDetail}</span>
        )}
      </div>
    </Link>
  );
}
