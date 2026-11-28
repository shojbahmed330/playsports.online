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
  {
    to: "/cricket",
    label: "Hub",
    emoji: "🏏",
    Icon: Flame,
    grad: "from-[var(--color-accent-cricket)] to-[var(--color-accent-cricket)]",
    accent: "text-[var(--color-accent-cricket)]",
    match: (p) => p === "/cricket" || p === "/cricket/",
  },
  {
    to: "/cricket/scores",
    label: "Scores",
    emoji: "🔴",
    Icon: CalendarDays,
    grad: "from-[var(--color-live)] to-[var(--color-live)]",
    accent: "text-[var(--color-live)]",
    match: (p) => p.startsWith("/cricket/scores"),
  },
  {
    to: "/cricket/series",
    label: "Series",
    emoji: "🏆",
    Icon: Trophy,
    grad: "from-[var(--color-gold)] to-[var(--color-gold)]",
    accent: "text-[var(--color-gold)]",
    match: (p) => p.startsWith("/cricket/series"),
  },
  {
    to: "/cricket/teams",
    label: "Teams",
    emoji: "🛡️",
    Icon: Users,
    grad: "from-[var(--color-accent-mlb)] to-[var(--color-accent-mlb)]",
    accent: "text-[var(--color-accent-mlb)]",
    match: (p) => p.startsWith("/cricket/teams"),
  },
  {
    to: "/cricket/players",
    label: "Players",
    emoji: "👤",
    Icon: User,
    grad: "from-[var(--color-accent-nhl)] to-[var(--color-accent-nhl)]",
    accent: "text-[var(--color-accent-nhl)]",
    match: (p) => p.startsWith("/cricket/players"),
  },
  {
    to: "/cricket/rankings",
    label: "Rankings",
    emoji: "📊",
    Icon: BarChart3,
    grad: "from-[var(--color-accent-nhl)] to-[var(--color-accent-nhl)]",
    accent: "text-[var(--color-accent-nhl)]",
    match: (p) => p.startsWith("/cricket/rankings"),
  },
  {
    to: "/cricket/records",
    label: "Records",
    emoji: "📜",
    Icon: Crown,
    grad: "from-[var(--color-gold)] to-[var(--color-gold)]",
    accent: "text-[var(--color-gold)]",
    match: (p) => p.startsWith("/cricket/records"),
  },
  {
    to: "/cricket/history",
    label: "History",
    emoji: "🕰️",
    Icon: Crown,
    grad: "from-background to-background",
    accent: "text-foreground",
    match: (p) => p.startsWith("/cricket/history"),
  },
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
      <div className="border-b border-border bg-gradient-to-r from-[var(--color-accent-cricket)]/40 via-background to-[var(--color-gold)]/30">
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
                    aria-current={active ? "page" : undefined}
                    className={[
                      "tap-target shrink-0 snap-start group inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold ring-1 transition-all duration-200",
                      active
                        ? `bg-gradient-to-r ${t.grad} text-foreground ring-border shadow-[0_6px_18px_-6px_rgba(0,0,0,0.55)] scale-[1.02]`
                        : `bg-muted hover:bg-muted ${t.accent} ring-border hover:ring-border hover:-translate-y-0.5`,
                    ].join(" ")}
                  >
                    <span aria-hidden className="text-sm leading-none">
                      {t.emoji}
                    </span>
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
        className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[var(--color-gold)]/15 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/30 hover:bg-[var(--color-gold)]/25 transition-colors"
        aria-label="Cricket leagues"
      >
        <Trophy className="size-3.5" />
        <span className="hidden xs:inline sm:inline">Leagues</span>
        <ChevronDown className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-gold)]">
          T20 Leagues
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/cricket/ipl" className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <span aria-hidden>🇮🇳</span> Indian Premier League
            </span>
            <span className="text-[9px] font-black rounded-full bg-[var(--color-live)]/20 text-[var(--color-live)] px-1.5 py-0.5 ring-1 ring-[var(--color-live)]/30">
              LIVE
            </span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <span className="flex items-center gap-2 opacity-60">
            <span>🇦🇺</span> Big Bash League
          </span>
          <span className="text-[9px] font-black rounded-full bg-muted text-foreground px-1.5 py-0.5">
            SOON
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <span className="flex items-center gap-2 opacity-60">
            <span>🇵🇰</span> Pakistan Super League
          </span>
          <span className="text-[9px] font-black rounded-full bg-muted text-foreground px-1.5 py-0.5">
            SOON
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="flex items-center justify-between">
          <span className="flex items-center gap-2 opacity-60">
            <span>🌴</span> Caribbean Premier League
          </span>
          <span className="text-[9px] font-black rounded-full bg-muted text-foreground px-1.5 py-0.5">
            SOON
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
