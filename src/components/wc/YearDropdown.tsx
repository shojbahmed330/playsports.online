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
  const champ = getChampion(year);
  const isLive = year === liveYear;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-amber-600/10 pl-2.5 pr-3 py-2 text-sm font-bold text-amber-100 hover:from-amber-500/25 hover:to-amber-600/20 transition"
          aria-label="Choose tournament year"
        >
          <Trophy className="size-4 text-amber-300" />
          <span className="hidden sm:inline text-xs uppercase tracking-widest text-amber-200/80">
            FIFA World Cup
          </span>
          <span className="tabular-nums text-white">{year}</span>
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 ring-1 ring-red-500/50 px-1.5 py-[1px] text-[9px] font-extrabold tracking-widest text-red-200 uppercase">
              <span className="size-1 rounded-full bg-red-500 animate-pulse" /> Live
            </span>
          )}
          <ChevronDown className="size-4 text-amber-200/80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 max-h-[70vh] overflow-y-auto bg-black/95 backdrop-blur-xl border border-amber-500/20"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70">
          Browse tournaments
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {years.map((y) => {
          const c = getChampion(y);
          const active = y === year;
          const live = y === liveYear;
          return (
            <DropdownMenuItem
              key={y}
              onSelect={() => onChange(y)}
              className={`flex items-center gap-2 cursor-pointer py-2 ${
                active ? "bg-amber-500/15 text-amber-100" : "text-gray-200 focus:bg-white/10"
              }`}
            >
              <span className="tabular-nums font-bold w-12 text-sm">{y}</span>
              {c ? (
                <>
                  <span className="text-base leading-none">{flagOf(c.champion)}</span>
                  <span className="flex-1 text-xs truncate">{c.champion}</span>
                  <span className="text-[10px] text-gray-500 truncate">{c.host}</span>
                </>
              ) : (
                <span className="flex-1 text-xs text-gray-500">TBD</span>
              )}
              {live && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 ring-1 ring-red-500/50 px-1.5 py-[1px] text-[9px] font-extrabold uppercase text-red-200">
                  <span className="size-1 rounded-full bg-red-500 animate-pulse" /> Live
                </span>
              )}
              {active && !live && <Check className="size-3.5 text-amber-300" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
