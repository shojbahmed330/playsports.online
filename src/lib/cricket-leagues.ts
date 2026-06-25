// ESPN cricket series/league registry.
// IDs come from ESPN's series catalog; "current/active" pages reuse last
// season's id once a new season starts.

export type CricketLeague = {
  id: string;                 // ESPN series/league id
  slug: string;               // url-safe key
  label: string;              // short label
  longName: string;           // full name
  emoji: string;
  format: "t20" | "odi" | "test" | "mixed";
  group: "international" | "franchise" | "domestic";
  accent: string;             // tailwind text color
  chipBg: string;
  ring: string;
  bgGrad: string;
  tagline: string;
};

export const CRICKET_LEAGUES: CricketLeague[] = [
  {
    id: "8048", slug: "ipl", label: "IPL", longName: "Indian Premier League",
    emoji: "🇮🇳", format: "t20", group: "franchise",
    accent: "text-amber-300", chipBg: "bg-amber-500/15", ring: "ring-amber-500/30",
    bgGrad: "from-amber-900/40 via-slate-900 to-blue-900/20",
    tagline: "The world's biggest T20 league",
  },
  {
    id: "8039", slug: "icc-world-cup", label: "ICC WC", longName: "ICC Cricket World Cup",
    emoji: "🏆", format: "odi", group: "international",
    accent: "text-yellow-300", chipBg: "bg-yellow-500/15", ring: "ring-yellow-500/30",
    bgGrad: "from-yellow-900/40 via-slate-900 to-emerald-900/20",
    tagline: "ODI World Cup — every four years",
  },
  {
    id: "8132", slug: "t20-world-cup", label: "T20 WC", longName: "ICC Men's T20 World Cup",
    emoji: "⚡", format: "t20", group: "international",
    accent: "text-fuchsia-300", chipBg: "bg-fuchsia-500/15", ring: "ring-fuchsia-500/30",
    bgGrad: "from-fuchsia-900/40 via-slate-900 to-purple-900/20",
    tagline: "20-over global championship",
  },
  {
    id: "8044", slug: "bbl", label: "BBL", longName: "Big Bash League",
    emoji: "🇦🇺", format: "t20", group: "franchise",
    accent: "text-orange-300", chipBg: "bg-orange-500/15", ring: "ring-orange-500/30",
    bgGrad: "from-orange-900/40 via-slate-900 to-yellow-900/20",
    tagline: "Australia's premier T20 league",
  },
  {
    id: "23360199", slug: "psl", label: "PSL", longName: "Pakistan Super League",
    emoji: "🇵🇰", format: "t20", group: "franchise",
    accent: "text-emerald-300", chipBg: "bg-emerald-500/15", ring: "ring-emerald-500/30",
    bgGrad: "from-emerald-900/40 via-slate-900 to-lime-900/20",
    tagline: "Pakistan's franchise T20",
  },
  {
    id: "22791243", slug: "sa20", label: "SA20", longName: "SA20 — South Africa",
    emoji: "🇿🇦", format: "t20", group: "franchise",
    accent: "text-sky-300", chipBg: "bg-sky-500/15", ring: "ring-sky-500/30",
    bgGrad: "from-sky-900/40 via-slate-900 to-cyan-900/20",
    tagline: "South Africa's premier T20",
  },
  {
    id: "19429", slug: "the-hundred", label: "The Hundred", longName: "The Hundred (England)",
    emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", format: "t20", group: "franchise",
    accent: "text-pink-300", chipBg: "bg-pink-500/15", ring: "ring-pink-500/30",
    bgGrad: "from-pink-900/40 via-slate-900 to-rose-900/20",
    tagline: "England's 100-ball format",
  },
  {
    id: "17280", slug: "cpl", label: "CPL", longName: "Caribbean Premier League",
    emoji: "🌴", format: "t20", group: "franchise",
    accent: "text-lime-300", chipBg: "bg-lime-500/15", ring: "ring-lime-500/30",
    bgGrad: "from-lime-900/40 via-slate-900 to-emerald-900/20",
    tagline: "Caribbean franchise T20",
  },
  {
    id: "8043", slug: "sheffield-shield", label: "Sheff Shield", longName: "Sheffield Shield",
    emoji: "🇦🇺", format: "test", group: "domestic",
    accent: "text-stone-300", chipBg: "bg-stone-500/15", ring: "ring-stone-500/30",
    bgGrad: "from-stone-800/50 via-slate-900 to-stone-900/30",
    tagline: "Australia's domestic first-class",
  },
];

export const CRICKET_LEAGUE_BY_SLUG: Record<string, CricketLeague> = Object.fromEntries(
  CRICKET_LEAGUES.map((l) => [l.slug, l]),
);
export const CRICKET_LEAGUE_BY_ID: Record<string, CricketLeague> = Object.fromEntries(
  CRICKET_LEAGUES.map((l) => [l.id, l]),
);

export const CURATED_LEAGUE_IDS: Set<string> = new Set(CRICKET_LEAGUES.map((l) => l.id));
export function isCuratedLeague(id: string | null | undefined): boolean {
  return !!id && CURATED_LEAGUE_IDS.has(String(id));
}

export const FORMAT_META: Record<CricketLeague["format"] | "any", { label: string; color: string }> = {
  any:  { label: "All",   color: "bg-white/10 text-white" },
  t20:  { label: "T20",   color: "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30" },
  odi:  { label: "ODI",   color: "bg-blue-500/15 text-blue-300 ring-blue-500/30" },
  test: { label: "Test",  color: "bg-amber-500/15 text-amber-200 ring-amber-500/30" },
  mixed:{ label: "Mixed", color: "bg-gray-500/15 text-gray-300 ring-gray-500/30" },
};

