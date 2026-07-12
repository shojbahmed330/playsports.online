import { useEffect, useState } from "react";
import { Timer, CalendarDays, MapPin, Users } from "lucide-react";

/**
 * Combined Euro 2028 identity hero: wordmark + hosts + countdown in one
 * framed panel. Replaces the separate CompetitionCountdown + Euro2028InfoCard
 * pair on the Euro 2028 landing.
 */
const TARGET_ISO = "2028-06-09T19:00:00Z";

export function Euro2028Hero() {
  const target = new Date(TARGET_ISO).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);

  return (
    <section className="mt-6">
      <div
        className="relative overflow-hidden rounded-3xl border border-blue-400/25 p-5 sm:p-8"
        style={{
          backgroundImage:
            "radial-gradient(1200px 400px at 10% -10%, rgba(59,130,246,0.28), transparent 60%), radial-gradient(800px 300px at 100% 110%, rgba(37,99,235,0.20), transparent 60%), linear-gradient(180deg, rgba(15,23,42,0.6), rgba(2,6,23,0.4))",
        }}
      >
        {/* subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200/90">
              <Timer className="size-3.5" /> UEFA Euro 2028
            </div>
            <h2 className="mt-2 font-black leading-[0.9] tracking-tight text-4xl sm:text-6xl lg:text-7xl bg-gradient-to-b from-white to-blue-200/70 bg-clip-text text-transparent">
              EURO <span className="tabular-nums">28</span>
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:text-base">
              <span className="text-lg sm:text-xl" aria-hidden>
                🏴󠁧󠁢󠁥󠁮󠁧󠁿 🏴󠁧󠁢󠁳󠁣󠁴󠁿 🏴󠁧󠁢󠁷󠁬󠁳󠁿 🇬🇧 🇮🇪
              </span>
              <span className="font-semibold">UK &amp; Ireland</span>
              <span className="text-muted-foreground">· 24 teams · 10 stadiums · 51 matches</span>
            </div>

            <div className="mt-4 grid gap-2 grid-cols-2 lg:grid-cols-4">
              <Fact icon={<CalendarDays className="size-4 text-blue-200" />} label="Dates" value="9 Jun – 9 Jul 2028" />
              <Fact icon={<MapPin className="size-4 text-blue-200" />} label="Hosts" value="5 nations" />
              <Fact icon={<Users className="size-4 text-blue-200" />} label="Format" value="6 groups + KO" />
              <Fact icon={<CalendarDays className="size-4 text-blue-200" />} label="Qualifying" value="Mar 2027" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur px-4 py-3 sm:px-5 sm:py-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Kick-off in
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              <Unit v={days} label="days" />
              <Unit v={hours} label="hrs" />
              <Unit v={mins} label="min" />
              <Unit v={secs} label="sec" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 min-w-0">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground truncate">
        {icon} {label}
      </div>
      <div className="mt-0.5 text-sm font-bold truncate">{value}</div>
    </div>
  );
}

function Unit({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-0">
      <span className="text-xl sm:text-3xl font-black tabular-nums leading-none">
        {String(v).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}
