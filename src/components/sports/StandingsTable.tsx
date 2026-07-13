import type { StandingRow } from "@/lib/espn.functions";
import { StatTable, type StatColumn } from "@/components/ui/StatTable";

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

  const columns: StatColumn<StandingRow & { _idx: number }>[] = [
    {
      key: "rank",
      label: "#",
      align: "left",
      width: "2.5rem",
      render: (r) => <span className="text-gray-500 tabular-nums">{r._idx + 1}</span>,
    },
    {
      key: "team",
      label: "Team",
      sticky: true,
      render: (r) => (
        <div className="flex items-center gap-2 min-w-0">
          {r.logo && <img src={r.logo} alt="" loading="lazy" className="size-5 shrink-0 object-contain" / decoding="async">}
          <span className="truncate">{r.team}</span>
        </div>
      ),
    },
    { key: "w", label: "W", align: "center", render: (r) => r.wins },
    { key: "l", label: "L", align: "center", render: (r) => r.losses },
    ...(showTies
      ? [{ key: "t", label: "T", align: "center" as const, render: (r: StandingRow) => r.ties ?? "–" }]
      : []),
    ...(showOT
      ? [{ key: "otl", label: "OTL", align: "center" as const, render: (r: StandingRow) => r.otLosses ?? "–" }]
      : []),
    {
      key: "pct",
      label: "PCT",
      align: "center",
      render: (r) => (r.pct != null ? r.pct.toFixed(3).replace(/^0/, "") : "–"),
    },
    {
      key: "gb",
      label: "GB",
      align: "right",
      render: (r) => <span className="text-gray-500">{r.gamesBack ?? "–"}</span>,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div key={g.name} className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800/80 flex items-center gap-3">
            <span className="block w-1.5 h-5 rounded-full bg-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">{g.name}</h3>
          </div>
          <div className="p-2 sm:p-3">
            <StatTable
              caption={`${g.name} standings`}
              rows={g.rows.map((r, i) => ({ ...r, _idx: i }))}
              rowKey={(r) => r.teamId || String(r._idx)}
              columns={columns}
              density="compact"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
