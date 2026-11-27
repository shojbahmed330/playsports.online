import type { CricketInningsDetail, CricketMatch } from "@/lib/cricket.functions";
import { InningsCard } from "./InningsCard";
import { EmptyState } from "./ScorecardTab";
import { displayScore } from "@/lib/cricket-score-display";

export function SummaryTab({
  match,
  innings,
  onPlayer,
}: {
  match: CricketMatch;
  innings: CricketInningsDetail[];
  onPlayer: (id: string) => void;
}) {
  // Show latest innings mini-card + full most-recent innings card.
  const latest = innings[innings.length - 1];
  const home = displayScore(match, "home");
  const away = displayScore(match, "away");

  return (
    <div className="space-y-4">
      {/* Mini result banner */}
      {match.result?.marginText && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-100 font-semibold">
          {match.result.marginText}
        </div>
      )}

      {/* Compact score summary */}
      <div className="grid grid-cols-2 gap-3">
        {(["home", "away"] as const).map((side) => {
          const t = match[side];
          const d = side === "home" ? home : away;
          const won = t.winner === true;
          return (
            <div
              key={side}
              className={`rounded-xl border p-3 ${won ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-gray-800 bg-gray-900/40"}`}
            >
              <div className="text-[11px] uppercase tracking-wider text-gray-400 truncate">
                {t.name}
              </div>
              <div className="mt-1 text-2xl font-black tabular-nums">
                {d.kind === "innings" ? (
                  <>
                    {d.runs}
                    {!d.allOut && <span className="text-base text-gray-500">/{d.wickets}</span>}
                  </>
                ) : d.kind === "did-not-bat" ? (
                  <span className="text-sm text-gray-400 font-semibold">Did not bat</span>
                ) : d.kind === "yet-to-bat" ? (
                  <span className="text-sm text-gray-400 font-semibold">Yet to bat</span>
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </div>
              {d.kind === "innings" && d.overs != null && d.overs > 0 && (
                <div className="text-[10px] text-gray-500 tabular-nums mt-0.5">
                  {d.overs} ov{d.allOut ? " · all out" : ""}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Latest innings full card */}
      {latest ? (
        <InningsCard
          inn={latest}
          onPlayer={onPlayer}
          accentColor={latest.battingTeamId === match.home.id ? match.home.color : match.away.color}
        />
      ) : (
        <EmptyState label="Innings details will appear here once available." />
      )}
    </div>
  );
}
