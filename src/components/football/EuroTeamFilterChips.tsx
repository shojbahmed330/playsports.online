import { useEffect, useState } from "react";
import { flagOf } from "@/lib/flags";
import { Star } from "lucide-react";

const STORAGE_KEY = "euro:fav-teams";

// Recurring favourites / recent finalists — used as pre-tournament chips.
const EURO_TEAMS = [
  "Spain", "England", "France", "Germany", "Italy", "Portugal",
  "Netherlands", "Belgium", "Croatia", "Denmark", "Switzerland", "Turkey",
  "Austria", "Poland", "Ukraine", "Scotland", "Wales",
  "Republic of Ireland", "Serbia", "Czech Republic", "Sweden", "Norway",
  "Hungary", "Romania",
];

export function useEuroFavTeams(): [string[], (t: string) => void, () => void] {
  const [fav, setFav] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFav(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);
  const toggle = (t: string) => {
    setFav((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  const clear = () => {
    setFav([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };
  return [fav, toggle, clear];
}

/**
 * Horizontal chip row of Euro finalist favourites. Multi-select; toggling
 * updates parent via `onToggle`. Persists to localStorage.
 */
export function EuroTeamFilterChips({
  selected,
  onToggle,
  onClear,
}: {
  selected: string[];
  onToggle: (team: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Star className="size-3.5" /> Filter by team
          {selected.length > 0 && (
            <span className="tabular-nums text-primary">· {selected.length}</span>
          )}
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:flex-wrap gap-1.5 overflow-x-auto snap-x scrollbar-hide pb-1">
        {EURO_TEAMS.map((t) => {
          const active = selected.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              className={`snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 min-h-[36px] text-xs font-bold transition ${
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-white/10 bg-white/[0.03] text-foreground/85 hover:border-white/25"
              }`}
            >
              <span className="text-base leading-none">{flagOf(t)}</span>
              {t}
            </button>
          );
        })}
      </div>
    </section>
  );
}
