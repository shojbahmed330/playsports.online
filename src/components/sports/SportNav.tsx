import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Trophy, BarChart3, ChevronDown, Check, Search } from "lucide-react";
import { SPORT_LIST } from "@/lib/sports-config";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type Tab = {
  to: string;
  emoji: string;
  label: string;
  grad: string;
  accent: string;
};

const BASE_TABS: Tab[] = [
  { to: "/",         emoji: "🏆", label: "Hub",      grad: "from-amber-500 to-orange-500",   accent: "text-amber-300" },
  { to: "/football", emoji: "⚽", label: "Football", grad: "from-emerald-500 to-teal-500",   accent: "text-emerald-300" },
  { to: "/cricket",  emoji: "🏏", label: "Cricket",  grad: "from-emerald-500 to-amber-500",  accent: "text-emerald-200" },
];

const SPORT_GRADS: Record<string, { grad: string; accent: string }> = {
  mlb: { grad: "from-sky-500 to-blue-600",      accent: "text-sky-300" },
  nba: { grad: "from-orange-500 to-red-500",    accent: "text-orange-300" },
  nhl: { grad: "from-cyan-400 to-blue-500",     accent: "text-cyan-300" },
  mls: { grad: "from-emerald-500 to-lime-500",  accent: "text-emerald-300" },
};

export function SportNav({ liveCount = 0 }: { liveCount?: number }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);


  const sportTabs: Tab[] = SPORT_LIST.map((s) => ({
    to: `/${s.slug}`,
    emoji: s.emoji,
    label: s.label,
    grad: SPORT_GRADS[s.slug]?.grad ?? "from-gray-500 to-gray-700",
    accent: SPORT_GRADS[s.slug]?.accent ?? "text-gray-300",
  }));
  const allTabs: Tab[] = [...BASE_TABS, ...sportTabs];

  const current =
    allTabs.find((t) => t.to !== "/" && (pathname === t.to || pathname.startsWith(t.to + "/"))) ??
    allTabs[0];

  const showStatsChip = current.to !== "/";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="size-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 grid place-items-center ring-1 ring-amber-500/40">
            <Trophy className="size-5 text-black" />
          </div>
          <div className="leading-tight hidden xs:block sm:block">
            <div className="text-sm font-bold tracking-wide">PlaySports</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400">
              Cricket · Football
            </div>
          </div>
        </Link>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-0.5 ml-4">
          <HeaderLink to="/live/today" label="Live" pathname={pathname} />
          <HeaderLink to="/cricket" label="Cricket" pathname={pathname} />
          <HeaderLink to="/football" label="Football" pathname={pathname} />
          <HeaderLink to="/football/world-cup" label="World Cup" pathname={pathname} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/search"
            aria-label="Search PlaySports"
            className="grid size-9 place-items-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors hover:text-foreground hover:bg-card"
          >
            <Search className="size-4" />
          </Link>
          <SportDropdown current={current} tabs={allTabs} pathname={pathname} />
          {mounted && liveCount > 0 && <LiveChip count={liveCount} />}
          {showStatsChip && <StatsChip pathname={pathname} />}
        </div>
      </div>
    </header>
  );
}

function HeaderLink({
  to,
  label,
  pathname,
}: {
  to: string;
  label: string;
  pathname: string;
}) {
  const active =
    pathname === to ||
    pathname.startsWith(to + "/") ||
    (to === "/live/today" && pathname.startsWith("/live"));
  return (
    <Link
      to={to}
      className={[
        "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-white/[0.08] text-foreground"
          : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function SportDropdown({
  current,
  tabs,
  pathname,
}: {
  current: Tab;
  tabs: Tab[];
  pathname: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={[
            "group inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-xs font-bold transition-all",
            "bg-gradient-to-r", current.grad,
            "text-white ring-1 ring-white/20 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.7)] hover:brightness-110 hover:-translate-y-0.5",
          ].join(" ")}
          aria-label="Switch sport"
        >
          <span className="size-7 rounded-full grid place-items-center bg-black/25 backdrop-blur-sm ring-1 ring-white/25 text-base leading-none">
            {current.emoji}
          </span>
          <span className="tracking-wide max-w-[100px] truncate">{current.label}</span>
          <ChevronDown className="size-3.5 opacity-90 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/50 p-2"
      >
        <DropdownMenuLabel className="px-2 pt-1 pb-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Switch sport
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <div className="pt-1 space-y-0.5">
          {tabs.map((t) => {
            const active =
              t.to === "/"
                ? pathname === "/"
                : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <DropdownMenuItem
                key={t.to}
                asChild
                className="p-0 focus:bg-transparent data-[highlighted]:bg-transparent"
              >
                <Link
                  to={t.to}
                  className={[
                    "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold transition-all cursor-pointer w-full",
                    active
                      ? `bg-gradient-to-r ${t.grad} text-white ring-1 ring-white/15 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)]`
                      : "text-foreground hover:bg-white/[0.06] ring-1 ring-transparent hover:ring-white/10",
                  ].join(" ")}
                >
                  <span className={[
                    "size-8 rounded-lg grid place-items-center text-base leading-none ring-1",
                    active ? "bg-black/25 ring-white/25" : `bg-gradient-to-br ${t.grad} ring-white/10 shadow-inner`,
                  ].join(" ")}>
                    {t.emoji}
                  </span>
                  <span className="flex-1 tracking-wide">{t.label}</span>
                  {active && <Check className="size-4 opacity-90" />}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LiveChip({ count }: { count: number }) {
  return (
    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
      <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> {count} live
    </span>
  );
}

type StatsTarget = {
  to: string;
  title: string;
  subtitle: string;
  grad: string;
  ring: string;
  text: string;
  shadow: string;
};

function resolveStatsTarget(pathname: string): StatsTarget {
  if (pathname === "/football" || pathname.startsWith("/football/")) {
    return { to: "/players", title: "Player Stats", subtitle: "Scorers · Records", grad: "from-emerald-500 to-teal-500", ring: "ring-emerald-400/40", text: "text-emerald-200", shadow: "shadow-emerald-500/30" };
  }
  if (pathname === "/mlb" || pathname.startsWith("/mlb/")) {
    return { to: "/mlb/players", title: "Player Stats", subtitle: "Leaders · Rosters", grad: "from-sky-500 to-blue-600", ring: "ring-sky-400/40", text: "text-sky-200", shadow: "shadow-sky-500/30" };
  }
  if (pathname === "/cricket" || pathname.startsWith("/cricket/")) {
    return { to: "/players", title: "Player Stats", subtitle: "Batting · Bowling", grad: "from-amber-500 to-emerald-500", ring: "ring-amber-400/40", text: "text-amber-200", shadow: "shadow-amber-500/30" };
  }
  return { to: "/players", title: "Player Stats", subtitle: "All sports", grad: "from-fuchsia-500 to-purple-500", ring: "ring-fuchsia-400/40", text: "text-fuchsia-200", shadow: "shadow-fuchsia-500/30" };
}

function StatsChip({ pathname }: { pathname: string }) {
  const t = resolveStatsTarget(pathname);
  const active = pathname === t.to || pathname.startsWith(t.to + "/");
  return (
    <Link
      to={t.to}
      className={[
        "hidden md:inline-flex group relative items-center gap-2 rounded-full pl-1.5 pr-3 py-1 transition-all ring-1",
        active
          ? `bg-gradient-to-r ${t.grad} text-white ring-white/20 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)] ${t.shadow}`
          : `bg-white/[0.04] hover:bg-white/[0.08] ${t.ring} hover:-translate-y-0.5`,
      ].join(" ")}
    >
      <span className={["size-6 rounded-full grid place-items-center bg-gradient-to-br", t.grad, "ring-1 ring-white/20 shadow-inner"].join(" ")}>
        <BarChart3 className="size-3.5 text-white" />
      </span>
      <span className="leading-tight text-left">
        <span className={["block text-[10px] font-extrabold tracking-wide", active ? "text-white" : t.text].join(" ")}>
          {t.title}
        </span>
        <span className={["block text-[8px] uppercase tracking-[0.18em]", active ? "text-white/80" : "text-muted-foreground"].join(" ")}>
          {t.subtitle}
        </span>
      </span>
    </Link>
  );
}
