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

  const activeIdx = Math.max(0, rounds.findIndex((r) => r.round === active));

  return (
    <div className="md:hidden">
      {/* Round progress rail — gives a sense of where in the bracket you are */}
      <div className="flex items-center gap-1.5 px-1 mb-2">
        {rounds.map((r, i) => {
          const isPast = i < activeIdx;
          const isOn = i === activeIdx;
          return (
            <div key={r.round} className="flex items-center gap-1.5 min-w-0">
              <span
                className={`block size-2 rounded-full shrink-0 ${
                  isOn ? "bg-amber-400 ring-2 ring-amber-400/30" : isPast ? "bg-amber-500/40" : "bg-gray-700"
                }`}
              />
              {i < rounds.length - 1 && (
                <span className={`block h-px w-5 ${isPast ? "bg-amber-500/40" : "bg-gray-800"}`} />
              )}
            </div>
          );
        })}
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-amber-400 font-bold">
          {ROUND_LABEL[active]}
        </span>
      </div>

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
            <div className="text-[10px] uppercase tracking-widest text-gray-500">
              {ROUND_FULL[stage.round]}
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">
              {stage.matches.length} match{stage.matches.length === 1 ? "" : "es"} · tap any card for details
            </div>
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
