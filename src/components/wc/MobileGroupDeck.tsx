import { useMemo, useRef, useEffect, useState } from "react";
import type { WCGroup, WCMatch } from "@/lib/supabase";
import { flagOf } from "@/lib/flags";
import { confederationOf } from "@/lib/confederations";
import { MobileMatchCard } from "./MobileMatchCard";

/**
 * Mobile-only swipeable deck of group cards (one group per page).
 * Each card shows mini standings + the group's fixtures.
 */
export function MobileGroupDeck({
  groups, matches, onPick,
}: { groups: WCGroup[]; matches: WCMatch[]; onPick: (m: WCMatch) => void }) {
  const byGroup = useMemo(() => {
    const map = new Map<string, WCGroup[]>();
    for (const g of groups) {
      const k = g.group_name;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(g);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [groups]);

  const matchesByGroup = useMemo(() => {
    const map = new Map<string, WCMatch[]>();
    for (const m of matches) {
      const k = m.round;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    return map;
  }, [matches]);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIdx(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (byGroup.length === 0) return null;

  return (
    <div className="md:hidden">
      {/* Dot indicator */}
      <div className="flex justify-center gap-1.5 mb-2">
        {byGroup.map(([name], i) => (
          <button
            key={name}
            onClick={() => {
              const el = scrollerRef.current;
              if (!el) return;
              el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIdx ? "w-6 bg-amber-400" : "w-1.5 bg-gray-700"
            }`}
            aria-label={`Show ${name}`}
          />
        ))}
      </div>
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory overflow-x-auto -mx-4 px-4 gap-3 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {byGroup.map(([name, rows]) => {
          const fixtures = matchesByGroup.get(name) ?? [];
          return (
            <div
              key={name}
              className="snap-center shrink-0 w-[88vw] max-w-[420px] rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black p-3 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black tracking-wide text-amber-400">{name}</h3>
                <span className="text-[10px] text-gray-500">{rows.length} teams</span>
              </div>
              <div className="rounded-xl bg-gray-950/60 ring-1 ring-white/5 overflow-hidden">
                <div className="grid grid-cols-[20px_1fr_28px_28px_28px_32px] gap-1 px-2 py-1.5 text-[9px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                  <span>#</span><span>Team</span><span className="text-center">P</span>
                  <span className="text-center">GD</span><span className="text-center">Pts</span><span></span>
                </div>
                {rows.map((r) => {
                  const conf = confederationOf(r.team);
                  return (
                    <div
                      key={r.team}
                      className="grid grid-cols-[20px_1fr_28px_28px_28px_32px] gap-1 px-2 py-2 items-center text-xs border-b border-white/5 last:border-0"
                    >
                      <span className="text-gray-600 tabular-nums">{r.position ?? "–"}</span>
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-base">{flagOf(r.team)}</span>
                        <span className="text-white truncate">{r.team}</span>
                      </span>
                      <span className="text-center text-gray-400 tabular-nums">{r.played ?? 0}</span>
                      <span className="text-center text-gray-400 tabular-nums">
                        {(r.goals_for ?? 0) - (r.goals_against ?? 0)}
                      </span>
                      <span className="text-center font-bold text-white tabular-nums">{r.points ?? 0}</span>
                      <span className={`block h-3 w-1 rounded-full justify-self-end conf-${conf}`} />
                    </div>
                  );
                })}
              </div>

              {fixtures.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-gray-500">Fixtures</div>
                  {fixtures.map((m) => (
                    <MobileMatchCard key={m.id} match={m} onClick={() => onPick(m)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center text-[10px] text-gray-600 mt-1">← swipe to browse groups →</div>
    </div>
  );
}
