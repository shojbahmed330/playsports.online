import { Link, useLocation } from "@tanstack/react-router";
import { Flame, Trophy, Users, BarChart3 } from "lucide-react";

const TABS = [
  { to: "/cricket", label: "Live & Fixtures", emoji: "🏏", icon: Flame, match: (p: string) => p === "/cricket" || p === "/cricket/" },
  { to: "/cricket/history", label: "History & Records", emoji: "🏆", icon: Trophy, match: (p: string) => p.startsWith("/cricket/history") },
] as const;
void Users;
void BarChart3;

export function CricketSubNav() {
  const { pathname } = useLocation();
  return (
    <div className="border-b border-border bg-gradient-to-r from-emerald-950/40 via-background to-amber-950/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <nav
          className="flex items-center gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2"
          aria-label="Cricket sections"
        >
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={[
                  "snap-start shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold ring-1 transition-all",
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-amber-500 text-black ring-amber-300 shadow-[0_4px_20px_-6px_rgba(245,158,11,0.55)]"
                    : "bg-white/[0.04] hover:bg-white/[0.09] ring-white/10 hover:ring-white/20 text-gray-200",
                ].join(" ")}
              >
                <span aria-hidden>{t.emoji}</span>
                <Icon className="size-3.5" />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
