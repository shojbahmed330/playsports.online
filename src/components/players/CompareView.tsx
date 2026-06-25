import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { flagOf } from "@/lib/flags";
import {
  parseComparePlayers,
  joinComparePlayers,
  playerKey,
  type PlayersSearch,
} from "@/lib/players-filters";
import cardsData from "@/data/wc_cards.json";
import { useMergedGoals, HISTORICAL_GOALS, type GoalRow } from "@/lib/use-merged-goals";
import { CompareChart } from "@/components/players/CompareChart";

type CardRow = {
  pid: string; name: string; team: string; year: number;
  type: "yellow" | "red"; pos: string;
};
const CARDS = cardsData as CardRow[];

// Build a player index from any goal dataset (used by the picker).
function buildPlayerIndex(goals: GoalRow[]) {
  const m = new Map<string, { name: string; country: string; goals: number }>();
  for (const g of goals) {
    if (g.og) continue;
    const k = `${g.name}||${g.pteam}`;
    const ex = m.get(k);
    if (ex) ex.goals++;
    else m.set(k, { name: g.name, country: g.pteam, goals: 1 });
  }
  return Array.from(m.values()).sort((a, b) => b.goals - a.goals);
}

export function CompareView() {
  const { goals: GOALS } = useMergedGoals();
  const search = useSearch({ from: "/players" });
  const navigate = useNavigate({ from: "/players" });
  const selected = parseComparePlayers(search.compare);

  const setSelected = (next: { name: string; country: string }[]) =>
    navigate({
      search: (prev: PlayersSearch) => ({
        ...prev,
        compare: joinComparePlayers(next),
      }),
      replace: true,
    });

  const stats = useMemo(
    () =>
      selected.map((p) => {
        const gs: GoalRow[] = GOALS.filter(
          (g) => !g.og && g.name === p.name && g.pteam === p.country,
        );
        const cs = CARDS.filter((c) => c.name === p.name && c.team === p.country);
        const years = new Set<number>(gs.map((g) => g.year));
        const live2026 = gs.filter((g) => g.year === 2026).length;
        return {
          ...p,
          goals: gs.length,
          penalties: gs.filter((g) => g.pen).length,
          tournaments: years.size,
          yellow: cs.filter((c) => c.type === "yellow").length,
          red: cs.filter((c) => c.type === "red").length,
          first: years.size ? Math.min(...Array.from(years)) : 0,
          last: years.size ? Math.max(...Array.from(years)) : 0,
          live2026,
        };
      }),
    [selected, GOALS],
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          {selected.map((p, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-gold/15 text-gold ring-1 ring-gold/30 text-xs font-semibold"
            >
              {flagOf(p.country)} {p.name}
              <button
                onClick={() =>
                  setSelected(selected.filter((_, j) => j !== i))
                }
                className="hover:text-amber-200"
                aria-label={`Remove ${p.name}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {selected.length < 4 && (
            <AddPicker
              exclude={selected}
              onPick={(p) => setSelected([...selected, p])}
            />
          )}
          {selected.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected([])}
              className="ml-auto"
            >
              Clear
            </Button>
          )}
        </div>
        {selected.length === 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            Pick up to 4 players to compare side-by-side.
          </p>
        )}
      </div>

      {stats.length > 0 && (
        <div
          className={`grid gap-3 ${
            stats.length === 1
              ? "grid-cols-1"
              : stats.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {stats.map((s) => (
            <div
              key={s.name + s.country}
              className="rounded-2xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{flagOf(s.country)}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate flex items-center gap-1.5">
                    {s.name}
                    {s.live2026 > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-emerald-400 font-bold shrink-0">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        +{s.live2026} '26
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {s.country}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Cell label="Goals" value={s.goals} accent />
                <Cell label="WC" value={s.tournaments} />
                <Cell label="Pen" value={s.penalties} />
                <Cell label="🟨" value={s.yellow} />
                <Cell label="🟥" value={s.red} />
                <Cell
                  label="G/WC"
                  value={s.tournaments ? +(s.goals / s.tournaments).toFixed(1) : 0}
                />
              </div>
              <div className="text-[11px] text-muted-foreground text-center">
                {s.first ? `${s.first} – ${s.last}` : "—"}
              </div>
            </div>
          ))}
        </div>
      )}

      {stats.length >= 2 && <CompareChart rows={stats} />}
    </div>
  );
}

function Cell({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-md bg-background border border-border py-2">
      <div className={`text-lg font-extrabold tabular-nums ${accent ? "text-gold" : ""}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function AddPicker({
  onPick,
  exclude,
  goals,
}: {
  onPick: (p: { name: string; country: string }) => void;
  exclude: { name: string; country: string }[];
  goals: GoalRow[];
}) {
  const [open, setOpen] = useState(false);
  const index = useMemo(() => buildPlayerIndex(goals), [goals]);
  const excludeKeys = new Set(exclude.map((p) => playerKey(p.name, p.country)));
  const options = index
    .filter((p) => !excludeKeys.has(playerKey(p.name, p.country)))
    .slice(0, 200);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8">
          <Plus className="size-3.5" /> Add player
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search top scorers…" />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((p) => (
                <CommandItem
                  key={p.name + p.country}
                  onSelect={() => {
                    onPick({ name: p.name, country: p.country });
                    setOpen(false);
                  }}
                >
                  <span className="text-base mr-2">{flagOf(p.country)}</span>
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-gold tabular-nums">{p.goals}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
