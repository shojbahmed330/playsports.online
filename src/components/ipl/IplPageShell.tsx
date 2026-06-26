import type { ReactNode } from "react";
import { SportNav } from "@/components/sports/SportNav";
import { IplSubNav } from "@/components/ipl/IplSubNav";

/** Shared chrome for every /cricket/ipl/* sub-route. */
export function IplPageShell({
  title,
  subtitle,
  right,
  children,
  liveCount,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  liveCount?: number;
}) {
  return (
    <div className="min-h-screen bg-background text-white">
      <SportNav liveCount={liveCount} />
      <IplSubNav />
      <header className="max-w-7xl mx-auto px-3 sm:px-6 pt-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between">
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300/80">
              Indian Premier League
            </div>
            <h1 className="mt-1 truncate text-2xl sm:text-3xl font-black tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      </header>
      <main id="main-content" className="max-w-7xl mx-auto px-3 sm:px-6 py-6">{children}</main>
    </div>
  );
}
