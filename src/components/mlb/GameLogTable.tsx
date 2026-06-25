import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlbAthleteGameLog } from "@/lib/mlb.functions";

const SEASONS = (() => {
  const y = new Date().getFullYear();
  return [y, y - 1, y - 2, y - 3];
})();

export function GameLogTable({ athleteId }: { athleteId: string }) {
  const [season, setSeason] = useState<number>(SEASONS[0]);
  const fn = useServerFn(getMlbAthleteGameLog);
  const q = useQuery({
    queryKey: ["mlb", "gamelog", athleteId, season],
    queryFn: () => fn({ data: { id: athleteId, season } }),
    staleTime: 10 * 60_000,
  });

  const log = q.data?.log;
  const rows = log?.rows ?? [];

  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-white">Game Log</h2>
          <p className="text-[11px] text-muted-foreground">
            {log?.group === "pitching" ? "Pitching" : "Batting"} · {rows.length} games
          </p>
        </div>
        <div className="flex gap-1">
          {SEASONS.map((s) => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold tabular-nums transition ${
                s === season
                  ? "bg-[#f7e6c4] text-[#0a1428]"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="h-40 animate-pulse bg-white/5" />
      ) : rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          No games for {season}.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-card/95 backdrop-blur text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Date</th>
                <th className="text-left px-3 py-2 font-semibold">Opp</th>
                <th className="text-left px-3 py-2 font-semibold">Result</th>
                {log!.headers.map((h) => (
                  <th key={h} className="text-right px-3 py-2 font-semibold tabular-nums">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => {
                const d = r.date ? new Date(r.date) : null;
                const dateStr = d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";
                const win = r.result?.startsWith("W");
                const loss = r.result?.startsWith("L");
                return (
                  <tr key={i} className="hover:bg-white/[0.03]">
                    <td className="px-3 py-2 text-gray-200 whitespace-nowrap">{dateStr}</td>
                    <td className="px-3 py-2 text-gray-200 whitespace-nowrap">
                      <span className="text-muted-foreground mr-1">{r.homeAway === "away" ? "@" : "vs"}</span>
                      {r.opponentLogo ? (
                        <img src={r.opponentLogo} alt="" className="inline-block size-4 mr-1 align-middle" />
                      ) : null}
                      <span className="font-semibold">{r.opponentAbbr ?? "—"}</span>
                    </td>
                    <td className={`px-3 py-2 font-bold whitespace-nowrap ${win ? "text-green-400" : loss ? "text-red-400" : "text-muted-foreground"}`}>
                      {r.result ?? "—"}
                    </td>
                    {log!.headers.map((h) => (
                      <td key={h} className="text-right px-3 py-2 tabular-nums text-gray-200">
                        {r.stats[h] ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
