import { Link, useLocation } from "@tanstack/react-router";
import {
  Flame,
  CalendarDays,
  Trophy,
  Users,
  User,
  BarChart3,
  Crown,
  ChevronDown,
  Home,
} from "lucide-react";
import { useEffect, useRef, type ComponentType } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "@/components/nav/Breadcrumbs";

type Tab = {
  to: string;
  label: string;
  emoji: string;
  Icon: ComponentType<{ className?: string }>;
  grad: string;
  accent: string;
  match: (p: string) => boolean;
};

const TABS: Tab[] = [
  { to: "/cricket",          label: "Hub",      emoji: "🏏", Icon: Flame,        grad: "from-emerald-500 to-teal-500",  accent: "text-emerald-200", match: (p) => p === "/cricket" || p === "/cricket/" },
  { to: "/cricket/scores",   label: "Scores",   emoji: "🔴", Icon: CalendarDays, grad: "from-rose-500 to-red-500",      accent: "text-rose-200",    match: (p) => p.startsWith("/cricket/scores") },
  { to: "/cricket/series",   label: "Series",   emoji: "🏆", Icon: Trophy,       grad: "from-amber-500 to-orange-500",  accent: "text-amber-200",   match: (p) => p.startsWith("/cricket/series") },
  { to: "/cricket/teams",    label: "Teams",    emoji: "🛡️", Icon: Users,        grad: "from-sky-500 to-blue-600",      accent: "text-sky-200",     match: (p) => p.startsWith("/cricket/teams") },
  { to: "/cricket/players",  label: "Players",  emoji: "👤", Icon: User,         grad: "from-fuchsia-500 to-purple-500",accent: "text-fuchsia-200", match: (p) => p.startsWith("/cricket/players") },
  { to: "/cricket/rankings", label: "Rankings", emoji: "📊", Icon: BarChart3,    grad: "from-indigo-500 to-violet-500", accent: "text-indigo-200",  match: (p) => p.startsWith("/cricket/rankings") },
  { to: "/cricket/records",  label: "Records",  emoji: "📜", Icon: Crown,        grad: "from-yellow-500 to-amber-600",  accent: "text-yellow-200",  match: (p) => p.startsWith("/cricket/records") },
  { to: "/cricket/history",  label: "History",  emoji: "🕰️", Icon: Crown,        grad: "from-stone-500 to-zinc-600",    accent: "text-stone-200",   match: (p) => p.startsWith("/cricket/history") },
];

// Mobile bottom nav is mounted globally via <GlobalMobileNav /> in __root.tsx.

export function CricketSubNav() {
  const { pathname } = useLocation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  // auto-scroll active pill into view on mobile
  useEffect(() => {
    const el = activeRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const elRect = el.getBoundingClientRect();
    const sRect = scroller.getBoundingClientRect();
    if (elRect.left < sRect.left || elRect.right > sRect.right) {
      scroller.scrollTo({
        left: el.offsetLeft - sRect.width / 2 + el.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [pathname]);

  return (
    <>
      <div className="border-b border-border bg-gradient-to-r from-emerald-950/40 via-background to-amber-950/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <div
              ref={scrollerRef}
              className="flex items-center gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-visible [scroll-snap-type:x_mandatory] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Cricket sections"
              role="navigation"
            >
              {TABS.map((t) => {
                const active = t.match(pathname);
                const Icon = t.Icon;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    ref={active ? activeRef : undefined}
                    className={[
                      "shrink-0 snap-start group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold ring-1 transition-all duration-200",
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
            </div>
            {/* fade masks */}
            <div className="pointer-events-none sm:hidden absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none sm:hidden absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
          </div>

          <LeaguesDropdown />
        </div>
        <Breadcrumbs />
      </div>
    </>
  );
}

function LeaguesDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-amber-200 ring-1 ring-amber-400/30 hover:bg-amber-500/25 transition-colors"
        aria-label="Cricket leagues"
      >
        <Trophy className="size-3.5" />
        <span className="hidden xs:inline sm:inline">Leagues</span>
        <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-amber-300">
          T20 Leagues
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/cricket/ipl" className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <span aria-hidden>🇮🇳</span> Indian Premier League
            </span>
            <span className="text-[9px] font-black rounded-full bg-rose-500/20 text-rose-300 px-1.5 py-0.5 ring-1 ring-rose-400/30">
              LIVE
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <span className="flex items-center gap-2 opacity-60"><span>🇦🇺</span> Big Bash League</span>
          <span className="text-[9px] font-black rounded-full bg-white/10 text-white/50 px-1.5 py-0.5">SOON</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <span className="flex items-center gap-2 opacity-60"><span>🇵🇰</span> Pakistan Super League</span>
          <span className="text-[9px] font-black rounded-full bg-white/10 text-white/50 px-1.5 py-0.5">SOON</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <span className="flex items-center gap-2 opacity-60"><span>🌴</span> Caribbean Premier League</span>
          <span className="text-[9px] font-black rounded-full bg-white/10 text-white/50 px-1.5 py-0.5">SOON</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
