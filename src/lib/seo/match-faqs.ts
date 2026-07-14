// Shared FAQ builder for match/game pages. Produces schema.org-friendly
// Q&A that also renders as visible content padding under the live score.
export type MatchFaqInput = {
  sport: "NBA" | "NHL" | "MLB" | "MLS" | "Soccer" | "Cricket" | "Football";
  leagueName?: string;      // "National Basketball Association"
  home?: string;
  away?: string;
  venue?: string;
  startDate?: string;        // ISO
  status?: "scheduled" | "live" | "ended";
  homeScore?: number | null;
  awayScore?: number | null;
  broadcast?: string;
};

export type FaqQA = { q: string; a: string };

function dateStr(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  } catch { return ""; }
}
function timeStr(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  } catch { return ""; }
}

export function buildMatchFaqs(i: MatchFaqInput): FaqQA[] {
  const league = i.leagueName ?? i.sport;
  const matchup = i.home && i.away ? `${i.away} vs ${i.home}` : `this ${i.sport} match`;
  const faqs: FaqQA[] = [];

  // Q1 — when / where
  if (i.startDate) {
    const d = dateStr(i.startDate);
    const t = timeStr(i.startDate);
    faqs.push({
      q: `When is ${matchup}?`,
      a: `${matchup} is scheduled for ${d}${t ? ` at ${t}` : ""}${i.venue ? `, played at ${i.venue}` : ""}. Live scores, box score and play-by-play update in real time on PlaySports.`,
    });
  }

  // Q2 — venue
  if (i.venue) {
    faqs.push({
      q: `Where is ${matchup} being played?`,
      a: `${matchup} takes place at ${i.venue}. See full ${league} venue details, capacity and directions on the team page.`,
    });
  }

  // Q3 — where to watch / broadcast
  faqs.push({
    q: `How can I watch ${matchup} live?`,
    a: i.broadcast
      ? `${matchup} airs live on ${i.broadcast}. Check your local ${league} broadcast listings for regional restrictions and streaming options.`
      : `Live TV and streaming coverage of ${matchup} depends on your region — check the official ${league} broadcast partners for authorised streams. PlaySports carries the live box score and play-by-play free with no signup.`,
  });

  // Q4 — current status / score
  if (i.status === "ended" && i.home && i.away && i.homeScore != null && i.awayScore != null) {
    const winner = i.homeScore > i.awayScore ? i.home : i.awayScore > i.homeScore ? i.away : null;
    faqs.push({
      q: `What was the final score of ${matchup}?`,
      a: winner
        ? `${winner} won ${Math.max(i.homeScore, i.awayScore)}–${Math.min(i.homeScore, i.awayScore)}. See the full box score, scoring plays and player leaders above.`
        : `${matchup} finished ${i.homeScore}–${i.awayScore}. See the full box score above.`,
    });
  } else if (i.status === "live") {
    faqs.push({
      q: `What is the live score for ${matchup}?`,
      a: `${matchup} is currently in progress — the score board above updates automatically every 15 seconds with the latest goals, scoring plays and box-score numbers.`,
    });
  }

  // Q5 — head-to-head / league context (evergreen padding)
  if (i.home && i.away) {
    faqs.push({
      q: `Who has the better record between ${i.home} and ${i.away}?`,
      a: `Season records, recent form and head-to-head history for ${i.home} and ${i.away} are on each team page. Compare standings, offensive and defensive stats, and injury reports before puck/tip/first-pitch/kickoff.`,
    });
  }

  return faqs;
}
