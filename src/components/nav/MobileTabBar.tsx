import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export type MobileTabItem = {
  to: string;
  label: string;
  emoji?: string;
  Icon?: ComponentType<{ className?: string }>;
};

export type MobileTab = {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  match?: (pathname: string, search: Record<string, unknown>) => boolean;
  /** Optional search params to attach to the link. */
  search?: Record<string, unknown>;
  /** If provided, tapping opens a sub-menu instead of navigating. */
  items?: MobileTabItem[];
};

const ACCENTS = {
  amber: { active: "text-amber-300", bar: "bg-amber-400" },
  emerald: { active: "text-emerald-300", bar: "bg-emerald-400" },
  sky: { active: "text-sky-300", bar: "bg-sky-400" },
  fuchsia: { active: "text-fuchsia-300", bar: "bg-fuchsia-400" },
} as const;

export function MobileTabBar({
  tabs,
  accent = "amber",
}: {
  tabs: MobileTab[];
  accent?: keyof typeof ACCENTS;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const a = ACCENTS[accent];
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Close any open submenu on route change.
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  // Close the submenu on Escape.
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  return (
    <>
      {/* spacer so fixed bar doesn't cover content */}
      <div aria-hidden className="h-[68px] sm:hidden" />

      {/* Backdrop + submenu sheet */}
      {openMenu && (
        <button
          type="button"
          aria-label="Close section menu"
          tabIndex={-1}
          className="sm:hidden fixed inset-0 z-40 cursor-default bg-black/50 backdrop-blur-sm"
          onClick={() => setOpenMenu(null)}
        />
      )}

      <nav
        aria-label="Section quick nav"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      >
        <ul
          className={`grid`}
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        >
          {tabs.map((t) => {
            const key = `${t.to}-${t.label}`;
            const active = t.match ? t.match(pathname, search) : pathname === t.to;
            const Icon = t.Icon;
            const hasMenu = !!t.items?.length;
            const isOpen = openMenu === key;

            const inner = (
              <>
                {(active || isOpen) && (
                  <span aria-hidden className={`absolute top-0 h-0.5 w-10 rounded-full ${a.bar}`} />
                )}
                <Icon className="size-5" aria-hidden />
                <span className="tracking-wide">{t.label}</span>
              </>
            );

            const className = [
              "tap-target relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active || isOpen ? a.active : "text-muted-foreground hover:text-foreground",
            ].join(" ");

            return (
              <li key={key} className="relative">
                {hasMenu ? (
                  <>
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      aria-label={t.label}
                      onClick={() => setOpenMenu(isOpen ? null : key)}
                      className={className}
                    >
                      {inner}
                    </button>
                    {isOpen && (
                      <div
                        role="menu"
                        aria-label={`${t.label} sections`}
                        className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] inset-x-3 z-50 rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 fade-in duration-150 motion-reduce:animate-none"
                      >
                        <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {t.label}
                        </div>
                        <ul className="grid grid-cols-2 gap-2">
                          {t.items!.map((it) => {
                            const ItemIcon = it.Icon;
                            return (
                              <li key={it.to}>
                                <Link
                                  to={it.to}
                                  role="menuitem"
                                  onClick={() => setOpenMenu(null)}
                                  className="flex min-h-11 items-center gap-2 rounded-xl px-3 bg-muted ring-1 ring-border text-sm font-semibold text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  {it.emoji && (
                                    <span className="text-base leading-none" aria-hidden="true">
                                      {it.emoji}
                                    </span>
                                  )}
                                  {ItemIcon && <ItemIcon className="size-4" aria-hidden />}
                                  <span className="truncate">{it.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={t.to}
                    search={
                      t.search
                        ? (prev: Record<string, unknown>) => ({ ...prev, ...t.search })
                        : undefined
                    }
                    aria-current={active ? "page" : undefined}
                    aria-label={t.label}
                    className={className}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
