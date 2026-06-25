import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, BarChart3, Shield, User, Trophy, Crown } from "lucide-react";
import type { ComponentType } from "react";

type Tab = {
  to: string;
  label: string;
  emoji: string;
  Icon: ComponentType<{ className?: string }>;
  grad: string;
  accent: string;
  match: (p: string) => boolean;
};

// Tabs preview future routes; only "Home" is wired in Step 2 — the rest
// resolve to /cricket/ipl for now and will be split into real routes in
// the next steps (scores, standings, teams, players, history, records).
const TABS: Tab[] = [
  { to: "/cricket/ipl", label: "Home",      emoji: "🏠", Icon: Home,        grad: "from-amber-400 to-orange-500", accent: "text-amber-200", match: (p) => p === "/cricket/ipl" || p === "/cricket/ipl/" },
  { to: "/cricket/ipl", label: "Scores",    emoji: "🔴", Icon: CalendarDays, grad: "from-rose-500 to-red-500",     accent: "text-rose-200",  match: (p) => p.startsWith("/cricket/ipl/scores") },
  { to: "/cricket/ipl", label: "Standings", emoji: "📊", Icon: BarChart3,   grad: "from-sky-500 to-blue-600",     accent: "text-sky-200",   match: (p) => p.startsWith("/cricket/ipl/standings") },
  { to: "/cricket/ipl", label: "Teams",     emoji: "🛡️", Icon: Shield,      grad: "from-emerald-500 to-teal-500", accent: "text-emerald-200", match: (p) => p.startsWith("/cricket/ipl/teams") },
  { to: "/cricket/ipl", label: "Players",   emoji: "👤", Icon: User,         grad: "from-fuchsia-500 to-purple-500", accent: "text-fuchsia-200", match: (p) => p.startsWith("/cricket/ipl/players") },
  { to: "/cricket/ipl", label: "History",   emoji: "🏆", Icon: Trophy,      grad: "from-yellow-500 to-amber-600", accent: "text-yellow-200", match: (p) => p.startsWith("/cricket/ipl/history") },
  { to: "/cricket/ipl", label: "Records",   emoji: "👑", Icon: Crown,       grad: "from-indigo-500 to-violet-500", accent: "text-indigo-200", match: (p) => p.startsWith("/cricket/ipl/records") },
];

export function IplSubNav() {
  const { pathname } = useLocation();
  return (
    <div className="border-b border-white/5 bg-gradient-to-r from-amber-950/30 via-background to-violet-950/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <nav
          className="flex gap-1.5 overflow-x-auto ipl-snap-nav sm:flex-wrap sm:overflow-visible"
          aria-label="IPL sections"
        >
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.Icon;
            return (
              <Link
                key={t.label}
                to={t.to}
                className={[
                  "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold ring-1 transition-all duration-200",
                  active
                    ? `bg-gradient-to-r ${t.grad} text-white ring-white/15 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)] scale-[1.02]`
                    : `bg-white/[0.04] hover:bg-white/[0.09] ${t.accent} ring-white/10 hover:ring-white/20 hover:-translate-y-0.5`,
                ].join(" ")}
              >
                <span aria-hidden className="text-sm leading-none">{t.emoji}</span>
                <Icon className="size-3.5 hidden sm:inline-block" />
                <span className="tracking-wide">{t.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
