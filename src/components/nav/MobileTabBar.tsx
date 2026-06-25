import { Link, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";

export type MobileTab = {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  match?: (pathname: string, search: Record<string, unknown>) => boolean;
  /** Optional search params to attach to the link. */
  search?: Record<string, unknown>;
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
  return (
    <>
      {/* spacer so fixed bar doesn't cover content */}
      <div aria-hidden className="h-16 sm:hidden" />
      <nav
        aria-label="Section quick nav"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-4">
          {tabs.map((t) => {
            const active = t.match ? t.match(pathname, search) : pathname === t.to;
            const Icon = t.Icon;
            return (
              <li key={`${t.to}-${t.label}`}>
                <Link
                  to={t.to}
                  search={t.search ? (prev) => ({ ...prev, ...t.search }) : undefined}
                  className={[
                    "relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold",
                    active ? a.active : "text-white/55 hover:text-white/80",
                  ].join(" ")}
                >
                  {active && (
                    <span className={`absolute top-0 h-0.5 w-8 rounded-full ${a.bar}`} />
                  )}
                  <Icon className="size-5" />
                  <span className="tracking-wide">{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
