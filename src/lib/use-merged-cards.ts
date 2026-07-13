import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import cardsData from "@/data/wc_cards.json";
import seed2026 from "@/data/wc_2026_cards.json";
import { getWc2026PlayerEvents, type Wc2026PlayerEvent } from "@/lib/wc2026.functions";
import { norm } from "@/lib/players-filters";

export type CardRow = {
  pid: string;
  name: string;
  team: string;
  year: number;
  type: "yellow" | "red";
  pos: string;
  live?: boolean;
};

const HISTORICAL = cardsData as CardRow[];

const HISTORICAL_CARD_PID_INDEX = (() => {
  const m = new Map<string, { pid: string; name: string; team: string; pos: string }>();
  for (const c of HISTORICAL) {
    const k = `${norm(c.name)}|${norm(c.team)}`;
    if (!m.has(k)) m.set(k, { pid: c.pid, name: c.name, team: c.team, pos: c.pos ?? "" });
  }
  return m;
})();

function eventToCardRow(e: Wc2026PlayerEvent): CardRow | null {
  if (e.type !== "yellow" && e.type !== "red") return null;
  const country = e.team.name;
  if (!country) return null;
  const nk = `${norm(e.playerName)}|${norm(country)}`;
  const existing = HISTORICAL_CARD_PID_INDEX.get(nk);
  return {
    pid: existing?.pid ?? `wc2026_${e.playerId}`,
    name: existing?.name ?? e.playerName,
    team: existing?.team ?? country,
    year: 2026,
    type: e.type,
    pos: existing?.pos ?? "",
    live: true,
  };
}

export function useMergedCards() {
  const fn = useServerFn(getWc2026PlayerEvents);
  const q = useQuery({
    queryKey: ["wc2026", "player-events"],
    queryFn: () => fn(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const live = useMemo<CardRow[]>(() => {
    const out: CardRow[] = [];
    for (const e of q.data?.events ?? []) {
      const row = eventToCardRow(e);
      if (row) out.push(row);
    }
    return out;
  }, [q.data]);

  const SEED_2026 = seed2026 as unknown as CardRow[];

  const cards = useMemo<CardRow[]>(() => {
    if (live.length > 0) return [...HISTORICAL, ...live];
    return [...HISTORICAL, ...SEED_2026];
  }, [live, SEED_2026]);

  return {
    cards,
    live2026Cards: live,
    isLoading: q.isLoading,
    isFetched: q.isFetched,
  };
}

export const HISTORICAL_CARDS = HISTORICAL;