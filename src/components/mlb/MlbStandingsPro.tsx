import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trophy, Eye, EyeOff, Layers, Flag, Sparkles } from "lucide-react";
import type { MlbLeague, MlbStandingRow } from "@/lib/mlb.functions";

type View = "division" | "league" | "wildcard";

export function MlbStandingsPro({ leagues }: { leagues: MlbLeague[] }) {
  const [view, setView] = useState<View>("division");
  const [expanded, setExpanded] = useState(false);

  if (!leagues.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">
        Standings unavailable right now.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-card ring-1 ring-border p-1">
          <ViewTab active={view === "division"} onClick={() => setView("division")} icon={<Layers className="size-3.5" />} label="Division" />
          <ViewTab active={view === "league"} onClick={() => setView("league")} icon={<Flag className="size-3.5" />} label="League" />
          <ViewTab active={view === "wildcard"} onClick={() => setView("wildcard")} icon={<Sparkles className="size-3.5" />} label="Wild Card" />
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-card ring-1 ring-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition"
        >
          {expanded ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {expanded ? "Compact" : "Expanded"}
        </button>
      </div>

      {view === "division" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {leagues.flatMap((lg) =>
            lg.divisions.map((d) => (
              <StandingsCard
                key={`${lg.name}-${d.name}`}
                title={d.name}
                badge={lg.abbr}
                rows={d.rows}
                expanded={expanded}
                mode="division"
              />
            ))
          )}
        </div>
      )}

      {view === "league" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {leagues.map((lg) => (
            <StandingsCard
              key={lg.name}
              title={lg.name}
              badge={lg.abbr}
              rows={[...lg.divisions.flatMap((d) => d.rows)].sort(
                (a, b) => (b.pct ?? 0) - (a.pct ?? 0)
              )}
              expanded={expanded}
              mode="league"
            />
          ))}
        </div>
      )}

      {view === "wildcard" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {leagues.map((lg) => (
            <WildCardCard key={lg.name} league={lg} expanded={expanded} />
          ))}
        </div>
      )}
    </div>
  );
}

function ViewTab({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40"
          : "text-muted-foreground hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StandingsCard({
  title, badge, rows, expanded, mode,
}: {
  title: string;
  badge?: string;
  rows: MlbStandingRow[];
  expanded: boolean;
  mode: "division" | "league" | "wildcard";
}) {
  return (
    <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <span className="block w-1.5 h-5 rounded-full bg-amber-500" />
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400 flex-1">
          {title}
        </h3>
        {badge && (
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider">{badge}</span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="text-left py-2 pl-3 w-8">#</th>
              <th className="text-left">Team</th>
              <th className="text-center w-10">W</th>
              <th className="text-center w-10">L</th>
              <th className="text-center w-14">PCT</th>
              <th className="text-right w-12">{mode === "wildcard" ? "WCGB" : "GB"}</th>
              <th className="text-center w-12">L10</th>
              <th className="text-center w-12">STRK</th>
              {expanded && (
                <>
                  <th className="text-center w-16">HOME</th>
                  <th className="text-center w-16">AWAY</th>
                  <th className="text-right w-14">DIFF</th>
                  <th className="text-right w-14 pr-3">POFF%</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const clinched = r.seed != null && r.seed <= 3 && mode === "division" && i === 0;
              return (
                <tr
                  key={r.teamId || i}
                  className="border-b border-border/40 hover:bg-muted/30 transition"
                >
                  <td className="py-2 pl-3 tabular-nums text-muted-foreground">
                    {clinched ? (
                      <Trophy className="size-3.5 text-amber-400" />
                    ) : (
                      r.seed ?? i + 1
                    )}
                  </td>
                  <td>
                    <Link
                      to="/mlb/team/$id"
                      params={{ id: r.teamId }}
                      className="flex items-center gap-2 py-0.5 group"
                    >
                      {r.logo && (
                        <img src={r.logo} alt="" loading="lazy" className="size-5 object-contain" / decoding="async">
                      )}
                      <span className="truncate font-medium text-white group-hover:text-amber-300 transition">
                        {r.shortName || r.team}
                      </span>
                    </Link>
                  </td>
                  <td className="text-center tabular-nums text-white">{r.wins}</td>
                  <td className="text-center tabular-nums text-white">{r.losses}</td>
                  <td className="text-center tabular-nums text-muted-foreground">
                    {r.pct != null ? r.pct.toFixed(3).replace(/^0/, "") : "–"}
                  </td>
                  <td className="text-right tabular-nums text-muted-foreground">
                    {r.gamesBack ?? "–"}
                  </td>
                  <td className="text-center tabular-nums text-muted-foreground">
                    {r.last10 ?? "–"}
                  </td>
                  <td className="text-center tabular-nums">
                    <StreakPill streak={r.streak} />
                  </td>
                  {expanded && (
                    <>
                      <td className="text-center tabular-nums text-muted-foreground">{r.home ?? "–"}</td>
                      <td className="text-center tabular-nums text-muted-foreground">{r.away ?? "–"}</td>
                      <td className={`text-right tabular-nums font-semibold ${
                        (r.runDiff ?? 0) > 0 ? "text-emerald-400" : (r.runDiff ?? 0) < 0 ? "text-rose-400" : "text-muted-foreground"
                      }`}>
                        {r.runDiff != null ? (r.runDiff > 0 ? `+${r.runDiff}` : r.runDiff) : "–"}
                      </td>
                      <td className="text-right tabular-nums text-muted-foreground pr-3">
                        {r.playoffPct ?? "–"}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StreakPill({ streak }: { streak: string | null }) {
  if (!streak) return <span className="text-muted-foreground">–</span>;
  const win = /^W/i.test(streak);
  const loss = /^L/i.test(streak);
  return (
    <span
      className={`inline-flex items-center justify-center min-w-[2.25rem] rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
        win
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
          : loss
            ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {streak}
    </span>
  );
}

function WildCardCard({ league, expanded }: { league: MlbLeague; expanded: boolean }) {
  const ranked = useMemo(() => {
    const divLeaders = new Set<string>();
    league.divisions.forEach((d) => {
      const top = [...d.rows].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))[0];
      if (top) divLeaders.add(top.teamId);
    });
    const wcPool = league.divisions
      .flatMap((d) => d.rows)
      .filter((r) => !divLeaders.has(r.teamId))
      .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));
    return wcPool;
  }, [league]);

  return (
    <StandingsCard
      title={`${league.name} · Wild Card`}
      badge={league.abbr}
      rows={ranked}
      expanded={expanded}
      mode="wildcard"
    />
  );
}
