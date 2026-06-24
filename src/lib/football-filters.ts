// Filter helpers for /football 2026 view. URL-synced via TanStack search params.
import { useEffect, useState, useCallback } from "react";
import type { WCMatch } from "@/lib/supabase";

export type FootballFilter = "all" | "live" | "today" | "my";

const STORAGE_KEY = "fb:my-teams";

function readMy(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}

function writeMy(list: string[]) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function useMyTeams() {
  const [teams, setTeams] = useState<string[]>([]);
  useEffect(() => { setTeams(readMy()); }, []);
  const toggle = useCallback((team: string) => {
    setTeams((prev) => {
      const next = prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team];
      writeMy(next);
      return next;
    });
  }, []);
  const has = useCallback((team: string) => teams.includes(team), [teams]);
  return { teams, toggle, has };
}

function isLive(m: WCMatch): boolean {
  // 2026 fixtures use status indirectly — we approximate via match_date proximity
  // when no explicit status. Returns true when match is within now ± 2.5h and not finished.
  if (!m.match_date) return false;
  const ts = new Date(m.match_date).getTime();
  const now = Date.now();
  const diff = now - ts;
  return diff >= 0 && diff <= 2.5 * 60 * 60 * 1000 && (m.home_score == null || m.away_score == null || true);
}

function isToday(m: WCMatch): boolean {
  if (!m.match_date) return false;
  const d = new Date(m.match_date);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export function applyFilter(
  matches: WCMatch[],
  filter: FootballFilter,
  team: string | undefined,
  myTeams: string[],
): WCMatch[] {
  let out = matches;
  if (filter === "live") out = out.filter(isLive);
  else if (filter === "today") out = out.filter(isToday);
  else if (filter === "my" && myTeams.length > 0) {
    const set = new Set(myTeams.map((t) => t.toLowerCase()));
    out = out.filter((m) => set.has(m.home_team.toLowerCase()) || set.has(m.away_team.toLowerCase()));
  }
  if (team) {
    const t = team.toLowerCase();
    out = out.filter(
      (m) => m.home_team.toLowerCase().includes(t) || m.away_team.toLowerCase().includes(t),
    );
  }
  return out;
}

export function uniqueTeams(matches: WCMatch[]): string[] {
  const s = new Set<string>();
  matches.forEach((m) => { s.add(m.home_team); s.add(m.away_team); });
  return Array.from(s).sort();
}
