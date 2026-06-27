import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import type { NbaPlay } from "@/lib/nba.functions";

export function NbaPlayByPlay({ plays }: { plays: NbaPlay[] }) {
  const periods = useMemo(() => {
    const set = new Set<number>();
    plays.forEach((p) => p.periodNumber && set.add(p.periodNumber));
    return Array.from(set).sort((a, b) => a - b);
  }, [plays]);

  const [filter, setFilter] = useState<number | "all" | "scoring">("all");

  const filtered = plays.filter((p) => {
    if (filter === "all") return true;
    if (filter === "scoring") return p.scoring;
    return p.periodNumber === filter;
  });

  if (!plays.length) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">Play-by-play not available.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Pill active={filter === "all"} onClick={() => setFilter("all")}>All</Pill>
        <Pill active={filter === "scoring"} onClick={() => setFilter("scoring")} amber>
          <Trophy className="size-3" /> Scoring only
        </Pill>
        {periods.map((p) => (
          <Pill key={p} active={filter === p} onClick={() => setFilter(p)}>Q{p}</Pill>
        ))}
      </div>
      <ol className="rounded-2xl ring-1 ring-border bg-card divide-y divide-border overflow-hidden">
        {filtered.slice(0, 200).map((p) => (
          <li key={p.id} className={`px-3 py-2.5 flex items-start gap-3 text-sm ${p.scoring ? "bg-orange-500/[0.04]" : ""}`}>
            <div className="shrink-0 flex flex-col items-end min-w-[3.5rem]">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{p.period}</span>
              <span className="text-[10px] text-muted-foreground tabular-nums">{p.clock}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-100 leading-snug">
                {p.athleteId ? (
                  <Link to="/nba/player/$id" params={{ id: p.athleteId }} className="hover:text-orange-300 transition">
                    {p.text}
                  </Link>
                ) : p.text}
              </div>
              {p.scoring && p.awayScore != null && p.homeScore != null && (
                <div className="text-[10px] mt-0.5 font-bold tabular-nums text-orange-300">
                  {p.awayScore} – {p.homeScore}
                </div>
              )}
            </div>
            {p.teamAbbr && (
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{p.teamAbbr}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Pill({ children, active, onClick, amber }: { children: React.ReactNode; active?: boolean; onClick?: () => void; amber?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition ${
        active
          ? amber
            ? "bg-orange-500/20 text-orange-200 ring-orange-500/50"
            : "bg-white/10 text-white ring-white/20"
          : "bg-card text-muted-foreground ring-border hover:text-white"
      }`}
    >{children}</button>
  );
}
