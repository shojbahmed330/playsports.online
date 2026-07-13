// Phase 2.2 — Evergreen guide content. Each entry is one long-tail SEO
// landing page. Content is authored as trusted HTML fragments (not raw
// user input) so no sanitisation is required.

export type Guide = {
  slug: string;
  title: string;
  description: string;
  updated: string; // ISO date
  keyword: string;
  faqs: Array<{ q: string; a: string }>;
  /** HTML body — trusted, hand-authored. */
  html: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "how-fifa-world-cup-knockouts-work",
    title: "How FIFA World Cup Knockouts Work — The Complete Guide",
    description:
      "How the FIFA World Cup knockout rounds work: seeding, single-elimination, extra time, penalty shootouts, and the road from Round of 32 to the Final.",
    updated: "2026-06-10",
    keyword: "how fifa world cup knockouts work",
    faqs: [
      { q: "How does the FIFA World Cup knockout stage work?", a: "After the group stage, qualified teams enter a single-elimination bracket. Each round is one match — winner advances, loser goes home. Ties are decided by 30 minutes of extra time and then a penalty shootout." },
      { q: "When did the World Cup adopt a Round of 32?", a: "The 2026 FIFA World Cup is the first edition with 48 teams and a Round of 32, adding an extra knockout round before the Round of 16." },
      { q: "What happens if a knockout match is tied after 90 minutes?", a: "Two 15-minute periods of extra time are played. If the score is still level, a penalty shootout decides the winner." },
      { q: "Can a team draw a knockout match?", a: "No — every knockout match must produce a winner. Ties are resolved by extra time and, if necessary, a penalty shootout." },
    ],
    html: `
      <h2>The knockout format explained</h2>
      <p>The FIFA World Cup knockout stage is a single-elimination bracket. Once the group stage is done, the qualifying teams are placed into a predetermined bracket. Every match has one winner and one loser — no second chances, no aggregate scores, no away-goals rule.</p>

      <h2>Round-by-round breakdown</h2>
      <ul>
        <li><strong>Round of 32</strong> (2026 onwards): 32 teams, 16 matches. New for the expanded 48-team format.</li>
        <li><strong>Round of 16</strong>: 16 teams, 8 matches. The traditional first knockout round in 32-team editions (1998–2022).</li>
        <li><strong>Quarter-finals</strong>: 8 teams, 4 matches.</li>
        <li><strong>Semi-finals</strong>: 4 teams, 2 matches. Winners go to the Final; losers play the third-place play-off.</li>
        <li><strong>Third-place play-off</strong>: The two losing semi-finalists face off for bronze medals.</li>
        <li><strong>Final</strong>: 2 teams, 1 match. Winner lifts the World Cup trophy.</li>
      </ul>

      <h2>What happens if the scores are level?</h2>
      <p>Every knockout match must have a winner. If the game is tied after 90 minutes, the referees add two 15-minute periods of extra time (30 minutes total). If the scores remain level, the match goes to a penalty shootout — five kicks each initially, then sudden-death.</p>

      <h2>The 2026 change: Round of 32</h2>
      <p>The 2026 FIFA World Cup expands to 48 teams for the first time. The top two from each of the twelve groups qualify automatically, joined by the eight best third-place finishers — 32 teams into the knockout bracket. That's one extra round to survive, and one extra chance to see a giant-killing.</p>
    `,
  },
  {
    slug: "how-many-teams-fifa-world-cup-2026",
    title: "How Many Teams Are in the 2026 FIFA World Cup?",
    description:
      "The 2026 FIFA World Cup features 48 teams — the first expanded edition. Full breakdown of how many teams qualify per confederation and how the new format works.",
    updated: "2026-06-01",
    keyword: "how many teams in fifa world cup 2026",
    faqs: [
      { q: "How many teams are in the 2026 FIFA World Cup?", a: "48 teams will play at the 2026 FIFA World Cup — up from 32 in 2022. It's the largest World Cup in history." },
      { q: "How many teams qualify from each confederation?", a: "AFC has 8 direct slots, CAF 9, CONCACAF 6 (including 3 hosts), CONMEBOL 6, OFC 1, UEFA 16, plus 2 slots decided by an inter-confederation play-off." },
      { q: "Why did FIFA expand the World Cup to 48 teams?", a: "FIFA voted in 2017 to expand from 32 to 48 teams to give more nations the chance to qualify and grow the global reach of football's biggest tournament." },
      { q: "Who is hosting the 2026 World Cup?", a: "The 2026 FIFA World Cup is jointly hosted by the United States, Mexico and Canada — the first three-nation host in World Cup history." },
    ],
    html: `
      <h2>48 teams: the biggest World Cup ever</h2>
      <p>The 2026 FIFA World Cup will feature <strong>48 teams</strong>, a 50% increase from the 32-team format that ran from 1998 to 2022. It's the largest edition in the tournament's 96-year history.</p>

      <h2>Confederation slot breakdown</h2>
      <ul>
        <li><strong>AFC (Asia)</strong>: 8 direct + 1 play-off</li>
        <li><strong>CAF (Africa)</strong>: 9 direct + 1 play-off</li>
        <li><strong>CONCACAF (North & Central America / Caribbean)</strong>: 3 automatic host slots + 3 direct + 2 play-off</li>
        <li><strong>CONMEBOL (South America)</strong>: 6 direct + 1 play-off</li>
        <li><strong>OFC (Oceania)</strong>: 1 direct + 1 play-off</li>
        <li><strong>UEFA (Europe)</strong>: 16 direct</li>
      </ul>
      <p>Two additional slots go to the winners of an inter-confederation play-off tournament.</p>

      <h2>How the format works</h2>
      <p>The 48 teams are drawn into 12 groups of 4. Each team plays three group matches, and the top two from each group automatically qualify for the knockouts. They're joined by the eight best third-placed teams across the 12 groups, giving 32 teams for a new Round of 32 — a knockout round the World Cup has never had before.</p>

      <h2>Hosts</h2>
      <p>The 2026 tournament is co-hosted by the <strong>United States, Mexico and Canada</strong> — the first three-nation host in the tournament's history and the largest World Cup by geography.</p>
    `,
  },
  {
    slug: "fifa-world-cup-2026-format",
    title: "FIFA World Cup 2026 Format — Groups, Knockouts & Schedule",
    description:
      "The 2026 FIFA World Cup format explained: 12 groups of 4, a new Round of 32, expanded 48-team draw, and the road from June 11 to the July 19 Final.",
    updated: "2026-06-01",
    keyword: "fifa world cup 2026 format",
    faqs: [
      { q: "What is the format of the 2026 FIFA World Cup?", a: "48 teams split into 12 groups of 4. Top two from each group plus the eight best third-placed teams advance to a 32-team knockout bracket." },
      { q: "How many matches are at the 2026 World Cup?", a: "104 matches in total — 72 in the group stage plus 32 in the knockout rounds (Round of 32 through the Final)." },
      { q: "When does the 2026 World Cup start and end?", a: "The tournament runs from June 11, 2026 to July 19, 2026. The Round of 32 begins June 28 and the Final is on July 19." },
      { q: "How is the Round of 32 seeded?", a: "Group winners are placed on one side of the bracket, runners-up on the other, and the eight best third-placed teams fill the remaining slots based on their group and points total." },
    ],
    html: `
      <h2>Group stage: 12 groups of 4</h2>
      <p>The 48 qualifying teams are drawn into 12 groups labelled A through L. Each team plays every other team in its group once, for a total of 6 matches per group and 72 group-stage matches overall. Group play runs from June 11 to June 27, 2026.</p>

      <h2>Advancement: top 2 + 8 best 3rd</h2>
      <p>The top two teams from each of the 12 groups qualify automatically — 24 teams. They're joined by the <strong>eight best third-placed teams</strong> across the tournament, ranked by group-stage points, goal difference and goals scored. That gives 32 teams for the knockout stage.</p>

      <h2>Knockout stage: Round of 32 to Final</h2>
      <ul>
        <li><strong>Round of 32</strong>: June 28 – July 3 (16 matches)</li>
        <li><strong>Round of 16</strong>: July 4 – July 7 (8 matches)</li>
        <li><strong>Quarter-finals</strong>: July 9 – July 11 (4 matches)</li>
        <li><strong>Semi-finals</strong>: July 14 – July 15 (2 matches)</li>
        <li><strong>Third-place play-off</strong>: July 18 (1 match)</li>
        <li><strong>Final</strong>: July 19 at MetLife Stadium, New Jersey (1 match)</li>
      </ul>

      <h2>Total matches: 104</h2>
      <p>72 group-stage + 32 knockout = 104 matches, up from 64 in the 32-team format. That's 40 extra matches spread across 16 host cities in the USA, Mexico and Canada.</p>
    `,
  },
  {
    slug: "what-is-var",
    title: "What is VAR in Football? — Video Assistant Referee Explained",
    description:
      "VAR (Video Assistant Referee) reviews four match-changing decisions in football: goals, penalties, red cards and mistaken identity. Full guide to how VAR works.",
    updated: "2026-06-15",
    keyword: "what is var in football",
    faqs: [
      { q: "What does VAR stand for?", a: "VAR stands for Video Assistant Referee — a team of officials who review the on-field referee's decisions using video replay." },
      { q: "What decisions can VAR review?", a: "VAR only reviews four types of decisions: goals (and the phase of play leading to them), penalty decisions, direct red cards, and cases of mistaken identity." },
      { q: "Who makes the final decision, VAR or the on-field referee?", a: "The on-field referee always makes the final decision. VAR only recommends a review; the referee then watches the replay pitch-side and decides." },
      { q: "When was VAR introduced?", a: "VAR was written into the Laws of the Game in 2018 and used at the 2018 FIFA World Cup in Russia — the first World Cup with video review." },
    ],
    html: `
      <h2>What is VAR?</h2>
      <p><strong>VAR</strong> stands for <strong>Video Assistant Referee</strong>. It's a team of match officials sitting in a video operations room, watching multiple camera angles of the game live. Their job is to help the on-field referee correct clear and obvious errors on four specific types of decisions.</p>

      <h2>The four reviewable decisions</h2>
      <ul>
        <li><strong>Goals</strong> — including any offside, foul, handball or ball-out-of-play in the attacking phase.</li>
        <li><strong>Penalty decisions</strong> — whether a penalty was correctly awarded or wrongly denied.</li>
        <li><strong>Direct red cards</strong> — not second yellows.</li>
        <li><strong>Mistaken identity</strong> — when the referee cautions or sends off the wrong player.</li>
      </ul>

      <h2>How a VAR check works</h2>
      <p>After every reviewable incident, VAR silently checks the footage. If they spot a clear and obvious error, they recommend an on-field review. The referee walks to the pitch-side monitor, watches the replay, and either changes the decision or sticks with it. If VAR finds no clear error, play continues without interruption.</p>

      <h2>When was VAR introduced?</h2>
      <p>VAR was added to the Laws of the Game in March 2018 by IFAB. The <strong>2018 FIFA World Cup in Russia</strong> was the first World Cup to use it. Since then it's been adopted by the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, MLS and every major continental competition.</p>

      <h2>Common criticisms</h2>
      <p>VAR is often criticised for slowing the game down, taking away spontaneous goal celebrations, and inconsistent interpretations of handball and offside. Supporters argue it has significantly reduced game-changing refereeing errors — especially on offside goals and missed penalties.</p>
    `,
  },
  {
    slug: "ipl-format",
    title: "IPL Format Explained — 10 Teams, Playoffs & Final",
    description:
      "The Indian Premier League format: 10 franchises, 74 matches, a double round-robin group stage and a 4-team playoff with Qualifiers and Eliminator leading to the Final.",
    updated: "2026-06-20",
    keyword: "ipl format explained",
    faqs: [
      { q: "How many teams play in the IPL?", a: "10 franchises play in the IPL: Mumbai Indians, Chennai Super Kings, Royal Challengers Bengaluru, Kolkata Knight Riders, Delhi Capitals, Punjab Kings, Rajasthan Royals, Sunrisers Hyderabad, Gujarat Titans and Lucknow Super Giants." },
      { q: "How many matches are in an IPL season?", a: "74 matches: 70 in the league stage plus 4 in the playoffs (Qualifier 1, Eliminator, Qualifier 2 and the Final)." },
      { q: "How does the IPL playoff work?", a: "The top 4 teams qualify. Teams 1 and 2 play Qualifier 1 — the winner goes straight to the Final. Teams 3 and 4 play the Eliminator — the loser is out. The Eliminator winner then plays the Qualifier 1 loser in Qualifier 2 for the second Final spot." },
      { q: "Why do the top 2 teams get two chances?", a: "The Qualifier 1 / Qualifier 2 system rewards league-stage performance. Teams that finish 1st or 2nd get a second chance to reach the Final even if they lose their first playoff." },
    ],
    html: `
      <h2>10 teams, 74 matches</h2>
      <p>The <strong>Indian Premier League (IPL)</strong> is a Twenty20 franchise tournament played every March–May. Ten city-based franchises play a total of <strong>74 matches</strong> across roughly eight weeks — 70 league matches plus four playoff matches.</p>

      <h2>League stage: modified double round-robin</h2>
      <p>Each team plays 14 league matches. Because a full home-and-away double round-robin would need 18 matches, the schedule is trimmed: every team plays some opponents twice and others once. That gives 70 group-stage matches in total, with the top 4 on the points table advancing to the playoffs.</p>

      <h2>Playoffs: Qualifier 1, Eliminator, Qualifier 2, Final</h2>
      <ul>
        <li><strong>Qualifier 1</strong>: 1st vs 2nd. Winner → Final. Loser gets a second chance in Qualifier 2.</li>
        <li><strong>Eliminator</strong>: 3rd vs 4th. Loser is out. Winner advances to Qualifier 2.</li>
        <li><strong>Qualifier 2</strong>: Qualifier 1 loser vs Eliminator winner. Winner → Final.</li>
        <li><strong>Final</strong>: Qualifier 1 winner vs Qualifier 2 winner. Winner is IPL champion.</li>
      </ul>

      <h2>Why the top 2 get a second chance</h2>
      <p>The playoff design intentionally rewards teams that top the league. Finishing 1st or 2nd earns you two chances to reach the Final, while 3rd and 4th are on sudden-death from the Eliminator onwards. It keeps the league stage meaningful right until the last round.</p>

      <h2>Orange Cap and Purple Cap</h2>
      <p>Individual honours are tracked live all season: the <strong>Orange Cap</strong> goes to the top run-scorer, and the <strong>Purple Cap</strong> to the top wicket-taker. The current cap-holder wears the coloured cap while batting or bowling.</p>
    `,
  },
  {
    slug: "nba-playoffs-format",
    title: "NBA Playoffs Format — Play-In, Bracket & Finals Explained",
    description:
      "The NBA Playoffs format: 16 teams from two conferences, best-of-seven series in all four rounds, the Play-In Tournament for seeds 7–10, and the NBA Finals.",
    updated: "2026-06-25",
    keyword: "nba playoffs format",
    faqs: [
      { q: "How many teams make the NBA Playoffs?", a: "16 teams — the top 8 seeds from each conference (Eastern and Western). Seeds 1–6 qualify directly; seeds 7 and 8 are decided through the Play-In Tournament." },
      { q: "What is the NBA Play-In Tournament?", a: "A mini-tournament between the 7th, 8th, 9th and 10th seeds in each conference. The 7 vs 8 winner earns the 7 seed. The 9 vs 10 winner plays the 7 vs 8 loser for the 8 seed." },
      { q: "How long is an NBA Playoff series?", a: "Every round — First Round, Conference Semifinals, Conference Finals and NBA Finals — is a best-of-seven series. First team to 4 wins advances." },
      { q: "What is home-court advantage in the playoffs?", a: "The higher-seeded team plays Games 1, 2, 5 and 7 at home (2-2-1-1-1 format). Home-court in the Finals goes to the team with the better regular-season record." },
    ],
    html: `
      <h2>16 teams, two conferences</h2>
      <p>The <strong>NBA Playoffs</strong> feature 16 teams — the top 8 from the Eastern Conference and the top 8 from the Western Conference. Seeds 1 through 6 qualify directly from the regular-season standings. Seeds 7 and 8 are settled by the Play-In Tournament.</p>

      <h2>The Play-In Tournament (seeds 7–10)</h2>
      <p>Introduced full-time in 2021, the Play-In gives teams ranked 7th–10th in each conference a shot at the last two playoff spots:</p>
      <ul>
        <li><strong>7 vs 8</strong>: winner earns the 7 seed. Loser gets a second chance.</li>
        <li><strong>9 vs 10</strong>: winner advances. Loser is eliminated.</li>
        <li><strong>7 vs 8 loser vs 9 vs 10 winner</strong>: winner earns the 8 seed and the final playoff spot.</li>
      </ul>

      <h2>The playoff bracket: four rounds, all best-of-seven</h2>
      <ul>
        <li><strong>First Round</strong>: 1 vs 8, 4 vs 5, 3 vs 6, 2 vs 7 (per conference).</li>
        <li><strong>Conference Semifinals</strong>: First-round winners meet in a re-seeded bracket.</li>
        <li><strong>Conference Finals</strong>: East champion and West champion decided.</li>
        <li><strong>NBA Finals</strong>: East champion vs West champion for the Larry O'Brien Trophy.</li>
      </ul>

      <h2>Home-court advantage</h2>
      <p>Every series is best-of-seven and follows the <strong>2-2-1-1-1</strong> format: the higher seed hosts Games 1, 2, 5 and 7; the lower seed hosts Games 3, 4 and 6. Home-court in the NBA Finals is awarded to the team with the better regular-season record, regardless of conference seeding.</p>

      <h2>How long do the playoffs last?</h2>
      <p>From the Play-In in mid-April to the Finals in mid-June, the NBA Playoffs run about two months. A full-length playoff run (four series that all go seven games) means 28 games — nearly a third of a regular season.</p>
    `,
  },
];

export function getGuide(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

export function listGuides(): Guide[] {
  return GUIDES;
}
