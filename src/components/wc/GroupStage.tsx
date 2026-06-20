import type { WCGroup } from "@/lib/supabase";

export function GroupStage({ groups, year }: { groups: WCGroup[]; year: number }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground bg-card/30">
        Group stage data coming soon for {year}.
      </div>
    );
  }
  const byGroup = new Map<string, WCGroup[]>();
  for (const g of groups) {
    if (!byGroup.has(g.group_name)) byGroup.set(g.group_name, []);
    byGroup.get(g.group_name)!.push(g);
  }
  const names = [...byGroup.keys()].sort();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {names.map((name) => {
        const teams = byGroup.get(name)!.slice().sort(
          (a, b) => (a.position ?? 99) - (b.position ?? 99) || (b.points ?? 0) - (a.points ?? 0),
        );
        return (
          <div key={name} className="rounded-xl border border-border bg-card p-3">
            <div className="text-xs font-bold tracking-widest text-gold mb-2">GROUP {name.toUpperCase()}</div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left font-medium pb-1">Team</th>
                  <th className="font-medium pb-1 w-6">P</th>
                  <th className="font-medium pb-1 w-6">W</th>
                  <th className="font-medium pb-1 w-6">D</th>
                  <th className="font-medium pb-1 w-6">L</th>
                  <th className="font-medium pb-1 w-7">GF</th>
                  <th className="font-medium pb-1 w-7">GA</th>
                  <th className="font-medium pb-1 w-7">Pts</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t) => (
                  <tr key={t.team} className={`border-t border-border/50 ${t.qualified ? "text-gold font-semibold" : ""}`}>
                    <td className="py-1 truncate max-w-[110px]">{t.team}</td>
                    <td className="text-center">{t.played ?? 0}</td>
                    <td className="text-center">{t.won ?? 0}</td>
                    <td className="text-center">{t.drawn ?? 0}</td>
                    <td className="text-center">{t.lost ?? 0}</td>
                    <td className="text-center">{t.goals_for ?? 0}</td>
                    <td className="text-center">{t.goals_against ?? 0}</td>
                    <td className="text-center font-bold">{t.points ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
