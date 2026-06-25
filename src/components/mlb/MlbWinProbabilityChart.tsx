import type { MlbWinProbPoint, MlbLinescoreTeam } from "@/lib/mlb.functions";
import { useState } from "react";

type Props = {
  data: MlbWinProbPoint[];
  home: MlbLinescoreTeam;
  away: MlbLinescoreTeam;
};

export function MlbWinProbabilityChart({ data, home, away }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length < 2) {
    return (
      <div className="rounded-2xl bg-card ring-1 ring-border p-6 text-center text-sm text-muted-foreground">
        Win probability data unavailable.
      </div>
    );
  }

  const W = 800;
  const H = 200;
  const PAD = { top: 16, right: 16, bottom: 24, left: 16 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW;

  const homeColor = home.color ?? "#f7e6c4";
  const awayColor = away.color ?? "#d50032";

  const pts = data.map((d, i) => {
    const x = PAD.left + i * step;
    const y = PAD.top + (1 - d.homeWinPct) * innerH;
    return [x, y] as const;
  });

  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const midY = PAD.top + innerH / 2;
  const lastPt = pts[pts.length - 1];
  const finalHomePct = Math.round(data[data.length - 1].homeWinPct * 100);

  const active = hover != null ? data[hover] : data[data.length - 1];
  const activePt = hover != null ? pts[hover] : lastPt;

  return (
    <div className="rounded-2xl bg-card ring-1 ring-border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="text-sm font-bold text-white">Win Probability</h2>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: homeColor }}>
            <span className="size-2 rounded-full" style={{ background: homeColor }} />
            {home.abbr} {finalHomePct}%
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: awayColor }}>
            <span className="size-2 rounded-full" style={{ background: awayColor }} />
            {away.abbr} {100 - finalHomePct}%
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W - PAD.left;
            const idx = Math.round(x / step);
            if (idx >= 0 && idx < data.length) setHover(idx);
          }}
        >
          {/* Home band (above 50) */}
          <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH / 2} fill={homeColor} opacity={0.05} />
          {/* Away band */}
          <rect x={PAD.left} y={midY} width={innerW} height={innerH / 2} fill={awayColor} opacity={0.05} />
          {/* 50% line */}
          <line x1={PAD.left} y1={midY} x2={PAD.left + innerW} y2={midY} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />

          {/* Scoring markers */}
          {data.map((d, i) =>
            d.scoring ? (
              <circle key={`s-${i}`} cx={pts[i][0]} cy={pts[i][1]} r={3} fill="#facc15" opacity={0.8} />
            ) : null
          )}

          {/* Win prob line */}
          <path d={linePath} fill="none" stroke={homeColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {/* Hover crosshair */}
          {activePt && (
            <>
              <line x1={activePt[0]} y1={PAD.top} x2={activePt[0]} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.2)" />
              <circle cx={activePt[0]} cy={activePt[1]} r={4} fill={homeColor} stroke="#0a1428" strokeWidth={1.5} />
            </>
          )}

          {/* Labels */}
          <text x={PAD.left} y={PAD.top - 4} fill={homeColor} fontSize={10} opacity={0.7}>{home.abbr} favored</text>
          <text x={PAD.left} y={PAD.top + innerH + 14} fill={awayColor} fontSize={10} opacity={0.7}>{away.abbr} favored</text>
        </svg>
      </div>

      {active && (
        <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/5 p-3 text-xs">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="font-bold text-[#f7e6c4]">{active.inning || "—"}</span>
            <span className="tabular-nums text-white/70">
              {away.abbr} {active.awayScore ?? 0} — {active.homeScore ?? 0} {home.abbr}
            </span>
            <span className="tabular-nums font-extrabold text-white">
              {Math.round(active.homeWinPct * 100)}% {home.abbr}
            </span>
          </div>
          {active.text && <p className="text-gray-300 leading-snug">{active.text}</p>}
        </div>
      )}
    </div>
  );
}
