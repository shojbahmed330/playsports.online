// In-browser match reminders. LocalStorage-persisted; scheduled via setTimeout
// when the tab is open. Best-effort: silent-fail when permission denied.
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fb:reminders";
const LEAD_MINUTES = 15;

export type Reminder = {
  matchId: number;
  title: string;
  startMs: number;
  url: string;
};

function readAll(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function writeAll(list: Reminder[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

async function ensurePermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const p = await Notification.requestPermission();
    return p === "granted";
  } catch { return false; }
}

function schedule(r: Reminder): number | null {
  if (typeof window === "undefined") return null;
  const fireAt = r.startMs - LEAD_MINUTES * 60_000;
  const delay = fireAt - Date.now();
  if (delay <= 0 || delay > 2_147_000_000) return null;
  return window.setTimeout(() => {
    try {
      if (Notification.permission === "granted") {
        const n = new Notification("Kickoff in 15 min", {
          body: r.title,
          tag: `wc-${r.matchId}`,
        });
        n.onclick = () => { window.focus(); window.location.href = r.url; };
      }
    } catch { /* ignore */ }
  }, delay) as unknown as number;
}

export function useMatchReminders() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [timers, setTimers] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    const all = readAll();
    // prune past
    const fresh = all.filter((r) => r.startMs - LEAD_MINUTES * 60_000 > Date.now());
    if (fresh.length !== all.length) writeAll(fresh);
    setItems(fresh);
    const m = new Map<number, number>();
    fresh.forEach((r) => { const t = schedule(r); if (t != null) m.set(r.matchId, t); });
    setTimers(m);
    return () => { m.forEach((t) => window.clearTimeout(t)); };
  }, []);

  const has = useCallback((matchId: number) => items.some((r) => r.matchId === matchId), [items]);

  const add = useCallback(async (r: Reminder): Promise<boolean> => {
    const ok = await ensurePermission();
    if (!ok) return false;
    setItems((prev) => {
      if (prev.some((x) => x.matchId === r.matchId)) return prev;
      const next = [...prev, r];
      writeAll(next);
      return next;
    });
    const t = schedule(r);
    if (t != null) setTimers((prev) => { const n = new Map(prev); n.set(r.matchId, t); return n; });
    return true;
  }, []);

  const remove = useCallback((matchId: number) => {
    setItems((prev) => { const next = prev.filter((r) => r.matchId !== matchId); writeAll(next); return next; });
    setTimers((prev) => {
      const t = prev.get(matchId);
      if (t != null) window.clearTimeout(t);
      const n = new Map(prev); n.delete(matchId); return n;
    });
  }, []);

  return { items, has, add, remove };
}
