import { Zap, Users, Swords, Trophy } from "lucide-react";
import { ChipScroller } from "@/components/ui/ChipScroller";

export type SubNavTab = "today" | "groups" | "knockout" | "scorers";

const TABS: { id: SubNavTab; label: string; icon: React.ReactNode; accent: string }[] = [
  { id: "today",    label: "Today",    icon: <Zap className="size-4" />,     accent: "from-red-500 to-orange-400" },
  { id: "groups",   label: "Groups",   icon: <Users className="size-4" />,   accent: "from-blue-500 to-cyan-400" },
  { id: "knockout", label: "Knockout", icon: <Swords className="size-4" />,  accent: "from-rose-500 to-amber-400" },
  { id: "scorers",  label: "Scorers",  icon: <Trophy className="size-4" />,  accent: "from-amber-400 to-yellow-300" },
];

export interface SubNavBadges {
  today?: { count: number; live?: boolean; label?: string };
  groups?: { count: number; live?: boolean; label?: string };
  knockout?: { count: number; live?: boolean; label?: string };
  scorers?: { count: number; label?: string };
}

export function FootballSubNav({
  active,
  onChange,
  badges,
}: {
  active: SubNavTab;
  onChange: (t: SubNavTab) => void;
  badges?: SubNavBadges;
}) {
  return (
    <div className="sticky top-16 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 backdrop-blur bg-background/85 border-b border-border/60 sm:border-0 sm:bg-transparent sm:backdrop-blur-0">
      <div className="sm:flex sm:justify-center">
        <ChipScroller ariaLabel="Football sections" className="sm:inline-block">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-gray-900/80 p-1 shadow-lg">
            {TABS.map((t) => {
              const isActive = active === t.id;
              const badge = badges?.[t.id];
              const isLive = !!(badge && "live" in badge && badge.live);
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onChange(t.id)}
                  className={`tap-target relative shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all snap-start ${
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
                    {badge && badge.count > 0 && (
                      <span
                        title={badge.label}
                        className={`inline-flex items-center gap-1 rounded-full px-1.5 text-[10px] font-bold tabular-nums leading-none py-0.5 ${
                          isActive
                            ? "bg-black/25 text-black"
                            : isLive
                              ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/40"
                              : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {isLive && !isActive && (
                          <span className="relative inline-flex items-center justify-center">
                            <span className="absolute size-2 rounded-full bg-red-500/60 animate-ping" />
                            <span className="relative size-1 rounded-full bg-red-500" />
                          </span>
                        )}
                        {badge.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </ChipScroller>
      </div>
    </div>
  );
}
