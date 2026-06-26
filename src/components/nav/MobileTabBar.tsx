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
  amber:    { active: "text-amber-300",    bar: "bg-amber-400" },
  emerald:  { active: "text-emerald-300",  bar: "bg-emerald-400" },
  sky:      { active: "text-sky-300",      bar: "bg-sky-400" },
  fuchsia:  { active: "text-fuchsia-300",  bar: "bg-fuchsia-400" },
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
  useEffect(() => { setOpenMenu(null); }, [pathname]);

  return (
    <>
      {/* spacer so fixed bar doesn't cover content */}
      <div aria-hidden className="h-[68px] sm:hidden" />

      {/* Backdrop + submenu sheet */}
      {openMenu && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpenMenu(null)}
          aria-hidden
        />
      )}

      <nav
        aria-label="Section quick nav"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
      >
        <ul className={`grid`} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
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
              "tap-target relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors w-full",
              active || isOpen ? a.active : "text-white/60 hover:text-white/90 active:text-white",
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
                        className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] inset-x-3 z-50 rounded-2xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl p-2 animate-in slide-in-from-bottom-2 fade-in duration-150"
                      >
                        <div className="px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/50">
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
                                  className="flex items-center gap-2 rounded-xl px-3 py-3 bg-white/[0.04] hover:bg-white/[0.10] ring-1 ring-white/10 text-sm font-semibold text-white/90 transition-colors"
                                >
                                  {it.emoji && <span className="text-base leading-none">{it.emoji}</span>}
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
                    search={t.search ? ((prev: Record<string, unknown>) => ({ ...prev, ...t.search })) : undefined}
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
