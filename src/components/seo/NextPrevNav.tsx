import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export type NextPrevItem = { label: string; href: string; sub?: string };

/**
 * Prev / next pagination for sequential entities:
 *   - Match #72 → #73
 *   - Round of 16 → Quarter-finals
 *   - World Series 2022 → 2023
 *
 * Also injects <link rel="prev" /> and <link rel="next" /> into <head>
 * (client side after hydration) so crawlers see the sequential
 * relationship. Route-level `head()` is the preferred spot to emit these
 * — this component is a safety net for pages that render them
 * dynamically only on the client.
 */
export function NextPrevNav({
  prev,
  next,
  label = "Sequential navigation",
  emitLinkTags = false,
}: {
  prev?: NextPrevItem | null;
  next?: NextPrevItem | null;
  label?: string;
  emitLinkTags?: boolean;
}) {
  useEffect(() => {
    if (!emitLinkTags) return;
    const created: HTMLLinkElement[] = [];
    if (prev?.href) {
      const el = document.createElement("link");
      el.rel = "prev";
      el.href = prev.href;
      document.head.appendChild(el);
      created.push(el);
    }
    if (next?.href) {
      const el = document.createElement("link");
      el.rel = "next";
      el.href = next.href;
      document.head.appendChild(el);
      created.push(el);
    }
    return () => {
      for (const el of created) el.remove();
    };
  }, [prev?.href, next?.href, emitLinkTags]);

  if (!prev && !next) return null;
  return (
    <nav
      aria-label={label}
      className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {prev ? (
        <a
          href={prev.href}
          rel="prev"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 transition hover:border-indigo-400/60"
        >
          <ChevronLeft className="size-4 shrink-0 text-muted-foreground group-hover:text-indigo-400" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Previous</div>
            <div className="truncate text-sm font-semibold text-foreground">{prev.label}</div>
            {prev.sub && <div className="truncate text-[11px] text-muted-foreground">{prev.sub}</div>}
          </div>
        </a>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
      {next ? (
        <a
          href={next.href}
          rel="next"
          className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-card/40 px-4 py-3 text-right transition hover:border-indigo-400/60"
        >
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Next</div>
            <div className="truncate text-sm font-semibold text-foreground">{next.label}</div>
            {next.sub && <div className="truncate text-[11px] text-muted-foreground">{next.sub}</div>}
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-indigo-400" />
        </a>
      ) : (
        <span aria-hidden className="hidden sm:block" />
      )}
    </nav>
  );
}
