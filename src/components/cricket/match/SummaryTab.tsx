import type { CricketInningsDetail, CricketMatch } from "@/lib/cricket.functions";
import { InningsCard } from "./InningsCard";
import { EmptyState } from "./ScorecardTab";
import { displayScore } from "@/lib/cricket-score-display";

export function SummaryTab({
  match,
  innings,
}: {
  match: CricketMatch;
  innings: CricketInningsDetail[];
}) {
  // Show latest innings mini-card + full most-recent innings card.
  const latest = innings[innings.length - 1];
  const home = displayScore(match, "home");
  const away = displayScore(match, "away");

  return (
    <div className="space-y-4">
      {/* Mini result banner */}
      {match.result?.marginText && (
        <div className="rounded-xl border border-[var(--color-accent-cricket)]/30 bg-[var(--color-accent-cricket)]/[0.08] px-4 py-3 text-sm text-[var(--color-accent-cricket)] font-semibold">
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
              className={`rounded-xl border p-3 ${won ? "border-[var(--color-accent-cricket)]/40 bg-[var(--color-accent-cricket)]/[0.06]" : "border-border bg-background"}`}
            >
              <div className="text-[11px] uppercase tracking-wider text-foreground truncate">
                {t.name}
              </div>
              <div className="mt-1 text-2xl font-black tabular-nums">
                {d.kind === "innings" ? (
                  <>
                    {d.runs}
                    {!d.allOut && <span className="text-base text-muted-foreground">/{d.wickets}</span>}
                  </>
                ) : d.kind === "did-not-bat" ? (
                  <span className="text-sm text-foreground font-semibold">Did not bat</span>
                ) : d.kind === "yet-to-bat" ? (
                  <span className="text-sm text-foreground font-semibold">Yet to bat</span>
                ) : (
                  <span className="text-muted-foreground">â€”</span>
                )}
              </div>
              {d.kind === "innings" && d.overs != null && d.overs > 0 && (
                <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
                  {d.overs} ov{d.allOut ? " Â· all out" : ""}
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
          accentColor={latest.battingTeamId === match.home.id ? match.home.color : match.away.color}
        />
      ) : (
        <EmptyState label="Innings details will appear here once available." />
      )}
    </div>
  );
}
