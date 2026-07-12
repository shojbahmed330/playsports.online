import { Link, useMatchRoute } from "@tanstack/react-router";
import { Zap, Calendar, Trophy, History, Award, Users, User } from "lucide-react";
import { ChipScroller } from "@/components/ui/ChipScroller";
import type { Competition } from "@/lib/competitions";

/**
 * Sticky sub-nav for a single competition. Renders on every
 * `/football/<comp>/...` route so users can jump between sections without
 * losing scope.
 */
export function CompetitionSubNav({ comp }: { comp: Competition }) {
  const tabs = getTabsFor(comp);
  const matchRoute = useMatchRoute();

  return (
    <div className="sticky top-16 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 backdrop-blur bg-background/85 border-b border-border/60 sm:border-0 sm:bg-transparent sm:backdrop-blur-0">
      <div className="sm:flex sm:justify-center">
        <ChipScroller ariaLabel={`${comp.shortName} sections`} className="sm:inline-block">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-gray-900/80 p-1 shadow-lg">
            {tabs.map((t) => {
              const active = !!matchRoute({ to: t.to, params: { comp: comp.slug } });
              return (
                <Link
                  key={t.id}
                  to={t.to}
                  params={{ comp: comp.slug }}
                  aria-current={active ? "page" : undefined}
                  className={`tap-target relative shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all snap-start ${
                    active
                      ? `${comp.hero.chipAccent} shadow-md`
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </Link>
              );
            })}
          </div>
        </ChipScroller>
      </div>
    </div>
  );
}

type Tab = {
  id: string;
  label: string;
  to:
    | "/football/$comp"
    | "/football/$comp/scores"
    | "/football/$comp/fixtures"
    | "/football/$comp/standings"
    | "/football/$comp/history"
    | "/football/$comp/records"
    | "/football/$comp/teams"
    | "/football/$comp/players";
  icon: React.ReactNode;
};

function getTabsFor(comp: Competition): Tab[] {
  const common: Tab[] = [
    { id: "overview", label: "Overview", to: "/football/$comp", icon: <Zap className="size-4" /> },
    { id: "scores", label: "Scores", to: "/football/$comp/scores", icon: <Zap className="size-4" /> },
    { id: "fixtures", label: "Fixtures", to: "/football/$comp/fixtures", icon: <Calendar className="size-4" /> },
    { id: "standings", label: comp.kind === "league" ? "Table" : "Groups", to: "/football/$comp/standings", icon: <Trophy className="size-4" /> },
    { id: "history", label: "History", to: "/football/$comp/history", icon: <History className="size-4" /> },
    { id: "records", label: "Records", to: "/football/$comp/records", icon: <Award className="size-4" /> },
    { id: "teams", label: comp.kind === "league" ? "Clubs" : "Teams", to: "/football/$comp/teams", icon: <Users className="size-4" /> },
    { id: "players", label: "Players", to: "/football/$comp/players", icon: <User className="size-4" /> },
  ];
  return common;
}
