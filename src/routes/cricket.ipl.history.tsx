import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Trophy, Award } from "lucide-react";
import { IplPageShell } from "@/components/ipl/IplPageShell";
import { getIplHistory } from "@/lib/ipl.functions";

const qo = queryOptions({
  queryKey: ["ipl", "history"],
  queryFn: () => getIplHistory(),
  staleTime: 60 * 60_000,
});

export const Route = createFileRoute("/cricket/ipl/history")({
  head: () => ({
    meta: [
      { title: "IPL History — All Champions, Finals & Awards (2008–present)" },
      { name: "description", content: "Every IPL final with champion, runner-up, venue, scoreline, Player of the Final and season awards." },
      { property: "og:title", content: "IPL — Complete History" },
      { property: "og:description", content: "Every IPL final, champion and award winner since 2008." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(qo),
  component: HistoryPage,
});

function HistoryPage() {
  const { data } = useSuspenseQuery(qo);
  return (
    <IplPageShell
      title="History"
      subtitle={`${data.seasons.length} seasons of finals, champions and awards`}
    >
      <ul className="grid gap-4">
        {data.seasons.map((s) => (
          <li
            key={s.year}
            className="overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-amber-950/40 via-gray-900/70 to-gray-900/40 shadow-xl"
          >
            <header className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/5 px-4 py-3">
              <div className="text-2xl font-black text-amber-300">{s.year}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Trophy className="size-4 text-amber-300" />
                  <span className="truncate">{s.champion}</span>
                </div>
                <div className="truncate text-xs text-white/60">def. {s.runnerUp}</div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-black text-amber-200 ring-1 ring-amber-300/30">
                CHAMPION
              </span>
            </header>

            <div className="grid gap-3 px-4 py-3 sm:grid-cols-2">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Final</div>
                <p className="mt-1 text-sm text-white/90">{s.finalScore}</p>
                <p className="mt-0.5 text-[11px] text-white/50">{s.finalVenue}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-white/10">
                  <Award className="size-3" /> Player of the Final: {s.mom}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-2 text-xs">
                <AwardCard label="Orange Cap" name={s.orangeCap.player} team={s.orangeCap.team} value={`${s.orangeCap.runs} runs`} className="ipl-orange-cap" />
                <AwardCard label="Purple Cap" name={s.purpleCap.player} team={s.purpleCap.team} value={`${s.purpleCap.wickets} wkts`} className="ipl-purple-cap" />
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </IplPageShell>
  );
}

function AwardCard({ label, name, team, value, className }: { label: string; name: string; team: string; value: string; className: string }) {
  return (
    <div className={`rounded-lg p-2.5 ${className}`}>
      <div className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</div>
      <div className="mt-0.5 truncate text-sm font-bold">{name}</div>
      <div className="flex items-baseline justify-between text-[11px] opacity-90">
        <span>{team}</span>
        <span className="font-black">{value}</span>
      </div>
    </div>
  );
}
