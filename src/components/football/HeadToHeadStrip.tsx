import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Swords } from "lucide-react";
import { getHeadToHead } from "@/lib/head-to-head.functions";
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

export function HeadToHeadStrip({ fx }: { fx: Wc2026Fixture }) {
  const fn = useServerFn(getHeadToHead);
  const q = useQuery({
    queryKey: ["h2h", fx.home.id, fx.away.id],
    queryFn: () => fn({ data: { homeId: fx.home.id, awayId: fx.away.id, homeName: fx.home.name, awayName: fx.away.name } }),
    staleTime: 15 * 60_000,
    enabled: !!fx.home.id && !!fx.away.id,
  });
  const list = q.data ?? [];

  let hW = 0, aW = 0, d = 0, hG = 0, aG = 0;
  for (const m of list) {
    const isHomeHere = m.home.toLowerCase() === fx.home.name.toLowerCase();
    const fFor = isHomeHere ? (m.homeScore ?? 0) : (m.awayScore ?? 0);
    const fAgainst = isHomeHere ? (m.awayScore ?? 0) : (m.homeScore ?? 0);
    hG += fFor; aG += fAgainst;
    if (fFor > fAgainst) hW++; else if (fFor < fAgainst) aW++; else d++;
  }

  if (q.isLoading) {
    return <SkelBox label="Head-to-Head" />;
  }
  if (list.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Swords className="size-4 text-amber-300" />
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
          Head-to-head · last {list.length}
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <TotalPill label={fx.home.code || fx.home.name} value={hW} color="text-emerald-300" />
        <TotalPill label="Draws" value={d} color="text-gray-300" />
        <TotalPill label={fx.away.code || fx.away.name} value={aW} color="text-sky-300" />
      </div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5 text-center">
        Goals · {hG}–{aG}
      </div>
      <ul className="space-y-1.5">
        {list.map((m, i) => (
          <li key={i} className="flex items-center justify-between rounded-lg bg-black/30 px-3 py-1.5 text-xs">
            <span className="text-gray-500 tabular-nums text-[10px] w-16 shrink-0">
              {new Date(m.date).toLocaleDateString(undefined, { year: "2-digit", month: "short" })}
            </span>
            <span className="flex-1 truncate text-gray-200 font-semibold text-right pr-2">{m.home}</span>
            <span className="tabular-nums font-black text-white px-1.5">{m.homeScore}–{m.awayScore}</span>
            <span className="flex-1 truncate text-gray-200 font-semibold pl-2">{m.away}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TotalPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg bg-black/40 py-2">
      <div className={`text-2xl font-black tabular-nums ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-gray-500 truncate">{label}</div>
    </div>
  );
}

function SkelBox({ label }: { label: string }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gray-900/50 p-4 animate-pulse">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-3">{label}</div>
      <div className="h-16 rounded-lg bg-white/5" />
    </section>
  );
}
