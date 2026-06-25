import { Link, useLocation } from "@tanstack/react-router";
import {
  Flame,
  CalendarDays,
  Trophy,
  Users,
  User,
  BarChart3,
  Crown,
} from "lucide-react";
import type { ComponentType } from "react";

type Tab = {
  to: string;
  label: string;
  emoji: string;
  Icon: ComponentType<{ className?: string }>;
  /** active gradient */
  grad: string;
  /** inactive accent text */
  accent: string;
  match: (p: string) => boolean;
};

const TABS: Tab[] = [
  {
    to: "/cricket",
    label: "Hub",
    emoji: "🏏",
    Icon: Flame,
    grad: "from-emerald-500 to-teal-500",
    accent: "text-emerald-200",
    match: (p) => p === "/cricket" || p === "/cricket/",
  },
  {
    to: "/cricket/scores",
    label: "Scores",
    emoji: "🔴",
    Icon: CalendarDays,
    grad: "from-rose-500 to-red-500",
    accent: "text-rose-200",
    match: (p) => p.startsWith("/cricket/scores"),
  },
  {
    to: "/cricket/series",
    label: "Series",
    emoji: "🏆",
    Icon: Trophy,
    grad: "from-amber-500 to-orange-500",
    accent: "text-amber-200",
    match: (p) => p.startsWith("/cricket/series"),
  },
  {
    to: "/cricket/ipl",
    label: "IPL",
    emoji: "🏆",
    Icon: Trophy,
    grad: "from-amber-400 to-orange-500",
    accent: "text-amber-200",
    match: (p) => p.startsWith("/cricket/ipl"),
  },
  {
    to: "/cricket/teams",
    label: "Teams",
    emoji: "🛡️",
    Icon: Users,
    grad: "from-sky-500 to-blue-600",
    accent: "text-sky-200",
    match: (p) => p.startsWith("/cricket/teams"),
  },
  {
    to: "/cricket/players",
    label: "Players",
    emoji: "👤",
    Icon: User,
    grad: "from-fuchsia-500 to-purple-500",
    accent: "text-fuchsia-200",
    match: (p) => p.startsWith("/cricket/players"),
  },
  {
    to: "/cricket/rankings",
    label: "Rankings",
    emoji: "📊",
    Icon: BarChart3,
    grad: "from-indigo-500 to-violet-500",
    accent: "text-indigo-200",
    match: (p) => p.startsWith("/cricket/rankings"),
  },
  {
    to: "/cricket/records",
    label: "Records",
    emoji: "📜",
    Icon: Crown,
    grad: "from-yellow-500 to-amber-600",
    accent: "text-yellow-200",
    match: (p) => p.startsWith("/cricket/records"),
  },
  {
    to: "/cricket/history",
    label: "History",
    emoji: "🕰️",
    Icon: Crown,
    grad: "from-stone-500 to-zinc-600",
    accent: "text-stone-200",
    match: (p) => p.startsWith("/cricket/history"),
  },
];

export function CricketSubNav() {
  const { pathname } = useLocation();
  return (
    <div className="border-b border-border bg-gradient-to-r from-emerald-950/40 via-background to-amber-950/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        <nav
          className="flex flex-wrap items-center gap-1.5"
          aria-label="Cricket sections"
        >
          {TABS.map((t) => {
            const active = t.match(pathname);
            const Icon = t.Icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={[
                  "group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold ring-1 transition-all duration-200",
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
