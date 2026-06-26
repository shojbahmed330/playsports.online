import { Link, useLocation } from "@tanstack/react-router";
import { Calendar, Trophy, Users, BarChart3, Newspaper, History, Home, ListOrdered } from "lucide-react";
import { useEffect, useRef } from "react";

const TABS = [
  { to: "/mlb",            label: "Today",      icon: Home,        exact: true  as boolean },
  { to: "/mlb/scores",     label: "Scores",     icon: Calendar,    exact: false as boolean },
  { to: "/mlb/standings",  label: "Standings",  icon: ListOrdered, exact: false as boolean },
  { to: "/mlb/postseason", label: "Postseason", icon: Trophy,      exact: false as boolean },
  { to: "/mlb/teams",      label: "Teams",      icon: Users,       exact: false as boolean },
  { to: "/mlb/players",    label: "Leaders",    icon: BarChart3,   exact: false as boolean },
  { to: "/mlb/history",    label: "History",    icon: History,     exact: false as boolean },
  { to: "/mlb/news",       label: "News",       icon: Newspaper,   exact: false as boolean },
] as const;

export function MlbSubNav() {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = activeRef.current;
    const nav = navRef.current;
    if (!el || !nav) return;
    const left = el.offsetLeft - nav.clientWidth / 2 + el.clientWidth / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="border-b border-border bg-gradient-to-r from-[#001a44]/80 via-background to-[#8c0020]/40 sticky top-16 z-20 backdrop-blur">
      <div className="relative max-w-7xl mx-auto px-2 sm:px-6">
        {/* edge fades */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent sm:hidden" />
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent sm:hidden" />
        <nav
          ref={navRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 scroll-smooth"
          aria-label="MLB sections"
        >
          {TABS.map((t) => {
            const active = t.exact ? (pathname === t.to || pathname === t.to + "/") : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                ref={active ? activeRef : undefined}
                aria-current={active ? "page" : undefined}
                className={[
                  "tap-target snap-start shrink-0 inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full text-[11px] sm:text-xs font-bold ring-1 transition-all active:scale-95",
                  active
                    ? "bg-gradient-to-r from-[#002d72] to-[#d50032] text-white ring-[#f7e6c4]/40 shadow-[0_4px_20px_-6px_rgba(213,0,50,0.7)] scale-[1.02]"
                    : "bg-white/[0.04] hover:bg-white/[0.09] ring-white/10 hover:ring-white/25 text-gray-200",
                ].join(" ")}
              >
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
