import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { MlbPlay } from "@/lib/mlb.functions";

export function MlbPlayByPlay({ plays }: { plays: MlbPlay[] }) {
  const [scoringOnly, setScoringOnly] = useState(false);
  const [openInning, setOpenInning] = useState<string | null>(null);

  const innings = useMemo(() => {
    const map = new Map<string, MlbPlay[]>();
    for (const p of plays) {
      if (scoringOnly && !p.scoring) continue;
      const key = p.inning || `Inning ${p.inningNumber}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [plays, scoringOnly]);

  // Default-open the latest inning
  const effectiveOpen = openInning ?? innings[innings.length - 1]?.[0] ?? null;

  if (plays.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Play-by-play unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-white">Play-by-Play</h2>
        <button
          onClick={() => setScoringOnly((v) => !v)}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
            scoringOnly
              ? "bg-[#facc15] text-[#0a1428]"
              : "bg-white/5 text-white/70 hover:bg-white/10"
          }`}
        >
          {scoringOnly ? "Scoring only ✓" : "All plays"}
        </button>
      </div>

      <div className="space-y-2">
        {innings.map(([inning, items]) => {
          const isOpen = effectiveOpen === inning;
          const lastPlay = items[items.length - 1];
          const scoringCount = items.filter((p) => p.scoring).length;
          return (
            <div key={inning} className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
              <button
                onClick={() => setOpenInning(isOpen ? "__none__" : inning)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.03] transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-[#f7e6c4]">{inning}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {items.length} plays {scoringCount > 0 && `· ${scoringCount} scoring`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {lastPlay && (
                    <span className="text-xs tabular-nums text-white/70">
                      {lastPlay.awayScore ?? 0} — {lastPlay.homeScore ?? 0}
                    </span>
                  )}
                  <span className={`text-white/40 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                </div>
              </button>
              {isOpen && (
                <ol className="divide-y divide-border">
                  {items.map((p) => (
                    <li
                      key={p.id}
                      className={`px-4 py-3 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 items-start ${
                        p.scoring ? "bg-[#facc15]/5" : ""
                      }`}
                    >
                      <div className="size-7 rounded-full bg-white/5 ring-1 ring-white/10 grid place-items-center text-[10px] font-bold text-white/70">
                        {p.outs != null ? `${p.outs}o` : "·"}
                      </div>
                      <div className="min-w-0">
                        {p.type && (
                          <div className={`text-[10px] uppercase tracking-wider font-bold mb-0.5 ${p.scoring ? "text-[#facc15]" : "text-muted-foreground"}`}>
                            {p.type}{p.scoring && " · Scored"}
                          </div>
                        )}
                        <p className="text-xs text-gray-200 leading-snug">{p.text}</p>
                        {(p.batterName || p.pitcherName) && (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                            {p.batterName && (
                              <span>
                                Batter:{" "}
                                {p.batterId ? (
                                  <Link to="/mlb/player/$id" params={{ id: p.batterId }} className="text-white/80 font-semibold hover:text-[#f7e6c4]">
                                    {p.batterName}
                                  </Link>
                                ) : (
                                  <span className="text-white/80 font-semibold">{p.batterName}</span>
                                )}
                              </span>
                            )}
                            {p.pitcherName && (
                              <span>
                                Pitcher:{" "}
                                {p.pitcherId ? (
                                  <Link to="/mlb/player/$id" params={{ id: p.pitcherId }} className="text-white/80 font-semibold hover:text-[#f7e6c4]">
                                    {p.pitcherName}
                                  </Link>
                                ) : (
                                  <span className="text-white/80 font-semibold">{p.pitcherName}</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] tabular-nums text-white/70 whitespace-nowrap font-semibold">
                        {p.awayScore ?? 0}–{p.homeScore ?? 0}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
