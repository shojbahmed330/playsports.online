import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin, Trophy } from "lucide-react";
import {
  getWc2026Fixtures,
  getWc2026Standings,
  getWc2026TopScorers,
  wc2026TeamLogo,
  type Wc2026Fixture,
} from "@/lib/wc2026.functions";

const HOUR = 60 * 60 * 1000;

export function Wc2026GroupsView() {
  const standingsFn = useServerFn(getWc2026Standings);
  const fixturesFn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "standings"],
    queryFn: () => standingsFn(),
    staleTime: HOUR,
  });
  const fxQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: HOUR,
  });

  if (q.isLoading) return <Spinner />;
  if (q.data?.error) return <ErrBox msg={q.data.error} />;
  const groups = q.data?.groups ?? [];
  if (!groups.length) {
    return (
      <EmptyBox
        title="Groups not drawn yet"
        body="Group standings will appear here once the draw is published."
      />
    );
  }

  const fxByGroup = useMemo(() => {
    const m = new Map<string, Wc2026Fixture[]>();
    for (const f of fxQ.data?.fixtures ?? []) {
      if (!/^Group/i.test(f.group)) continue;
      if (!m.has(f.group)) m.set(f.group, []);
      m.get(f.group)!.push(f);
    }
    return m;
  }, [fxQ.data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div key={g.group} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold mb-3 text-amber-400">{g.group}</h3>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-gray-800">
              <tr>
                <th className="text-left py-1.5">#</th>
                <th className="text-left">Team</th>
                <th className="text-center">P</th>
                <th className="text-center">W</th>
                <th className="text-center">D</th>
                <th className="text-center">L</th>
                <th className="text-center">GD</th>
                <th className="text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r) => (
                <tr key={r.team.id} className="border-b border-gray-800/40">
                  <td className="py-1.5 text-muted-foreground">{r.rank}</td>
                  <td className="flex items-center gap-2 py-1.5">
                    <img src={wc2026TeamLogo(r.team.id)} alt="" className="size-5 object-contain" loading="lazy" />
                    <span className="truncate">{r.team.name}</span>
                  </td>
                  <td className="text-center">{r.played}</td>
                  <td className="text-center">{r.win}</td>
                  <td className="text-center">{r.draw}</td>
                  <td className="text-center">{r.lose}</td>
                  <td className="text-center">{r.goalsDiff}</td>
                  <td className="text-right font-bold text-amber-400">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {fxByGroup.get(g.group)?.length ? (
            <details className="mt-3 group">
              <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground select-none">
                Matches ({fxByGroup.get(g.group)!.length})
              </summary>
              <div className="mt-2 space-y-1.5">
                {fxByGroup.get(g.group)!.map((f) => (
                  <MiniFixture key={f.id} f={f} />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function Wc2026KnockoutView() {
  const fixturesFn = useServerFn(getWc2026Fixtures);
  const scorersFn = useServerFn(getWc2026TopScorers);
  const fxQ = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: HOUR,
  });
  const tsQ = useQuery({
    queryKey: ["wc2026", "scorers"],
    queryFn: () => scorersFn(),
    staleTime: HOUR,
  });

  if (fxQ.isLoading) return <Spinner />;
  if (fxQ.data?.error) return <ErrBox msg={fxQ.data.error} />;
  const all = fxQ.data?.fixtures ?? [];
  const knockout = all.filter((f) => !/^Group/i.test(f.group));
  const live = all.filter((f) => f.status === "inprogress");

  const grouped = useMemo(() => {
    const order = ["Round of 32", "Round of 16", "Quarter-Final", "Semi-Final", "3rd Place", "Final"];
    const m = new Map<string, Wc2026Fixture[]>();
    for (const f of knockout) {
      if (!m.has(f.group)) m.set(f.group, []);
      m.get(f.group)!.push(f);
    }
    return Array.from(m.entries()).sort(
      (a, b) => (order.indexOf(a[0]) === -1 ? 99 : order.indexOf(a[0])) -
                (order.indexOf(b[0]) === -1 ? 99 : order.indexOf(b[0])),
    );
  }, [knockout]);

  return (
    <div className="space-y-6">
      {live.length > 0 && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-sm font-bold text-red-300">Live now</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {live.map((f) => <FixtureCard key={f.id} f={f} />)}
          </div>
        </div>
      )}

      {grouped.length === 0 ? (
        <EmptyBox
          title="Knockout bracket not yet available"
          body="The bracket will populate after the group stage ends."
        />
      ) : (
        grouped.map(([round, list]) => (
          <section key={round} className="space-y-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">{round}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {list.map((f) => <FixtureCard key={f.id} f={f} />)}
            </div>
          </section>
        ))
      )}

      {tsQ.data && (tsQ.data.scorers?.length ?? 0) > 0 && (
        <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Trophy className="size-4" /> Top Scorers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {tsQ.data.scorers.map((s) => (
              <div key={s.playerId} className="flex items-center justify-between gap-2 py-1 border-b border-gray-800/40">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-6 tabular-nums">#{s.rank}</span>
                  <img src={wc2026TeamLogo(s.team.id)} alt="" className="size-4 object-contain" loading="lazy" />
                  <span className="truncate font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.team.code}</span>
                </div>
                <span className="text-amber-400 font-bold tabular-nums">{s.goals}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FixtureCard({ f }: { f: Wc2026Fixture }) {
  const isLive = f.status === "inprogress";
  const isFinished = f.status === "finished";
  const d = new Date(f.startTs * 1000);
  const dateStr = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeStr = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const hw = isFinished && (f.home.goals ?? 0) > (f.away.goals ?? 0);
  const aw = isFinished && (f.away.goals ?? 0) > (f.home.goals ?? 0);
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-amber-500/30 transition-colors">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
        <span>{dateStr} · {timeStr}</span>
        {isLive ? (
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold animate-pulse">
            🔴 {f.statusDesc}
          </span>
        ) : isFinished ? (
          <span className="px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300">FT</span>
        ) : (
          <span className="text-gray-500">{f.statusDesc || "Upcoming"}</span>
        )}
      </div>
      <div className="space-y-2">
        <TeamRow id={f.home.id} name={f.home.name} goals={f.home.goals} highlight={hw} />
        <TeamRow id={f.away.id} name={f.away.name} goals={f.away.goals} highlight={aw} />
      </div>
      {f.venue && (
        <div className="mt-3 text-[11px] text-muted-foreground border-t border-gray-800 pt-2 flex items-center gap-1">
          <MapPin className="size-3" /> {f.venue}{f.city ? `, ${f.city}` : ""}
        </div>
      )}
    </div>
  );
}

function TeamRow({ id, name, goals, highlight }: { id: number; name: string; goals: number | null; highlight: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${highlight ? "text-white font-bold" : ""}`}>
      <div className="flex items-center gap-2 min-w-0">
        <img src={wc2026TeamLogo(id)} alt="" className="size-6 object-contain" loading="lazy" />
        <span className="truncate">{name}</span>
      </div>
      <span className="text-xl tabular-nums">{goals ?? "–"}</span>
    </div>
  );
}

function MiniFixture({ f }: { f: Wc2026Fixture }) {
  const d = new Date(f.startTs * 1000);
  const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const isFinished = f.status === "finished";
  return (
    <div className="flex items-center justify-between gap-2 text-xs py-1 px-2 rounded-md bg-gray-900/50">
      <span className="text-muted-foreground w-12 shrink-0">{dateStr}</span>
      <span className="flex-1 text-right truncate">{f.home.code || f.home.name}</span>
      <span className="font-bold tabular-nums px-2">
        {isFinished ? `${f.home.goals ?? 0} - ${f.away.goals ?? 0}` : "vs"}
      </span>
      <span className="flex-1 truncate">{f.away.code || f.away.name}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

function ErrBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
      ⚠️ {msg}
    </div>
  );
}

function EmptyBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center bg-gray-900/40">
      <Trophy className="size-10 mx-auto mb-3 opacity-30" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
