import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  PLAYER_TABS,
  type PlayerTab,
} from "@/lib/players-filters";
import {
  BarChart3,
  Trophy,
  ShieldAlert,
  Globe2,
  Crown,
  GitCompareArrows,
  Sparkles,
} from "lucide-react";

const META: Record<PlayerTab, { label: string; icon: typeof Trophy }> = {
  overview: { label: "Overview", icon: BarChart3 },
  scorers: { label: "Top Scorers", icon: Trophy },
  discipline: { label: "Discipline", icon: ShieldAlert },
  countries: { label: "Countries", icon: Globe2 },
  rankings: { label: "Rankings", icon: Crown },
  compare: { label: "Compare", icon: GitCompareArrows },
  records: { label: "Records", icon: Sparkles },
};

export function PlayerSubNav() {
  const search = useSearch({ from: "/players" });
  const navigate = useNavigate({ from: "/players" });
  const active = search.tab;

  return (
    <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-border bg-background/85 backdrop-blur">
      <nav
        className="flex gap-1 overflow-x-auto snap-x scrollbar-none py-2"
        style={{ scrollbarWidth: "none" }}
      >
        {PLAYER_TABS.map((t) => {
          const M = META[t];
          const Icon = M.icon;
          const isActive = active === t;
          return (
            <button
              key={t}
              onClick={() =>
                navigate({
                  search: (prev) => ({ ...prev, tab: t }),
                  replace: true,
                })
              }
              className={`snap-start inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 h-10 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-gold text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="size-3.5" />
              {M.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Kept as a Link helper for breadcrumbs if needed elsewhere.
export { Link };
