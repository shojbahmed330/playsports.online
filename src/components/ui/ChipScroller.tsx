import { useEffect, useRef, useState } from "react";

/**
 * Horizontal chip scroller primitive used across sub-navs.
 * - Native horizontal scroll with snap on mobile.
 * - Edge fades when content overflows.
 * - Auto-scrolls the active child into view.
 * - Keyboard: ArrowLeft/Right move focus across children.
 */
export function ChipScroller({
  children,
  ariaLabel,
  className = "",
  align = "start",
}: {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
  align?: "start" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<{ l: boolean; r: boolean }>({ l: false, r: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const l = el.scrollLeft > 4;
      const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
      setEdges((p) => (p.l === l && p.r === r ? p : { l, r }));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  // Auto-center the active (aria-current/aria-selected) chip.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const active = el.querySelector<HTMLElement>(
      '[aria-current="page"], [aria-current="true"], [aria-selected="true"]'
    );
    if (active) {
      const target =
        active.offsetLeft - el.clientWidth / 2 + active.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    }
  });

  return (
    <div className={`relative ${className}`}>
      {edges.l && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent z-10"
        />
      )}
      {edges.r && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent z-10"
        />
      )}
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        className={`flex gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar ${
          align === "center" ? "justify-start sm:justify-center" : ""
        }`}
        style={{ scrollbarWidth: "none" }}
      >
        {children}
      </div>
    </div>
  );
}
