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
  { key: "host", label: "Host confirmation", date: "2027", startIso: "2027-06-01T00:00:00Z", icon: <Dot className="size-4" /> },
  { key: "quals", label: "CONMEBOL qualifiers", date: "Ongoing (WC path)", startIso: "2023-09-01T00:00:00Z", endIso: "2025-09-30T23:59:59Z", icon: <Users className="size-4" /> },
  { key: "draw", label: "Copa 2028 draw", date: "Feb 2028", startIso: "2028-02-01T00:00:00Z", endIso: "2028-02-28T23:59:59Z", icon: <Dot className="size-4" /> },
  { key: "group", label: "Group stage", date: "Jun 2028", startIso: "2028-06-11T00:00:00Z", endIso: "2028-06-24T23:59:59Z", icon: <Flag className="size-4" /> },
  { key: "qf", label: "Quarter-finals", date: "Jun–Jul 2028", startIso: "2028-06-28T00:00:00Z", endIso: "2028-07-02T23:59:59Z", icon: <Swords className="size-4" /> },
  { key: "sf", label: "Semi-finals", date: "Jul 2028", startIso: "2028-07-04T00:00:00Z", endIso: "2028-07-06T23:59:59Z", icon: <Swords className="size-4" /> },
  { key: "final", label: "Final", date: "9 Jul 2028", startIso: "2028-07-09T19:00:00Z", endIso: "2028-07-09T23:59:59Z", icon: <Trophy className="size-4" /> },
];

/** Horizontal timeline of Copa 2028 milestones. */
export function CopaFixturesRoadmap() {
  const now = Date.now();
  const activeIdx = (() => {
    for (let i = 0; i < STEPS.length; i++) {
      const start = new Date(STEPS[i].startIso).getTime();
      const end = STEPS[i].endIso ? new Date(STEPS[i].endIso!).getTime() : start;
      if (now >= start && now <= end) return i;
      if (now < start) return i;
    }
    return STEPS.length - 1;
  })();

  return (
    <section className="mb-4 sm:mb-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
        Roadmap to Copa 2028
      </div>
      <ol className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1">
        {STEPS.map((s, i) => {
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <li
              key={s.key}
              className={`snap-start shrink-0 w-[62vw] max-w-[220px] rounded-2xl border p-3 transition ${
                active
                  ? "border-amber-400/60 bg-amber-400/[0.08]"
                  : done
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`shrink-0 ${active ? "text-amber-300" : done ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {done ? <CheckCircle2 className="size-4" /> : active ? s.icon : <Circle className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold truncate">{s.label}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{s.date}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
