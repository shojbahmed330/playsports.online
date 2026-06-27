import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Floating "back to top" button. Appears after the user scrolls past 800px
 * and respects prefers-reduced-motion (scrolls instantly when reduced).
 */
export function BackToTopFab() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handler = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  if (!show) return null;
  return (
    <button
      type="button"
      onClick={handler}
      aria-label="Back to top"
      className="fixed right-4 bottom-24 md:bottom-6 z-40 grid place-items-center size-11 rounded-full bg-amber-500 text-black shadow-[0_8px_24px_rgba(245,158,11,0.45)] ring-1 ring-amber-300/50 active:scale-95 transition-all animate-in fade-in zoom-in-90"
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
