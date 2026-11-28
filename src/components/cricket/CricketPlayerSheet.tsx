import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { X, User, Calendar, MapPin, Shirt, Activity, Loader2, AlertCircle } from "lucide-react";
import { getCricketPlayer, type CricketCareerStat } from "@/lib/cricket.functions";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { Link } from "@tanstack/react-router";
import { cricketPlayerSlug } from "@/lib/cricket-player-slug";

function withTimeout<T>(promise: Promise<T>, ms = 12_000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Player profile timed out")), ms),
    ),
  ]);
}

type Props = {
  athleteId: string | null;
  leagueId?: string;
  onClose: () => void;
};

export function CricketPlayerSheet({ athleteId, leagueId, onClose }: Props) {
  const fn = useServerFn(getCricketPlayer);
  const open = !!athleteId;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  const q = useQuery({
    enabled: open,
    queryKey: ["cricket", "player", athleteId, leagueId ?? ""],
    queryFn: () => withTimeout(fn({ data: { athleteId: String(athleteId), leagueId } })),
    staleTime: 60 * 60_000,
    retry: 1,
  });

  if (!open) return null;
  const p = q.data?.profile;

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close player profile"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      />
      {/* Sheet */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cricket player profile"
        className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 shadow-2xl ring-1 ring-emerald-500/20 animate-in slide-in-from-right duration-300 motion-reduce:animate-none sm:max-w-md"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-emerald-500/15 bg-emerald-950/80 px-4 py-3 backdrop-blur">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            <User className="size-3.5" aria-hidden="true" /> Player Profile
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close player profile"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        {q.isLoading && (
          <div className="grid place-items-center py-20 text-sm text-emerald-200/70" role="status">
            <Loader2
              className="mb-2 size-6 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Loading profile…
          </div>
        )}

        {!q.isLoading && (!p || q.data?.error || q.isError) && (
          <div className="space-y-3 px-4 py-16 text-center">
            <AlertCircle className="mx-auto size-10 text-amber-400/80" aria-hidden="true" />
            <div className="text-sm font-semibold text-amber-200/90">Profile unavailable</div>
            <p className="mx-auto max-w-xs text-caption text-muted-foreground">
              ESPN didn't return data for this player. Bilateral and older series sometimes ship
              without athlete records.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => void q.refetch()}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-caption font-semibold text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Try again
              </button>
              <Link
                to="/cricket/players"
                onClick={onClose}
                className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-caption font-bold text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Browse players
              </Link>
            </div>
          </div>
        )}

        {p && (
          <>
            {/* Hero */}
            <section className="relative p-5 overflow-hidden">
              <div className="absolute -top-10 -right-10 size-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
              <div className="relative flex items-start gap-4">
                <div className="shrink-0">
                  {p.headshot ? (
                    <img
                      src={p.headshot}
                      alt={p.name}
                      className="size-24 rounded-2xl object-cover bg-emerald-900/60 ring-2 ring-emerald-400/30 shadow-lg"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <div className="size-24 rounded-2xl bg-emerald-900/60 ring-2 ring-emerald-400/30 grid place-items-center text-3xl">
                      🏏
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold leading-tight">{p.name}</h2>
                  {p.position && (
                    <div className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold mt-0.5">
                      {p.position}
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {p.team && (
                      <Pill
                        icon={
                          <img
                            loading="lazy"
                            decoding="async"
                            src={p.teamLogo ?? ""}
                            alt=""
                            className="size-3 inline"
                          />
                        }
                      >
                        {p.team}
                      </Pill>
                    )}
                    {p.country && <Pill icon={<MapPin className="size-3" />}>{p.country}</Pill>}
                    {p.jersey && <Pill icon={<Shirt className="size-3" />}>#{p.jersey}</Pill>}
                    {p.age != null && (
                      <Pill icon={<Calendar className="size-3" />}>{p.age} yrs</Pill>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="px-5 pb-2">
              <Link
                to="/cricket/players/$slug"
                params={{ slug: cricketPlayerSlug(p.name) }}
                onClick={onClose}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-caption font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open full profile →
              </Link>
            </div>

            {/* Meta */}
            {(p.batStyle || p.bowlStyle || p.birthPlace) && (
              <section className="px-5 pb-2 grid grid-cols-2 gap-2 text-[11px]">
                {p.batStyle && <MetaCell label="Batting" value={p.batStyle} />}
                {p.bowlStyle && <MetaCell label="Bowling" value={p.bowlStyle} />}
                {p.birthPlace && <MetaCell label="Born" value={p.birthPlace} />}
                {p.dob && <MetaCell label="DOB" value={new Date(p.dob).toLocaleDateString()} />}
              </section>
            )}

            {/* Career stats */}
            <section className="px-5 py-4">
              <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-300 mb-2 inline-flex items-center gap-1.5">
                <Activity className="size-3.5" /> Career
              </div>
              {p.career.length === 0 ? (
                <div className="rounded-xl border border-dashed border-emerald-500/20 px-4 py-5 text-center text-xs text-muted-foreground">
                  Career stats unavailable for this player.
                </div>
              ) : (
                <div className="space-y-2">
                  {p.career.map((row, i) => (
                    <CareerRow key={`${row.format}-${i}`} row={row} />
                  ))}
                </div>
              )}
            </section>

            {p.description && (
              <section className="px-5 pb-4">
                <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-300 mb-1">
                  About
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-6">
                  {p.description}
                </p>
              </section>
            )}

            <div className="px-5 pb-6">
              <AffiliateStrip
                placement="player_footer"
                sport="cricket"
                heading="Cricket gear & partners"
              />
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Pill({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/8 ring-1 ring-white/10 text-[10px] font-bold text-gray-200">
      {icon}
      <span className="truncate max-w-[140px]">{children}</span>
    </span>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/5 ring-1 ring-white/10 px-3 py-2">
      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">{label}</div>
      <div className="text-xs font-semibold text-gray-100 truncate">{value}</div>
    </div>
  );
}

function CareerRow({ row }: { row: CricketCareerStat }) {
  const fmt = row.format.toUpperCase();
  const accent = fmt.includes("TEST")
    ? "from-amber-500/15 to-amber-500/5 ring-amber-500/20 text-amber-300"
    : fmt.includes("T20")
      ? "from-fuchsia-500/15 to-fuchsia-500/5 ring-fuchsia-500/20 text-fuchsia-300"
      : fmt.includes("ODI")
        ? "from-sky-500/15 to-sky-500/5 ring-sky-500/20 text-sky-300"
        : "from-slate-500/15 to-slate-500/5 ring-slate-500/20 text-slate-300";

  return (
    <div className={`rounded-xl bg-gradient-to-br ring-1 ${accent} p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] uppercase tracking-[0.18em] font-bold">{row.format}</div>
        {row.matches != null && (
          <div className="text-[10px] text-gray-400">{row.matches} matches</div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat label="Runs" value={row.runs} />
        <Stat label="Avg" value={row.battingAvg} fmt={(v) => v.toFixed(2)} />
        <Stat label="SR" value={row.strikeRate} fmt={(v) => v.toFixed(1)} />
        <Stat label="HS" value={row.highScore ?? "—"} />
      </div>
      {(row.wickets != null ||
        row.bowlingAvg != null ||
        row.economy != null ||
        row.bestBowling) && (
        <div className="grid grid-cols-4 gap-2 text-center mt-2 pt-2 border-t border-white/5">
          <Stat label="Wkts" value={row.wickets} />
          <Stat label="Avg" value={row.bowlingAvg} fmt={(v) => v.toFixed(2)} />
          <Stat label="Econ" value={row.economy} fmt={(v) => v.toFixed(2)} />
          <Stat label="Best" value={row.bestBowling ?? "—"} />
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  fmt,
}: {
  label: string;
  value: number | string | null;
  fmt?: (v: number) => string;
}) {
  let display: string = "—";
  if (value != null && value !== "") {
    display = typeof value === "number" ? (fmt ? fmt(value) : String(value)) : value;
  }
  return (
    <div>
      <div className="text-sm font-extrabold text-white tabular-nums truncate">{display}</div>
      <div className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">{label}</div>
    </div>
  );
}
