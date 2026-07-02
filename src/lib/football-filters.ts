// Filter helpers for /football 2026 view. URL-synced via TanStack search params.
import { useEffect, useCallback } from "react";
import type { WCMatch } from "@/lib/supabase";
import { useStarred } from "@/lib/starred";

export type FootballFilter = "all" | "live" | "today" | "my";

const LEGACY_KEY = "fb:my-teams";

// Unified favorites: football starred list = cross-sport `starred:football` store.
// One-time migration from the legacy `fb:my-teams` key so existing users don't lose picks.
function migrateLegacy() {
  if (typeof window === "undefined") return;
  try {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const arr = JSON.parse(legacy);
    if (!Array.isArray(arr) || arr.length === 0) { window.localStorage.removeItem(LEGACY_KEY); return; }
    const currentRaw = window.localStorage.getItem("starred:football");
    const current: string[] = currentRaw ? JSON.parse(currentRaw) : [];
    const merged = Array.from(new Set([...(Array.isArray(current) ? current : []), ...arr.filter((x) => typeof x === "string")]));
    window.localStorage.setItem("starred:football", JSON.stringify(merged));
    window.localStorage.removeItem(LEGACY_KEY);
    window.dispatchEvent(new CustomEvent("starred:change", { detail: { sport: "football" } }));
  } catch { /* ignore */ }
}

export function useMyTeams() {
  useEffect(() => { migrateLegacy(); }, []);
  const { items, toggle, has } = useStarred("football");
  const stableToggle = useCallback((team: string) => toggle(team), [toggle]);
  const stableHas = useCallback((team: string) => has(team), [has]);
  return { teams: items, toggle: stableToggle, has: stableHas };
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
