import { CalendarX, RotateCcw } from "lucide-react";

/**
 * Compact empty state when a fixtures filter yields zero matches.
 * Used only when there ARE fixtures loaded but the filter hides them all.
 */
export function FixturesEmptyStateEuro({
  filterLabel,
  onReset,
}: {
  filterLabel: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 sm:py-8 text-center">
      <div className="mx-auto grid place-items-center size-10 rounded-xl bg-white/5 text-muted-foreground mb-2">
        <CalendarX className="size-5" />
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        No fixtures match “{filterLabel}”.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary px-3.5 py-2 text-xs font-bold hover:bg-primary/15 transition"
      >
        <RotateCcw className="size-3.5" /> Show all fixtures
      </button>
    </div>
  );
}
