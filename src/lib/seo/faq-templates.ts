// FAQ generators for programmatic SEO pages.
// Each helper returns { q, a } pairs that mirror the exact phrasing users
// search in Google (e.g. "how many world cups has X played").

export type Faq = { q: string; a: string };

export function countryFaqs(opts: {
  name: string;
  appearances: number;
  years: number[];
  titles: number;
  titleYears: number[];
  bestFinish: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  topScorer?: { name: string; goals: number };
}): Faq[] {
  const {
    name, appearances, years, titles, titleYears, bestFinish,
    matchesPlayed, wins, draws, losses, goalsFor, goalsAgainst, topScorer,
  } = opts;
  const yearList = years.join(", ");
  const list: Faq[] = [
    { q: `How many World Cups has ${name} played in?`, a: `${name} has appeared in ${appearances} FIFA World Cups — ${yearList || "none on record"}.` },
    { q: `Has ${name} ever won the FIFA World Cup?`, a: titles > 0
      ? `Yes — ${name} has won the FIFA World Cup ${titles} time${titles === 1 ? "" : "s"} (${titleYears.join(", ")}).`
      : `No — ${name} has never won the FIFA World Cup. Their best finish is ${bestFinish}.` },
    { q: `What is ${name}'s best finish at the World Cup?`, a: `${name}'s best World Cup finish is ${bestFinish}.` },
    { q: `How many World Cup matches has ${name} played?`, a: `${name} has played ${matchesPlayed} FIFA World Cup matches: ${wins} wins, ${draws} draws and ${losses} losses.` },
    { q: `How many World Cup goals has ${name} scored?`, a: `${name} has scored ${goalsFor} goals at the FIFA World Cup and conceded ${goalsAgainst}.` },
  ];
  if (topScorer) {
    list.push({ q: `Who is ${name}'s all-time top World Cup scorer?`, a: `${topScorer.name} is ${name}'s leading World Cup scorer with ${topScorer.goals} goals.` });
  }
  list.push({ q: `When did ${name} last play at the World Cup?`, a: years.length ? `${name} last appeared at the FIFA World Cup in ${years[years.length - 1]}.` : `${name} has no recorded World Cup appearances.` });
  return list;
}

export function countryYearFaqs(opts: {
  name: string;
  year: number;
  host: string;
  finish: string;
  played: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  topScorer?: { name: string; goals: number };
}): Faq[] {
  const { name, year, host, finish, played, w, d, l, gf, ga, topScorer } = opts;
  const list: Faq[] = [
    { q: `How did ${name} do at the ${year} World Cup?`, a: `${name} ${finish} at the ${year} FIFA World Cup in ${host}: ${played} matches, ${w}W-${d}D-${l}L, ${gf} scored, ${ga} conceded.` },
    { q: `What was ${name}'s ${year} World Cup result?`, a: `${name} finished ${finish} at the ${host} ${year} World Cup.` },
    { q: `How many goals did ${name} score at the ${year} World Cup?`, a: `${name} scored ${gf} goals and conceded ${ga} at the ${year} World Cup.` },
  ];
  if (topScorer) {
    list.push({ q: `Who was ${name}'s top scorer at the ${year} World Cup?`, a: `${topScorer.name} was ${name}'s top scorer at the ${year} World Cup with ${topScorer.goals} goal${topScorer.goals === 1 ? "" : "s"}.` });
  }
  list.push({ q: `Where was the ${year} World Cup held?`, a: `The ${year} FIFA World Cup was hosted by ${host}.` });
  return list;
}

export function playerFaqs(opts: {
  name: string;
  team: string;
  goalsTotal: number;
  years: number[];
  hatTricks?: number;
  bestYear?: { year: number; goals: number };
}): Faq[] {
  const { name, team, goalsTotal, years, hatTricks = 0, bestYear } = opts;
  const yearList = years.join(", ") || "no recorded editions";
  const list: Faq[] = [
    { q: `How many World Cup goals has ${name} scored?`, a: `${name} has scored ${goalsTotal} FIFA World Cup goals for ${team}.` },
    { q: `How many World Cups has ${name} played in?`, a: `${name} has played in ${years.length} FIFA World Cup${years.length === 1 ? "" : "s"} (${yearList}).` },
    { q: `Which teams did ${name} represent at the World Cup?`, a: `${name} represented ${team} at the FIFA World Cup.` },
  ];
  if (bestYear) {
    list.push({ q: `In which World Cup did ${name} score the most goals?`, a: `${name} scored the most goals (${bestYear.goals}) at the ${bestYear.year} World Cup.` });
  }
  if (hatTricks > 0) {
    list.push({ q: `Has ${name} scored a World Cup hat-trick?`, a: `Yes — ${name} has scored ${hatTricks} hat-trick${hatTricks === 1 ? "" : "s"} at the FIFA World Cup.` });
  }
  return list;
}

export function playerYearFaqs(opts: {
  name: string;
  team: string;
  year: number;
  goals: number;
  isTopScorer?: boolean;
}): Faq[] {
  const { name, team, year, goals, isTopScorer } = opts;
  return [
    { q: `How many goals did ${name} score at the ${year} World Cup?`, a: `${name} scored ${goals} goal${goals === 1 ? "" : "s"} for ${team} at the ${year} FIFA World Cup.` },
    { q: `Did ${name} play at the ${year} World Cup?`, a: `Yes — ${name} played for ${team} at the ${year} FIFA World Cup${goals > 0 ? ` and scored ${goals} goal${goals === 1 ? "" : "s"}` : ""}.` },
    ...(isTopScorer ? [{ q: `Was ${name} the top scorer of the ${year} World Cup?`, a: `Yes — ${name} won the Golden Boot at the ${year} FIFA World Cup with ${goals} goals.` }] : []),
  ];
}

export function tournamentFaqs(opts: {
  year: number;
  host: string;
  champion: string;
  runnerUp: string;
  finalScore: string;
  topScorer: string;
  topScorerGoals: number;
  teams: number;
  matches: number;
  totalGoals: number;
}): Faq[] {
  const { year, host, champion, runnerUp, finalScore, topScorer, topScorerGoals, teams, matches, totalGoals } = opts;
  return [
    { q: `Who won the ${year} FIFA World Cup?`, a: champion === "TBD" ? `The ${year} FIFA World Cup champion has not yet been decided.` : `${champion} won the ${year} FIFA World Cup, beating ${runnerUp} ${finalScore} in the final.` },
    { q: `Where was the ${year} World Cup held?`, a: `The ${year} FIFA World Cup was hosted by ${host}.` },
    { q: `Who was the top scorer of the ${year} World Cup?`, a: topScorer === "TBD" ? `Top scorer of the ${year} World Cup has not yet been decided.` : `${topScorer} was the top scorer of the ${year} World Cup with ${topScorerGoals} goals.` },
    { q: `How many teams played in the ${year} World Cup?`, a: `${teams} nations played in the ${year} FIFA World Cup across ${matches} matches.` },
    { q: `How many goals were scored at the ${year} World Cup?`, a: totalGoals ? `${totalGoals} goals were scored across ${matches} matches at the ${year} FIFA World Cup.` : `Goal totals for the ${year} World Cup are not yet available.` },
  ];
}
