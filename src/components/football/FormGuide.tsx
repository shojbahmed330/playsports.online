import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { TrendingUp } from "lucide-react";
import { getTeamForm, type TeamFormEntry } from "@/lib/head-to-head.functions";
import { flagOf } from "@/lib/flags";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

export function FormGuide({ fx }: { fx: Wc2026Fixture }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="size-4 text-emerald-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">
          Form · last 5
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <TeamForm teamId={fx.home.id} name={fx.home.name} />
        <TeamForm teamId={fx.away.id} name={fx.away.name} />
      </div>
    </section>
  );
}

function TeamForm({ teamId, name }: { teamId: number; name: string }) {
  const fn = useServerFn(getTeamForm);
  const q = useQuery({
    queryKey: ["team-form", teamId, name],
    queryFn: () => fn({ data: { teamId, teamName: name } }),
    staleTime: 15 * 60_000,
    enabled: !!teamId,
  });
  const list = q.data ?? [];
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg leading-none">{flagOf(name)}</span>
        <span className="text-sm font-bold text-white truncate">{name}</span>
      </div>
      {q.isLoading ? (
        <div className="h-6 rounded bg-white/5 animate-pulse" />
      ) : list.length === 0 ? (
        <div className="text-[11px] text-gray-500">No recent matches</div>
      ) : (
        <div className="flex items-center gap-1">
          {list.map((m, i) => <FormPill key={i} m={m} />)}
        </div>
      )}
    </div>
  );
}

function FormPill({ m }: { m: TeamFormEntry }) {
  const c = m.result === "W" ? "bg-emerald-500 text-white"
          : m.result === "L" ? "bg-red-500 text-white"
          : m.result === "D" ? "bg-gray-500 text-white"
          : "bg-white/10 text-gray-400";
  return (
    <span
      title={`${m.opponent} · ${m.scoreFor ?? "-"}–${m.scoreAgainst ?? "-"}`}
      className={`grid size-6 place-items-center rounded text-[10px] font-black ${c}`}
    >
      {m.result ?? "-"}
    </span>
  );
}
