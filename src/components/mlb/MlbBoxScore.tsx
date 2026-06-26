import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { MlbBoxGroup } from "@/lib/mlb.functions";

export function MlbBoxScore({ groups }: { groups: MlbBoxGroup[] }) {
  const teams = Array.from(new Set(groups.map((g) => g.teamAbbr))).filter(Boolean);
  const [tab, setTab] = useState<"batting" | "pitching">("batting");
  if (groups.length === 0) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Boxscore not available yet.</div>;
  }
  return (
    <div className="space-y-3">
      <div className="flex rounded-full bg-card ring-1 ring-border p-0.5 w-fit">
        {(["batting", "pitching"] as const).map((g) => (
          <button
            key={g}
            onClick={() => setTab(g)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${tab === g ? "bg-gradient-to-r from-[#002d72] to-[#d50032] text-white" : "text-muted-foreground hover:text-white"}`}
          >
            {g === "batting" ? "Batting" : "Pitching"}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {teams.map((tAbbr) => {
          const g = groups.find((x) => x.teamAbbr === tAbbr && x.group === tab);
          if (!g) return null;
          return (
            <div key={tAbbr + tab} className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 bg-gradient-to-r from-[#002d72]/30 to-transparent">
                {g.teamLogo && <img loading="lazy" decoding="async" src={g.teamLogo} alt="" className="size-5 object-contain" />}
                <h3 className="text-sm font-bold text-white">{tAbbr} · {tab === "batting" ? "Batting" : "Pitching"}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 sticky left-0 bg-card z-10">Player</th>
                      {g.headers.map((h) => (
                        <th key={h} className="text-right px-2 py-2 tabular-nums">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {g.rows.map((r) => (
                      <tr key={r.athleteId} className="hover:bg-white/[0.03]">
                        <td className="px-3 py-2 sticky left-0 bg-card z-10">
                          <Link to="/mlb/player/$id" params={{ id: r.athleteId }} className="font-semibold text-white hover:text-[#f7e6c4]">
                            {r.name}
                          </Link>
                          {r.pos && <span className="ml-1.5 text-[10px] text-muted-foreground">{r.pos}</span>}
                        </td>
                        {g.headers.map((h) => (
                          <td key={h} className="text-right px-2 py-2 tabular-nums text-gray-200">{r.stats[h] ?? "—"}</td>
                        ))}
                      </tr>
                    ))}
                    {Object.values(g.totals).some(Boolean) && (
                      <tr className="bg-white/[0.04] font-bold">
                        <td className="px-3 py-2 sticky left-0 bg-card z-10 text-[#f7e6c4]">Totals</td>
                        {g.headers.map((h) => (
                          <td key={h} className="text-right px-2 py-2 tabular-nums text-[#f7e6c4]">{g.totals[h] ?? ""}</td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
