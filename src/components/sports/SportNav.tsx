import { Link, useRouterState } from "@tanstack/react-router";
import { Trophy, ShieldCheck, BarChart3 } from "lucide-react";
import { SPORT_LIST } from "@/lib/sports-config";
import { useAuth } from "@/hooks/use-auth";

type Tab = {
  to: string;
  emoji: string;
  label: string;
  /** gradient when active */
  grad: string;
  /** ring/text accent color */
  accent: string;
};

// Players is intentionally NOT in the sport tabs — it's a cross-sport stats
// surface, rendered as a separate chip on the right next to Admin.
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
  const { isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const sportTabs: Tab[] = SPORT_LIST.map((s) => ({
    to: `/${s.slug}`,
    emoji: s.emoji,
    label: s.label,
    grad: SPORT_GRADS[s.slug]?.grad ?? "from-gray-500 to-gray-700",
    accent: SPORT_GRADS[s.slug]?.accent ?? "text-gray-300",
  }));
  const allTabs: Tab[] = [...BASE_TABS, ...sportTabs];

  // Determine current sport context. On a specific sport page, hide other
  // sport tabs so the bar shows just Hub + current sport (+ Player Stats chip).
  const currentSportTab = allTabs.find(
    (t) => t.to !== "/" && (pathname === t.to || pathname.startsWith(t.to + "/")),
  );
  const onHub = pathname === "/";
  const tabs: Tab[] = currentSportTab
    ? [allTabs[0], currentSportTab]
    : allTabs;

  // Player Stats chip is sport-scoped — only on a specific sport page.
  const showStatsChip = !!currentSportTab;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:h-16 sm:py-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        {/* Brand row */}
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="size-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 grid place-items-center ring-1 ring-amber-500/40">
              <Trophy className="size-5 text-black" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wide">Sports Hub</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400">
                Live · Stats · Archive
              </div>
            </div>
          </Link>

          {/* live + players + admin chips, right-aligned on mobile brand row */}
          <div className="flex items-center gap-2 sm:hidden">
            {liveCount > 0 && <LiveChip count={liveCount} />}
            {showStatsChip && <StatsChip pathname={pathname} />}
          </div>

        </div>

        {/* Tabs — single-row horizontal scroll on mobile, inline on desktop */}
        <nav className="-mx-3 sm:mx-0 px-3 sm:px-0 flex sm:flex-nowrap items-center gap-1.5 sm:gap-1 sm:ml-auto overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
          {tabs.map((t) => {
            const active =
              t.to === "/"
                ? pathname === "/"
                : pathname === t.to || pathname.startsWith(t.to + "/");
            return (
              <div key={t.to} className="snap-start shrink-0">
                <NavPill tab={t} active={active} />
              </div>
            );
          })}
        </nav>

        {/* desktop-only chips */}
        <div className="hidden sm:flex items-center gap-2">
          {liveCount > 0 && <LiveChip count={liveCount} />}
          {showStatsChip && <StatsChip pathname={pathname} />}
          {isAdmin && <AdminChip />}
        </div>
      </div>
    </header>
  );
}

function NavPill({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <Link
      to={tab.to}
      aria-current={active ? "page" : undefined}
      className={[
        "tap-target group relative inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all duration-200",
        "px-3 py-1.5 sm:px-3.5 sm:py-1.5",
        active
          ? `bg-gradient-to-r ${tab.grad} text-white shadow-[0_4px_18px_-4px_rgba(0,0,0,0.55)] ring-1 ring-white/15 scale-[1.02]`
          : `bg-white/[0.04] hover:bg-white/[0.08] ${tab.accent} ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-0.5`,
      ].join(" ")}
    >
      <span aria-hidden className="text-sm leading-none">{tab.emoji}</span>
      <span className="tracking-wide">{tab.label}</span>
    </Link>
  );
}

function LiveChip({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 ring-1 ring-red-500/40 text-[10px] font-bold text-red-300">
      <span className="size-1.5 rounded-full bg-red-500 animate-pulse" /> {count} live
    </span>
  );
}

function AdminChip() {
  return (
    <Link
      to="/admin"
      className="px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 ring-1 ring-emerald-500/30 transition-colors inline-flex items-center gap-1"
    >
      <ShieldCheck className="size-3" /> Admin
    </Link>
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
    return {
      to: "/players",
      title: "Player Stats",
      subtitle: "Scorers · Records",
      grad: "from-emerald-500 to-teal-500",
      ring: "ring-emerald-400/40",
      text: "text-emerald-200",
      shadow: "shadow-emerald-500/30",
    };
  }
  if (pathname === "/mlb" || pathname.startsWith("/mlb/")) {
    return {
      to: "/mlb/players",
      title: "Player Stats",
      subtitle: "Leaders · Rosters",
      grad: "from-sky-500 to-blue-600",
      ring: "ring-sky-400/40",
      text: "text-sky-200",
      shadow: "shadow-sky-500/30",
    };
  }
  if (pathname === "/cricket" || pathname.startsWith("/cricket/")) {
    return {
      to: "/players",
      title: "Player Stats",
      subtitle: "Batting · Bowling",
      grad: "from-amber-500 to-emerald-500",
      ring: "ring-amber-400/40",
      text: "text-amber-200",
      shadow: "shadow-amber-500/30",
    };
  }
  return {
    to: "/players",
    title: "Player Stats",
    subtitle: "All sports",
    grad: "from-fuchsia-500 to-purple-500",
    ring: "ring-fuchsia-400/40",
    text: "text-fuchsia-200",
    shadow: "shadow-fuchsia-500/30",
  };
}

function StatsChip({ pathname }: { pathname: string }) {
  const t = resolveStatsTarget(pathname);
  const active = pathname === t.to || pathname.startsWith(t.to + "/");
  return (
    <Link
      to={t.to}
      className={[
        "group relative inline-flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1 transition-all ring-1",
        active
          ? `bg-gradient-to-r ${t.grad} text-white ring-white/20 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.6)] ${t.shadow}`
          : `bg-white/[0.04] hover:bg-white/[0.08] ${t.ring} hover:-translate-y-0.5`,
      ].join(" ")}
    >
      <span
        className={[
          "size-6 rounded-full grid place-items-center bg-gradient-to-br",
          t.grad,
          "ring-1 ring-white/20 shadow-inner",
        ].join(" ")}
      >
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
