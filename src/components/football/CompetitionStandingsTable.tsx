import type { StandingRow } from "@/lib/espn.functions";

/**
 * Soccer standings — one group per section. Uses feed-provided GP/GD/Pts when
 * available (needed for World Cup groups + La Liga), otherwise falls back to
 * W×3 + D calculation so it still renders during off-season / partial feeds.
 */
export function CompetitionStandingsTable({
  groups,
}: {
  groups: { name: string; rows: StandingRow[] }[];
}) {
  if (!groups.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-sm text-muted-foreground">
        Standings will appear once the season begins.
      </div>
    );
  }
  return (
    <div className="grid gap-6">
      {groups.map((g) => (
        <section key={g.name}>
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            {g.name}
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-2 py-2 w-8">#</th>
                  <th className="text-left px-3 py-2">Team</th>
                  <th className="text-right px-2 py-2">GP</th>
                  <th className="text-right px-2 py-2">W</th>
                  <th className="text-right px-2 py-2">D</th>
                  <th className="text-right px-2 py-2">L</th>
                  <th className="text-right px-2 py-2">GF</th>
                  <th className="text-right px-2 py-2">GA</th>
                  <th className="text-right px-2 py-2">GD</th>
                  <th className="text-right px-3 py-2 font-bold text-foreground">Pts</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r, i) => {
                  const w = r.wins ?? 0;
                  const d = r.ties ?? 0;
                  const l = r.losses ?? 0;
                  const gp = r.gamesPlayed ?? (w + d + l || null);
                  const gf = r.pointsFor;
                  const ga = r.pointsAgainst;
                  const gd = r.goalDiff ?? (gf != null && ga != null ? gf - ga : null);
                  const pts = r.points ?? w * 3 + d;
                  return (
                    <tr
                      key={r.teamId || `${g.name}-${i}`}
                      className="border-t border-white/5 hover:bg-white/[0.04]"
                    >
                      <td className="px-2 py-2 text-muted-foreground tabular-nums">
                        <span className="inline-flex items-center gap-1.5">
                          {r.noteColor && (
                            <span
                              className="inline-block size-1.5 rounded-full"
                              style={{ backgroundColor: r.noteColor }}
                              title={r.noteDesc ?? undefined}
                            />
                          )}
                          {r.rank ?? i + 1}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {r.logo ? (
                            <img src={r.logo} alt="" className="size-5 rounded-full bg-white/5 object-contain" loading="lazy" />
                          ) : (
                            <span className="size-5 rounded-full bg-white/10" />
                          )}
                          <span className="truncate font-medium">{r.team}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{gp ?? "—"}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{w}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{d}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{l}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{gf ?? "—"}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">{ga ?? "—"}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                        {gd == null ? "—" : gd > 0 ? `+${gd}` : gd}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-bold text-foreground">{pts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
