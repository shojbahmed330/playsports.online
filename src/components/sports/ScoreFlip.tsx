import { useEffect, useRef } from "react";

/**
 * Renders a number that pulses (color + scale) whenever its value changes.
 * Used for live score updates so they catch the eye without being noisy.
 */
export function ScoreFlip({
  value,
  className = "",
}: {
  value: number | null;
  className?: string;
}) {
  const elRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<number | null>(value);

  useEffect(() => {
    if (prevRef.current !== value && prevRef.current !== null && value !== null) {
      const el = elRef.current;
      if (el) {
        el.classList.remove("score-pulse");
        // force reflow so we can replay the animation
        void el.offsetWidth;
        el.classList.add("score-pulse");
      }
    }
    prevRef.current = value;
  }, [value]);

  return (
    <span ref={elRef} className={`inline-block tabular-nums ${className}`}>
      {value ?? "–"}
    </span>
  );
}
