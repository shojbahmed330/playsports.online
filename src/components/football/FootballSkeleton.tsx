// Branded pitch-stripe shimmer for /football loading states.
export function FootballPitchSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-gradient-to-b from-emerald-950/50 to-gray-950 p-4">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "repeating-linear-gradient(90deg, rgba(16,185,129,0.10) 0 40px, rgba(16,185,129,0.02) 40px 80px)",
          }}
        />
        <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 w-px bg-emerald-500/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full border border-emerald-500/20" />
        <div className="relative space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-white/5 border border-white/10"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FootballEmptyBall({ message, ctaHref = "#fixtures" }: { message: string; ctaHref?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-900/50 bg-gradient-to-b from-emerald-950/30 to-gray-950 p-10 text-center">
      <div className="mx-auto mb-3 size-12 grid place-items-center">
        <svg viewBox="0 0 64 64" className="size-12 animate-bounce" aria-hidden>
          <circle cx="32" cy="32" r="28" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
          <polygon points="32,18 40,24 37,34 27,34 24,24" fill="#0f172a" />
          <polygon points="32,18 24,24 16,20 18,12 28,10" fill="#0f172a" opacity="0.85" />
          <polygon points="32,18 40,24 48,20 46,12 36,10" fill="#0f172a" opacity="0.85" />
          <polygon points="27,34 24,44 30,50 36,50 40,44 37,34" fill="#0f172a" opacity="0.9" />
        </svg>
      </div>
      <div className="text-sm font-semibold text-foreground">{message}</div>
      <a
        href={ctaHref}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 text-black px-4 py-1.5 text-xs font-bold hover:bg-amber-400 transition-colors"
      >
        Browse 1930–2026
      </a>
    </div>
  );
}
