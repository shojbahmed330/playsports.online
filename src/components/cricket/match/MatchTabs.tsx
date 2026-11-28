import { useState, type ReactNode } from "react";

export type TabDef = { id: string; label: string; badge?: string | number };

export function MatchTabs({
  tabs,
  initial,
  render,
}: {
  tabs: TabDef[];
  initial?: string;
  render: (activeId: string) => ReactNode;
}) {
  const [active, setActive] = useState<string>(initial ?? tabs[0]?.id);
  return (
    <div>
      <div className="sticky top-[36px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-background backdrop-blur border-b border-border">
        <div
          role="tablist"
          className="flex gap-1 overflow-x-auto no-scrollbar -mb-px"
          aria-label="Match sections"
        >
          {tabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(t.id)}
                className={`shrink-0 min-h-[44px] px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? "border-[var(--color-accent-cricket)] text-foreground"
                    : "border-transparent text-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {t.badge != null && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-[var(--color-accent-cricket)]/25 text-[var(--color-accent-cricket)]"
                        : "bg-card text-foreground"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pt-5">{render(active)}</div>
    </div>
  );
}
