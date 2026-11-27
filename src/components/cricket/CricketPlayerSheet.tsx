import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { X, User, Calendar, MapPin, Shirt, Activity, Loader2, AlertCircle } from "lucide-react";
import { getCricketPlayer, type CricketCareerStat } from "@/lib/cricket.functions";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";

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
    queryFn: () => fn({ data: { athleteId: String(athleteId), leagueId } }),
    staleTime: 60 * 60_000,
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
        className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 ring-1 ring-emerald-500/20 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 border-b border-emerald-500/15 bg-emerald-950/80 backdrop-blur">
          <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-300 inline-flex items-center gap-1.5">
            <User className="size-3.5" /> Player Profile
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 grid place-items-center rounded-full bg-white/5 hover:bg-white/15 ring-1 ring-white/10 transition"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        {q.isLoading && (
          <div className="grid place-items-center py-20 text-emerald-200/70 text-sm">
            <Loader2 className="size-6 animate-spin mb-2" />
            Loading profile…
          </div>
        )}

        {!q.isLoading && (!p || q.data?.error) && (
          <div className="px-4 py-16 text-center space-y-3">
            <AlertCircle className="size-10 mx-auto text-amber-400/80" />
            <div className="text-sm text-amber-200/90 font-semibold">Profile unavailable</div>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              ESPN didn't return data for this player. Try another match — bilateral &amp; older
              series sometimes ship without athlete records.
            </p>
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
