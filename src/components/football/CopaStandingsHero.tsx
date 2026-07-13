import { Trophy, Info } from "lucide-react";
import { Link } from "@tanstack/react-router";

/** Standings hero for Copa América. */
export function CopaStandingsHero({ live = false }: { live?: boolean }) {
  return (
    <section className="mb-4 sm:mb-6 space-y-3">
      <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-400/[0.12] via-white/[0.02] to-transparent p-4 sm:p-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-2">
          <Trophy className="size-3.5" /> {live ? "Live table" : "Group standings"}
        </div>
        <h1 className="text-lg sm:text-2xl font-black leading-tight">Copa América · Group standings</h1>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat label="Reigning" value="🇦🇷 2024" />
          <Stat label="Teams" value="16" />
          <Stat label="Format" value="4×4 + KO" />
        </div>
        <Link
          to="/football/$comp/history/$year"
          params={{ comp: "copa-america", year: "2024" }}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-200 hover:border-amber-300 transition"
        >
          <Trophy className="size-3" /> See the 2024 final
        </Link>
      </div>
      {!live && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 flex items-start gap-2 text-[12px] text-muted-foreground">
          <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            CONMEBOL qualifiers double as World Cup qualifiers — Copa group standings return when the 2028 draw is made.
            Below is the definitive Copa América 2024 group phase.
          </div>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-2 text-center min-w-0">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground truncate">{label}</div>
      <div className="text-sm font-black truncate">{value}</div>
    </div>
  );
}
