import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWc2026Fixtures } from "@/lib/wc2026.functions";
import { dateKeyInTz } from "@/lib/timezone";

const LIVE_WINDOW_MS = 2.5 * 60 * 60 * 1000;

export interface Wc2026Pulse {
  loading: boolean;
  total: number;
  liveCount: number;
  todayCount: number;
  groupTodayCount: number;
  knockoutTodayCount: number;
  hasKnockout: boolean;
  groupStageOver: boolean;
  finalToday: boolean;
}

/**
 * Lightweight derived pulse from the shared wc2026/fixtures cache.
 * Re-uses the exact queryKey football.tsx prefetches so no extra request.
 */
export function useWc2026Pulse(): Wc2026Pulse {
  const fixturesFn = useServerFn(getWc2026Fixtures);
  const q = useQuery({
    queryKey: ["wc2026", "fixtures"],
    queryFn: () => fixturesFn(),
    staleTime: 20_000,
    refetchInterval: 30_000,
    retry: 1,
  });

  return useMemo<Wc2026Pulse>(() => {
    const fixtures = q.data?.fixtures ?? [];
    const now = Date.now();
    const todayKey = dateKeyInTz(new Date());
    let liveCount = 0, todayCount = 0, groupToday = 0, knockoutToday = 0;
    let hasKnockout = false, knockoutPlayedOrLive = 0, groupRemaining = 0;
    let finalToday = false;

    for (const f of fixtures) {
      const round = (f.group ?? "").toLowerCase();
      const isKnockout = /round of|quarter|semi|final|playoff|play-?off|third/.test(round);
      if (isKnockout) hasKnockout = true;
      const ts = f.startTs ? f.startTs * 1000 : null;
      if (ts != null) {
        const diff = now - ts;
        if (diff >= 0 && diff <= LIVE_WINDOW_MS) liveCount++;
        const dk = dateKeyInTz(new Date(ts).toISOString());
        if (dk === todayKey) {
          todayCount++;
          if (isKnockout) knockoutToday++; else groupToday++;
          if (/^final$|world cup final/i.test((f.group ?? "").trim())) finalToday = true;
        }
        if (isKnockout && (diff > -24 * 3600_000)) knockoutPlayedOrLive++;
      }
      // Group remaining = group fixture not yet kicked-off
      if (!isKnockout && (f.status === "scheduled" || (ts != null && ts > now))) {
        groupRemaining++;
      }
    }

    return {
      loading: q.isLoading,
      total: fixtures.length,
      liveCount,
      todayCount,
      groupTodayCount: groupToday,
      knockoutTodayCount: knockoutToday,
      hasKnockout,
      groupStageOver: hasKnockout && groupRemaining === 0,
      finalToday,
    };
  }, [q.data, q.isLoading]);
}
