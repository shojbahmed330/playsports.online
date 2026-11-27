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
    <div className="sticky top-14 z-20 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:top-16">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <div
          role="group"
          aria-label="Filter by sport"
          className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-2"
        >
          {TABS.map((t) => {
            const active = value === t.id;
            const count = counts?.[t.id];
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(t.id)}
                className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]"
                    : "bg-muted text-muted-foreground ring-1 ring-border hover:bg-accent hover:text-foreground"
                }`}
              >
                <span className="text-sm leading-none" aria-hidden="true">{t.emoji}</span>
                <span>{t.label}</span>
                {count != null && count > 0 && (
                  <span
                    className={`ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-micro font-bold ${
                      active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/15 text-primary"
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
