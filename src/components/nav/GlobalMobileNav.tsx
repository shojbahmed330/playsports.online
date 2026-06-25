import { useRouterState } from "@tanstack/react-router";
import {
  Home, Trophy, Calendar, Users, Swords, Goal, CalendarDays,
  BarChart3, Shield, User, ListOrdered, Activity, Flame,
} from "lucide-react";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";

/**
 * Site-wide mobile bottom navigation, mounted once in `__root.tsx`.
 *
 * To add a new section:
 *   1. Add a case to `pickTabs(pathname)` below.
 *   2. Return `{ tabs, accent }` — `tabs` is exactly 4 MobileTab entries.
 *   3. Pick an accent: "amber" | "emerald" | "sky" | "fuchsia".
 * The fixed bottom bar will appear on every matching route automatically.
 *
 * To hide the bar on a chrome-less page (auth, admin), return null from
 * pickTabs for that pathname.
 */

type Accent = "amber" | "emerald" | "sky" | "fuchsia";
type Picked = { tabs: MobileTab[]; accent: Accent } | null;

// ---------- HUB / ROOT ----------
const HUB_TABS: MobileTab[] = [
  { to: "/",         label: "Home",     Icon: Home,    match: (p) => p === "/" },
  { to: "/football", label: "Football", Icon: Goal,    match: (p) => p.startsWith("/football") || p.startsWith("/players") },
  { to: "/cricket",  label: "Cricket",  Icon: Activity,match: (p) => p.startsWith("/cricket") },
  { to: "/mlb",      label: "More",     Icon: Flame,   match: (p) => p.startsWith("/mlb") || p.startsWith("/nba") || p.startsWith("/nhl") || p.startsWith("/mls") },
];

// ---------- FOOTBALL ----------
const FOOTBALL_TABS: MobileTab[] = [
  {
    to: "/football", label: "Live", Icon: Activity,
    search: { filter: "live" },
    match: (p, s) => p === "/football" && (s.filter as string) === "live",
  },
  {
    to: "/football", label: "Today", Icon: Calendar,
    search: { filter: "today" },
    match: (p, s) => p === "/football" && (s.filter as string) === "today",
  },
  {
    to: "/football", label: "Bracket", Icon: Swords,
    search: { tab: "knockout" },
    match: (p, s) =>
      p.startsWith("/football/match") ||
      (p === "/football" && (!s.tab || s.tab === "knockout") && (s.filter ?? "all") !== "live" && (s.filter ?? "all") !== "today"),
  },
  {
    to: "/players", label: "Scorers", Icon: Trophy,
    match: (p) => p.startsWith("/players") || (p === "/football"),
  },
];
// The "Scorers" tab uses a more lenient match so it lights up on /players,
// but with the order above Live/Today/Bracket take priority on /football.

// ---------- CRICKET (non-IPL) ----------
const CRICKET_TABS: MobileTab[] = [
  { to: "/cricket",         label: "Live",    Icon: Activity,
    match: (p) => p === "/cricket" || p === "/cricket/" || p.startsWith("/cricket/scores") || p.startsWith("/cricket/match") },
  { to: "/cricket/series",  label: "Series",  Icon: Trophy,    match: (p) => p.startsWith("/cricket/series") },
  { to: "/cricket/records", label: "Records", Icon: BarChart3, match: (p) => p.startsWith("/cricket/records") || p.startsWith("/cricket/rankings") || p.startsWith("/cricket/history") },
  { to: "/cricket/players", label: "Players", Icon: User,      match: (p) => p.startsWith("/cricket/players") || p.startsWith("/cricket/teams") },
];

// ---------- IPL ----------
const IPL_TABS: MobileTab[] = [
  { to: "/cricket/ipl/scores",    label: "Scores",  Icon: CalendarDays, match: (p) => p === "/cricket/ipl" || p === "/cricket/ipl/" || p.startsWith("/cricket/ipl/scores") },
  { to: "/cricket/ipl/standings", label: "Table",   Icon: BarChart3,    match: (p) => p.startsWith("/cricket/ipl/standings") },
  { to: "/cricket/ipl/teams",     label: "Teams",   Icon: Shield,       match: (p) => p.startsWith("/cricket/ipl/teams") },
  { to: "/cricket/ipl/records",   label: "Records", Icon: Trophy,       match: (p) => p.startsWith("/cricket/ipl/records") || p.startsWith("/cricket/ipl/history") || p.startsWith("/cricket/ipl/players") },
];

// ---------- MLB ----------
const MLB_TABS: MobileTab[] = [
  { to: "/mlb",           label: "Today",   Icon: Home,        match: (p) => p === "/mlb" || p === "/mlb/" },
  { to: "/mlb/scores",    label: "Scores",  Icon: Calendar,    match: (p) => p.startsWith("/mlb/scores") },
  { to: "/mlb/standings", label: "Table",   Icon: ListOrdered, match: (p) => p.startsWith("/mlb/standings") },
  { to: "/mlb/players",   label: "Leaders", Icon: BarChart3,
    match: (p) => p.startsWith("/mlb/players") || p.startsWith("/mlb/player") || p.startsWith("/mlb/teams") || p.startsWith("/mlb/team") || p.startsWith("/mlb/history") || p.startsWith("/mlb/news") },
];

// ---------- Other ESPN leagues (NBA / NHL / MLS) ----------
function leagueTabs(base: "/nba" | "/nhl" | "/mls"): MobileTab[] {
  return [
    { to: base,                label: "Today",     Icon: Home,        match: (p) => p === base || p === `${base}/` },
    { to: `${base}/scores`,    label: "Scores",    Icon: Calendar,    match: (p) => p.startsWith(`${base}/scores`) },
    { to: `${base}/standings`, label: "Standings", Icon: ListOrdered, match: (p) => p.startsWith(`${base}/standings`) },
    { to: `${base}/teams`,     label: "Teams",     Icon: Users,       match: (p) => p.startsWith(`${base}/teams`) || p.startsWith(`${base}/team`) },
  ];
}

function pickTabs(pathname: string): Picked {
  // hidden on auth-style chrome
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  if (pathname.startsWith("/cricket/ipl")) return { tabs: IPL_TABS, accent: "amber" };
  if (pathname.startsWith("/cricket"))     return { tabs: CRICKET_TABS, accent: "emerald" };
  if (pathname.startsWith("/football") || pathname.startsWith("/players"))
                                           return { tabs: FOOTBALL_TABS, accent: "amber" };
  if (pathname.startsWith("/mlb"))         return { tabs: MLB_TABS, accent: "sky" };
  if (pathname.startsWith("/nba"))         return { tabs: leagueTabs("/nba"), accent: "sky" };
  if (pathname.startsWith("/nhl"))         return { tabs: leagueTabs("/nhl"), accent: "fuchsia" };
  if (pathname.startsWith("/mls"))         return { tabs: leagueTabs("/mls"), accent: "emerald" };

  // hub / unknown → top-level switcher so users can always navigate
  return { tabs: HUB_TABS, accent: "amber" };
}

export function GlobalMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const picked = pickTabs(pathname);
  if (!picked) return null;
  return <MobileTabBar tabs={picked.tabs} accent={picked.accent} />;
}
