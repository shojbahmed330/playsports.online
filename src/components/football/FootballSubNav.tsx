import { Users, Swords, Trophy } from "lucide-react";

export type SubNavTab = "groups" | "knockout" | "scorers";

const TABS: { id: SubNavTab; label: string; icon: React.ReactNode; accent: string }[] = [
  { id: "groups",   label: "Groups",   icon: <Users className="size-4" />,  accent: "from-blue-500 to-cyan-400" },
  { id: "knockout", label: "Knockout", icon: <Swords className="size-4" />, accent: "from-rose-500 to-amber-400" },
  { id: "scorers",  label: "Scorers",  icon: <Trophy className="size-4" />, accent: "from-amber-400 to-yellow-300" },
];

export function FootballSubNav({
  active,
  onChange,
}: {
  active: SubNavTab;
  onChange: (t: SubNavTab) => void;
}) {
  return (
    <div className="sticky top-16 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 backdrop-blur bg-background/85 border-b border-border/60 sm:border-0 sm:bg-transparent sm:backdrop-blur-0">
      <div className="flex justify-center">
        <div
          role="tablist"
          className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-gray-900/80 p-1 shadow-lg overflow-x-auto max-w-full"
        >
          {TABS.map((t) => {
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(t.id)}
                className={`relative shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "text-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${t.accent} shadow-md animate-scale-in`}
                  />
                )}
                <span className="relative inline-flex items-center gap-1.5">
                  {t.icon}
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
