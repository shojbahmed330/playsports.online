import { Link } from "@tanstack/react-router";
import type { StandingRow } from "@/lib/espn.functions";

/**
 * Soccer standings — one group per section. Uses feed-provided GP/GD/Pts when
 * available (needed for World Cup groups + La Liga), otherwise falls back to
 * W×3 + D calculation.
 *
 * `compact` hides GF/GA/GD so the table fits inside narrow layout columns
 * (landing sidebar) without needing horizontal scroll. The dedicated
 * standings route keeps all columns visible.
 */
export function CompetitionStandingsTable({
  groups,
  compact = false,
  compSlug,
}: {
  groups: { name: string; rows: StandingRow[] }[];
  compact?: boolean;
  /** When set, team names link to their competition team page. */
  compSlug?: string;
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
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            {g.name}
          </h3>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <table className="w-full text-xs sm:text-sm table-fixed">
              <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-1.5 py-2 w-6">#</th>
                  <th className="text-left px-2 py-2">Team</th>
                  <th className="text-right px-1 py-2 w-7">GP</th>
                  <th className="text-right px-1 py-2 w-6">W</th>
                  <th className="text-right px-1 py-2 w-6">D</th>
                  <th className="text-right px-1 py-2 w-6">L</th>
                  {!compact && <th className="text-right px-1 py-2 w-8">GF</th>}
                  {!compact && <th className="text-right px-1 py-2 w-8">GA</th>}
                  <th className="text-right px-1 py-2 w-8">GD</th>
                  <th className="text-right px-2 py-2 w-8 font-bold text-foreground">Pts</th>
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
                  const label = compact ? r.abbr || r.team : r.team;
                  return (
                    <tr
                      key={r.teamId || `${g.name}-${i}`}
                      className="border-t border-white/5 hover:bg-white/[0.04]"
                    >
                      <td className="px-1.5 py-1.5 text-muted-foreground tabular-nums">
                        <span className="inline-flex items-center gap-1">
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
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {r.logo ? (
                            <img src={r.logo} alt="" className="size-4 rounded-full bg-white/5 object-contain shrink-0" loading="lazy"  decoding="async" />
                          ) : (
                            <span className="size-4 rounded-full bg-white/10 shrink-0" />
                          )}
                          {compSlug && r.teamId ? (
                            <Link
                              to="/football/$comp/teams/$teamId"
                              params={{ comp: compSlug, teamId: r.teamId }}
                              className="truncate font-medium hover:text-emerald-300 hover:underline"
                            >
                              {label}
                            </Link>
                          ) : (
                            <span className="truncate font-medium">{label}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-1 py-1.5 text-right tabular-nums text-muted-foreground">{gp ?? "—"}</td>
                      <td className="px-1 py-1.5 text-right tabular-nums">{w}</td>
                      <td className="px-1 py-1.5 text-right tabular-nums">{d}</td>
                      <td className="px-1 py-1.5 text-right tabular-nums">{l}</td>
                      {!compact && <td className="px-1 py-1.5 text-right tabular-nums text-muted-foreground">{gf ?? "—"}</td>}
                      {!compact && <td className="px-1 py-1.5 text-right tabular-nums text-muted-foreground">{ga ?? "—"}</td>}
                      <td className="px-1 py-1.5 text-right tabular-nums text-muted-foreground">
                        {gd == null ? "—" : gd > 0 ? `+${gd}` : gd}
                      </td>
                      <td className="px-2 py-1.5 text-right tabular-nums font-bold text-foreground">{pts}</td>
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

