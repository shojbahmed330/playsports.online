import { EURO_TEAMS_FILTERS, type EuroTeamsFilter } from "@/lib/euro-teams";

export function EuroConfederationFilter({
  value,
  onChange,
}: {
  value: EuroTeamsFilter;
  onChange: (v: EuroTeamsFilter) => void;
}) {
  return (
    <div
      className="mt-6 flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Filter nations"
    >
      {EURO_TEAMS_FILTERS.map((f) => {
        const active = f.id === value;
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f.id)}
            className={`tap-target shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition ${
              active
                ? "bg-white text-gray-950 ring-white"
                : "bg-white/[0.04] text-muted-foreground ring-white/10 hover:text-foreground hover:ring-white/20"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
