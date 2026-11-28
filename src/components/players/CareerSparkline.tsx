/**
 * Tiny dependency-free SVG sparkline for a player's goals across World Cup years.
 * Renders bars with the current 2026 year highlighted live-green.
 */
export function CareerSparkline({ data }: { data: { year: number; goals: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(1, ...data.map((d) => d.goals));
  const W = 280;
  const H = 60;
  const pad = 4;
  const barW = (W - pad * 2) / data.length;

  return (
    <div className="rounded-xl border border-border bg-background/50 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Goals across tournaments
      </div>
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="career-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.18 75)" />
            <stop offset="100%" stopColor="oklch(0.62 0.20 50)" />
          </linearGradient>
          <linearGradient id="career-live" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.20 150)" />
            <stop offset="100%" stopColor="oklch(0.62 0.20 150)" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const h = d.goals === 0 ? 2 : Math.max(3, (d.goals / max) * H);
          const x = pad + i * barW + barW * 0.15;
          const y = H - h;
          const w = barW * 0.7;
          const isLive = d.year === 2026;
          return (
            <g key={d.year}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={2}
                fill={isLive ? "url(#career-live)" : "url(#career-grad)"}
              >
                <title>{`${d.year}: ${d.goals} goal${d.goals === 1 ? "" : "s"}`}</title>
              </rect>
              {d.goals > 0 && (
                <text
                  x={x + w / 2}
                  y={y - 2}
                  fontSize="8"
                  textAnchor="middle"
                  fill={isLive ? "oklch(0.85 0.20 150)" : "oklch(0.85 0.15 75)"}
                  fontWeight="700"
                >
                  {d.goals}
                </text>
              )}
              {(i === 0 || i === data.length - 1 || isLive) && (
                <text
                  x={x + w / 2}
                  y={H + 12}
                  fontSize="8"
                  textAnchor="middle"
                  fill="oklch(0.55 0 0)"
                >
                  {`'${String(d.year).slice(2)}`}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
