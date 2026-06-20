import type { WCGroup, WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { MatchCard } from "./MatchCard";

const GROUP_ACCENT: Record<string, { bar: string; grad: string; ring: string }> = {
  A: { bar: "bg-amber-500",  grad: "from-amber-500 to-amber-400",   ring: "ring-amber-500/30" },
  B: { bar: "bg-blue-500",   grad: "from-blue-600 to-blue-500",     ring: "ring-blue-500/30" },
  C: { bar: "bg-green-500",  grad: "from-green-600 to-green-500",   ring: "ring-green-500/30" },
  D: { bar: "bg-red-500",    grad: "from-red-600 to-red-500",       ring: "ring-red-500/30" },
  E: { bar: "bg-purple-500", grad: "from-purple-600 to-purple-500", ring: "ring-purple-500/30" },
  F: { bar: "bg-cyan-500",   grad: "from-cyan-600 to-cyan-500",     ring: "ring-cyan-500/30" },
  G: { bar: "bg-pink-500",   grad: "from-pink-600 to-pink-500",     ring: "ring-pink-500/30" },
  H: { bar: "bg-orange-500", grad: "from-orange-600 to-orange-500", ring: "ring-orange-500/30" },
};

function groupLetterOf(name: string): string {
  return name.toUpperCase().replace(/^GROUP\s*/, "").trim();
}

function matchGroupLetter(round: string): string | null {
  const m = round.toUpperCase().match(/GROUP\s*([A-H])/);
  return m ? m[1] : null;
}

export function GroupStage({
  groups, matches, year, onPick,
}: {
  groups: WCGroup[];
  matches: WCMatch[];
  year: number;
  onPick: (m: WCMatch) => void;
}) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center text-sm text-gray-500 bg-gray-900/40">
        Group stage data coming soon for {year}.
      </div>
    );
  }
  const byGroup = new Map<string, WCGroup[]>();
  for (const g of groups) {
    if (!byGroup.has(g.group_name)) byGroup.set(g.group_name, []);
    byGroup.get(g.group_name)!.push(g);
  }
  const names = [...byGroup.keys()].sort();

  const matchesByLetter = new Map<string, WCMatch[]>();
  for (const m of matches) {
    const letter = matchGroupLetter(m.round);
    if (!letter) continue;
    if (!matchesByLetter.has(letter)) matchesByLetter.set(letter, []);
    matchesByLetter.get(letter)!.push(m);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {names.map((name, gi) => {
        const teams = byGroup.get(name)!.slice().sort(
          (a, b) =>
            (a.position ?? 99) - (b.position ?? 99) ||
            (b.points ?? 0) - (a.points ?? 0),
        );
        const letter = groupLetterOf(name);
        const accent = GROUP_ACCENT[letter] ?? GROUP_ACCENT.A;
        const fixtures = (matchesByLetter.get(letter) ?? [])
          .slice()
          .sort((a, b) => (a.match_number ?? 0) - (b.match_number ?? 0));

        return (
          <div
            key={name}
            style={{ animationDelay: `${gi * 60}ms` }}
            className="wc-card rounded-2xl border border-gray-800 bg-gray-900/70 overflow-hidden"
          >
            {/* Group header banner */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/80 bg-gray-900/60">
              <div className="flex items-center gap-3">
                <span className={`block w-1.5 h-6 rounded-full ${accent.bar}`} />
                <span
                  className={`bg-gradient-to-r ${accent.grad} text-white font-bold text-[11px] uppercase tracking-widest
                    rounded-full px-3 py-1 shadow-lg ${accent.ring}`}
                >
                  Group {letter}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                {fixtures.length} matches
              </span>
            </div>

            {/* Standings */}
            <div className="px-5 pt-4 pb-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-2">
                Standings
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase border-b border-gray-800">
                    <th className="text-left font-medium pb-2">Team</th>
                    <th className="font-medium pb-2 w-7">P</th>
                    <th className="font-medium pb-2 w-7">W</th>
                    <th className="font-medium pb-2 w-7">D</th>
                    <th className="font-medium pb-2 w-7">L</th>
                    <th className="font-medium pb-2 w-8">GF</th>
                    <th className="font-medium pb-2 w-8">GA</th>
                    <th className="font-medium pb-2 w-9">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => {
                    const prevQ = i > 0 && teams[i - 1].qualified;
                    const showDivider = prevQ && !t.qualified;
                    return (
                      <tr
                        key={t.team}
                        className={`transition-colors hover:bg-gray-800/50 ${
                          showDivider ? "border-t-2 border-gray-700" : "border-t border-gray-800/50"
                        }`}
                        style={t.qualified ? { background: "rgba(245,158,11,0.08)" } : undefined}
                      >
                        <td className="py-2">
                          <span className="flex items-center gap-2">
                            <span className="text-base leading-none">{flagOf(t.team)}</span>
                            <span className={`truncate ${t.qualified ? "text-white font-medium" : "text-gray-500"}`}>
                              {t.team}
                            </span>
                            {t.qualified && (
                              <span className="ml-1 text-[9px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded">
                                Q
                              </span>
                            )}
                          </span>
                        </td>
                        <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.played ?? 0}</td>
                        <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.won ?? 0}</td>
                        <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.drawn ?? 0}</td>
                        <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.lost ?? 0}</td>
                        <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.goals_for ?? 0}</td>
                        <td className={`text-center ${t.qualified ? "text-gray-300" : "text-gray-500"}`}>{t.goals_against ?? 0}</td>
                        <td className="text-center font-bold text-white">{t.points ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fixtures */}
            {fixtures.length > 0 && (
              <div className="px-5 pb-5 border-t border-gray-800/80 pt-4 bg-gray-950/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                    Fixtures &amp; Results
                  </div>
                  <span className="text-[10px] text-gray-600 italic">tap a match for details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fixtures.map((m, i) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      round="round_of_16"
                      index={i}
                      onClick={() => onPick(m)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
