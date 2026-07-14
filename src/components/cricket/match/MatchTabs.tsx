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
      <div className="sticky top-[36px] z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-gray-950/90 backdrop-blur border-b border-gray-800">
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
                    ? "border-emerald-400 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {t.label}
                {t.badge != null && (
                  <span
                    className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      isActive ? "bg-emerald-500/25 text-emerald-100" : "bg-gray-800 text-gray-400"
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
