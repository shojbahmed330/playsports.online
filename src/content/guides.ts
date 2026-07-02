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
];

export function getGuide(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

export function listGuides(): Guide[] {
  return GUIDES;
}
