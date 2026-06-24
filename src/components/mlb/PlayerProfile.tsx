import type { MlbAthlete, MlbCareer } from "@/lib/mlb.functions";

export function PlayerProfile({ athlete, career }: { athlete: MlbAthlete; career: MlbCareer }) {
  return (
    <div className="space-y-6">
      {/* Bio header */}
      <div className="relative overflow-hidden rounded-2xl bg-mlb-hero ring-1 ring-[#f7e6c4]/15">
        <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-50" />
        <div className="relative p-6 grid grid-cols-[auto_minmax(0,1fr)] gap-5 items-center">
          <div className="size-24 sm:size-28 rounded-2xl bg-white/10 ring-1 ring-white/20 overflow-hidden grid place-items-center shrink-0">
            {athlete.headshot ? (
              <img src={athlete.headshot} alt={athlete.name} className="size-full object-cover" />
            ) : (
              <span className="text-3xl">⚾</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-[#f7e6c4] font-bold">
              {athlete.team?.abbr ?? "Free Agent"} · {athlete.position ?? "—"}
              {athlete.jersey && <span className="ml-2 opacity-70">#{athlete.jersey}</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
              {athlete.name}
            </h1>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <Fact label="Age" value={athlete.age != null ? String(athlete.age) : "—"} />
              <Fact label="B / T" value={`${athlete.bats ?? "—"} / ${athlete.throws ?? "—"}`} />
              <Fact label="Ht / Wt" value={`${athlete.height ?? "—"} · ${athlete.weight ?? "—"}`} />
              <Fact label="Exp" value={athlete.experience ?? "—"} />
            </div>
            {(athlete.birthplace || athlete.college) && (
              <div className="mt-2 text-[11px] text-white/60">
                {athlete.birthplace && <span>📍 {athlete.birthplace}</span>}
                {athlete.college && <span className="ml-3">🎓 {athlete.college}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Career table */}
      <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">
            Career — {career.group === "pitching" ? "Pitching" : "Batting"}
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {career.rows.length} seasons
          </span>
        </div>
        {career.rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Career stats unavailable.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Season</th>
                  <th className="text-left px-3 py-2 font-semibold">Team</th>
                  {career.headers.map((h) => (
                    <th key={h} className="text-right px-3 py-2 font-semibold tabular-nums">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {career.rows.map((r, i) => (
                  <tr key={`${r.season}-${i}`} className="hover:bg-white/[0.03]">
                    <td className="px-3 py-2 font-semibold text-white tabular-nums">{r.season}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.team}</td>
                    {career.headers.map((h) => (
                      <td key={h} className="text-right px-3 py-2 tabular-nums text-gray-200">
                        {r.stats[h] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 ring-1 ring-white/10 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-white/50">{label}</div>
      <div className="text-xs font-bold text-white truncate">{value}</div>
    </div>
  );
}
