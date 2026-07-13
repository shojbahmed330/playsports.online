import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { EURO_RISING_STARS } from "@/lib/euro-players";
import { flagFor } from "@/lib/euro-history";

export function EuroRisingStars() {
  return (
    <section id="rising" className="mt-10 scroll-mt-24">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-300" /> Watch at Euro 2028
        </h2>
      </div>
      <div className="edge-fade-x -mx-4 sm:mx-0">
        <ul className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 sm:px-0 pb-1">
          {EURO_RISING_STARS.map((s) => {
            const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=0b1220&color=fff&bold=true&size=96`;
            const body = (
              <>
                <img
                  src={s.image ?? fallback}
                  alt={s.name}
                  loading="lazy"
                  onError={(e) = decoding="async"> {
                    const img = e.currentTarget;
                    if (img.src !== fallback) img.src = fallback;
                  }}
                  className="size-14 rounded-full object-cover bg-white/10 ring-1 ring-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-sm font-bold truncate">{s.name}</div>
                    <span className="shrink-0 text-[9px] uppercase tracking-widest rounded-full bg-emerald-500/15 text-emerald-200 px-1.5 py-0.5">
                      2028
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    <span aria-hidden>{flagFor(s.nation)} </span>
                    {s.nation} · {s.club} · {s.position}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-200 truncate">{s.headline}</div>
                </div>
              </>
            );
            const cls =
              "snap-start shrink-0 w-[76vw] max-w-[300px] sm:w-auto sm:max-w-none flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-emerald-300/40 hover:bg-emerald-500/[0.06] transition px-3 py-2.5";
            return s.playerId ? (
              <li key={s.name}>
                <Link
                  to="/football/$comp/players/$playerId"
                  params={{ comp: "euro", playerId: s.playerId }}
                  className={cls}
                >
                  {body}
                </Link>
              </li>
            ) : (
              <li key={s.name} className={cls}>{body}</li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
