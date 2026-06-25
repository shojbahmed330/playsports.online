import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Trophy, Flame, CalendarClock } from "lucide-react";
import { SportNav } from "@/components/sports/SportNav";
import { CricketSubNav } from "@/components/cricket/CricketSubNav";
import { getCricketSeriesList } from "@/lib/cricket.functions";
import { CRICKET_LEAGUE_BY_ID } from "@/lib/cricket-leagues";

const search = z.object({
  fmt: fallback(z.enum(["any", "t20", "odi", "test"]), "any").default("any"),
  group: fallback(z.enum(["any", "international", "franchise", "domestic"]), "any").default("any"),
});

export const Route = createFileRoute("/cricket/series/")({
  validateSearch: zodValidator(search),
  head: () => ({
    meta: [
      { title: "Cricket Series — IPL, BBL, World Cups & more" },
      { name: "description", content: "All major cricket series, live counts, and fixtures." },
    ],
  }),
  component: SeriesIndex,
});

function SeriesIndex() {
  const { fmt, group } = Route.useSearch();
  const navigate = Route.useNavigate();
  const fn = useServerFn(getCricketSeriesList);
  const q = useQuery({
    queryKey: ["cricket", "series-list"],
    queryFn: () => fn({}),
    staleTime: 5 * 60_000,
    refetchInterval: 60_000,
  });

  const series = q.data?.series ?? [];
  const filtered = useMemo(() => {
    return series.filter((s) => {
      if (fmt !== "any" && s.format !== fmt) return false;
      if (group !== "any" && s.group !== group) return false;
      return true;
    }).sort((a, b) => {
      if (a.liveCount !== b.liveCount) return b.liveCount - a.liveCount;
      if (a.upcomingCount !== b.upcomingCount) return b.upcomingCount - a.upcomingCount;
      return a.longName.localeCompare(b.longName);
    });
  }, [series, fmt, group]);

  const set = (patch: Partial<{ fmt: typeof fmt; group: typeof group }>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <div className="min-h-screen">
      <SportNav liveCount={series.reduce((s, x) => s + x.liveCount, 0)} />
      <CricketSubNav />

      <section className="border-b border-border bg-gradient-to-br from-amber-950/40 via-background to-emerald-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-500/30 grid place-items-center text-2xl">🏆</div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-300 font-bold">Cricket</div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">All Series</h1>
              <p className="text-xs text-muted-foreground mt-1">Tap a series for fixtures, live scores and standings.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterGroup label="Format">
            {(["any", "t20", "odi", "test"] as const).map((v) => (
              <Chip key={v} active={fmt === v} onClick={() => set({ fmt: v })}>{v === "any" ? "All" : v.toUpperCase()}</Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Type">
            {(["any", "international", "franchise", "domestic"] as const).map((v) => (
              <Chip key={v} active={group === v} onClick={() => set({ group: v })}>{v === "any" ? "All" : v[0].toUpperCase() + v.slice(1)}</Chip>
            ))}
          </FilterGroup>
        </div>

        {q.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-900/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 p-12 text-center text-sm text-muted-foreground">
            No series match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s) => {
              const meta = CRICKET_LEAGUE_BY_ID[s.id];
              return (
                <Link
                  key={s.id}
                  to="/cricket/series/$id"
                  params={{ id: s.id }}
                  className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${meta?.bgGrad ?? "from-slate-900 to-slate-800"} p-4 hover:border-white/25 hover:-translate-y-0.5 transition`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`size-12 rounded-xl ${meta?.chipBg ?? "bg-white/10"} ring-1 ${meta?.ring ?? "ring-white/15"} grid place-items-center text-2xl shrink-0`}>
                      {s.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[10px] uppercase tracking-[0.18em] font-bold ${meta?.accent ?? "text-emerald-300"}`}>{s.label} · {s.format.toUpperCase()}</div>
                      <div className="font-bold leading-tight truncate">{s.longName}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{s.tagline}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px]">
                    {s.liveCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 ring-1 ring-red-500/30 font-bold">
                        <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                        <Flame className="size-3" /> {s.liveCount} live
                      </span>
                    )}
                    {s.upcomingCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 font-bold">
                        <CalendarClock className="size-3" /> {s.upcomingCount} upcoming
                      </span>
                    )}
                    {s.liveCount === 0 && s.upcomingCount === 0 && (
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">No scheduled play</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mr-1">{label}</span>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1 rounded-full text-[11px] font-bold ring-1 transition",
        active ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white ring-white/20" : "bg-white/5 text-gray-300 ring-white/10 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
