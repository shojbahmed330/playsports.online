// Prev/Next year navigator for year-based archive routes. Reads year from
// route params and links to the sibling year within [minYear, maxYear].
// Emits <link rel=prev/next> client-side for crawlers.

import { useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { NextPrevNav } from "./NextPrevNav";

type Props = {
  basePath: string;             // "/mlb/world-series"
  minYear: number;
  maxYear: number;
  label?: string;               // "World Series"
  paramKey?: string;            // default "year"
};

export function YearArchiveNav({ basePath, minYear, maxYear, label = "Season", paramKey = "year" }: Props) {
  const params = useParams({ strict: false }) as Record<string, string>;
  const y = Number(params[paramKey]);
  const nav = useMemo(() => {
    if (!Number.isFinite(y)) return null;
    const prev = y > minYear ? y - 1 : null;
    const next = y < maxYear ? y + 1 : null;
    return {
      prev: prev ? { label: `${label} ${prev}`, href: `${basePath}/${prev}` } : null,
      next: next ? { label: `${label} ${next}`, href: `${basePath}/${next}` } : null,
    };
  }, [y, minYear, maxYear, label, basePath]);
  if (!nav) return null;
  return <NextPrevNav prev={nav.prev} next={nav.next} label={`${label} navigation`} emitLinkTags />;
}
