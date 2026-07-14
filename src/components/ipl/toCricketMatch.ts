import type { IplMatchLite, IplTeamScore } from "@/lib/ipl.functions";
import type { CricketMatch, ParsedScore } from "@/lib/cricket.functions";

/** Adapter so CricketMatchCard can render IPL DTOs without changes. */
export function toCricketMatch(
  m: IplMatchLite,
  leagueId: string,
  leagueName: string,
): CricketMatch {
  const mapSide = (s: IplTeamScore) => {
    const innings = s.totalRuns > 0 ? [{ runs: s.totalRuns, wickets: s.wickets, overs: s.overs }] : [];
    const parsedScore: ParsedScore = {
      innings: s.totalRuns > 0
        ? [{
            runs: s.totalRuns,
            wickets: s.wickets,
            overs: s.overs || null,
            declared: false,
            allOut: s.wickets >= 10,
          }]
        : [],
      totalRuns: s.totalRuns,
      didNotBat: s.totalRuns === 0,
      raw: s.scoreSummary ?? null,
    };
    return {
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      abbr: s.abbr,
      logo: s.logo,
      color: s.color,
      scoreSummary: s.scoreSummary,
      winner: s.winner,
      innings,
      parsedScore,
    };
  };
  const home = mapSide(m.home);
  const away = mapSide(m.away);
  const winnerTeam = home.winner === true ? home : away.winner === true ? away : null;
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
    home,
    away,
    result: m.status === "post"
      ? { kind: "unknown", winnerAbbr: winnerTeam?.abbr ?? null, marginText: m.note ?? (winnerTeam ? `${winnerTeam.name} won` : "Result") }
      : null,
    dataIncomplete: false,
  } as unknown as CricketMatch;
}

