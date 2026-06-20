import type { WCGroup } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";

const GROUP_ACCENT: Record<string, string> = {
  A: "bg-amber-500", B: "bg-blue-500", C: "bg-green-500", D: "bg-red-500",
  E: "bg-purple-500", F: "bg-cyan-500", G: "bg-pink-500", H: "bg-orange-500",
};

export function GroupStage({ groups, year }: { groups: WCGroup[]; year: number }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center text-sm text-gray-500 bg-gray-900/40">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {names.map((name, gi) => {
        const teams = byGroup.get(name)!.slice().sort(
          (a, b) =>
            (a.position ?? 99) - (b.position ?? 99) ||
            (b.points ?? 0) - (a.points ?? 0),
        );
        const letter = name.toUpperCase().replace(/^GROUP\s*/, "").trim();
        const accent = GROUP_ACCENT[letter] ?? "bg-gold";
        return (
          <div
            key={name}
            style={{ animationDelay: `${gi * 60}ms` }}
            className="wc-card rounded-2xl border border-gray-800 bg-gray-900 p-5 min-w-[320px]"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`block w-1 h-6 rounded-full ${accent}`} />
              <h3 className="font-black tracking-widest text-sm">
                GROUP {letter}
              </h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                  <th className="text-left font-medium pb-2">Team</th>
                  <th className="font-medium pb-2 w-8">P</th>
                  <th className="font-medium pb-2 w-8">W</th>
                  <th className="font-medium pb-2 w-8">D</th>
                  <th className="font-medium pb-2 w-8">L</th>
                  <th className="font-medium pb-2 w-9">GF</th>
                  <th className="font-medium pb-2 w-9">GA</th>
                  <th className="font-medium pb-2 w-10">Pts</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, i) => {
                  const prevQ = i > 0 && teams[i - 1].qualified;
                  const showDivider = prevQ && !t.qualified;
                  return (
                    <tr
                      key={t.team}
                      className={`transition-colors hover:bg-gray-800/50 ${
                        showDivider ? "border-t-2 border-gray-700" : "border-t border-gray-800/50"
                      } ${t.qualified ? "" : ""}`}
                      style={t.qualified ? { background: "rgba(245,158,11,0.08)" } : undefined}
                    >
                      <td className="py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{flagOf(t.team)}</span>
                          <span className={`truncate ${t.qualified ? "text-white font-medium" : "text-gray-500"}`}>
                            {t.team}
                          </span>
                          {t.qualified && (
                            <span className="ml-1 text-[9px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded">
                              Q
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.played ?? 0}</td>
                      <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.won ?? 0}</td>
                      <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.drawn ?? 0}</td>
                      <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.lost ?? 0}</td>
                      <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.goals_for ?? 0}</td>
                      <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.goals_against ?? 0}</td>
                      <td className="text-center font-bold text-white">{t.points ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
