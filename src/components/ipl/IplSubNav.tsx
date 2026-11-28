import { Link, useLocation } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  BarChart3,
  Shield,
  User,
  Trophy,
  Crown,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useRef, type ComponentType } from "react";
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
    to: "/cricket/ipl",
    label: "Home",
    emoji: "🏠",
    Icon: Home,
    grad: "from-[var(--color-gold)] to-[var(--color-gold)]",
    accent: "text-[var(--color-gold)]",
    match: (p) => p === "/cricket/ipl" || p === "/cricket/ipl/",
  },
  {
    to: "/cricket/ipl/scores",
    label: "Scores",
    emoji: "🔴",
    Icon: CalendarDays,
    grad: "from-[var(--color-live)] to-[var(--color-live)]",
    accent: "text-[var(--color-live)]",
    match: (p) => p.startsWith("/cricket/ipl/scores"),
  },
  {
    to: "/cricket/ipl/standings",
    label: "Standings",
    emoji: "📊",
    Icon: BarChart3,
    grad: "from-[var(--color-accent-mlb)] to-[var(--color-accent-mlb)]",
    accent: "text-[var(--color-accent-mlb)]",
    match: (p) => p.startsWith("/cricket/ipl/standings"),
  },
  {
    to: "/cricket/ipl/teams",
    label: "Teams",
    emoji: "🛡️",
    Icon: Shield,
    grad: "from-[var(--color-accent-cricket)] to-[var(--color-accent-cricket)]",
    accent: "text-[var(--color-accent-cricket)]",
    match: (p) => p.startsWith("/cricket/ipl/teams"),
  },
  {
    to: "/cricket/ipl/players",
    label: "Players",
    emoji: "👤",
    Icon: User,
    grad: "from-[var(--color-accent-nhl)] to-[var(--color-accent-nhl)]",
    accent: "text-[var(--color-accent-nhl)]",
    match: (p) => p.startsWith("/cricket/ipl/players"),
  },
  {
    to: "/cricket/ipl/history",
    label: "History",
    emoji: "🏆",
    Icon: Trophy,
    grad: "from-[var(--color-gold)] to-[var(--color-gold)]",
    accent: "text-[var(--color-gold)]",
    match: (p) => p.startsWith("/cricket/ipl/history"),
  },
  {
    to: "/cricket/ipl/records",
    label: "Records",
    emoji: "👑",
    Icon: Crown,
    grad: "from-[var(--color-accent-nhl)] to-[var(--color-accent-nhl)]",
    accent: "text-[var(--color-accent-nhl)]",
    match: (p) => p.startsWith("/cricket/ipl/records"),
  },
];

// Mobile bottom nav is mounted globally via <GlobalMobileNav /> in __root.tsx.

export function IplSubNav() {
  const { pathname } = useLocation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

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
      <div className="border-b border-border bg-gradient-to-r from-[var(--color-gold)]/30 via-background to-[var(--color-accent-nhl)]/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center gap-2">
          <Link
            to="/cricket"
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-[11px] font-bold text-[var(--color-accent-cricket)] ring-1 ring-[var(--color-accent-cricket)]/25 hover:bg-[var(--color-accent-cricket)]/15 transition-colors"
            aria-label="Back to Cricket"
          >
            <ChevronLeft className="size-3.5" />
            <span className="hidden sm:inline">Cricket</span>
          </Link>
          <div className="relative flex-1 min-w-0">
            <div
              ref={scrollerRef}
              className="flex gap-1.5 overflow-x-auto sm:flex-wrap sm:overflow-visible [scroll-snap-type:x_mandatory] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="IPL sections"
              role="navigation"
            >
              {TABS.map((t) => {
                const active = t.match(pathname);
                const Icon = t.Icon;
                return (
                  <Link
                    key={t.label}
                    to={t.to}
                    ref={active ? activeRef : undefined}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "tap-target shrink-0 snap-start inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:text-xs font-bold ring-1 transition-all duration-200",
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
            <div className="pointer-events-none sm:hidden absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none sm:hidden absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent" />
          </div>
        </div>
        <Breadcrumbs />
      </div>
    </>
  );
}
