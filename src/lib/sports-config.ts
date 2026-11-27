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
  accent: string;           // semantic text colour (sport accent token)
  bgGrad: string;           // hero gradient (sport accent token → background)
  ring: string;             // ring colour (sport accent token)
  chipBg: string;           // chip background (sport accent token)
};

// Sport colours are design tokens (`--color-accent-*` in styles.css), never
// raw Tailwind palette classes, so a theme change moves every sport at once.
export const SPORTS: Record<SportSlug, SportConfig> = {
  mlb: {
    slug: "mlb",
    label: "MLB",
    longName: "Major League Baseball",
    emoji: "⚾",
    path: "baseball/mlb",
    tagline: "America's National Pastime",
    accent: "text-[var(--color-accent-mlb)]",
    bgGrad:
      "from-[var(--color-accent-mlb)]/25 via-background to-background",
    ring: "ring-[var(--color-accent-mlb)]/30",
    chipBg: "bg-[var(--color-accent-mlb)]/15",
  },
  nba: {
    slug: "nba",
    label: "NBA",
    longName: "National Basketball Association",
    emoji: "🏀",
    path: "basketball/nba",
    tagline: "Where amazing happens",
    accent: "text-[var(--color-accent-nba)]",
    bgGrad:
      "from-[var(--color-accent-nba)]/25 via-background to-background",
    ring: "ring-[var(--color-accent-nba)]/30",
    chipBg: "bg-[var(--color-accent-nba)]/15",
  },
  nhl: {
    slug: "nhl",
    label: "NHL",
    longName: "National Hockey League",
    emoji: "🏒",
    path: "hockey/nhl",
    tagline: "Fastest game on ice",
    accent: "text-[var(--color-accent-nhl)]",
    bgGrad:
      "from-[var(--color-accent-nhl)]/25 via-background to-background",
    ring: "ring-[var(--color-accent-nhl)]/30",
    chipBg: "bg-[var(--color-accent-nhl)]/15",
  },
  mls: {
    slug: "mls",
    label: "MLS",
    longName: "Major League Soccer",
    emoji: "⚽",
    path: "soccer/usa.1",
    tagline: "Soccer's home in North America",
    accent: "text-[var(--color-accent-mls)]",
    bgGrad:
      "from-[var(--color-accent-mls)]/25 via-background to-background",
    ring: "ring-[var(--color-accent-mls)]/30",
    chipBg: "bg-[var(--color-accent-mls)]/15",
  },
};

export const SPORT_LIST: SportConfig[] = [
  SPORTS.mlb,
  SPORTS.nba,
  SPORTS.nhl,
  SPORTS.mls,
];
