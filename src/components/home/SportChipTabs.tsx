import { SPORT_LIST } from "@/lib/sports-config";

export type SportFilter = "all" | "football" | "cricket" | "mlb" | "nba" | "nhl" | "mls";

const TABS: { id: SportFilter; emoji: string; label: string }[] = [
  { id: "all", emoji: "🏆", label: "All" },
  { id: "football", emoji: "⚽", label: "Football" },
  { id: "cricket", emoji: "🏏", label: "Cricket" },
  ...SPORT_LIST.map((s) => ({
    id: s.slug as SportFilter,
    emoji: s.emoji,
    label: s.label,
  })),
];

export function SportChipTabs({
  value,
  onChange,
  counts,
}: {
  value: SportFilter;
  onChange: (v: SportFilter) => void;
  counts?: Partial<Record<SportFilter, number>>;
}) {
  return (
    <div className="sticky top-14 sm:top-16 z-20 border-b border-white/5 bg-gray-950/90 backdrop-blur supports-[backdrop-filter]:bg-gray-950/70">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div
          role="tablist"
          aria-label="Filter by sport"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2"
        >
          {TABS.map((t) => {
            const active = value === t.id;
            const count = counts?.[t.id];
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => onChange(t.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  active
                    ? "bg-amber-500 text-gray-950 shadow-[0_2px_8px_rgba(245,158,11,0.35)]"
                    : "bg-gray-900 text-gray-300 hover:bg-gray-800 ring-1 ring-white/5"
                }`}
              >
                <span className="text-sm leading-none">{t.emoji}</span>
                <span>{t.label}</span>
                {count != null && count > 0 && (
                  <span
                    className={`ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                      active ? "bg-gray-950/20 text-gray-950" : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
