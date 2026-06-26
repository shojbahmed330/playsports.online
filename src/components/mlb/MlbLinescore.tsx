import type { MlbLinescoreTeam } from "@/lib/mlb.functions";

export function MlbLinescore({
  home,
  away,
  innings,
}: {
  home: MlbLinescoreTeam;
  away: MlbLinescoreTeam;
  innings: number;
}) {
  const cols = Math.max(innings, 9);
  const inningHeaders = Array.from({ length: cols }, (_, i) => i + 1);
  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2 sticky left-0 bg-card z-10">Team</th>
              {inningHeaders.map((n) => (
                <th key={n} className="text-center px-2 py-2 tabular-nums w-8">{n}</th>
              ))}
              <th className="text-center px-3 py-2 font-bold text-[#f7e6c4]">R</th>
              <th className="text-center px-3 py-2">H</th>
              <th className="text-center px-3 py-2">E</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[away, home].map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.03]">
                <td className="px-3 py-2 sticky left-0 bg-card z-10">
                  <div className="flex items-center gap-2">
                    {t.logo && <img loading="lazy" decoding="async" src={t.logo} alt="" className="size-5 object-contain" />}
                    <span className="font-bold text-white">{t.abbr}</span>
                  </div>
                </td>
                {inningHeaders.map((_, i) => {
                  const v = t.innings[i];
                  return (
                    <td key={i} className="text-center px-2 py-2 tabular-nums text-gray-200">
                      {v == null ? "—" : v}
                    </td>
                  );
                })}
                <td className="text-center px-3 py-2 tabular-nums font-extrabold text-[#f7e6c4]">{t.score ?? 0}</td>
                <td className="text-center px-3 py-2 tabular-nums text-gray-200">{t.hits ?? "—"}</td>
                <td className="text-center px-3 py-2 tabular-nums text-gray-200">{t.errors ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
