import type { MlbScoringPlay } from "@/lib/mlb.functions";

export function MlbScoringPlays({ plays }: { plays: MlbScoringPlay[] }) {
  if (plays.length === 0) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No scoring plays yet.</div>;
  }
  return (
    <ol className="space-y-2">
      {plays.map((p) => (
        <li key={p.id} className="rounded-xl bg-card ring-1 ring-border p-3 flex items-start gap-3">
          <div className="shrink-0 w-20">
            <div className="text-[10px] uppercase tracking-wider font-bold text-[#f7e6c4]">{p.inning}</div>
            {p.teamAbbr && <div className="text-[11px] text-muted-foreground mt-0.5">{p.teamAbbr}</div>}
          </div>
          <div className="flex-1 text-xs text-gray-200">{p.text}</div>
          {p.awayScore != null && p.homeScore != null && (
            <div className="shrink-0 text-xs font-extrabold tabular-nums text-white">
              {p.awayScore}–{p.homeScore}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
