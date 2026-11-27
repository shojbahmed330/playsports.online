import type { WCGroup, WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { MatchCard } from "./MatchCard";
import { EmptyState } from "@/components/ui/state";

type GroupTone = { bar: string; pill: string };

// Token-based group colours. Twelve groups share five semantic accents so the
// palette stays inside the design system instead of twelve hardcoded hues.
const GROUP_TONES: GroupTone[] = [
  { bar: "bg-primary", pill: "bg-primary/15 text-primary ring-primary/30" },
  { bar: "bg-[var(--color-accent-mlb)]", pill: "bg-[var(--color-accent-mlb)]/15 text-[var(--color-accent-mlb)] ring-[var(--color-accent-mlb)]/30" },
  { bar: "bg-[var(--color-accent-nhl)]", pill: "bg-[var(--color-accent-nhl)]/15 text-[var(--color-accent-nhl)] ring-[var(--color-accent-nhl)]/30" },
  { bar: "bg-gold", pill: "bg-gold/15 text-gold ring-gold/30" },
  { bar: "bg-positive", pill: "bg-positive/15 text-positive ring-positive/30" },
];
const NUM_TO_LETTER: Record<string, string> = {
  "1":"A","2":"B","3":"C","4":"D","5":"E","6":"F","7":"G","8":"H","9":"I","10":"J","11":"K","12":"L",
};

function groupLetterOf(name: string): string {
  const raw = name.toUpperCase().replace(/^GROUP\s*/, "").trim();
  return NUM_TO_LETTER[raw] ?? raw;
}

function matchGroupLetter(round: string): string | null {
  const m = round.toUpperCase().match(/GROUP\s*([A-Z0-9]+)/);
  if (!m) return null;
  const tok = m[1];
  return NUM_TO_LETTER[tok] ?? tok;
}

function toneFor(letter: string): GroupTone {
  const idx = letter.charCodeAt(0) - 65;
  return GROUP_TONES[((idx % GROUP_TONES.length) + GROUP_TONES.length) % GROUP_TONES.length];
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
      <EmptyState
        title={`Groups not drawn yet for ${year}`}
        description="Standings will appear here as soon as FIFA publishes the draw or the first match kicks off."
      />
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {names.map((name, gi) => {
        const teams = byGroup.get(name)!.slice().sort(
          (a, b) =>
            (a.position ?? 99) - (b.position ?? 99) ||
            (b.points ?? 0) - (a.points ?? 0),
        );
        const letter = groupLetterOf(name);
        const tone = toneFor(letter);
        const fixtures = (matchesByLetter.get(letter) ?? [])
          .slice()
          .sort((a, b) => (a.match_number ?? 0) - (b.match_number ?? 0));

        return (
          <div
            key={name}
            style={{ animationDelay: `${gi * 60}ms` }}
            className="wc-card overflow-hidden rounded-2xl border border-border bg-card"
          >
            {/* Group header banner */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`block h-6 w-1.5 rounded-full ${tone.bar}`} aria-hidden="true" />
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-micro uppercase ring-1 ${tone.pill}`}>
                  Group {letter}
                </span>
              </div>
              <span className="text-micro uppercase text-muted-foreground">
                {fixtures.length} matches
              </span>
            </div>

            {/* Standings */}
            <div className="px-5 pb-5 pt-4">
              <div className="mb-2 text-micro uppercase text-muted-foreground">
                Standings
              </div>
              <table className="w-full text-caption">
                <caption className="sr-only">Group {letter} standings</caption>
                <thead>
                  <tr className="border-b border-border text-micro uppercase text-muted-foreground">
                    <th scope="col" className="pb-2 text-left font-medium">Team</th>
                    <th scope="col" title="Played" className="w-7 cursor-help pb-2 font-medium">P</th>
                    <th scope="col" title="Won" className="w-7 cursor-help pb-2 font-medium">W</th>
                    <th scope="col" title="Drawn" className="w-7 cursor-help pb-2 font-medium">D</th>
                    <th scope="col" title="Lost" className="w-7 cursor-help pb-2 font-medium">L</th>
                    <th scope="col" title="Goals For" className="w-8 cursor-help pb-2 font-medium">GF</th>
                    <th scope="col" title="Goals Against" className="w-8 cursor-help pb-2 font-medium">GA</th>
                    <th scope="col" title="Points (Win = 3, Draw = 1)" className="w-9 cursor-help pb-2 font-medium">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t, i) => {
                    const prevQ = i > 0 && teams[i - 1].qualified;
                    const showDivider = prevQ && !t.qualified;
                    const cell = t.qualified ? "text-foreground" : "text-muted-foreground";
                    return (
                      <tr
                        key={t.team}
                        className={`transition-colors hover:bg-accent/40 ${
                          showDivider ? "border-t-2 border-border" : "border-t border-border/60"
                        } ${t.qualified ? "bg-primary/5" : ""}`}
                      >
                        <td className="py-2">
                          <span className="flex items-center gap-2">
                            <span className="text-base leading-none" aria-hidden="true">{flagOf(t.team)}</span>
                            <span className={`truncate ${t.qualified ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                              {t.team}
                            </span>
                            {t.qualified && (
                              <span className="ml-1 rounded bg-positive/15 px-1.5 py-0.5 text-micro font-bold text-positive">
                                Q
                              </span>
                            )}
                          </span>
                        </td>
                        <td className={`text-center ${cell}`}>{t.played ?? 0}</td>
                        <td className={`text-center ${cell}`}>{t.won ?? 0}</td>
                        <td className={`text-center ${cell}`}>{t.drawn ?? 0}</td>
                        <td className={`text-center ${cell}`}>{t.lost ?? 0}</td>
                        <td className={`text-center ${cell}`}>{t.goals_for ?? 0}</td>
                        <td className={`text-center ${cell}`}>{t.goals_against ?? 0}</td>
                        <td className="text-center font-bold text-foreground">{t.points ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Fixtures */}
            {fixtures.length > 0 && (
              <div className="border-t border-border bg-muted/20 px-5 pb-5 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-micro uppercase text-muted-foreground">
                    Fixtures &amp; Results
                  </div>
                  <span className="text-micro italic text-muted-foreground">tap a match for details</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
