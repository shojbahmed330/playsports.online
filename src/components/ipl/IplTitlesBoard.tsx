import { Trophy } from "lucide-react";

type Franchise = {
  id: string;
  short: string;
  name: string;
  titles: number;
  titleYears: number[];
  primary: string;
  ink: string;
  logo: string;
};

/** Sortable, color-branded grid of franchises with title counts. */
export function IplTitlesBoard({ teams }: { teams: Franchise[] }) {
  const sorted = [...teams].sort((a, b) => b.titles - a.titles || a.name.localeCompare(b.name));
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
          Franchise Titles Board
        </h2>
        <span className="text-[11px] text-white/50">All-time champions</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {sorted.map((t) => (
          <article
            key={t.id}
            className="group relative overflow-hidden rounded-xl border border-white/5 p-3 transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(160deg, ${t.primary} 0%, color-mix(in oklab, ${t.primary} 65%, #0a0a0f) 100%)`,
              color: t.ink,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-80">
                  {t.short}
                </div>
                <div className="mt-0.5 truncate text-[13px] font-bold leading-tight">{t.name}</div>
              </div>
              {t.logo && (
                <img
                  src={t.logo}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-md bg-black/20 object-contain p-1 ring-1 ring-white/20"
                  loading="lazy"
                />
              )}
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold opacity-90">
                <Trophy className="size-3.5" />
                {t.titles} {t.titles === 1 ? "title" : "titles"}
              </div>
              <div className="text-[10px] opacity-70">
                {t.titleYears.length ? t.titleYears.join(", ") : "—"}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 -bottom-2 h-10 rounded-full bg-white/10 blur-2xl" />
          </article>
        ))}
      </div>
    </section>
  );
}
