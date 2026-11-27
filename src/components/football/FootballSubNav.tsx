import { Zap, Users, Swords, Trophy, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ChipScroller } from "@/components/ui/ChipScroller";

export type SubNavTab = "today" | "groups" | "knockout" | "scorers";

const TABS: { id: SubNavTab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Today", icon: <Zap className="size-4" aria-hidden="true" /> },
  { id: "groups", label: "Groups", icon: <Users className="size-4" aria-hidden="true" /> },
  { id: "knockout", label: "Knockout", icon: <Swords className="size-4" aria-hidden="true" /> },
  { id: "scorers", label: "Scorers", icon: <Trophy className="size-4" aria-hidden="true" /> },
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
    <div className="sticky top-16 z-20 -mx-4 border-b border-border/60 bg-background/85 px-4 py-2 backdrop-blur sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:backdrop-blur-0">
      <div className="sm:flex sm:justify-center">
        <ChipScroller ariaLabel="Football sections" className="sm:inline-block">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-border bg-card/80 p-1 shadow-[var(--shadow-elevated)]">
            {TABS.map((t) => {
              const isActive = active === t.id;
              const badge = badges?.[t.id];
              const isLive = !!(badge && "live" in badge && badge.live);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    onChange(t.id);
                    if (typeof window !== "undefined" && window.innerWidth < 640) {
                      const targetId = t.id === "scorers" ? "scorers" : "fixtures";
                      requestAnimationFrame(() => {
                        setTimeout(() => {
                          const el = document.getElementById(targetId);
                          if (!el) return;
                          const y = el.getBoundingClientRect().top + window.scrollY - 120;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }, 80);
                      });
                    }
                  }}
                  className={`tap-target relative inline-flex shrink-0 snap-start items-center justify-center gap-1.5 rounded-xl px-3 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4 ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span className="relative inline-flex items-center gap-1.5">
                    {t.icon}
                    {t.label}
                    {badge && badge.count > 0 && (
                      <span
                        title={badge.label}
                        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-micro font-bold leading-none tabular-nums ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : isLive
                              ? "bg-live/15 text-live ring-1 ring-live/40"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isLive && !isActive && (
                          <span className="relative inline-flex items-center justify-center" aria-hidden="true">
                            <span className="absolute size-2 rounded-full bg-live/60 animate-ping motion-reduce:animate-none" />
                            <span className="relative size-1 rounded-full bg-live" />
                          </span>
                        )}
                        {badge.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
            <Link
              to="/mine"
              className="tap-target inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 text-caption font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-4"
              aria-label="My starred teams"
            >
              <Star className="size-4" aria-hidden="true" /> Mine
            </Link>
          </div>
        </ChipScroller>
      </div>
    </div>
  );
}
