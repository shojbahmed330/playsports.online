import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MlsBoxGroup, MlsBoxRow } from "@/lib/mls.functions";

export function MlsBoxScore({ groups }: { groups: MlsBoxGroup[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!groups.length) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">Box score not available yet.</div>;
  }
  const g = groups[activeIdx];
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-xl bg-card ring-1 ring-border p-1">
        {groups.map((grp, i) => (
          <button
            key={grp.teamId + i}
            onClick={() => setActiveIdx(i)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              i === activeIdx ? "bg-orange-500/20 text-orange-200 ring-1 ring-orange-500/40" : "text-muted-foreground hover:text-white"
            }`}
          >
            {grp.teamLogo && <img src={grp.teamLogo} alt="" className="size-4 object-contain" loading="lazy" / decoding="async">}
            {grp.teamAbbr || "Team"}
          </button>
        ))}
      </div>
      <Table group={g} />
    </div>
  );
}

function Table({ group }: { group: MlsBoxGroup }) {
  const starters = group.rows.filter((r) => r.starter);
  const bench = group.rows.filter((r) => !r.starter);
  return (
    <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left py-2 pl-3 sticky left-0 bg-card z-10 min-w-[10rem]">Player</th>
              {group.headers.map((h) => (
                <th key={h} className="text-right px-2 tabular-nums">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {starters.length > 0 && <SectionHeader label="Starters" span={group.headers.length + 1} />}
            {starters.map((r) => <Row key={r.athleteId} row={r} headers={group.headers} />)}
            {bench.length > 0 && <SectionHeader label="Bench" span={group.headers.length + 1} />}
            {bench.map((r) => <Row key={r.athleteId} row={r} headers={group.headers} />)}
            {Object.keys(group.totals).length > 0 && (
              <tr className="border-t border-border bg-muted/30 font-bold">
                <td className="py-2 pl-3 sticky left-0 bg-card text-orange-300">TOTALS</td>
                {group.headers.map((h) => (
                  <td key={h} className="text-right px-2 tabular-nums text-white">{group.totals[h] ?? "—"}</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SectionHeader({ label, span }: { label: string; span: number }) {
  return (
    <tr>
      <td colSpan={span} className="bg-background/70 px-3 py-1.5 text-[10px] uppercase tracking-wider text-orange-300/80 font-bold">
        {label}
      </td>
    </tr>
  );
}

function Row({ row, headers }: { row: MlsBoxRow; headers: string[] }) {
  return (
    <tr className="border-b border-border/40 hover:bg-white/[0.03] transition">
      <td className="py-2 pl-3 sticky left-0 bg-card z-10">
        <Link to="/mls/player/$id" params={{ id: row.athleteId }} className="font-medium text-white hover:text-orange-300 transition">
          {row.name}{row.pos ? <span className="text-muted-foreground ml-1 text-[10px]">{row.pos}</span> : null}
        </Link>
      </td>
      {headers.map((h) => (
        <td key={h} className="text-right px-2 tabular-nums text-gray-200">{row.stats[h] ?? "—"}</td>
      ))}
    </tr>
  );
}
