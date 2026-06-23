import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  Search,
  X,
  Check,
  ChevronsUpDown,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { flagOf } from "@/lib/flags";
import {
  POSITIONS,
  ERAS,
  GOAL_TYPES,
  SORTS,
  parseList,
  joinList,
  playersDefaults,
  type SortKey,
  type Era,
  type PositionFilter,
  type GoalType,
  type PlayersSearch,
} from "@/lib/players-filters";
import { CONFEDERATIONS } from "@/lib/confederations";
import { WC_YEARS } from "@/lib/supabase";

const ALL_YEARS = [...WC_YEARS, 2026].sort((a, b) => b - a);

const SORT_LABELS: Record<SortKey, string> = {
  goals: "Goals",
  goals_per_tournament: "Goals / WC",
  tournaments: "Tournaments",
  name: "Name (A–Z)",
  recent: "Most recent",
};

const ERA_LABELS: Record<Era, string> = {
  ALL: "All eras",
  "pre-war": "Pre-WWII",
  classic: "Classic 50s–70s",
  modern: "Modern 80s–00s",
  current: "Current 2010+",
};

const GOAL_LABELS: Record<GoalType, string> = {
  ALL: "All",
  open: "Open play",
  penalty: "Penalty",
  og: "Own goal",
};

export function FilterBar({
  countries,
  inSheet = false,
}: {
  countries: string[];
  inSheet?: boolean;
}) {
  const search = useSearch({ from: "/players" });
  const navigate = useNavigate({ from: "/players" });

  const update = (patch: Partial<typeof playersDefaults>) =>
    navigate({
      search: (prev: PlayersSearch) => ({ ...prev, ...patch }),
      replace: true,
    });

  const selectedYears = parseList(search.years);
  const selectedCountries = parseList(search.countries);
  const selectedConfeds = parseList(search.confeds);

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const reset = () =>
    navigate({
      search: (prev: PlayersSearch) => ({
        ...playersDefaults,
        tab: prev.tab,
      }),
      replace: true,
    });

  return (
    <div
      className={
        inSheet
          ? "space-y-5 pb-4"
          : "rounded-2xl border border-border bg-card/60 backdrop-blur p-4 sm:p-5 space-y-4"
      }
    >
      {/* Search + sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search player (e.g. Mbappé, Pele)…"
            className="pl-9 pr-9 h-10"
          />
          {search.q && (
            <button
              onClick={() => update({ q: "" })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-accent"
              aria-label="Clear"
            >
              <X className="size-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <select
          value={search.sort}
          onChange={(e) => update({ sort: e.target.value as SortKey })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              Sort: {SORT_LABELS[s]}
            </option>
          ))}
        </select>
        <CountryCombobox
          countries={countries}
          selected={selectedCountries}
          onChange={(next) => update({ countries: joinList(next) })}
        />
      </div>

      {/* Year chips */}
      <FilterRow label="Tournament">
        <Chip
          active={selectedYears.length === 0}
          onClick={() => update({ years: "", era: "ALL" })}
        >
          All
        </Chip>
        {ALL_YEARS.map((y) => (
          <Chip
            key={y}
            active={selectedYears.includes(String(y))}
            onClick={() =>
              update({
                years: joinList(toggle(selectedYears, String(y))),
                era: "ALL",
              })
            }
            accent={y === 2026 ? "live" : undefined}
          >
            {y === 2026 ? "● 2026" : y}
          </Chip>
        ))}
      </FilterRow>

      {/* Era presets */}
      <FilterRow label="Era">
        {ERAS.map((e) => (
          <Chip
            key={e}
            active={search.era === e}
            onClick={() => update({ era: e as Era, years: "" })}
          >
            {ERA_LABELS[e as Era]}
          </Chip>
        ))}
      </FilterRow>

      {/* Confederation */}
      <FilterRow label="Confederation">
        {CONFEDERATIONS.map((c) => (
          <Chip
            key={c}
            active={selectedConfeds.includes(c)}
            onClick={() =>
              update({ confeds: joinList(toggle(selectedConfeds, c)) })
            }
          >
            {c}
          </Chip>
        ))}
      </FilterRow>

      {/* Position + goal type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <FilterRow label="Position">
          {POSITIONS.map((p) => (
            <Chip
              key={p}
              active={search.pos === p}
              onClick={() => update({ pos: p as PositionFilter })}
            >
              {p === "ALL" ? "All" : p}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="Goal type">
          {GOAL_TYPES.map((g) => (
            <Chip
              key={g}
              active={search.goalType === g}
              onClick={() => update({ goalType: g as GoalType })}
            >
              {GOAL_LABELS[g as GoalType]}
            </Chip>
          ))}
        </FilterRow>
      </div>

      {/* Min goals slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Minimum goals
          </label>
          <span className="text-xs font-semibold text-gold tabular-nums">
            ≥ {search.minGoals}
          </span>
        </div>
        <Slider
          value={[search.minGoals]}
          min={1}
          max={15}
          step={1}
          onValueChange={(v) => update({ minGoals: v[0] ?? 1 })}
        />
      </div>

      <div className="flex items-center justify-end pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> Reset all
        </Button>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: "live";
}) {
  const live = accent === "live";
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3 rounded-full text-xs font-semibold transition-all border ${
        active
          ? live
            ? "bg-emerald-500 text-black border-emerald-400 shadow-sm"
            : "bg-gold text-black border-gold shadow-sm"
          : live
            ? "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
            : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}

function CountryCombobox({
  countries,
  selected,
  onChange,
}: {
  countries: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const sorted = useMemo(() => countries.slice().sort(), [countries]);
  const toggle = (c: string) =>
    onChange(selected.includes(c) ? selected.filter((x) => x !== c) : [...selected, c]);

  const label = selected.length === 0
    ? "All countries"
    : selected.length === 1
      ? `${flagOf(selected[0])} ${selected[0]}`
      : `${selected.length} countries`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="h-10 min-w-[180px] justify-between font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="size-3.5 opacity-50 ml-2 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <Command>
          <CommandInput placeholder="Search country…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {selected.length > 0 && (
                <CommandItem
                  onSelect={() => onChange([])}
                  className="text-muted-foreground"
                >
                  <X className="size-3.5 mr-2" /> Clear selection
                </CommandItem>
              )}
              {sorted.map((c) => {
                const isSel = selected.includes(c);
                return (
                  <CommandItem key={c} onSelect={() => toggle(c)}>
                    <span className="text-base mr-2">{flagOf(c)}</span>
                    <span className="flex-1 truncate">{c}</span>
                    {isSel && <Check className="size-3.5 text-gold" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ActiveFilterChips() {
  const search = useSearch({ from: "/players" });
  const navigate = useNavigate({ from: "/players" });
  const update = (patch: Partial<typeof playersDefaults>) =>
    navigate({ search: (prev: PlayersSearch) => ({ ...prev, ...patch }), replace: true });

  const years = parseList(search.years);
  const cs = parseList(search.countries);
  const cfs = parseList(search.confeds);

  const chips: { label: string; clear: () => void }[] = [];
  if (search.q) chips.push({ label: `"${search.q}"`, clear: () => update({ q: "" }) });
  for (const y of years)
    chips.push({
      label: y,
      clear: () =>
        update({ years: joinList(years.filter((x) => x !== y)) }),
    });
  for (const c of cs)
    chips.push({
      label: `${flagOf(c)} ${c}`,
      clear: () => update({ countries: joinList(cs.filter((x) => x !== c)) }),
    });
  for (const c of cfs)
    chips.push({
      label: c,
      clear: () => update({ confeds: joinList(cfs.filter((x) => x !== c)) }),
    });
  if (search.era !== "ALL")
    chips.push({ label: ERA_LABELS[search.era as Era], clear: () => update({ era: "ALL" }) });
  if (search.pos !== "ALL")
    chips.push({ label: search.pos, clear: () => update({ pos: "ALL" }) });
  if (search.goalType !== "ALL")
    chips.push({
      label: GOAL_LABELS[search.goalType as GoalType],
      clear: () => update({ goalType: "ALL" }),
    });
  if (search.minGoals > 1)
    chips.push({
      label: `≥ ${search.minGoals} goals`,
      clear: () => update({ minGoals: 1 }),
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={c.clear}
          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-accent text-xs text-foreground hover:bg-accent/70"
        >
          {c.label}
          <X className="size-3" />
        </button>
      ))}
    </div>
  );
}
