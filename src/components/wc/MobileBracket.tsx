import { useRef, useState } from "react";
import type { WCMatch } from "@/lib/supabase";
import type { RoundKey } from "./MatchCard";
import { MobileMatchCard } from "./MobileMatchCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  // Swipe left/right to change rounds
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 40) return;
    if (dx < 0 && activeIdx < rounds.length - 1) setActive(rounds[activeIdx + 1].round);
    if (dx > 0 && activeIdx > 0) setActive(rounds[activeIdx - 1].round);
  };
  const prev = () => activeIdx > 0 && setActive(rounds[activeIdx - 1].round);
  const next = () => activeIdx < rounds.length - 1 && setActive(rounds[activeIdx + 1].round);

  return (
    <div className="md:hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Sticky round header: progress rail + chip row */}
      <div className="sticky top-14 z-20 -mx-3 border-b border-border bg-background/85 px-3 pb-2 pt-2 backdrop-blur-md">
        <div className="mb-2 flex items-center gap-1.5 px-1">
          <button
            type="button"
            onClick={prev}
            disabled={activeIdx === 0}
            aria-label="Previous round"
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          {rounds.map((r, i) => {
            const isPast = i < activeIdx;
            const isOn = i === activeIdx;
            return (
              <div key={r.round} className="flex min-w-0 items-center gap-1.5">
                <span
                  className={`block size-2 shrink-0 rounded-full ${
                    isOn ? "bg-primary ring-2 ring-primary/30" : isPast ? "bg-primary/40" : "bg-muted"
                  }`}
                  aria-hidden="true"
                />
                {i < rounds.length - 1 && (
                  <span className={`block h-px w-4 ${isPast ? "bg-primary/40" : "bg-border"}`} aria-hidden="true" />
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={next}
            disabled={activeIdx === rounds.length - 1}
            aria-label="Next round"
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:text-primary disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
          <span className="ml-auto text-micro uppercase tabular-nums text-primary">
            {activeIdx + 1}/{rounds.length} · {ROUND_LABEL[active]}
          </span>
        </div>

        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1" style={{ scrollbarWidth: "none" }}>
          {rounds.map(({ round, matches }) => {
            const isActive = round === active;
            return (
              <button
                key={round}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(round)}
                className={`inline-flex min-h-11 shrink-0 snap-center items-center rounded-full px-3 text-micro font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground ring-1 ring-border hover:text-foreground"
                }`}
              >
                {ROUND_LABEL[round]}
                <span className={`ml-1 text-micro ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {matches.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {stage && (
        <>
          <div className="my-3 text-center">
            <div className="text-micro uppercase text-muted-foreground">
              {ROUND_FULL[stage.round]}
            </div>
            <div className="mt-0.5 text-micro text-muted-foreground">
              {stage.matches.length} match{stage.matches.length === 1 ? "" : "es"} · swipe ← → to change round
            </div>
          </div>
          <div className="relative space-y-3">
            {stage.matches.map((m, i) => (
              <div key={m.id} className="relative">
                <MobileMatchCard match={m} onClick={() => onPick(m)} />
                {i < stage.matches.length - 1 && (
                  <div className="absolute -bottom-2 left-1/2 h-2 w-px bg-border" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
