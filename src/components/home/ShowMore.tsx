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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-gray-900 hover:bg-gray-800 ring-1 ring-white/10 text-gray-300 transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
