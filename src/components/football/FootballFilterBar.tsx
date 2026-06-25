import { useMemo, useState } from "react";
import { Search, X, Radio, Calendar, Globe2, Star } from "lucide-react";
import { useMyTeams, type FootballFilter } from "@/lib/football-filters";
import { flagOf } from "@/lib/flags";
import { StarTeamButton } from "./StarTeamButton";

const CHIPS: { id: FootballFilter; label: string; icon: React.ReactNode; tone: string }[] = [
  { id: "all",   label: "All",      icon: <Globe2 className="size-3.5" />,   tone: "from-white/10 to-white/5" },
  { id: "live",  label: "Live",     icon: <Radio className="size-3.5" />,    tone: "from-red-500 to-rose-500" },
  { id: "today", label: "Today",    icon: <Calendar className="size-3.5" />, tone: "from-blue-500 to-cyan-400" },
  { id: "my",    label: "My Teams", icon: <Star className="size-3.5" />,     tone: "from-amber-400 to-yellow-300" },
];

export function FootballFilterBar({
  filter, onFilterChange,
  team, onTeamChange,
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
    return teamOptions
      .filter((t) => t.toLowerCase().includes(needle))
      .slice(0, 6);
  }, [q, teamOptions]);

  return (
    <div className="space-y-3">
      {/* Chip row + search — wrap on mobile to avoid horizontal scrollbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {CHIPS.map((c) => {
            const active = filter === c.id;
            const disabled = c.id === "my" && myTeams.length === 0;
            return (
              <button
                key={c.id}
                onClick={() => onFilterChange(c.id)}
                disabled={disabled}
                className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? `bg-gradient-to-r ${c.tone} text-black shadow-md`
                    : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                title={disabled ? "Star teams to fill this list" : c.label}
              >
                {c.icon}
                {c.label}
                {c.id === "my" && myTeams.length > 0 && (
                  <span className={`ml-1 rounded-full px-1.5 text-[10px] tabular-nums ${active ? "bg-black/20" : "bg-white/10"}`}>
                    {myTeams.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search — full width on mobile, inline on sm+ */}
        <div className="relative w-full sm:w-auto sm:ml-auto sm:shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); onTeamChange(e.target.value || undefined); }}
            placeholder="Search team…"
            className="w-full sm:w-56 pl-8 pr-7 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          {q && (
            <button
              onClick={() => { setQ(""); onTeamChange(undefined); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>


      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-gray-900/80 backdrop-blur p-1 grid grid-cols-2 sm:grid-cols-3 gap-1 animate-fade-in">
          {suggestions.map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5"
            >
              <button
                onClick={() => { setQ(t); onTeamChange(t); }}
                className="flex-1 inline-flex items-center gap-2 text-left text-xs text-foreground truncate"
              >
                <span className="text-base leading-none">{flagOf(t)}</span>
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
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">My teams:</span>
          {myTeams.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 text-[11px] text-amber-200">
              <span className="text-sm leading-none">{flagOf(t)}</span> {t}
              <StarTeamButton team={t} size={10} />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
