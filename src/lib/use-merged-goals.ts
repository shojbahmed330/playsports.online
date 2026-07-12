import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import goalsData from "@/data/wc_goals.json";
import seed2026 from "@/data/wc_2026_goals.json";
import { getWc2026TopScorers, type Wc2026Scorer } from "@/lib/wc2026.functions";
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

function scorerToRows(s: Wc2026Scorer): GoalRow[] {
  const country = s.team.name;
  const nk = `${norm(s.name)}|${norm(country)}`;
  const existing = HISTORICAL_PID_INDEX.get(nk);
  const pid = existing?.pid ?? `wc2026_${s.playerId}`;
  const name = existing?.name ?? s.name;
  const pteam = existing?.pteam ?? country;
  const rows: GoalRow[] = [];
  for (let i = 0; i < s.goals; i++) {
    rows.push({
      pid,
      name,
      team: pteam,
      pteam,
      year: 2026,
      og: false,
      pen: false, // Sofascore top-scorers endpoint doesn't split penalty kicks
      pos: "",
      live: true,
    });
  }
  return rows;
}

/**
 * Returns the historical World Cup goals dataset merged with live 2026 goals
 * from Sofascore. Safe to call from any component on /players — the underlying
 * server fn is cached for 1 hour and shared via TanStack Query.
 */
export function useMergedGoals() {
  const fn = useServerFn(getWc2026TopScorers);
  const q = useQuery({
    queryKey: ["wc2026", "scorers"],
    queryFn: () => fn(),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const SEED_2026 = seed2026 as GoalRow[];

  const live = useMemo<GoalRow[]>(() => {
    const out: GoalRow[] = [];
    for (const s of q.data?.scorers ?? []) out.push(...scorerToRows(s));
    return out;
  }, [q.data]);

  const goals = useMemo<GoalRow[]>(() => {
    // If Sofascore returned live 2026 rows and they cover more goals than the
    // seed for a given player, prefer live counts. Otherwise use the seed.
    if (!live.length) return [...HISTORICAL, ...SEED_2026];
    const livePidCount = new Map<string, number>();
    for (const r of live) livePidCount.set(r.pid, (livePidCount.get(r.pid) ?? 0) + 1);
    const seedPidCount = new Map<string, number>();
    for (const r of SEED_2026) seedPidCount.set(r.pid, (seedPidCount.get(r.pid) ?? 0) + 1);
    const preferLiveForPid = new Set<string>();
    for (const [pid, n] of livePidCount) {
      if (n >= (seedPidCount.get(pid) ?? 0)) preferLiveForPid.add(pid);
    }
    const seedKept = SEED_2026.filter((r) => !preferLiveForPid.has(r.pid));
    return [...HISTORICAL, ...seedKept, ...live];
  }, [live]);


  return {
    goals,
    live2026Goals: live,
    isLoading: q.isLoading,
    isFetched: q.isFetched,
  };
}

export const HISTORICAL_GOALS = HISTORICAL;
