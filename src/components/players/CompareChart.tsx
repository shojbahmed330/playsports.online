import { flagOf } from "@/lib/flags";

type Row = {
  name: string;
  country: string;
  goals: number;
  penalties: number;
  tournaments: number;
  yellow: number;
  red: number;
  live2026: number;
};

const METRICS: { key: keyof Row; label: string; tone: string; emoji?: string }[] = [
  { key: "goals", label: "Goals", tone: "from-amber-400 to-yellow-500", emoji: "⚽" },
  { key: "tournaments", label: "Tournaments", tone: "from-blue-400 to-cyan-400", emoji: "🏆" },
  { key: "penalties", label: "Penalties", tone: "from-rose-400 to-pink-500", emoji: "🎯" },
  { key: "yellow", label: "Yellow cards", tone: "from-yellow-300 to-yellow-500", emoji: "🟨" },
  { key: "red", label: "Red cards", tone: "from-red-500 to-rose-600", emoji: "🟥" },
];

export function CompareChart({ rows }: { rows: Row[] }) {
  if (rows.length < 2) return null;

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2">
          📊 Side-by-side breakdown
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {rows.length} players
        </span>
      </div>

      <div className="space-y-4">
        {METRICS.map((m) => {
          const max = Math.max(1, ...rows.map((r) => Number(r[m.key]) || 0));
          return (
            <div key={String(m.key)}>
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </div>
              <div className="space-y-1.5">
                {rows.map((r) => {
                  const v = Number(r[m.key]) || 0;
                  const pct = Math.round((v / max) * 100);
                  return (
                    <div key={r.name + r.country} className="flex items-center gap-2 text-xs">
                      <div className="w-24 sm:w-32 flex items-center gap-1.5 shrink-0">
                        <span className="text-sm leading-none">{flagOf(r.country)}</span>
                        <span className="truncate font-medium">{r.name.split(" ").slice(-1)[0]}</span>
                      </div>
                      <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${m.tone} transition-all duration-700 ease-out`}
                          style={{ width: v === 0 ? "2px" : `${Math.max(4, pct)}%` }}
                        />
                      </div>
                      <span className="w-9 text-right tabular-nums font-bold text-foreground">
                        {v}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
