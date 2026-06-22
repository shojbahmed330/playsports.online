import type { StandingRow } from "@/lib/espn.functions";

export function StandingsTable({
  groups,
  showTies = false,
  showOT = false,
}: {
  groups: { name: string; rows: StandingRow[] }[];
  showTies?: boolean;
  showOT?: boolean;
}) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-800 p-8 text-center text-sm text-gray-500 bg-gray-900/40">
        Standings unavailable right now.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div key={g.name} className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800/80 flex items-center gap-3">
            <span className="block w-1.5 h-5 rounded-full bg-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
              {g.name}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
              <tr>
                <th className="text-left py-2 pl-4">#</th>
                <th className="text-left">Team</th>
                <th className="text-center w-10">W</th>
                <th className="text-center w-10">L</th>
                {showTies && <th className="text-center w-10">T</th>}
                {showOT && <th className="text-center w-10">OTL</th>}
                <th className="text-center w-14">PCT</th>
                <th className="text-right w-12 pr-4">GB</th>
              </tr>
            </thead>
            <tbody>
              {g.rows.map((r, i) => (
                <tr key={r.teamId || i} className="border-b border-gray-800/40 hover:bg-gray-800/30">
                  <td className="py-2 pl-4 text-gray-500 tabular-nums">{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2 py-0.5">
                      {r.logo && (
                        <img src={r.logo} alt="" loading="lazy" className="size-5 object-contain" />
                      )}
                      <span className="truncate">{r.team}</span>
                    </div>
                  </td>
                  <td className="text-center tabular-nums text-gray-200">{r.wins}</td>
                  <td className="text-center tabular-nums text-gray-200">{r.losses}</td>
                  {showTies && (
                    <td className="text-center tabular-nums text-gray-200">{r.ties ?? "–"}</td>
                  )}
                  {showOT && (
                    <td className="text-center tabular-nums text-gray-200">{r.otLosses ?? "–"}</td>
                  )}
                  <td className="text-center tabular-nums text-gray-300">
                    {r.pct != null ? r.pct.toFixed(3).replace(/^0/, "") : "–"}
                  </td>
                  <td className="text-right tabular-nums text-gray-500 pr-4">{r.gamesBack ?? "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
