// Cross-sport starred entities stored in localStorage.
// Each sport keeps its own list. Uses a storage-event listener so multiple
// components stay in sync in the same tab.
import { useCallback, useEffect, useState } from "react";

export type Sport = "football" | "cricket" | "nba" | "nhl" | "mlb" | "mls";

const KEY_PREFIX = "starred:";

function keyOf(sport: Sport) { return `${KEY_PREFIX}${sport}`; }

function read(sport: Sport): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(keyOf(sport));
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}

function write(sport: Sport, list: string[]) {
  try {
    window.localStorage.setItem(keyOf(sport), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("starred:change", { detail: { sport } }));
  } catch { /* ignore */ }
}

export function useStarred(sport: Sport) {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    setItems(read(sport));
    const sync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.sport === sport) setItems(read(sport));
    };
    window.addEventListener("starred:change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("starred:change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sport]);
  const toggle = useCallback((name: string) => {
    const cur = read(sport);
    const next = cur.includes(name) ? cur.filter((t) => t !== name) : [...cur, name];
    write(sport, next);
    setItems(next);
  }, [sport]);
  const has = useCallback((name: string) => items.includes(name), [items]);
  return { items, toggle, has };
}

export function readAllStarred(): Record<Sport, string[]> {
  const sports: Sport[] = ["football", "cricket", "nba", "nhl", "mlb", "mls"];
  const out = {} as Record<Sport, string[]>;
  for (const s of sports) out[s] = read(s);
  // Football legacy key
  if (out.football.length === 0 && typeof window !== "undefined") {
    try {
      const legacy = window.localStorage.getItem("fb:my-teams");
      if (legacy) {
        const arr = JSON.parse(legacy);
        if (Array.isArray(arr)) out.football = arr.filter((x) => typeof x === "string");
      }
    } catch { /* ignore */ }
  }
  return out;
}
