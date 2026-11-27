import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trophy, Check } from "lucide-react";
import { WC_YEARS } from "@/lib/supabase";
import { getChampion } from "@/data/wc_champions";
import { flagOf } from "@/lib/flags";

/**
 * Compact dropdown replacement for YearStrip. Shows current tournament
 * with a red LIVE pill on 2026 and champion flags in the menu.
 */
export function YearDropdown({
  year,
  onChange,
  liveYear = 2026,
}: {
  year: number;
  onChange: (y: number) => void;
  liveYear?: number;
}) {
  const years = WC_YEARS.slice().reverse();
  const isLive = year === liveYear;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 py-2 pl-2.5 pr-3 text-caption font-bold text-foreground transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Choose tournament year"
        >
          <Trophy className="size-4 text-primary" aria-hidden="true" />
          <span className="hidden text-micro uppercase text-primary/80 sm:inline">
            FIFA World Cup
          </span>
          <span className="tabular-nums text-foreground">{year}</span>
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-live/20 px-1.5 py-px text-micro font-extrabold uppercase text-live ring-1 ring-live/50">
              <span className="size-1 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" /> Live
            </span>
          )}
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-[70vh] w-72 overflow-y-auto border-border bg-background/95 backdrop-blur-xl"
      >
        <DropdownMenuLabel className="text-micro uppercase text-primary/70">
          Browse tournaments
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        {years.map((y) => {
          const c = getChampion(y);
          const active = y === year;
          const live = y === liveYear;
          return (
            <DropdownMenuItem
              key={y}
              onSelect={() => onChange(y)}
              className={`flex min-h-11 cursor-pointer items-center gap-2 py-2 ${
                active ? "bg-primary/15 text-foreground" : "text-foreground focus:bg-accent"
              }`}
            >
              <span className="w-12 text-caption font-bold tabular-nums">{y}</span>
              {c ? (
                <>
                  <span className="text-base leading-none" aria-hidden="true">{flagOf(c.champion)}</span>
                  <span className="flex-1 truncate text-caption">{c.champion}</span>
                  <span className="truncate text-micro text-muted-foreground">{c.host}</span>
                </>
              ) : (
                <span className="flex-1 text-caption text-muted-foreground">TBD</span>
              )}
              {live && (
                <span className="inline-flex items-center gap-1 rounded-full bg-live/20 px-1.5 py-px text-micro font-extrabold uppercase text-live ring-1 ring-live/50">
                  <span className="size-1 rounded-full bg-live animate-pulse motion-reduce:animate-none" aria-hidden="true" /> Live
                </span>
              )}
              {active && !live && <Check className="size-3.5 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
