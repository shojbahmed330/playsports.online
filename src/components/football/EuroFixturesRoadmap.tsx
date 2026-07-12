import { CheckCircle2, Circle, Dot, Trophy, Flag, Users, Swords } from "lucide-react";

type Step = {
  key: string;
  label: string;
  date: string;
  startIso: string;
  endIso?: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  { key: "draw", label: "Qualifying draw", date: "Dec 2026", startIso: "2026-12-13T00:00:00Z", icon: <Dot className="size-4" /> },
  { key: "quals", label: "Qualifiers begin", date: "Mar 2027", startIso: "2027-03-01T00:00:00Z", endIso: "2027-11-30T23:59:59Z", icon: <Users className="size-4" /> },
  { key: "group", label: "Group stage", date: "Jun–Nov 2027", startIso: "2027-06-01T00:00:00Z", endIso: "2027-11-30T23:59:59Z", icon: <Flag className="size-4" /> },
  { key: "playoffs", label: "Play-offs", date: "Mar 2028", startIso: "2028-03-23T00:00:00Z", endIso: "2028-03-31T23:59:59Z", icon: <Swords className="size-4" /> },
  { key: "opener", label: "Opener", date: "9 Jun 2028", startIso: "2028-06-09T19:00:00Z", endIso: "2028-06-09T22:00:00Z", icon: <Flag className="size-4" /> },
  { key: "final", label: "Final", date: "9 Jul 2028", startIso: "2028-07-09T19:00:00Z", endIso: "2028-07-09T22:00:00Z", icon: <Trophy className="size-4" /> },
];

/**
 * Horizontal timeline of Euro 2028 milestones. Active step is highlighted;
 * completed steps show a check.
 */
export function EuroFixturesRoadmap() {
  const now = Date.now();
  const activeIdx = (() => {
    for (let i = 0; i < STEPS.length; i++) {
      const start = new Date(STEPS[i].startIso).getTime();
      const end = STEPS[i].endIso ? new Date(STEPS[i].endIso!).getTime() : start;
      if (now >= start && now <= end) return i;
      if (now < start) return i; // upcoming — mark as active target
    }
    return STEPS.length - 1;
  })();

  return (
    <section className="mb-4 sm:mb-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        Roadmap to Euro 2028
      </div>
      <ol className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
        {STEPS.map((s, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <li
              key={s.key}
              className={`snap-start shrink-0 min-w-[150px] sm:min-w-[160px] rounded-2xl border px-3 py-2.5 transition ${
                active
                  ? "border-primary/50 bg-primary/[0.08]"
                  : done
                    ? "border-emerald-500/25 bg-emerald-500/[0.05]"
                    : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                {done ? (
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                ) : active ? (
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                ) : (
                  <Circle className="size-3 text-muted-foreground/60" />
                )}
                {s.date}
              </div>
              <div className={`mt-1 flex items-center gap-1.5 text-sm font-bold ${active ? "text-foreground" : "text-foreground/90"}`}>
                <span className="text-muted-foreground/80">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
