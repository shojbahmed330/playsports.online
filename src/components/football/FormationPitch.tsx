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
  const isHome = side === "home";

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl ring-1 ring-border"
      style={{
        aspectRatio: "3 / 4",
        background: isHome
          ? "linear-gradient(to bottom, color-mix(in oklch, var(--color-accent-cricket) 25%, var(--background)), var(--background))"
          : "linear-gradient(to top, color-mix(in oklch, var(--color-accent-mlb) 25%, var(--background)), var(--background))",
      }}
      aria-label={`${side} formation ${formation}`}
    >
      {/* Pitch lines */}
      <div className="absolute inset-2 rounded-md border border-foreground/15" aria-hidden="true" />
      <div className="absolute left-2 right-2 top-1/2 border-t border-foreground/15" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/15" aria-hidden="true" />

      <div className="relative z-10 grid h-full" style={{ gridTemplateRows: `repeat(${orderedRows.length}, 1fr)` }}>
        {orderedRows.map((row, ri) => (
          <div key={ri} className="flex items-center justify-around px-2">
            {row.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick?.(p)}
                className="group flex max-w-[68px] min-w-0 flex-col items-center gap-0.5 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={`inline-flex size-7 items-center justify-center rounded-full text-micro font-black tabular-nums ring-2 transition
                    ${isHome
                      ? "bg-positive text-background ring-positive/60 group-hover:ring-foreground"
                      : "bg-[var(--color-accent-mlb)] text-background ring-[var(--color-accent-mlb)]/60 group-hover:ring-foreground"}`}
                >
                  {p.shirt ?? "–"}
                </span>
                <span className="max-w-full truncate text-micro font-semibold leading-tight text-foreground/90">
                  {shortName(p.name)}
                  {p.captain && <span className="ml-0.5 text-primary">C</span>}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="absolute right-2 top-1.5 rounded bg-background/50 px-1.5 py-0.5 font-mono text-micro text-primary">
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
