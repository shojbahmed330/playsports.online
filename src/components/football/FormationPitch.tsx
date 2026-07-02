import type { Wc2026LineupPlayer } from "@/lib/wc2026.functions";

// Parses "4-3-3" → [4,3,3]. Returns null for missing/bad input.
function parseFormation(f: string | null): number[] | null {
  if (!f) return null;
  const parts = f.split(/[-\s]+/).map((p) => parseInt(p, 10)).filter((n) => Number.isFinite(n) && n > 0);
  if (parts.length < 2) return null;
  const sum = parts.reduce((a, b) => a + b, 0);
  if (sum > 10 || sum < 6) return null;
  return parts;
}

type Props = {
  formation: string | null;
  starters: Wc2026LineupPlayer[];
  side: "home" | "away";
  onPick?: (p: Wc2026LineupPlayer) => void;
};

// Very compact pitch view. Rows = GK → back → mid → forward.
// Layout is proportional so it fits sm and full-width.
export function FormationPitch({ formation, starters, side, onPick }: Props) {
  const shape = parseFormation(formation);
  if (!shape || starters.length < 8) return null;

  // rows: [GK=1, ...shape]
  const rows: Wc2026LineupPlayer[][] = [];
  const gk = starters.find((p) => (p.position ?? "").toUpperCase().startsWith("G")) ?? starters[0];
  rows.push([gk]);
  const outfield = starters.filter((p) => p.id !== gk.id);
  let cursor = 0;
  for (const n of shape) {
    rows.push(outfield.slice(cursor, cursor + n));
    cursor += n;
  }

  // Away flips vertically so both teams face the centre line.
  const orderedRows = side === "away" ? [...rows].reverse() : rows;

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden ring-1 ring-white/10 ${
        side === "home"
          ? "bg-gradient-to-b from-emerald-900/40 via-emerald-950/60 to-black"
          : "bg-gradient-to-t from-sky-900/40 via-sky-950/60 to-black"
      }`}
      style={{ aspectRatio: "3 / 4" }}
      aria-label={`${side} formation ${formation}`}
    >
      {/* Pitch lines */}
      <div className="absolute inset-2 border border-white/15 rounded-md" />
      <div className="absolute left-2 right-2 top-1/2 border-t border-white/15" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-10 rounded-full border border-white/15" />

      <div className="relative z-10 h-full grid" style={{ gridTemplateRows: `repeat(${orderedRows.length}, 1fr)` }}>
        {orderedRows.map((row, ri) => (
          <div key={ri} className="flex items-center justify-around px-2">
            {row.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick?.(p)}
                className="group flex flex-col items-center gap-0.5 min-w-0 max-w-[68px] focus:outline-none"
              >
                <span
                  className={`inline-flex items-center justify-center rounded-full text-[10px] font-black tabular-nums ring-2 transition
                    ${side === "home"
                      ? "bg-emerald-500 text-black ring-emerald-200/60 group-hover:ring-white"
                      : "bg-sky-400 text-black ring-sky-100/60 group-hover:ring-white"}
                    size-7`}
                >
                  {p.shirt ?? "–"}
                </span>
                <span className="text-[9px] text-white/90 font-semibold truncate max-w-full leading-tight">
                  {shortName(p.name)}
                  {p.captain && <span className="ml-0.5 text-amber-300">C</span>}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="absolute top-1.5 right-2 text-[9px] font-mono px-1.5 py-0.5 bg-black/50 rounded text-amber-200">
        {formation}
      </div>
    </div>
  );
}

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}
