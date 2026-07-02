// Cross-sport aggregator for the /mine feed. Fetches only the sports where
// the user has starred teams, then classifies each match as live / upcoming /
// recent for a starred team.
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWc2026Fixtures, type Wc2026Fixture } from "@/lib/wc2026.functions";
import { getScoreboard, type SportGame } from "@/lib/espn.functions";
import { SPORTS as ESPN_SPORTS } from "@/lib/sports-config";
import type { Sport } from "@/lib/starred";

export type MyMatch = {
  key: string;                       // stable id `${sport}:${matchId}`
  sport: Sport;
  matchId: string | number;
  startMs: number;
  status: "live" | "upcoming" | "finished";
  home: { name: string; score: number | null };
  away: { name: string; score: number | null };
  label: string;                     // "MLB · Final" / "WC26 · Group A" etc
  href: string;                      // in-app link
  starredTeam: string;               // which starred team pulled it in
};

function classify(status: string): MyMatch["status"] {
  if (status === "inprogress" || status === "in") return "live";
  if (status === "finished"   || status === "post") return "finished";
  return "upcoming";
}

function fromWc(fx: Wc2026Fixture, starred: Set<string>): MyMatch | null {
  const homeLc = fx.home.name.toLowerCase();
  const awayLc = fx.away.name.toLowerCase();
  const hit = starred.has(homeLc) ? fx.home.name : starred.has(awayLc) ? fx.away.name : null;
  if (!hit) return null;
  return {
    key: `football:${fx.id}`,
    sport: "football",
    matchId: fx.id,
    startMs: fx.startTs * 1000,
    status: classify(fx.status),
    home: { name: fx.home.name, score: fx.home.goals },
    away: { name: fx.away.name, score: fx.away.goals },
    label: `WC26 · ${fx.group || fx.statusDesc || "Match"}`,
    href: `/football/match/${fx.id}`,
    starredTeam: hit,
  };
}

function fromEspn(g: SportGame, sport: Sport, starred: Set<string>): MyMatch | null {
  const homeLc = g.home.name.toLowerCase();
  const awayLc = g.away.name.toLowerCase();
  const hit = starred.has(homeLc) ? g.home.name : starred.has(awayLc) ? g.away.name : null;
  if (!hit) return null;
  const hrefBase = { nba: "/nba/game/", nhl: "/nhl/game/", mlb: "/mlb/game/", mls: "/mls/game/" }[sport as "nba"|"nhl"|"mlb"|"mls"] ?? `/${sport}`;
  return {
    key: `${sport}:${g.id}`,
    sport,
    matchId: g.id,
    startMs: g.startTs,
    status: classify(g.status),
    home: { name: g.home.name, score: g.home.score },
    away: { name: g.away.name, score: g.away.score },
    label: `${g.league} · ${g.statusDetail || g.shortDetail}`,
    href: `${hrefBase}${g.id}`,
    starredTeam: hit,
  };
}

export function useMyMatches(starredByS: Record<Sport, string[]>) {
  const hasFootball = (starredByS.football?.length ?? 0) > 0;
  const hasNba      = (starredByS.nba?.length ?? 0) > 0;
  const hasNhl      = (starredByS.nhl?.length ?? 0) > 0;
  const hasMlb      = (starredByS.mlb?.length ?? 0) > 0;
  const hasMls      = (starredByS.mls?.length ?? 0) > 0;

  const wcFn = useServerFn(getWc2026Fixtures);
  const wc = useQuery({
    queryKey: ["mine", "wc2026-fixtures"],
    queryFn: () => wcFn(),
    enabled: hasFootball,
    staleTime: 60_000,
  });

  const sbFn = useServerFn(getScoreboard);
  const nba = useQuery({
    queryKey: ["mine", "sb", "nba"],
    queryFn: () => sbFn({ data: { sportPath: ESPN_SPORTS.nba.path, league: "NBA" } }),
    enabled: hasNba, staleTime: 60_000,
  });
  const nhl = useQuery({
    queryKey: ["mine", "sb", "nhl"],
    queryFn: () => sbFn({ data: { sportPath: ESPN_SPORTS.nhl.path, league: "NHL" } }),
    enabled: hasNhl, staleTime: 60_000,
  });
  const mlb = useQuery({
    queryKey: ["mine", "sb", "mlb"],
    queryFn: () => sbFn({ data: { sportPath: ESPN_SPORTS.mlb.path, league: "MLB" } }),
    enabled: hasMlb, staleTime: 60_000,
  });
  const mls = useQuery({
    queryKey: ["mine", "sb", "mls"],
    queryFn: () => sbFn({ data: { sportPath: ESPN_SPORTS.mls.path, league: "MLS" } }),
    enabled: hasMls, staleTime: 60_000,
  });

  return useMemo(() => {
    const out: MyMatch[] = [];
    const wcSet  = new Set((starredByS.football ?? []).map((t) => t.toLowerCase()));
    const nbaSet = new Set((starredByS.nba ?? []).map((t) => t.toLowerCase()));
    const nhlSet = new Set((starredByS.nhl ?? []).map((t) => t.toLowerCase()));
    const mlbSet = new Set((starredByS.mlb ?? []).map((t) => t.toLowerCase()));
    const mlsSet = new Set((starredByS.mls ?? []).map((t) => t.toLowerCase()));

    (wc.data?.fixtures ?? []).forEach((f) => { const m = fromWc(f, wcSet);   if (m) out.push(m); });
    (nba.data?.games   ?? []).forEach((g) => { const m = fromEspn(g, "nba", nbaSet); if (m) out.push(m); });
    (nhl.data?.games   ?? []).forEach((g) => { const m = fromEspn(g, "nhl", nhlSet); if (m) out.push(m); });
    (mlb.data?.games   ?? []).forEach((g) => { const m = fromEspn(g, "mlb", mlbSet); if (m) out.push(m); });
    (mls.data?.games   ?? []).forEach((g) => { const m = fromEspn(g, "mls", mlsSet); if (m) out.push(m); });

    const live     = out.filter((m) => m.status === "live").sort((a, b) => a.startMs - b.startMs);
    const upcoming = out.filter((m) => m.status === "upcoming").sort((a, b) => a.startMs - b.startMs).slice(0, 10);
    const recent   = out.filter((m) => m.status === "finished").sort((a, b) => b.startMs - a.startMs).slice(0, 10);

    return {
      live, upcoming, recent,
      loading: wc.isFetching || nba.isFetching || nhl.isFetching || mlb.isFetching || mls.isFetching,
    };
  }, [starredByS, wc.data, nba.data, nhl.data, mlb.data, mls.data, wc.isFetching, nba.isFetching, nhl.isFetching, mlb.isFetching, mls.isFetching]);
}
