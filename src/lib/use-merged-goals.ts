import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import goalsData from "@/data/wc_goals.json";
import seed2026 from "@/data/wc_2026_goals.json";
import { getWc2026PlayerEvents, type Wc2026PlayerEvent } from "@/lib/wc2026.functions";
import { norm } from "@/lib/players-filters";

export type GoalRow = {
  pid: string;
  name: string;
  team: string;     // opponent (historical) or own team for synthetic 2026 rows
  pteam: string;    // player's team / country
  year: number;
  og: boolean;
  pen: boolean;
  pos: string;
  live?: boolean;   // marker for 2026-synthesized rows
};

const HISTORICAL = goalsData as GoalRow[];

// Pre-build a normalized name+country → canonical pid index from history,
// so live 2026 scorers merge into the same player identity.
const HISTORICAL_PID_INDEX = (() => {
  const m = new Map<string, { pid: string; name: string; pteam: string }>();
  for (const g of HISTORICAL) {
    const k = `${norm(g.name)}|${norm(g.pteam)}`;
    if (!m.has(k)) m.set(k, { pid: g.pid, name: g.name, pteam: g.pteam });
  }
  return m;
})();

function eventToGoalRow(e: Wc2026PlayerEvent): GoalRow | null {
  if (e.type !== "goal" && e.type !== "penalty_goal" && e.type !== "own_goal") return null;
  const country = e.team.name;
  if (!country) return null;
  const nk = `${norm(e.playerName)}|${norm(country)}`;
  const existing = HISTORICAL_PID_INDEX.get(nk);
  const pid = existing?.pid ?? `wc2026_${e.playerId}`;
  const name = existing?.name ?? e.playerName;
  const pteam = existing?.pteam ?? country;
  return {
    pid,
    name,
    team: pteam,
    pteam,
    year: 2026,
    og: e.type === "own_goal",
    pen: e.type === "penalty_goal",
    pos: "",
    live: true,
  };
}

/**
 * Returns the historical World Cup goals dataset merged with live 2026 goal
 * events from ESPN. Safe to call from any component on /players — the underlying
 * server fn is cached for 1 hour and shared via TanStack Query.
 */
export function useMergedGoals() {
  const fn = useServerFn(getWc2026PlayerEvents);
  const q = useQuery({
    queryKey: ["wc2026", "player-events"],
    queryFn: () => fn(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const live = useMemo<GoalRow[]>(() => {
    const out: GoalRow[] = [];
    for (const e of q.data?.events ?? []) {
      const row = eventToGoalRow(e);
      if (row) out.push(row);
    }
    return out;
  }, [q.data]);

  // SEED_2026 is a historical fallback ONLY. It is used exclusively when the
  // live ESPN feed is unavailable (network error, cold start before the first
  // sync). As soon as `live` has entries, we ignore the seed entirely — the
  // ESPN data is authoritative.
  const SEED_2026 = seed2026 as unknown as GoalRow[];

  const goals = useMemo<GoalRow[]>(() => {
    if (live.length > 0) {
      // Live ESPN data present → use it, drop the seed.
      return [...HISTORICAL, ...live];
    }
    // No live data yet (loading or upstream down) → fall back to the seed
    // (usually empty in production; kept as a safety net).
    return [...HISTORICAL, ...SEED_2026];
  }, [live, SEED_2026]);


  return {
    goals,
    live2026Goals: live,
    isLoading: q.isLoading,
    isFetched: q.isFetched,
  };
}

export const HISTORICAL_GOALS = HISTORICAL;
