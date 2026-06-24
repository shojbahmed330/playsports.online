export function MlbHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-mlb-hero">
      <div aria-hidden className="absolute inset-0 mlb-pinstripes opacity-60" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 80% at 15% 10%, rgba(247,230,196,0.15), transparent 60%), radial-gradient(50% 70% at 85% 90%, rgba(213,0,50,0.25), transparent 65%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-center gap-4">
          <div className="size-16 sm:size-20 rounded-2xl bg-[#f7e6c4]/15 ring-1 ring-[#f7e6c4]/30 grid place-items-center text-4xl sm:text-5xl shrink-0 backdrop-blur">
            ⚾
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.25em] text-[#f7e6c4] font-bold">
              Major League Baseball
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white truncate">
              MLB Pro Hub
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Live scores · Standings · Teams · Leaders · Player careers · 120 years of history
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
