import { useState } from "react";
import type { WCMatch } from "@/lib/supabase";
import type { RoundKey } from "./MatchCard";
import { MobileMatchCard } from "./MobileMatchCard";

const ROUND_LABEL: Record<RoundKey, string> = {
  round_of_32:   "R32",
  round_of_16:   "R16",
  quarter_final: "QF",
  semi_final:    "SF",
  final:         "Final",
  third_place:   "3rd Place",
};
const ROUND_FULL: Record<RoundKey, string> = {
  round_of_32:   "Round of 32",
  round_of_16:   "Round of 16",
  quarter_final: "Quarter Finals",
  semi_final:    "Semi Finals",
  final:         "Final",
  third_place:   "Third-Place Play-off",
};

/**
 * Mobile-only vertical knockout bracket with stage chips at the top.
 * Connectors flow downward — fits naturally on a phone.
 */
export function MobileBracket({
  rounds, onPick,
}: {
  rounds: { round: RoundKey; matches: WCMatch[] }[];
  onPick: (m: WCMatch) => void;
}) {
  const [active, setActive] = useState<RoundKey>(rounds[0]?.round ?? "round_of_16");
  const stage = rounds.find((r) => r.round === active);

  return (
    <div className="md:hidden">
      {/* stage chips */}
      <div className="flex gap-2 overflow-x-auto snap-x px-1 pb-2 -mx-1" style={{ scrollbarWidth: "none" }}>
        {rounds.map(({ round, matches }) => {
          const isActive = round === active;
          return (
            <button
              key={round}
              onClick={() => setActive(round)}
              className={`snap-center shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/30"
                  : "bg-gray-900 text-gray-400 ring-1 ring-gray-800"
              }`}
            >
              {ROUND_LABEL[round]}
              <span className={`ml-1 text-[9px] ${isActive ? "text-black/70" : "text-gray-600"}`}>
                {matches.length}
              </span>
            </button>
          );
        })}
      </div>

      {stage && (
        <>
          <div className="text-center my-3">
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              {ROUND_FULL[stage.round]}
            </span>
          </div>
          <div className="space-y-3 relative">
            {stage.matches.map((m, i) => (
              <div key={m.id} className="relative">
                <MobileMatchCard match={m} onClick={() => onPick(m)} />
                {i < stage.matches.length - 1 && (
                  <div className="absolute left-1/2 -bottom-2 w-px h-2 bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
