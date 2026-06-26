import { type ReactNode, useEffect, useRef, useState } from "react";

export type StatColumn<T> = {
  key: string;
  label: string;
  sticky?: boolean;
  align?: "left" | "right" | "center";
  render: (row: T, index: number) => ReactNode;
  hideOnMobile?: boolean;
  width?: string;
};

type Props<T> = {
  rows: T[];
  columns: StatColumn<T>[];
  caption?: string;
  empty?: ReactNode;
  rowKey: (row: T, index: number) => string;
  density?: "compact" | "comfortable";
  zebra?: boolean;
  onRowClick?: (row: T) => void;
};

/**
 * Mobile-first responsive stat table.
 * - Horizontal scroll with edge fades when overflowing.
 * - Optional sticky first column for player/team identity.
 * - 44px row height for tap targets when interactive.
 * - Semantic <table> with caption + scope, screen-reader friendly.
 */
export function StatTable<T>({
  rows,
  columns,
  caption,
  empty,
  rowKey,
  density = "comfortable",
  zebra = true,
  onRowClick,
}: Props<T>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<{ left: boolean; right: boolean }>({ left: false, right: false });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ left: el.scrollLeft > 4, right: el.scrollLeft < max - 4 });
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [rows.length, columns.length]);

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
        {empty ?? "No data available."}
      </div>
    );
  }

  const cellPad = density === "compact" ? "px-2.5 py-2" : "px-3 py-2.5";
  const interactive = !!onRowClick;

  return (
    <div className="relative">
      {edges.left && (
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent" />
      )}
      {edges.right && (
        <div aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent" />
      )}
      <div
        ref={wrapRef}
        className="overflow-x-auto rounded-xl ring-1 ring-border bg-card/60 -mx-1 sm:mx-0"
        role="region"
        aria-label={caption ?? "Statistics"}
        tabIndex={0}
      >
        <table className="w-full min-w-full text-sm border-collapse">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-card/80 border-b border-border">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  style={c.width ? { width: c.width } : undefined}
                  className={[
                    cellPad,
                    "text-[10px] uppercase tracking-wider font-bold text-muted-foreground whitespace-nowrap",
                    c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left",
                    c.sticky ? "sticky left-0 z-[5] bg-card/95 backdrop-blur" : "",
                    c.hideOnMobile ? "hidden sm:table-cell" : "",
                  ].join(" ")}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={rowKey(row, idx)}
                onClick={interactive ? () => onRowClick?.(row) : undefined}
                className={[
                  "border-b border-border/50 last:border-0",
                  zebra && idx % 2 === 1 ? "bg-white/[0.015]" : "",
                  interactive ? "cursor-pointer hover:bg-white/[0.05] focus-within:bg-white/[0.05]" : "",
                ].join(" ")}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={[
                      cellPad,
                      "whitespace-nowrap",
                      c.align === "right" ? "text-right tabular-nums" : c.align === "center" ? "text-center" : "text-left",
                      c.sticky ? "sticky left-0 z-[4] bg-card/95 backdrop-blur font-semibold" : "",
                      c.hideOnMobile ? "hidden sm:table-cell" : "",
                    ].join(" ")}
                  >
                    {c.render(row, idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
