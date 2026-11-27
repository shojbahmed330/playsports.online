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
      <div className="mb-1 flex justify-center">
        {byGroup.map(([name], i) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              const el = scrollerRef.current;
              if (!el) return;
              el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
            }}
            className="grid size-11 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Show ${name}`}
            aria-pressed={i === activeIdx}
          >
            <span
              className={`block h-1.5 rounded-full transition-all ${i === activeIdx ? "w-6 bg-primary" : "w-1.5 bg-muted"}`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {byGroup.map(([name, rows]) => {
          const fixtures = matchesByGroup.get(name) ?? [];
          return (
            <div
              key={name}
              className="w-[88vw] max-w-[420px] shrink-0 snap-center space-y-3 rounded-2xl border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-caption font-black tracking-wide text-primary">{name}</h3>
                <span className="text-micro text-muted-foreground">{rows.length} teams</span>
              </div>
              <div className="overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border">
                <div className="grid grid-cols-[20px_1fr_28px_28px_28px_32px] gap-1 border-b border-border px-2 py-1.5 text-micro uppercase text-muted-foreground">
                  <span>#</span><span>Team</span><span className="text-center">P</span>
                  <span className="text-center">GD</span><span className="text-center">Pts</span><span></span>
                </div>
                {rows.map((r) => {
                  const conf = confederationOf(r.team);
                  return (
                    <div
                      key={r.team}
                      className="grid grid-cols-[20px_1fr_28px_28px_28px_32px] items-center gap-1 border-b border-border px-2 py-2 text-caption last:border-0"
                    >
                      <span className="tabular-nums text-muted-foreground">{r.position ?? "–"}</span>
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="text-base" aria-hidden="true">{flagOf(r.team)}</span>
                        <span className="truncate text-foreground">{r.team}</span>
                      </span>
                      <span className="text-center tabular-nums text-muted-foreground">{r.played ?? 0}</span>
                      <span className="text-center tabular-nums text-muted-foreground">
                        {(r.goals_for ?? 0) - (r.goals_against ?? 0)}
                      </span>
                      <span className="text-center font-bold tabular-nums text-foreground">{r.points ?? 0}</span>
                      <span className={`block h-3 w-1 justify-self-end rounded-full conf-${conf}`} aria-hidden="true" />
                    </div>
                  );
                })}
              </div>

              {fixtures.length > 0 && (
                <div className="space-y-2">
                  <div className="text-micro uppercase text-muted-foreground">Fixtures</div>
                  {fixtures.map((m) => (
                    <MobileMatchCard key={m.id} match={m} onClick={() => onPick(m)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1 text-center text-micro text-muted-foreground">← swipe to browse groups →</div>
    </div>
  );
}
