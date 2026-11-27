import { useRouterState } from "@tanstack/react-router";
import {
  Home,
  Trophy,
  Calendar,
  Swords,
  Goal,
  CalendarDays,
  BarChart3,
  Shield,
  User,
  ListOrdered,
  Activity,
  Flame,
} from "lucide-react";
import { MobileTabBar, type MobileTab } from "./MobileTabBar";

/**
 * Site-wide mobile bottom navigation, mounted once in `__root.tsx`.
 *
 * To add a new section:
 *   1. Add a case to `pickTabs(pathname)` below.
 *   2. Return `{ tabs, accent }` — 4–5 MobileTab entries.
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
  { to: "/", label: "Home", Icon: Home, match: (p) => p === "/" },
  { to: "/live/today", label: "Live", Icon: Activity, match: (p) => p.startsWith("/live") },
  { to: "/cricket", label: "Cricket", Icon: Trophy, match: (p) => p.startsWith("/cricket") },
  {
    to: "/football",
    label: "Football",
    Icon: Goal,
    match: (p) => p.startsWith("/football") || p.startsWith("/players"),
  },
  {
    to: "/search",
    label: "More",
    Icon: Flame,
    match: (p) =>
      p.startsWith("/mlb") ||
      p.startsWith("/nba") ||
      p.startsWith("/nhl") ||
      p.startsWith("/mls") ||
      p.startsWith("/search") ||
      p.startsWith("/news") ||
      p.startsWith("/guides") ||
      p.startsWith("/highlights") ||
      p.startsWith("/premium") ||
      p === "/mine",
    items: [
      { to: "/news", label: "News", emoji: "📰" },
      { to: "/search", label: "Search", emoji: "🔎" },
      { to: "/mine", label: "My Feed", emoji: "⭐" },
      { to: "/football/world-cup", label: "World Cup", emoji: "🏆" },
      { to: "/guides", label: "Guides", emoji: "📚" },
      { to: "/highlights", label: "Highlights", emoji: "🎬" },
      { to: "/mlb", label: "MLB", emoji: "⚾" },
      { to: "/nba", label: "NBA", emoji: "🏀" },
      { to: "/nhl", label: "NHL", emoji: "🏒" },
      { to: "/mls", label: "MLS", emoji: "⚽" },
    ],
  },
];

// ---------- FOOTBALL ----------
const FOOTBALL_TABS: MobileTab[] = [
  {
    to: "/football",
    label: "Live",
    Icon: Activity,
    search: { filter: "live" },
    match: (p, s) => p === "/football" && (s.filter as string) === "live",
  },
  {
    to: "/football",
    label: "Today",
    Icon: Calendar,
    search: { filter: "today" },
    match: (p, s) => p === "/football" && (s.filter as string) === "today",
  },
  {
    to: "/football/world-cup",
    label: "Archive",
    Icon: Swords,
    match: (p) => p.startsWith("/football/world-cup") || p.startsWith("/football/match"),
  },
  {
    to: "/players",
    label: "Scorers",
    Icon: Trophy,
    match: (p) => p.startsWith("/players"),
  },
];
// The "Scorers" tab only lights up on /players; Live/Today take priority on
// the football hub itself.

// ---------- CRICKET (non-IPL) ----------
const CRICKET_TABS: MobileTab[] = [
  {
    to: "/cricket",
    label: "Live",
    Icon: Activity,
    match: (p) =>
      p === "/cricket" ||
      p === "/cricket/" ||
      p.startsWith("/cricket/scores") ||
      p.startsWith("/cricket/match"),
  },
  {
    to: "/cricket/series",
    label: "Series",
    Icon: Trophy,
    match: (p) => p.startsWith("/cricket/series"),
  },
  {
    to: "/cricket/records",
    label: "Records",
    Icon: BarChart3,
    match: (p) =>
      p.startsWith("/cricket/records") ||
      p.startsWith("/cricket/rankings") ||
      p.startsWith("/cricket/history"),
  },
  {
    to: "/cricket/players",
    label: "Players",
    Icon: User,
    match: (p) => p.startsWith("/cricket/players") || p.startsWith("/cricket/teams"),
  },
];

// ---------- IPL ----------
const IPL_TABS: MobileTab[] = [
  {
    to: "/cricket/ipl/scores",
    label: "Scores",
    Icon: CalendarDays,
    match: (p) =>
      p === "/cricket/ipl" || p === "/cricket/ipl/" || p.startsWith("/cricket/ipl/scores"),
  },
  {
    to: "/cricket/ipl/standings",
    label: "Table",
    Icon: BarChart3,
    match: (p) => p.startsWith("/cricket/ipl/standings"),
  },
  {
    to: "/cricket/ipl/teams",
    label: "Teams",
    Icon: Shield,
    match: (p) => p.startsWith("/cricket/ipl/teams"),
  },
  {
    to: "/cricket/ipl/records",
    label: "Records",
    Icon: Trophy,
    match: (p) =>
      p.startsWith("/cricket/ipl/records") ||
      p.startsWith("/cricket/ipl/history") ||
      p.startsWith("/cricket/ipl/players"),
  },
];

// ---------- MLB ----------
const MLB_TABS: MobileTab[] = [
  { to: "/mlb", label: "Today", Icon: Home, match: (p) => p === "/mlb" || p === "/mlb/" },
  { to: "/mlb/scores", label: "Scores", Icon: Calendar, match: (p) => p.startsWith("/mlb/scores") },
  {
    to: "/mlb/standings",
    label: "Table",
    Icon: ListOrdered,
    match: (p) => p.startsWith("/mlb/standings"),
  },
  {
    to: "/mlb/players",
    label: "Leaders",
    Icon: BarChart3,
    match: (p) =>
      p.startsWith("/mlb/players") ||
      p.startsWith("/mlb/player") ||
      p.startsWith("/mlb/teams") ||
      p.startsWith("/mlb/team") ||
      p.startsWith("/mlb/history") ||
      p.startsWith("/mlb/news"),
  },
];

// ---------- NBA ----------
const NBA_TABS: MobileTab[] = [
  { to: "/nba", label: "Today", Icon: Home, match: (p) => p === "/nba" || p === "/nba/" },
  {
    to: "/nba/scores",
    label: "Scores",
    Icon: Calendar,
    match: (p) => p.startsWith("/nba/scores") || p.startsWith("/nba/game"),
  },
  {
    to: "/nba/standings",
    label: "Table",
    Icon: ListOrdered,
    match: (p) => p.startsWith("/nba/standings"),
  },
  {
    to: "/nba/leaders",
    label: "Leaders",
    Icon: BarChart3,
    match: (p) =>
      p.startsWith("/nba/leaders") ||
      p.startsWith("/nba/player") ||
      p.startsWith("/nba/teams") ||
      p.startsWith("/nba/team") ||
      p.startsWith("/nba/history") ||
      p.startsWith("/nba/news"),
  },
];

// ---------- NHL ----------
const NHL_TABS: MobileTab[] = [
  { to: "/nhl", label: "Today", Icon: Home, match: (p) => p === "/nhl" || p === "/nhl/" },
  {
    to: "/nhl/scores",
    label: "Scores",
    Icon: Calendar,
    match: (p) => p.startsWith("/nhl/scores") || p.startsWith("/nhl/game"),
  },
  {
    to: "/nhl/standings",
    label: "Table",
    Icon: ListOrdered,
    match: (p) => p.startsWith("/nhl/standings"),
  },
  {
    to: "/nhl/leaders",
    label: "Leaders",
    Icon: BarChart3,
    match: (p) =>
      p.startsWith("/nhl/leaders") ||
      p.startsWith("/nhl/player") ||
      p.startsWith("/nhl/teams") ||
      p.startsWith("/nhl/team") ||
      p.startsWith("/nhl/history") ||
      p.startsWith("/nhl/news"),
  },
];

// ---------- MLS ----------
const MLS_TABS: MobileTab[] = [
  { to: "/mls", label: "Today", Icon: Home, match: (p) => p === "/mls" || p === "/mls/" },
  {
    to: "/mls/scores",
    label: "Scores",
    Icon: Calendar,
    match: (p) => p.startsWith("/mls/scores") || p.startsWith("/mls/game"),
  },
  {
    to: "/mls/standings",
    label: "Table",
    Icon: ListOrdered,
    match: (p) => p.startsWith("/mls/standings"),
  },
  {
    to: "/mls/leaders",
    label: "Leaders",
    Icon: BarChart3,
    match: (p) =>
      p.startsWith("/mls/leaders") ||
      p.startsWith("/mls/player") ||
      p.startsWith("/mls/teams") ||
      p.startsWith("/mls/team") ||
      p.startsWith("/mls/history") ||
      p.startsWith("/mls/news"),
  },
];

function pickTabs(pathname: string): Picked {
  // hidden on auth-style chrome
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return null;

  if (pathname === "/mine") return { tabs: HUB_TABS, accent: "amber" };

  if (pathname.startsWith("/cricket/ipl")) return { tabs: IPL_TABS, accent: "amber" };
  if (pathname.startsWith("/cricket")) return { tabs: CRICKET_TABS, accent: "emerald" };
  if (pathname.startsWith("/football") || pathname.startsWith("/players"))
    return { tabs: FOOTBALL_TABS, accent: "amber" };
  if (pathname.startsWith("/mlb")) return { tabs: MLB_TABS, accent: "sky" };
  if (pathname.startsWith("/nba")) return { tabs: NBA_TABS, accent: "amber" };
  if (pathname.startsWith("/nhl")) return { tabs: NHL_TABS, accent: "fuchsia" };
  if (pathname.startsWith("/mls")) return { tabs: MLS_TABS, accent: "emerald" };

  // hub / unknown → top-level switcher so users can always navigate
  return { tabs: HUB_TABS, accent: "amber" };
}

export function GlobalMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const picked = pickTabs(pathname);
  if (!picked) return null;
  return <MobileTabBar tabs={picked.tabs} accent={picked.accent} />;
}
