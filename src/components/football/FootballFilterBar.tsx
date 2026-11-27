import { useMemo, useState } from "react";
import { Search, X, Radio, Calendar, Globe2, Star } from "lucide-react";
import { useMyTeams, type FootballFilter } from "@/lib/football-filters";
import { flagOf } from "@/lib/flags";
import { StarTeamButton } from "./StarTeamButton";

const CHIPS: { id: FootballFilter; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: <Globe2 className="size-3.5" aria-hidden="true" /> },
  { id: "live", label: "Live", icon: <Radio className="size-3.5" aria-hidden="true" /> },
  { id: "today", label: "Today", icon: <Calendar className="size-3.5" aria-hidden="true" /> },
  { id: "my", label: "My Teams", icon: <Star className="size-3.5" aria-hidden="true" /> },
];

export function FootballFilterBar({
  filter,
  onFilterChange,
  team,
  onTeamChange,
  teamOptions,
}: {
  filter: FootballFilter;
  onFilterChange: (f: FootballFilter) => void;
  team: string | undefined;
  onTeamChange: (t: string | undefined) => void;
  teamOptions: string[];
}) {
  const [q, setQ] = useState(team ?? "");
  const { teams: myTeams } = useMyTeams();

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return teamOptions.filter((t) => t.toLowerCase().includes(needle)).slice(0, 6);
  }, [q, teamOptions]);

  return (
    <div className="space-y-3">
      {/* Chip row + search — wrap on mobile to avoid horizontal scrollbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {CHIPS.map((c) => {
            const active = filter === c.id;
            const disabled = c.id === "my" && myTeams.length === 0;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange(c.id)}
                disabled={disabled}
                className={`relative inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                title={disabled ? "Star teams to fill this list" : c.label}
              >
                {c.icon}
                {c.label}
                {c.id === "my" && myTeams.length > 0 && (
                  <span
                    className={`ml-1 rounded-full px-1.5 text-micro tabular-nums ${
                      active ? "bg-primary-foreground/20" : "bg-muted"
                    }`}
                  >
                    {myTeams.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search — full width on mobile, inline on sm+ */}
        <div className="relative w-full sm:ml-auto sm:w-auto sm:shrink-0">
          <Search
            className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              onTeamChange(e.target.value || undefined);
            }}
            placeholder="Search team…"
            aria-label="Search team"
            className="min-h-11 w-full rounded-full border border-border bg-muted pl-8 pr-8 text-caption text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                onTeamChange(undefined);
              }}
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Clear team search"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <div className="animate-fade-in grid grid-cols-2 gap-1 rounded-xl border border-border bg-card/80 p-1 backdrop-blur motion-reduce:animate-none sm:grid-cols-3">
          {suggestions.map((t) => (
            <div key={t} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-accent">
              <button
                type="button"
                onClick={() => {
                  setQ(t);
                  onTeamChange(t);
                }}
                className="inline-flex min-h-11 flex-1 items-center gap-2 truncate text-left text-caption text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-base leading-none" aria-hidden="true">{flagOf(t)}</span>
                <span className="truncate">{t}</span>
              </button>
              <StarTeamButton team={t} />
            </div>
          ))}
        </div>
      )}

      {/* My teams quick row */}
      {myTeams.length > 0 && filter !== "my" && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-micro uppercase text-muted-foreground">My teams:</span>
          {myTeams.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-caption text-foreground"
            >
              <span className="text-sm leading-none" aria-hidden="true">{flagOf(t)}</span> {t}
              <StarTeamButton team={t} size={10} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
