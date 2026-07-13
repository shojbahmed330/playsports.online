import { useEffect, useState } from "react";
import { COPA_FILTERS, type CopaFilterId } from "@/lib/copa-records";

const STORAGE_KEY = "copa:history:filter";

export function useCopaHistoryFilter(): [CopaFilterId, (id: CopaFilterId) => void] {
  const [filter, setFilter] = useState<CopaFilterId>("all");
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && COPA_FILTERS.some((f) => f.id === raw)) setFilter(raw as CopaFilterId);
    } catch { /* ignore */ }
  }, []);
  function update(id: CopaFilterId) {
    setFilter(id);
    try { window.localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
  }
  return [filter, update];
}

export function CopaHistoryFilters({ value, onChange }: { value: CopaFilterId; onChange: (id: CopaFilterId) => void }) {
  return (
    <div className="sticky top-14 z-10 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 backdrop-blur bg-background/85 border-b border-border/60 sm:border-0">
      <div className="edge-fade-x">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          {COPA_FILTERS.map((f) => {
            const active = f.id === value;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(f.id)}
                aria-pressed={active}
                className={`snap-start shrink-0 tap-target inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:border-white/20"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
