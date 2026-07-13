// HOC wrapper that appends a <YearArchiveNav> to a year-based route.

import type { FC } from "react";
import { YearArchiveNav } from "./YearArchiveNav";

export function withYearNav<P extends object>(
  Inner: FC<P>,
  opts: { basePath: string; minYear: number; maxYear: number; label?: string; paramKey?: string },
): FC<P> {
  const Wrapped: FC<P> = (props) => (
    <>
      <Inner {...props} />
      <YearArchiveNav {...opts} />
    </>
  );
  Wrapped.displayName = `withYearNav(${Inner.displayName || Inner.name || "Component"})`;
  return Wrapped;
}
