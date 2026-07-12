/**
 * Mobile-only in-page jump nav. Renders a horizontal pill scroller of
 * anchor links (#hash). Hidden ≥ sm; consumer uses matching `id` + `scroll-mt-*`
 * on target sections.
 */
export function MobileJumpNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
  return (
    <nav
      aria-label="Jump to section"
      className="sm:hidden mt-4 edge-fade-x -mx-4"
    >
      <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-1">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            className="tap-target snap-start shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-foreground/90 hover:bg-white/[0.08]"
          >
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
