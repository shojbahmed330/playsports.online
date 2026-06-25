import type { IplMatchLite, IplTeamScore } from "@/lib/ipl.functions";
import type { CricketMatch } from "@/lib/cricket.functions";

/** Adapter so CricketMatchCard can render IPL DTOs without changes. */
export function toCricketMatch(
  m: IplMatchLite,
  leagueId: string,
  leagueName: string,
): CricketMatch {
  const mapSide = (s: IplTeamScore) => ({
    id: s.id,
    name: s.name,
    shortName: s.shortName,
    abbr: s.abbr,
    logo: s.logo,
    color: s.color,
    scoreSummary: s.scoreSummary,
    winner: s.winner,
    innings:
      s.totalRuns > 0
        ? [{ runs: s.totalRuns, wickets: s.wickets, overs: s.overs }]
        : [],
  });
  return {
    id: m.id,
    startTs: m.startTs,
    status: m.status,
    statusDetail: m.statusDetail,
    shortDetail: m.shortDetail,
    description: m.description,
    venue: m.venue,
    city: m.city,
    broadcast: m.broadcast,
    note: m.note,
    leagueId,
    leagueName,
    leagueSlug: "ipl",
    format: "T20",
    home: mapSide(m.home),
    away: mapSide(m.away),
  } as unknown as CricketMatch;
}
