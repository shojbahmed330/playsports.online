// Derive live / today / next stats from WC 2026 fixtures for hero pills.
import type { Wc2026Fixture } from "@/lib/wc2026.functions";

export type FootballPulse = {
  live: Wc2026Fixture[];
  today: Wc2026Fixture[];
  upcoming: Wc2026Fixture[];
  recent: Wc2026Fixture[];
  next: Wc2026Fixture | null;
  goalsToday: number;
  phase: "live" | "today" | "upcoming" | "idle";
};

const isLive = (f: Wc2026Fixture) => {
  const s = (f.status || "").toLowerCase();
  return s === "in" || s === "live" || s === "halftime" || s === "ht";
};
const isFinal = (f: Wc2026Fixture) => {
  const s = (f.status || "").toLowerCase();
  return s === "post" || s === "ft" || s === "final" || s === "aet" || s === "pen";
};
const isToday = (ts: number) => {
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

export function derivePulse(fixtures: Wc2026Fixture[] | undefined | null): FootballPulse {
  const list = fixtures ?? [];
  const live = list.filter(isLive);
  const todayList = list.filter((f) => isToday(f.startTs));
  const upcoming = list
    .filter((f) => !isLive(f) && !isFinal(f) && f.startTs > Date.now())
    .sort((a, b) => a.startTs - b.startTs);
  const recent = list.filter(isFinal).sort((a, b) => b.startTs - a.startTs).slice(0, 5);
  const next = upcoming[0] ?? null;
  const goalsToday = todayList.reduce((acc, f) => acc + (f.home.goals ?? 0) + (f.away.goals ?? 0), 0);
  const phase: FootballPulse["phase"] =
    live.length > 0 ? "live" : todayList.some((f) => !isFinal(f)) ? "today" : upcoming.length > 0 ? "upcoming" : "idle";
  return { live, today: todayList, upcoming, recent, next, goalsToday, phase };
}
