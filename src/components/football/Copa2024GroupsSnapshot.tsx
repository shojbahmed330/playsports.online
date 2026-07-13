import { COPA_2024_GROUPS } from "@/lib/copa-standings";

/** Static Copa América 2024 group phase — final tables. */
export function Copa2024GroupsSnapshot() {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Copa América 2024 · Group phase
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-emerald-300/80">Final</span>
      </div>
      <ul className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
        {COPA_2024_GROUPS.map((g) => (
          <li
            key={g.group}
            className="snap-start shrink-0 w-[85vw] max-w-[340px] sm:w-auto sm:max-w-none rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
          >
            <div className="px-3 py-2 bg-white/5 flex items-center justify-between">
              <div className="text-xs font-black uppercase tracking-widest">Group {g.group}</div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Top 2 advance</div>
            </div>
            <table className="w-full text-xs sm:text-sm table-fixed">
              <thead className="text-[9px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-1.5 py-1.5 w-6">#</th>
                  <th className="text-left px-1 py-1.5">Team</th>
                  <th className="text-right px-1 py-1.5 w-6">P</th>
                  <th className="text-right px-1 py-1.5 w-6">W</th>
                  <th className="text-right px-1 py-1.5 w-6">D</th>
                  <th className="text-right px-1 py-1.5 w-6">L</th>
                  <th className="text-right px-1 py-1.5 w-7">GD</th>
                  <th className="text-right px-1.5 py-1.5 w-7">Pts</th>
                </tr>
              </thead>
              <tbody>
                {[...g.rows].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).map((r, i) => (
                  <tr
                    key={r.team}
                    className={`border-t border-white/5 min-h-[44px] ${r.qualified ? "bg-emerald-500/[0.04]" : ""}`}
                  >
                    <td className="px-1.5 py-2 text-muted-foreground tabular-nums">{i + 1}</td>
                    <td className="px-1 py-2 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base leading-none shrink-0" aria-hidden>{r.flag}</span>
                        <span className="truncate font-medium">{r.team}</span>
                        {r.qualified && (
                          <span className="shrink-0 text-[8px] uppercase tracking-widest text-emerald-300/90 font-bold">Q</span>
                        )}
                      </div>
                    </td>
                    <td className="text-right px-1 py-2 tabular-nums">{r.p}</td>
                    <td className="text-right px-1 py-2 tabular-nums">{r.w}</td>
                    <td className="text-right px-1 py-2 tabular-nums">{r.d}</td>
                    <td className="text-right px-1 py-2 tabular-nums">{r.l}</td>
                    <td className={`text-right px-1 py-2 tabular-nums ${r.gd > 0 ? "text-emerald-300" : r.gd < 0 ? "text-red-300/80" : ""}`}>
                      {r.gd > 0 ? `+${r.gd}` : r.gd}
                    </td>
                    <td className="text-right px-1.5 py-2 tabular-nums font-black">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </li>
        ))}
      </ul>
    </section>
  );
}
