import type { CricketInningsDetail, CricketMatch } from "@/lib/cricket.functions";
import { InningsCard } from "./InningsCard";

export function ScorecardTab({
  match,
  innings,
  onPlayer,
}: {
  match: CricketMatch;
  innings: CricketInningsDetail[];
  onPlayer: (id: string) => void;
}) {
  if (innings.length === 0) {
    return <EmptyState label="Scorecard not available yet." />;
  }
  return (
    <div className="space-y-4">
      {innings.map((inn) => {
        const isHome = inn.battingTeamId === match.home.id;
        return (
          <InningsCard
            key={`${inn.period}-${inn.battingTeamId}`}
            inn={inn}
            onPlayer={onPlayer}
            accentColor={isHome ? match.home.color : match.away.color}
          />
        );
      })}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 text-center text-sm text-gray-400">
      {label}
    </div>
  );
}
