// Per-sport metadata. Used by the league page, hub, and nav.
// `path` is the ESPN API path segment (e.g. "baseball/mlb").

export type SportSlug = "mlb" | "nba" | "nhl" | "mls";

export type SportConfig = {
  slug: SportSlug;
  label: string;            // "MLB"
  longName: string;         // "Major League Baseball"
  emoji: string;            // ⚾
  path: string;             // "baseball/mlb"
  tagline: string;          // "America's pastime"
  accent: string;           // tailwind text color class
  bgGrad: string;           // hero gradient
  ring: string;             // ring color
  chipBg: string;           // chip background
};

export const SPORTS: Record<SportSlug, SportConfig> = {
  mlb: {
    slug: "mlb",
    label: "MLB",
    longName: "Major League Baseball",
    emoji: "⚾",
    path: "baseball/mlb",
    tagline: "America's National Pastime",
    accent: "text-sky-400",
    bgGrad: "from-sky-900/40 via-slate-900 to-red-900/20",
    ring: "ring-sky-500/30",
    chipBg: "bg-sky-500/15",
  },
  nba: {
    slug: "nba",
    label: "NBA",
    longName: "National Basketball Association",
    emoji: "🏀",
    path: "basketball/nba",
    tagline: "Where amazing happens",
    accent: "text-orange-400",
    bgGrad: "from-orange-900/40 via-slate-900 to-amber-900/20",
    ring: "ring-orange-500/30",
    chipBg: "bg-orange-500/15",
  },
  nhl: {
    slug: "nhl",
    label: "NHL",
    longName: "National Hockey League",
    emoji: "🏒",
    path: "hockey/nhl",
    tagline: "Fastest game on ice",
    accent: "text-cyan-300",
    bgGrad: "from-cyan-900/40 via-slate-900 to-blue-950/30",
    ring: "ring-cyan-500/30",
    chipBg: "bg-cyan-500/15",
  },
  mls: {
    slug: "mls",
    label: "MLS",
    longName: "Major League Soccer",
    emoji: "⚽",
    path: "soccer/usa.1",
    tagline: "Soccer's home in North America",
    accent: "text-emerald-400",
    bgGrad: "from-emerald-900/40 via-slate-900 to-red-900/20",
    ring: "ring-emerald-500/30",
    chipBg: "bg-emerald-500/15",
  },
};

export const SPORT_LIST: SportConfig[] = [
  SPORTS.mlb,
  SPORTS.nba,
  SPORTS.nhl,
  SPORTS.mls,
];
