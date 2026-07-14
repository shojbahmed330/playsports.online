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
  {
    slug: "ipl-2026-schedule",
    title: "IPL 2026 Schedule — Full Fixture List, Dates & Venues",
    description: "IPL 2026 schedule: full fixture list, match dates, start times, venues and playoffs. All 74 matches across 10 franchises in one place.",
    updated: "2026-07-10",
    keyword: "ipl 2026 schedule",
    faqs: [
      { q: "When does IPL 2026 start?", a: "IPL 2026 opens in the third week of March 2026 with the defending champions hosting the tournament opener, and runs through late May with the Final." },
      { q: "How many matches are in IPL 2026?", a: "74 matches — 70 league-stage games plus 4 playoff matches (Qualifier 1, Eliminator, Qualifier 2 and the Final)." },
      { q: "How many IPL 2026 teams are there?", a: "10 franchises: Mumbai Indians, Chennai Super Kings, Royal Challengers Bengaluru, Kolkata Knight Riders, Delhi Capitals, Punjab Kings, Rajasthan Royals, Sunrisers Hyderabad, Gujarat Titans and Lucknow Super Giants." },
      { q: "Where is the IPL 2026 Final?", a: "The IPL 2026 Final venue is announced by BCCI in the schedule reveal — historically it rotates between Ahmedabad's Narendra Modi Stadium, Chennai's Chepauk and Kolkata's Eden Gardens." },
    ],
    html: `
      <h2>IPL 2026 season at a glance</h2>
      <p>The 2026 Indian Premier League — the 19th edition — features 10 franchises playing 74 matches across roughly eight weeks. Each team plays 14 league matches; the top 4 advance to the playoffs.</p>

      <h2>Match structure</h2>
      <ul>
        <li><strong>Opening match:</strong> defending champions host — 3rd week of March 2026.</li>
        <li><strong>League stage:</strong> 70 matches over ~7 weeks. Each team plays 14 games (home &amp; away against most opponents).</li>
        <li><strong>Qualifier 1:</strong> 1st vs 2nd — winner goes straight to the Final.</li>
        <li><strong>Eliminator:</strong> 3rd vs 4th — loser out.</li>
        <li><strong>Qualifier 2:</strong> Qualifier 1 loser vs Eliminator winner.</li>
        <li><strong>Final:</strong> Late May 2026 at a rotating marquee venue.</li>
      </ul>

      <h2>Where to check live scores</h2>
      <p>Follow every IPL 2026 match with ball-by-ball live scores, playing XIs, over-by-over commentary and points table on <a href="/cricket/ipl">PlaySports IPL Live</a>. Standings and playoff-scenario tracking update in real time.</p>

      <h2>Orange Cap &amp; Purple Cap chases</h2>
      <p>The Orange Cap (most runs) and Purple Cap (most wickets) change hands throughout the season. Track the live leaderboard on the <a href="/cricket/ipl/players">IPL players hub</a> — updated after every match.</p>
    `,
  },
  {
    slug: "world-cup-2026-groups",
    title: "World Cup 2026 Groups — All 12 Groups, 48 Teams Explained",
    description: "FIFA World Cup 2026 groups: all 12 groups of 4, the full 48-team draw, how advancement works, and the third-place-team tiebreakers.",
    updated: "2026-07-14",
    keyword: "world cup 2026 groups",
    faqs: [
      { q: "How many groups are in the 2026 FIFA World Cup?", a: "12 groups (A through L) of 4 teams each — a total of 48 teams, the largest World Cup ever." },
      { q: "How do teams qualify from the World Cup 2026 groups?", a: "The top 2 from each of the 12 groups automatically advance to the Round of 32, plus the 8 best third-placed teams across all groups — 32 teams in total." },
      { q: "What are the tiebreakers for World Cup 2026 group stage?", a: "In order: (1) points, (2) goal difference, (3) goals scored, (4) head-to-head result, (5) fair-play points, (6) FIFA ranking draw." },
      { q: "When was the World Cup 2026 group draw?", a: "The FIFA World Cup 2026 group draw took place on December 5, 2025 at the Kennedy Center in Washington, D.C." },
    ],
    html: `
      <h2>12 groups, 48 teams — how it works</h2>
      <p>The 2026 FIFA World Cup groups the 48 qualified nations into <strong>12 groups of 4 teams</strong> — labelled Group A through Group L. It's the first World Cup with a 12-group format; previous editions used 8 groups of 4 (1998–2022) or 6 groups of 4 (1994).</p>

      <h2>Group stage schedule</h2>
      <p>Every team plays each opponent in its group once — 3 group matches per team, 6 total per group, and <strong>72 group-stage matches</strong> across the tournament. Group play runs from June 11 to June 27, 2026.</p>

      <h2>How teams advance</h2>
      <ul>
        <li>The <strong>top 2</strong> teams from every group qualify automatically (24 teams).</li>
        <li>The <strong>8 best third-placed teams</strong> across all 12 groups also advance, giving 32 teams for the new Round of 32.</li>
        <li>The remaining 4 third-placed teams are eliminated.</li>
      </ul>

      <h2>Tiebreakers</h2>
      <p>When teams are level on points, FIFA applies these criteria in order: goal difference, goals scored, head-to-head record, then fair-play points and, as a last resort, a drawing of lots.</p>

      <p>Follow every group live on <a href="/football?tab=groups">PlaySports Football</a> — group tables refresh after every match.</p>
    `,
  },
  {
    slug: "world-cup-2026-tickets",
    title: "How to Buy FIFA World Cup 2026 Tickets — Prices & Phases",
    description: "How to buy FIFA World Cup 2026 tickets: sale phases, ticket categories, resale window, price bands and the FIFA.com/tickets official portal.",
    updated: "2026-07-14",
    keyword: "world cup 2026 tickets how to buy",
    faqs: [
      { q: "Where do I buy official FIFA World Cup 2026 tickets?", a: "Only through FIFA's official portal at FIFA.com/tickets. All other resellers are unofficial — some may be legitimate resale marketplaces, others are scams. FIFA operates its own official resale platform." },
      { q: "How much do 2026 World Cup tickets cost?", a: "Category 4 (local residents) group-stage tickets start around $60. Category 1 tickets range from $200 to $600 for group games; the Final ranges from about $800 (Cat 4) to over $6,000 (Cat 1)." },
      { q: "When did World Cup 2026 tickets go on sale?", a: "FIFA opened ticket sales in phases starting September 2025 (Visa presale) then general Random Selection Draws. The first-come-first-served phase runs closer to the tournament." },
      { q: "Can I resell FIFA World Cup 2026 tickets?", a: "Only through FIFA's official resale platform — face-value or below. Third-party resales are not permitted under FIFA ticketing terms, and tickets sold outside the official channel can be voided at the gate." },
    ],
    html: `
      <h2>The only safe place to buy</h2>
      <p>All official FIFA World Cup 2026 tickets are sold at <strong>FIFA.com/tickets</strong>. No other site is an authorised primary seller. Match-day scams — fake QR codes, cloned resale sites, "guaranteed pairs" — spike in the weeks before every World Cup. If a site isn't linked from FIFA.com, treat it as risky.</p>

      <h2>Sales phases</h2>
      <ul>
        <li><strong>Visa Presale Draw</strong> — first window, open to Visa cardholders only.</li>
        <li><strong>Early Ticket Draw</strong> — random selection open to all fans.</li>
        <li><strong>Random Selection Draw</strong> — post-group-draw window (opens once the fixture list is known).</li>
        <li><strong>First-come-first-served</strong> — the final window in the months before the tournament, when remaining inventory is released live.</li>
        <li><strong>Last-minute sales</strong> — during the tournament itself for any released seats.</li>
      </ul>

      <h2>Ticket categories &amp; prices</h2>
      <p>FIFA sells four categories per match: Cat 1 (best seats, most expensive), Cat 2, Cat 3, and Cat 4 (a lower-priced category reserved for residents of the host country). Group-stage Cat 4 tickets start near $60; Cat 1 group tickets range roughly $200–$600. Knockout prices climb through the rounds, and the Final ranges from around $800 (Cat 4) up to $6,000+ (Cat 1 VIP hospitality).</p>

      <h2>Reselling safely</h2>
      <p>Sold-out matches move to FIFA's official resale platform. Tickets must be listed at face value or below; buyers get a fresh QR code and full anti-fraud protection. Third-party marketplaces (StubHub, Viagogo, etc.) are not authorised for World Cup tickets.</p>

      <p>Once your ticket is confirmed, plan your match day with the <a href="/football/venues">Host Cities &amp; Stadiums guide</a>.</p>
    `,
  },
  {
    slug: "orange-cap-winners-all-time",
    title: "IPL Orange Cap Winners — All-Time List (2008–2025)",
    description: "Every IPL Orange Cap winner from 2008 to 2025: most runs in a season, franchise, run totals and season averages. Full history in one table.",
    updated: "2026-07-14",
    keyword: "orange cap winners list",
    faqs: [
      { q: "Who has won the most IPL Orange Caps?", a: "David Warner has won the Orange Cap three times (2015, 2017, 2019) — the most of any batter in IPL history." },
      { q: "Who scored the most runs in a single IPL season?", a: "Virat Kohli scored 973 runs in IPL 2016 for Royal Challengers Bengaluru — still the single-season IPL record." },
      { q: "What is the Orange Cap in IPL?", a: "The Orange Cap is awarded to the leading run-scorer of each IPL season. The current holder wears the orange cap while batting until overtaken." },
      { q: "Who won the IPL 2025 Orange Cap?", a: "The IPL 2025 Orange Cap was won by the season's leading run-scorer — track the current list on PlaySports IPL." },
    ],
    html: `
      <h2>What is the Orange Cap?</h2>
      <p>The <strong>Orange Cap</strong> is awarded to the leading run-scorer of each IPL season. It's a live-tracking award — the current holder wears the orange cap while batting, and it changes hands as the leaderboard shifts. The winner takes home the cap permanently at the end of the season.</p>

      <h2>Complete winners list (2008–2025)</h2>
      <ul>
        <li><strong>2008</strong> — Shaun Marsh (Kings XI Punjab) · 616 runs</li>
        <li><strong>2009</strong> — Matthew Hayden (Chennai Super Kings) · 572 runs</li>
        <li><strong>2010</strong> — Sachin Tendulkar (Mumbai Indians) · 618 runs</li>
        <li><strong>2011</strong> — Chris Gayle (Royal Challengers Bengaluru) · 608 runs</li>
        <li><strong>2012</strong> — Chris Gayle (Royal Challengers Bengaluru) · 733 runs</li>
        <li><strong>2013</strong> — Michael Hussey (Chennai Super Kings) · 733 runs</li>
        <li><strong>2014</strong> — Robin Uthappa (Kolkata Knight Riders) · 660 runs</li>
        <li><strong>2015</strong> — David Warner (Sunrisers Hyderabad) · 562 runs</li>
        <li><strong>2016</strong> — <em>Virat Kohli (RCB) · 973 runs — IPL single-season record</em></li>
        <li><strong>2017</strong> — David Warner (Sunrisers Hyderabad) · 641 runs</li>
        <li><strong>2018</strong> — Kane Williamson (Sunrisers Hyderabad) · 735 runs</li>
        <li><strong>2019</strong> — David Warner (Sunrisers Hyderabad) · 692 runs</li>
        <li><strong>2020</strong> — KL Rahul (Kings XI Punjab) · 670 runs</li>
        <li><strong>2021</strong> — Ruturaj Gaikwad (Chennai Super Kings) · 635 runs</li>
        <li><strong>2022</strong> — Jos Buttler (Rajasthan Royals) · 863 runs</li>
        <li><strong>2023</strong> — Shubman Gill (Gujarat Titans) · 890 runs</li>
        <li><strong>2024</strong> — Virat Kohli (Royal Challengers Bengaluru) · 741 runs</li>
        <li><strong>2025</strong> — See the live IPL leaderboard on PlaySports</li>
      </ul>

      <h2>Most Orange Caps by a batter</h2>
      <p>David Warner leads with <strong>3 Orange Caps</strong> (2015, 2017, 2019), all with Sunrisers Hyderabad. Chris Gayle and Virat Kohli are next, tied on 2 each.</p>

      <p>Track this season's live Orange Cap race on <a href="/cricket/ipl/players">PlaySports IPL Players</a>.</p>
    `,
  },
  {
    slug: "nba-finals-mvp-list",
    title: "NBA Finals MVP List — Every Bill Russell Trophy Winner",
    description: "Every NBA Finals MVP (Bill Russell Trophy) from 1969 to 2025: the player, team, and championship. Complete year-by-year winners list.",
    updated: "2026-07-14",
    keyword: "nba finals mvp list",
    faqs: [
      { q: "Who has won the most NBA Finals MVPs?", a: "Michael Jordan won 6 NBA Finals MVPs (1991–1993, 1996–1998) — the most in league history. LeBron James is next with 4." },
      { q: "What is the Bill Russell NBA Finals MVP Trophy?", a: "The Finals MVP trophy was renamed after Bill Russell in 2009 — an 11-time champion whose Boston Celtics dynasty predated the award's creation in 1969." },
      { q: "Has a losing player ever won Finals MVP?", a: "Yes — once. Jerry West won Finals MVP in 1969 despite the Los Angeles Lakers losing to the Boston Celtics in seven games. He remains the only player to do so." },
      { q: "Who won the 2025 NBA Finals MVP?", a: "The 2025 NBA Finals MVP was won by the standout player of the championship series — see PlaySports NBA for the current list." },
    ],
    html: `
      <h2>The Bill Russell Trophy</h2>
      <p>The <strong>NBA Finals MVP</strong> — officially the Bill Russell NBA Finals Most Valuable Player Award — is presented to the best player of the NBA Finals. It's been awarded every year since 1969 and was renamed in 2009 to honour Bill Russell, the 11× champion whose dynasty predated the trophy.</p>

      <h2>Most Finals MVPs (career)</h2>
      <ul>
        <li><strong>Michael Jordan</strong> — 6 (1991, 1992, 1993, 1996, 1997, 1998)</li>
        <li><strong>LeBron James</strong> — 4 (2012, 2013, 2016, 2020)</li>
        <li><strong>Magic Johnson, Shaquille O'Neal, Tim Duncan, Kareem Abdul-Jabbar</strong> — 3 each</li>
      </ul>

      <h2>Recent winners (2015–2025)</h2>
      <ul>
        <li><strong>2015</strong> — Andre Iguodala (Golden State Warriors)</li>
        <li><strong>2016</strong> — LeBron James (Cleveland Cavaliers)</li>
        <li><strong>2017</strong> — Kevin Durant (Golden State Warriors)</li>
        <li><strong>2018</strong> — Kevin Durant (Golden State Warriors)</li>
        <li><strong>2019</strong> — Kawhi Leonard (Toronto Raptors)</li>
        <li><strong>2020</strong> — LeBron James (Los Angeles Lakers)</li>
        <li><strong>2021</strong> — Giannis Antetokounmpo (Milwaukee Bucks)</li>
        <li><strong>2022</strong> — Stephen Curry (Golden State Warriors) — first career Finals MVP</li>
        <li><strong>2023</strong> — Nikola Jokić (Denver Nuggets)</li>
        <li><strong>2024</strong> — Jaylen Brown (Boston Celtics)</li>
        <li><strong>2025</strong> — See PlaySports NBA for the latest winner</li>
      </ul>

      <h2>The one from the losing team</h2>
      <p>Only one player has won Finals MVP while losing the championship: <strong>Jerry West in 1969</strong>. The Lakers lost to Bill Russell's Celtics in seven games, but West averaged 37.9 points, 4.7 rebounds and 7.4 assists — enough for the media panel to name him MVP anyway.</p>

      <p>Track all-time NBA leaders on <a href="/nba/leaders">PlaySports NBA</a>.</p>
    `,
  },
  {
    slug: "world-series-winners-by-year",
    title: "World Series Winners by Year — Full MLB Championship List",
    description: "Every World Series winner from 1903 to 2025: champion, opponent and series result. Complete MLB championship history in one page.",
    updated: "2026-07-14",
    keyword: "world series winners by year",
    faqs: [
      { q: "Which team has won the most World Series?", a: "The New York Yankees have won 27 World Series titles — the most of any franchise in MLB history. The St. Louis Cardinals are next with 11." },
      { q: "When was the first World Series?", a: "The first modern World Series was played in 1903 between the Boston Americans (now Red Sox) and the Pittsburgh Pirates. Boston won 5–3 in a best-of-nine format." },
      { q: "Who won the 2024 World Series?", a: "The Los Angeles Dodgers won the 2024 World Series, defeating the New York Yankees 4–1 to claim their 8th championship." },
      { q: "How many games is the World Series?", a: "The World Series is a best-of-seven series — the first team to 4 wins is champion. It's been best-of-seven every year since 1922 (with brief best-of-nine experiments in 1903, 1919–1921)." },
    ],
    html: `
      <h2>The Fall Classic</h2>
      <p>The <strong>World Series</strong> is Major League Baseball's championship — a best-of-seven series between the American League and National League pennant winners. It's been played every year since 1903 except 1904 (no series) and 1994 (cancelled by the players' strike).</p>

      <h2>Most titles by franchise</h2>
      <ul>
        <li><strong>New York Yankees</strong> — 27 titles</li>
        <li><strong>St. Louis Cardinals</strong> — 11</li>
        <li><strong>Oakland Athletics</strong> — 9</li>
        <li><strong>Boston Red Sox / San Francisco Giants / Los Angeles Dodgers</strong> — 8 each</li>
      </ul>

      <h2>Recent World Series winners (2015–2024)</h2>
      <ul>
        <li><strong>2015</strong> — Kansas City Royals def. New York Mets, 4–1</li>
        <li><strong>2016</strong> — Chicago Cubs def. Cleveland Indians, 4–3 (ended 108-year drought)</li>
        <li><strong>2017</strong> — Houston Astros def. Los Angeles Dodgers, 4–3</li>
        <li><strong>2018</strong> — Boston Red Sox def. Los Angeles Dodgers, 4–1</li>
        <li><strong>2019</strong> — Washington Nationals def. Houston Astros, 4–3</li>
        <li><strong>2020</strong> — Los Angeles Dodgers def. Tampa Bay Rays, 4–2 (neutral-site pandemic series)</li>
        <li><strong>2021</strong> — Atlanta Braves def. Houston Astros, 4–2</li>
        <li><strong>2022</strong> — Houston Astros def. Philadelphia Phillies, 4–2</li>
        <li><strong>2023</strong> — Texas Rangers def. Arizona Diamondbacks, 4–1 (first title in franchise history)</li>
        <li><strong>2024</strong> — Los Angeles Dodgers def. New York Yankees, 4–1</li>
      </ul>

      <p>Follow the current MLB postseason live on <a href="/mlb/postseason">PlaySports MLB</a>.</p>
    `,
  },
  {
    slug: "stanley-cup-winners-list",
    title: "Stanley Cup Winners List — Every NHL Champion by Year",
    description: "Every Stanley Cup winner in NHL history: champion, runner-up and series result. Most titles by franchise and complete year-by-year list.",
    updated: "2026-07-14",
    keyword: "stanley cup winners list",
    faqs: [
      { q: "Which team has won the most Stanley Cups?", a: "The Montreal Canadiens have won 24 Stanley Cup championships — the most of any NHL franchise. The Toronto Maple Leafs are next with 13." },
      { q: "Who won the Stanley Cup in 2025?", a: "The 2025 Stanley Cup was won by the season's playoff champion — check PlaySports NHL for the current holder." },
      { q: "How old is the Stanley Cup?", a: "The Stanley Cup was donated by Lord Stanley of Preston in 1892 — making it the oldest trophy in North American professional sport, older than the modern World Series and Super Bowl." },
      { q: "Is the same Stanley Cup awarded every year?", a: "Yes — winning players get to spend a day with the actual trophy. It's the same physical Cup that's been awarded since 1893, with new bands added as champions are engraved." },
    ],
    html: `
      <h2>Hockey's oldest trophy</h2>
      <p>The <strong>Stanley Cup</strong> is the championship trophy of the National Hockey League — and, at over 130 years old, the oldest trophy competed for by professional athletes in North America. Lord Stanley of Preston donated it in 1892; the first Cup was awarded in 1893.</p>

      <h2>Most Stanley Cups by franchise</h2>
      <ul>
        <li><strong>Montreal Canadiens</strong> — 24 championships</li>
        <li><strong>Toronto Maple Leafs</strong> — 13</li>
        <li><strong>Detroit Red Wings</strong> — 11</li>
        <li><strong>Boston Bruins</strong> — 6</li>
        <li><strong>Chicago Blackhawks / Edmonton Oilers / Pittsburgh Penguins</strong> — 5 each</li>
      </ul>

      <h2>Recent champions (2015–2024)</h2>
      <ul>
        <li><strong>2015</strong> — Chicago Blackhawks def. Tampa Bay Lightning, 4–2</li>
        <li><strong>2016</strong> — Pittsburgh Penguins def. San Jose Sharks, 4–2</li>
        <li><strong>2017</strong> — Pittsburgh Penguins def. Nashville Predators, 4–2</li>
        <li><strong>2018</strong> — Washington Capitals def. Vegas Golden Knights, 4–1 (first title in franchise history)</li>
        <li><strong>2019</strong> — St. Louis Blues def. Boston Bruins, 4–3</li>
        <li><strong>2020</strong> — Tampa Bay Lightning def. Dallas Stars, 4–2 (Edmonton bubble)</li>
        <li><strong>2021</strong> — Tampa Bay Lightning def. Montreal Canadiens, 4–1</li>
        <li><strong>2022</strong> — Colorado Avalanche def. Tampa Bay Lightning, 4–2</li>
        <li><strong>2023</strong> — Vegas Golden Knights def. Florida Panthers, 4–1 (first title)</li>
        <li><strong>2024</strong> — Florida Panthers def. Edmonton Oilers, 4–3 (first title in franchise history)</li>
      </ul>

      <p>Follow the current NHL playoffs live on <a href="/nhl/scores">PlaySports NHL</a>.</p>
    `,
  },
];

export function getGuide(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

export function listGuides(): Guide[] {
  return GUIDES;
}
