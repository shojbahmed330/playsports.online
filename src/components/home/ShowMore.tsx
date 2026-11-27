import { useState } from "react";

/**
 * Progressive disclosure list — shows N items by default, "Show X more" reveals the rest.
 * Pure presentation helper. Pass any rendered children.
 */
export function ShowMore({
  initialCount = 5,
  step = 5,
  totalCount,
  children,
  labelMore = "Show more",
  labelLess = "Show less",
}: {
  initialCount?: number;
  step?: number;
  totalCount: number;
  children: (visibleCount: number) => React.ReactNode;
  labelMore?: string;
  labelLess?: string;
}) {
  const [visible, setVisible] = useState(Math.min(initialCount, totalCount));
  const canExpand = visible < totalCount;
  const expanded = visible >= totalCount && totalCount > initialCount;

  return (
    <div className="space-y-3">
      {children(visible)}
      {totalCount > initialCount && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisible((v) => (canExpand ? Math.min(v + step, totalCount) : initialCount))
            }
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-muted px-4 text-caption font-bold text-foreground ring-1 ring-border transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {canExpand ? (
              <>
                {labelMore} ({totalCount - visible})
              </>
            ) : expanded ? (
              <>{labelLess}</>
            ) : null}
          </button>
        </div>
      )}
    </div>
  );
}
