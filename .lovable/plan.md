# SEO Growth Plan - PlaySports

This plan outlines the next steps to maximize organic search visibility, following the resolution of technical indexing issues.

## 1. Contextual Internal Linking
Search engines need clear paths to discover deep programmatic pages.
- **Link Hubs**: Ensure every "Team" page links to its "H2H" history and "Archive" entries.
- **Player-to-Year Linking**: Ensure player profiles clearly link to their specific World Cup year pages (e.g., Messi 2022).
- **Cross-Sport Linking**: Add a "Trending in Other Sports" section to high-traffic landing pages.

## 2. Dynamic FAQ Generation
Enhance programmatic pages with self-updating, high-value FAQs to target "People Also Ask" (PAA) boxes.
- **Team FAQs**: "When was [Team]'s last World Cup appearance?", "Who is [Team]'s all-time top scorer?".
- **Match FAQs**: "Who won the last match between [Team A] and [Team B]?", "What was the highest-scoring game for [Team]?".

## 3. SEO Metadata Refinement (Keyword Targeting)
Optimization of titles and descriptions based on high-intent search queries.
- **Matches**: Target "Live score", "Highlights", and "Match details".
- **Records**: Target "All-time top scorers", "Most World Cup goals", "IPL records 2026".

## 4. Automation & Freshness
- **IndexNow Integration**: Automatically notify Bing and Yandex when new matches or scores are synced.
- **Sitemap Freshness**: Ensure the `lastmod` tags in `sitemap.xml` correctly reflect data updates (e.g., when a live score changes).

## 5. Technical Polish
- **Canonicalization**: Audit and enforce canonical tags on all path-variant URLs.
- **Image SEO**: Add descriptive `alt` text and structured data to player and team logos.

## Implementation Steps
1.  **Phase 1**: Implement enhanced internal linking on Team and Player pages.
2.  **Phase 2**: Deploy dynamic FAQ builders for programmatic routes.
3.  **Phase 3**: Set up automated IndexNow pings in the `sync-sports` cron job.
4.  **Phase 4**: Audit and optimize metadata for all US sports (MLB, NBA, NHL).
