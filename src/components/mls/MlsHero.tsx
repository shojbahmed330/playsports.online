import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlsScoreboard } from "@/lib/mls.functions";
import { todayYmd } from "@/components/sports/DateScrubber";
import { Radio, Calendar, CheckCircle2 } from "lucide-react";

export function MlsHero() {
  const sbFn = useServerFn(getMlsScoreboard);
  const day = todayYmd();
  const sbQ = useQuery({
    queryKey: ["mls", "hero-sb", day],
    queryFn: () => sbFn({ data: { yyyymmdd: day } }),
    staleTime: 30_000,
    refetchInterval: (q) => {
      const d = q.state.data as any;
      return d?.games?.some((g: any) => g.status === "in") ? 30_000 : false;
    },
  });
  const games = sbQ.data?.games ?? [];
  const live = games.filter((g) => g.status === "in").length;
  const pre = games.filter((g) => g.status === "pre").length;
  const post = games.filter((g) => g.status === "post").length;

  return (
    <section className="relative overflow-hidden border-b border-border bg-mls-hero">
      <div aria-hidden className="absolute inset-0 mls-hardwood opacity-50" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 80% at 15% 10%, rgba(245,132,38,0.22), transparent 60%), radial-gradient(50% 70% at 85% 90%, rgba(23,64,139,0.45), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-1/3 top-0 h-full opacity-25 mls-sheen"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-9">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="size-12 sm:size-20 rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/40 grid place-items-center text-3xl sm:text-5xl shrink-0 backdrop-blur animate-scale-in">
            ⚽
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.25em] text-orange-200 font-bold">
              National Basketball Association
            </div>
            <h1 className="text-xl sm:text-4xl font-extrabold tracking-tight text-white truncate">
              MLS Pro Hub
            </h1>
            <p className="hidden sm:block text-sm text-white/70 mt-1">
              Live scores · Standings · Teams · Leaders · Player careers · Champions history
            </p>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          <Chip tone="red" icon={<Radio className="size-3" />} label="Live" value={live} pulse />
          <Chip tone="amber" icon={<Calendar className="size-3" />} label="Upcoming" value={pre} />
          <Chip tone="green" icon={<CheckCircle2 className="size-3" />} label="Final" value={post} />
          <Chip tone="cream" label={`Today · ${games.length} games`} />
        </div>
      </div>
    </section>
  );
}

function Chip({
  tone, icon, label, value, pulse,
}: {
  tone: "red" | "amber" | "green" | "cream";
  icon?: React.ReactNode;
  label: string;
  value?: number;
  pulse?: boolean;
}) {
  const map = {
    red: "bg-red-500/15 text-red-100 ring-red-500/40",
    amber: "bg-amber-500/15 text-amber-100 ring-amber-500/40",
    green: "bg-emerald-500/15 text-emerald-100 ring-emerald-500/40",
    cream: "bg-orange-200/10 text-orange-100 ring-orange-200/30",
  }[tone];
  return (
    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 backdrop-blur ${map}`}>
      {pulse && value ? <span className="size-1.5 rounded-full bg-red-400 animate-pulse" /> : null}
      {icon}
      <span>{label}</span>
      {typeof value === "number" && <span className="tabular-nums opacity-90">· {value}</span>}
    </span>
  );
}
