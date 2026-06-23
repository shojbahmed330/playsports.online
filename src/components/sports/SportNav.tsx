import { Link, useRouterState } from "@tanstack/react-router";
import { Trophy, ShieldCheck } from "lucide-react";
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

const BASE_TABS: Tab[] = [
  { to: "/",         emoji: "🏆", label: "Hub",      grad: "from-amber-500 to-orange-500",   accent: "text-amber-300" },
  { to: "/football", emoji: "⚽", label: "Football", grad: "from-emerald-500 to-teal-500",   accent: "text-emerald-300" },
  { to: "/players",  emoji: "👤", label: "Players",  grad: "from-fuchsia-500 to-purple-500", accent: "text-fuchsia-300" },
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
  const tabs: Tab[] = [...BASE_TABS, ...sportTabs];

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

          {/* live + admin chips, right-aligned on mobile brand row */}
          <div className="flex items-center gap-2 sm:hidden">
            {liveCount > 0 && <LiveChip count={liveCount} />}
            {isAdmin && <AdminChip />}
          </div>
        </div>

        {/* Tabs — wrap on mobile (no horizontal scroll), inline on desktop */}
        <nav className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-1 sm:ml-auto">
          {tabs.map((t) => {
            const active =
              t.to === "/"
                ? pathname === "/"
                : pathname === t.to || pathname.startsWith(t.to + "/");
            return <NavPill key={t.to} tab={t} active={active} />;
          })}
        </nav>

        {/* desktop-only chips */}
        <div className="hidden sm:flex items-center gap-2">
          {liveCount > 0 && <LiveChip count={liveCount} />}
          {isAdmin && <AdminChip />}
        </div>
      </div>
    </header>
  );
}

function NavPill({ tab, active }: { tab: Tab; active: boolean }) {
  return (
    <a
      href={tab.to}
      className={[
        "group relative inline-flex items-center gap-1.5 rounded-full text-xs font-bold transition-all duration-200",
        "px-3 py-1.5 sm:px-3.5 sm:py-1.5",
        active
          ? `bg-gradient-to-r ${tab.grad} text-white shadow-[0_4px_18px_-4px_rgba(0,0,0,0.55)] ring-1 ring-white/15 scale-[1.02]`
          : `bg-white/[0.04] hover:bg-white/[0.08] ${tab.accent} ring-1 ring-white/10 hover:ring-white/20 hover:-translate-y-0.5`,
      ].join(" ")}
    >
      <span aria-hidden className="text-sm leading-none">{tab.emoji}</span>
      <span className="tracking-wide">{tab.label}</span>
    </a>
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
