import type { NbaLinescoreTeam } from "@/lib/nba.functions";

export function NbaLinescore({ home, away, periodCount }: { home: NbaLinescoreTeam; away: NbaLinescoreTeam; periodCount: number }) {
  const periods = Array.from({ length: Math.max(periodCount, 4) }, (_, i) => i);
  function row(team: NbaLinescoreTeam) {
    return (
      <tr className={team.winner ? "bg-orange-500/[0.05]" : ""}>
        <td className="py-2 pl-3 sticky left-0 bg-card z-10">
          <div className="flex items-center gap-2 min-w-0">
            {team.logo && <img src={team.logo} alt="" className="size-6 object-contain" loading="lazy"  decoding="async" />}
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">{team.shortName || team.abbr}</div>
              {team.record && <div className="text-[10px] text-muted-foreground">{team.record}</div>}
            </div>
          </div>
        </td>
        {periods.map((i) => {
          const label = i < 4 ? `Q${i + 1}` : `OT${i - 3}`;
          const v = team.periods[i];
          return (
            <td key={label} className="text-center tabular-nums px-2 text-gray-200">{v ?? "–"}</td>
          );
        })}
        <td className="text-right pr-4 tabular-nums text-lg font-extrabold text-white">{team.score ?? "–"}</td>
      </tr>
    );
  }
  return (
    <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left py-2 pl-3 sticky left-0 bg-card z-10">Team</th>
              {periods.map((i) => {
                const label = i < 4 ? `Q${i + 1}` : `OT${i - 3}`;
                return <th key={label} className="text-center px-2">{label}</th>;
              })}
              <th className="text-right pr-4">T</th>
            </tr>
          </thead>
          <tbody>
            {row(away)}
            <tr><td colSpan={periods.length + 2} className="border-t border-border/40" /></tr>
            {row(home)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
