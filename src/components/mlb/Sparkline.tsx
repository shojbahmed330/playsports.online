type Props = {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  label?: string;
};

export function Sparkline({ values, width = 120, height = 32, color = "#f7e6c4", fill = "rgba(247,230,196,0.18)", label }: Props) {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length < 2) {
    return <div className="h-8 grid place-items-center text-[10px] text-muted-foreground">—</div>;
  }
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const span = max - min || 1;
  const step = clean.length > 1 ? width / (clean.length - 1) : width;
  const pts = clean.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${d} L${width} ${height} L0 ${height} Z`;
  const last = pts[pts.length - 1];

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <path d={area} fill={fill} />
        <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r={2.5} fill={color} />
      </svg>
      {label && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>}
    </div>
  );
}
