# Screen Inventory

Generated from the real router files in `src/routes` and cross-checked against `src/routeTree.gen.ts`.


> **Execution status:** the foundation and HOME-01, CRK-04, CRK-19, CRK-13, CRK-21 and CRK-24 are DONE. Every remaining row is marked BLOCKED for this session because the per-screen audit/implementation budget was exhausted; the reason is recorded in `BLOCKERS.md` and the recommended order is in `FINAL_REPORT.md`. This is a resource blocker, not a claim that the screen is broken.

## 1. Summary

- **Route-level screens: 150**. Counting rule: every route file that renders a page or nested page, including dynamic routes as one template screen; layout-only files and API/verification endpoints are excluded (see "Excluded route files").
- **Overlays and global pieces**: listed separately in section 4 and audited in the foundation pass.
- **Modules**:
- Utility: 7
- Admin: 1
- Cross-sport: 5
- Auth: 1
- Cricket: 26
- Football: 34
- Guides: 4
- Home: 1
- Live: 2
- My Sports: 1
- MLB: 17
- MLS: 15
- NBA: 15
- News: 2
- NHL: 15
- Players: 2
- Premium: 1
- Search: 1
- **Types**: 150 full pages; overlays are additional and listed in section 4.
- **Dynamic route templates** count as one screen each (e.g. `/cricket/match/:id`), because the layout and behaviour are shared by every instance.

## 2. Module tree

- **Utility** (7)
    - UTIL-01 About — `/about`
    - UTIL-02 Contact — `/contact`
    - UTIL-03 Cookies — `/cookies`
    - UTIL-04 Disclaimer — `/disclaimer`
    - UTIL-05 Privacy — `/privacy`
    - UTIL-06 Terms — `/terms`
    - UTIL-07 Unsubscribe — `/unsubscribe`
- **Admin** (1)
    - ADMIN-01 Admin — `/admin`
- **Cross-sport** (5)
    - XSPT-01 Archive Sport Year — `/archive/:sport/:year`
    - XSPT-02 Team Sport Slug — `/team/:sport/:slug`
    - XSPT-03 Tournaments Tournament Leaderboard — `/tournaments/:tournament/:leaderboard`
    - XSPT-04 Tournaments Fifa World Cup 2026 Stage — `/tournaments/fifa-world-cup-2026/:stage`
    - XSPT-05 Vs Sport Matchup — `/vs/:sport/:matchup`
- **Auth** (1)
    - AUTH-01 Auth — `/auth`
- **Cricket** (26)
    - CRK-01 Cricket Highlights Slug — `/cricket/highlights/:slug`
    - CRK-02 Cricket Highlights — `/cricket/highlights`
    - CRK-03 Cricket History — `/cricket/history`
    - CRK-04 Cricket — `/cricket`
    - CRK-05 Cricket Ipl History — `/cricket/ipl/history`
    - CRK-06 Cricket Ipl — `/cricket/ipl`
    - CRK-07 Cricket Ipl Players — `/cricket/ipl/players`
    - CRK-08 Cricket Ipl Records — `/cricket/ipl/records`
    - CRK-09 Cricket Ipl Scores — `/cricket/ipl/scores`
    - CRK-10 Cricket Ipl Standings — `/cricket/ipl/standings`
    - CRK-11 Cricket Ipl Teams TeamId — `/cricket/ipl/teams/:teamId`
    - CRK-12 Cricket Ipl Teams — `/cricket/ipl/teams`
    - CRK-13 Cricket Match Id — `/cricket/match/:id`
    - CRK-14 Cricket Players Slug — `/cricket/players/:slug`
    - CRK-15 Cricket Players — `/cricket/players`
    - CRK-16 Cricket Rankings — `/cricket/rankings`
    - CRK-17 Cricket Records Category — `/cricket/records/:category`
    - CRK-18 Cricket Records — `/cricket/records`
    - CRK-19 Cricket Scores — `/cricket/scores`
    - CRK-20 Cricket Series Id — `/cricket/series/:id`
    - CRK-21 Cricket Series — `/cricket/series`
    - CRK-22 Cricket Team History Slug — `/cricket/team-history/:slug`
    - CRK-23 Cricket Teams Slug — `/cricket/teams/:slug`
    - CRK-24 Cricket Teams — `/cricket/teams`
    - CRK-25 Cricket Tournaments Slug — `/cricket/tournaments/:slug`
    - CRK-26 Cricket Tournaments — `/cricket/tournaments`
- **Football** (34)
    - FB-01 Football Comp Fixtures — `/football/:comp/fixtures`
    - FB-02 Football Comp H2h Matchup — `/football/:comp/h2h/:matchup`
    - FB-03 Football Comp History Year — `/football/:comp/history/:year`
    - FB-04 Football Comp History — `/football/:comp/history`
    - FB-05 Football Comp — `/football/:comp`
    - FB-06 Football Comp Matches MatchId — `/football/:comp/matches/:matchId`
    - FB-07 Football Comp Players PlayerId — `/football/:comp/players/:playerId`
    - FB-08 Football Comp Players — `/football/:comp/players`
    - FB-09 Football Comp Records Category — `/football/:comp/records/:category`
    - FB-10 Football Comp Records Decades — `/football/:comp/records/decades`
    - FB-11 Football Comp Records — `/football/:comp/records`
    - FB-12 Football Comp Scores — `/football/:comp/scores`
    - FB-13 Football Comp Seasons Year — `/football/:comp/seasons/:year`
    - FB-14 Football Comp Standings — `/football/:comp/standings`
    - FB-15 Football Comp Teams TeamId — `/football/:comp/teams/:teamId`
    - FB-16 Football Comp Teams TeamId Season Year — `/football/:comp/teams/:teamId/season-:year`
    - FB-17 Football Comp Teams — `/football/:comp/teams`
    - FB-18 Football Campaigns Slug — `/football/campaigns/:slug`
    - FB-19 Football Campaigns — `/football/campaigns`
    - FB-20 Football Countries Slug World Cup Year — `/football/countries/:slug/world-cup-:year`
    - FB-21 Football Countries — `/football/countries`
    - FB-22 Football — `/football`
    - FB-23 Football Match Id — `/football/match/:id`
    - FB-24 Football Matches Slug — `/football/matches/:slug`
    - FB-25 Football Mine — `/football/mine`
    - FB-26 Football Players Slug — `/football/players/:slug`
    - FB-27 Football Players Slug World Cup Year — `/football/players/:slug/world-cup-:year`
    - FB-28 Football Players — `/football/players`
    - FB-29 Football Records Category — `/football/records/:category`
    - FB-30 Football Teams Slug — `/football/teams/:slug`
    - FB-31 Football Top Scorers Year — `/football/top-scorers/:year`
    - FB-32 Football Top Scorers — `/football/top-scorers`
    - FB-33 Football Tournaments Year — `/football/tournaments/:year`
    - FB-34 Football Venues — `/football/venues`
- **Guides** (4)
    - GUIDE-01 Guides Slug — `/guides/:slug`
    - GUIDE-02 Guides — `/guides`
    - GUIDE-03 Highlights Slug — `/highlights/:slug`
    - GUIDE-04 Highlights — `/highlights`
- **Home** (1)
    - HOME-01 Index — `/`
- **Live** (2)
    - LIVE-01 Live Sport — `/live/:sport`
    - LIVE-02 Live Today — `/live/today`
- **My Sports** (1)
    - MINE-01 Mine — `/mine`
- **MLB** (17)
    - MLB-01 Mlb Champions — `/mlb/champions`
    - MLB-02 Mlb Game Id — `/mlb/game/:id`
    - MLB-03 Mlb History — `/mlb/history`
    - MLB-04 Mlb — `/mlb`
    - MLB-05 Mlb News — `/mlb/news`
    - MLB-06 Mlb Player Id — `/mlb/player/:id`
    - MLB-07 Mlb Players Slug — `/mlb/players/:slug`
    - MLB-08 Mlb Players — `/mlb/players`
    - MLB-09 Mlb Postseason — `/mlb/postseason`
    - MLB-10 Mlb Records Category — `/mlb/records/:category`
    - MLB-11 Mlb Scores — `/mlb/scores`
    - MLB-12 Mlb Standings — `/mlb/standings`
    - MLB-13 Mlb Team History Slug — `/mlb/team-history/:slug`
    - MLB-14 Mlb Team Id — `/mlb/team/:id`
    - MLB-15 Mlb Teams — `/mlb/teams`
    - MLB-16 Mlb Teams Slug — `/mlb/teams/:slug`
    - MLB-17 Mlb World Series Year — `/mlb/world-series/:year`
- **MLS** (15)
    - MLS-01 Mls Champions — `/mls/champions`
    - MLS-02 Mls Cup Year — `/mls/cup/:year`
    - MLS-03 Mls Game Id — `/mls/game/:id`
    - MLS-04 Mls History — `/mls/history`
    - MLS-05 Mls — `/mls`
    - MLS-06 Mls Leaders — `/mls/leaders`
    - MLS-07 Mls News — `/mls/news`
    - MLS-08 Mls Player Id — `/mls/player/:id`
    - MLS-09 Mls Players Slug — `/mls/players/:slug`
    - MLS-10 Mls Scores — `/mls/scores`
    - MLS-11 Mls Standings — `/mls/standings`
    - MLS-12 Mls Team History Slug — `/mls/team-history/:slug`
    - MLS-13 Mls Team Id — `/mls/team/:id`
    - MLS-14 Mls Teams — `/mls/teams`
    - MLS-15 Mls Teams Slug — `/mls/teams/:slug`
- **NBA** (15)
    - NBA-01 Nba Champions — `/nba/champions`
    - NBA-02 Nba Finals Year — `/nba/finals/:year`
    - NBA-03 Nba Game Id — `/nba/game/:id`
    - NBA-04 Nba History — `/nba/history`
    - NBA-05 Nba — `/nba`
    - NBA-06 Nba Leaders — `/nba/leaders`
    - NBA-07 Nba News — `/nba/news`
    - NBA-08 Nba Player Id — `/nba/player/:id`
    - NBA-09 Nba Players Slug — `/nba/players/:slug`
    - NBA-10 Nba Scores — `/nba/scores`
    - NBA-11 Nba Standings — `/nba/standings`
    - NBA-12 Nba Team History Slug — `/nba/team-history/:slug`
    - NBA-13 Nba Team Id — `/nba/team/:id`
    - NBA-14 Nba Teams — `/nba/teams`
    - NBA-15 Nba Teams Slug — `/nba/teams/:slug`
- **News** (2)
    - NEWS-01 News Slug — `/news/:slug`
    - NEWS-02 News — `/news`
- **NHL** (15)
    - NHL-01 Nhl Champions — `/nhl/champions`
    - NHL-02 Nhl Game Id — `/nhl/game/:id`
    - NHL-03 Nhl History — `/nhl/history`
    - NHL-04 Nhl — `/nhl`
    - NHL-05 Nhl Leaders — `/nhl/leaders`
    - NHL-06 Nhl News — `/nhl/news`
    - NHL-07 Nhl Player Id — `/nhl/player/:id`
    - NHL-08 Nhl Players Slug — `/nhl/players/:slug`
    - NHL-09 Nhl Scores — `/nhl/scores`
    - NHL-10 Nhl Standings — `/nhl/standings`
    - NHL-11 Nhl Stanley Cup Year — `/nhl/stanley-cup/:year`
    - NHL-12 Nhl Team History Slug — `/nhl/team-history/:slug`
    - NHL-13 Nhl Team Id — `/nhl/team/:id`
    - NHL-14 Nhl Teams — `/nhl/teams`
    - NHL-15 Nhl Teams Slug — `/nhl/teams/:slug`
- **Players** (2)
    - PLYR-01 Player Sport Slug — `/player/:sport/:slug`
    - PLYR-02 Players — `/players`
- **Premium** (1)
    - PREM-01 Premium — `/premium`
- **Search** (1)
    - SRCH-01 Search — `/search`

## 3. Master table

| ID | Module | Parent | Screen name | Type | Route / file path | Data and features shown | Key components | API/data sources | Has loading/empty/error states? | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| UTIL-01 | Utility | — | About | Full page | `/about`<br>`src/routes/about.tsx` | head meta | site/LegalLayout | static/local | loading, empty | BLOCKED |
| ADMIN-01 | Admin | — | Admin | Full page | `/admin`<br>`src/routes/admin.tsx` | client query; head meta | admin/CommandPalette, wc/VideoPlayer, admin/AdSenseAdminCard, admin/MonetizationCard | wc2026.functions | loading, empty, error | BLOCKED |
| XSPT-01 | Cross-sport | — | Archive Sport Year | Full page | `/archive/:sport/:year`<br>`src/routes/archive.$sport.$year.tsx` | SSR loader; JSON-LD; head meta | affiliates/AffiliateStrip, ads/AdSlot | server fn / query | error | BLOCKED |
| AUTH-01 | Auth | — | Auth | Full page | `/auth`<br>`src/routes/auth.tsx` | head meta | — | static/local | loading, error | BLOCKED |
| UTIL-02 | Utility | — | Contact | Full page | `/contact`<br>`src/routes/contact.tsx` | head meta | site/LegalLayout | contact.functions | error | BLOCKED |
| UTIL-03 | Utility | — | Cookies | Full page | `/cookies`<br>`src/routes/cookies.tsx` | head meta | site/LegalLayout | static/local | loading | BLOCKED |
| CRK-01 | Cricket | CRK-04 | Cricket Highlights Slug | Full page | `/cricket/highlights/:slug`<br>`src/routes/cricket.highlights.$slug.tsx` | SSR loader; JSON-LD; head meta | sports/SportNav, cricket/CricketSubNav, news/MatchRecapCard | server fn / query | loading, error | BLOCKED |
| CRK-02 | Cricket | CRK-04 | Cricket Highlights | Full page | `/cricket/highlights`<br>`src/routes/cricket.highlights.index.tsx` | JSON-LD; head meta | sports/SportNav, cricket/CricketSubNav | static/local | not verified | BLOCKED |
| CRK-03 | Cricket | CRK-04 | Cricket History | Full page | `/cricket/history`<br>`src/routes/cricket.history.tsx` | JSON-LD; head meta | sports/SportNav, cricket/CricketSubNav, cricket/PlayerLink, seo/withHubLinks | static/local | not verified | BLOCKED |
| CRK-04 | Cricket | — | Cricket hub | Full page | `/cricket`<br>`src/routes/cricket.index.tsx` | SSR slate; hero/pulse; internationals; featured + discovered series; live/today/upcoming/results | sports/SportNav, cricket/CricketSubNav, cricket/CricketHero, cricket/LivePulseStrip | cricket.functions | loading, empty, error+retry | DONE |
| CRK-05 | Cricket | CRK-06 | IPL History | Full page | `/cricket/ipl/history`<br>`src/routes/cricket.ipl.history.tsx` | SSR champions/awards/auctions; era/team/search filters; brackets | ipl/IplPageShell, cricket/PlayerLink, ui/state | ipl.functions | empty, error+retry | DONE |
| CRK-06 | Cricket | CRK-04 | IPL Hub | Full page | `/cricket/ipl`<br>`src/routes/cricket.ipl.index.tsx` | SSR live/upcoming/recent, caps, standings preview, champions | ipl/IplHero, ipl/IplSubNav, ipl/OrangePurpleCap, cricket/CricketMatchCard | ipl.functions | empty, error+retry | DONE |
| CRK-07 | Cricket | CRK-06 | IPL Players | Full page | `/cricket/ipl/players`<br>`src/routes/cricket.ipl.players.tsx` | SSR leaderboards; caps; season-aware sixes | ipl/IplPageShell, ipl/OrangePurpleCap, cricket/PlayerLink, ui/state | ipl.functions | empty, error+retry | DONE |
| CRK-08 | Cricket | CRK-06 | IPL Records | Full page | `/cricket/ipl/records`<br>`src/routes/cricket.ipl.records.tsx` | Static all-time book; live season leaders; search/filter/sort | ipl/IplPageShell, cricket/PlayerLink, ui/state | ipl.functions | empty, error+retry | DONE |
| CRK-09 | Cricket | CRK-06 | IPL Scores | Full page | `/cricket/ipl/scores`<br>`src/routes/cricket.ipl.scores.tsx` | SSR season matches; season/status filters; match cards | ipl/IplPageShell, cricket/CricketMatchCard, ipl/toCricketMatch | ipl.functions | empty, error+retry | DONE |
| CRK-10 | Cricket | CRK-06 | IPL Standings | Full page | `/cricket/ipl/standings`<br>`src/routes/cricket.ipl.standings.tsx` | SSR points table; top-4 cut; form; season picker | cricket/TeamCrest, ipl/IplPageShell, ui/state | ipl.functions | empty, error+retry | DONE |
| CRK-11 | Cricket | CRK-06 | IPL Team Profile | Full page | `/cricket/ipl/teams/:teamId`<br>`src/routes/cricket.ipl.teams.$teamId.tsx` | SSR team/squad/fixtures; tabs; H2H; titles | cricket/TeamCrest, ipl/IplPageShell, cricket/CricketMatchCard, ui/state | ipl.functions | empty, error+retry, 404 | DONE |
| CRK-12 | Cricket | CRK-06 | IPL Teams | Full page | `/cricket/ipl/teams`<br>`src/routes/cricket.ipl.teams.index.tsx` | SSR teams; title-sorted franchise cards | ipl/IplPageShell, cricket/TeamCrest, ui/state | ipl.functions | empty, error+retry | DONE |
| CRK-13 | Cricket | CRK-04 | Cricket Match Detail | Full page | `/cricket/match/:id`<br>`src/routes/cricket.match.$id.tsx` | SSR scorecard; 10s live refetch; Summary/Scorecard/Commentary/Info/FAQs; player sheet | sports/SportNav, cricket/match/*, cricket/CricketPlayerSheet, ui/state | cricket.functions | loading, error+retry, not-found | DONE |
| CRK-14 | Cricket | CRK-04 | Cricket Player Profile | Full page | `/cricket/players/:slug`<br>`src/routes/cricket.players.$slug.tsx` | SSR career records; FAQs; related players; explore links | sports/SportNav, cricket/CricketSubNav, seo/FaqSection, seo/RelatedLinks, ui/state | local entities + cached FAQs | empty, error+retry, not-found | DONE |
| CRK-15 | Cricket | CRK-04 | Cricket Players | Full page | `/cricket/players`<br>`src/routes/cricket.players.index.tsx` | Ranked players across roles/formats; search + filters; rating cards | sports/SportNav, cricket/CricketSubNav, cricket/PlayerLink, ui/state | static rankings snapshot | empty, snapshot note | DONE |
| CRK-16 | Cricket | CRK-04 | Cricket Rankings | Full page | `/cricket/rankings`<br>`src/routes/cricket.rankings.tsx` | Bundled ICC team/player rankings by category/format; trend | sports/SportNav, cricket/CricketSubNav, cricket/PlayerLink, ui/state | static snapshot JSON | empty, snapshot-stale note | DONE |
| CRK-17 | Cricket | CRK-04 | Cricket Record Category | Full page | `/cricket/records/:category`<br>`src/routes/cricket.records.$category.tsx` | SSR leaderboard; FAQs; player links; related records | sports/SportNav, cricket/CricketSubNav, ui/state | static snapshot JSON | empty, error+retry, not-found | DONE |
| CRK-18 | Cricket | CRK-04 | Cricket Records | Full page | `/cricket/records`<br>`src/routes/cricket.records.index.tsx` | Static all-time record categories; search + format filter; detail links | sports/SportNav, cricket/CricketSubNav, cricket/PlayerLink, ui/state | static snapshot JSON | empty, snapshot date | DONE |
| CRK-19 | Cricket | CRK-04 | Cricket Scores | Full page | `/cricket/scores`<br>`src/routes/cricket.scores.tsx` | SSR live tab; tabs/date/filters; grouped match cards | sports/SportNav, cricket/CricketSubNav, cricket/CricketMatchCard, ui/state | cricket.functions | loading, empty, error+retry | DONE |
| CRK-20 | Cricket | CRK-04 | Cricket Series Detail | Full page | `/cricket/series/:id`<br>`src/routes/cricket.series.$id.tsx` | Client scoreboard; live/upcoming/results; derived standings | cricket/TeamCrest, sports/SportNav, cricket/CricketMatchCard, ui/state | cricket.functions | loading, empty, error+retry, 404 | DONE |
| CRK-21 | Cricket | CRK-04 | Cricket Series Hub | Full page | `/cricket/series`<br>`src/routes/cricket.series.index.tsx` | SSR curated series; bilateral tours (client); format/type filters; live counts | sports/SportNav, cricket/CricketSubNav, ui/state | cricket.functions | loading, empty, error+retry | DONE |
| CRK-22 | Cricket | CRK-04 | Cricket Team History Slug | Full page | `/cricket/team-history/:slug`<br>`src/routes/cricket.team-history.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| CRK-23 | Cricket | CRK-04 | Cricket Team Profile | Full page | `/cricket/teams/:slug`<br>`src/routes/cricket.teams.$slug.tsx` | SSR profile; ICC rankings/franchise facts; FAQs; explore links | sports/SportNav, cricket/CricketSubNav, seo/FaqSection, ui/state | local entities + cached FAQs | loading, error+retry, not-found | DONE |
| CRK-24 | Cricket | CRK-04 | Cricket Teams | Full page | `/cricket/teams`<br>`src/routes/cricket.teams.index.tsx` | SSR team lists; search + league filter; profile/series links | cricket/TeamCrest, sports/SportNav, cricket/CricketSubNav, ui/state | cricket.functions | loading, empty, error+retry | DONE |
| CRK-25 | Cricket | CRK-04 | Cricket Tournament Profile | Full page | `/cricket/tournaments/:slug`<br>`src/routes/cricket.tournaments.$slug.tsx` | SSR champions; top runs/wickets; FAQs; related tournaments | sports/SportNav, cricket/CricketSubNav, ui/state | static entities | empty, error+retry, 404 | DONE |
| CRK-26 | Cricket | CRK-04 | Cricket Tournaments | Full page | `/cricket/tournaments`<br>`src/routes/cricket.tournaments.index.tsx` | JSON-LD; head meta | sports/SportNav, cricket/CricketSubNav | static/local | not verified | BLOCKED |
| UTIL-04 | Utility | — | Disclaimer | Full page | `/disclaimer`<br>`src/routes/disclaimer.tsx` | head meta | site/LegalLayout | static/local | loading, empty, error | BLOCKED |
| FB-01 | Football | FB-05 | Football Comp Fixtures | Full page | `/football/:comp/fixtures`<br>`src/routes/football.$comp.fixtures.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell, football/CompetitionMatchList, football/LastEditionRecap, football/EuroFixturesHero | espn.functions | loading, empty, error | BLOCKED |
| FB-02 | Football | FB-05 | Football Comp H2h Matchup | Full page | `/football/:comp/h2h/:matchup`<br>`src/routes/football.$comp.h2h.$matchup.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell | comp-head-to-head.functions | loading, empty, error | BLOCKED |
| FB-03 | Football | FB-05 | Football Comp History Year | Full page | `/football/:comp/history/:year`<br>`src/routes/football.$comp.history.$year.tsx` | SSR loader; JSON-LD; head meta | football/CompetitionPageShell | server fn / query | empty, error | BLOCKED |
| FB-04 | Football | FB-05 | Football Comp History | Full page | `/football/:comp/history`<br>`src/routes/football.$comp.history.index.tsx` | SSR loader; JSON-LD; head meta | football/CompetitionPageShell, football/EuroHistoryHero, football/EuroTitleRace, football/EuroChampionsTimelineDeluxe | server fn / query | error | BLOCKED |
| FB-05 | Football | FB-22 | Football Comp | Full page | `/football/:comp`<br>`src/routes/football.$comp.index.tsx` | SSR loader; client query; JSON-LD; head meta | football/CompetitionPageShell, football/CompetitionH2HPicker, football/CompetitionNewsRail, football/CompetitionCountdown | espn.functions | loading, error | BLOCKED |
| FB-06 | Football | FB-05 | Football Comp Matches MatchId | Full page | `/football/:comp/matches/:matchId`<br>`src/routes/football.$comp.matches.$matchId.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell | espn.functions | loading, empty, error | BLOCKED |
| FB-07 | Football | FB-05 | Football Comp Players PlayerId | Full page | `/football/:comp/players/:playerId`<br>`src/routes/football.$comp.players.$playerId.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell, football/CareerInCompetition | espn.functions | loading, empty, error | BLOCKED |
| FB-08 | Football | FB-05 | Football Comp Players | Full page | `/football/:comp/players`<br>`src/routes/football.$comp.players.index.tsx` | SSR loader; client query; JSON-LD; head meta | football/CompetitionPageShell, football/EuroPlayersPage | espn.functions | loading, empty, error | BLOCKED |
| FB-09 | Football | FB-05 | Football Comp Records Category | Full page | `/football/:comp/records/:category`<br>`src/routes/football.$comp.records.$category.tsx` | SSR loader; head meta | football/CompetitionPageShell | server fn / query | error | BLOCKED |
| FB-10 | Football | FB-05 | Football Comp Records Decades | Full page | `/football/:comp/records/decades`<br>`src/routes/football.$comp.records.decades.tsx` | SSR loader; head meta | football/CompetitionPageShell | server fn / query | empty, error | BLOCKED |
| FB-11 | Football | FB-05 | Football Comp Records | Full page | `/football/:comp/records`<br>`src/routes/football.$comp.records.index.tsx` | SSR loader; JSON-LD; head meta | football/CompetitionPageShell, football/EuroRecordsPage, football/CopaRecordsPage | server fn / query | empty, error | BLOCKED |
| FB-12 | Football | FB-05 | Football Comp Scores | Full page | `/football/:comp/scores`<br>`src/routes/football.$comp.scores.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell, football/DateScrubber, football/EuroScoresHero, football/ScoresLiveTicker | espn.functions | loading, empty, error | BLOCKED |
| FB-13 | Football | FB-05 | Football Comp Seasons Year | Full page | `/football/:comp/seasons/:year`<br>`src/routes/football.$comp.seasons.$year.tsx` | no head | — | static/local | not verified | BLOCKED |
| FB-14 | Football | FB-05 | Football Comp Standings | Full page | `/football/:comp/standings`<br>`src/routes/football.$comp.standings.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell, football/CompetitionStandingsTable, football/LastEditionRecap, football/CopaStandingsHero | espn.functions | loading, empty, error | BLOCKED |
| FB-15 | Football | FB-05 | Football Comp Teams TeamId | Full page | `/football/:comp/teams/:teamId`<br>`src/routes/football.$comp.teams.$teamId.index.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell | espn.functions | loading, empty, error | BLOCKED |
| FB-16 | Football | FB-05 | Football Comp Teams TeamId Season Year | Full page | `/football/:comp/teams/:teamId/season-:year`<br>`src/routes/football.$comp.teams.$teamId.season-{$year}.tsx` | SSR loader; client query; head meta | football/CompetitionPageShell | espn.functions | loading, empty, error | BLOCKED |
| FB-17 | Football | FB-05 | Football Comp Teams | Full page | `/football/:comp/teams`<br>`src/routes/football.$comp.teams.index.tsx` | SSR loader; client query; JSON-LD; head meta | football/CompetitionPageShell, football/EuroTeamsPage | espn.functions | loading, empty, error | BLOCKED |
| FB-18 | Football | FB-22 | Football Campaigns Slug | Full page | `/football/campaigns/:slug`<br>`src/routes/football.campaigns.$slug.tsx` | SSR loader; JSON-LD; head meta | ads/AdSlot, seo/RelatedLinks | server fn / query | error | BLOCKED |
| FB-19 | Football | FB-22 | Football Campaigns | Full page | `/football/campaigns`<br>`src/routes/football.campaigns.index.tsx` | JSON-LD; head meta | — | static/local | not verified | BLOCKED |
| FB-20 | Football | FB-22 | Football Countries Slug World Cup Year | Full page | `/football/countries/:slug/world-cup-:year`<br>`src/routes/football.countries.$slug.world-cup-{$year}.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | empty, error | BLOCKED |
| FB-21 | Football | FB-22 | Football Countries | Full page | `/football/countries`<br>`src/routes/football.countries.index.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | not verified | BLOCKED |
| FB-22 | Football | — | Football | Full page | `/football`<br>`src/routes/football.index.tsx` | SSR loader; client query; JSON-LD; head meta | sports/SportNav, wc/TournamentInfoCard, wc/GroupStage, wc/MatchCard | wc2026.functions | loading, empty, error | BLOCKED |
| FB-23 | Football | FB-22 | Football Match Id | Full page | `/football/match/:id`<br>`src/routes/football.match.$id.tsx` | SSR loader; client query; JSON-LD; head meta | wc/LiveMatchCenter, wc/WatchLivePanel, seo/MatchFaqBlock, affiliates/AffiliateStrip | wc2026.functions | loading, empty, error | BLOCKED |
| FB-24 | Football | FB-22 | Football Matches Slug | Full page | `/football/matches/:slug`<br>`src/routes/football.matches.$slug.tsx` | SSR loader; JSON-LD; head meta | ads/AdSlot, news/MatchRecapCard | server fn / query | loading, error | BLOCKED |
| FB-25 | Football | FB-22 | Football Mine | Full page | `/football/mine`<br>`src/routes/football.mine.tsx` | client query; head meta | — | wc2026.functions | loading, empty | BLOCKED |
| FB-26 | Football | FB-22 | Football Players Slug | Full page | `/football/players/:slug`<br>`src/routes/football.players.$slug.index.tsx` | SSR loader; JSON-LD; head meta | ads/AdSlot, seo/FaqSection, seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| FB-27 | Football | FB-22 | Football Players Slug World Cup Year | Full page | `/football/players/:slug/world-cup-:year`<br>`src/routes/football.players.$slug.world-cup-{$year}.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| FB-28 | Football | FB-22 | Football Players | Full page | `/football/players`<br>`src/routes/football.players.index.tsx` | SSR loader; JSON-LD; head meta | seo/withHubLinks | server fn / query | empty | BLOCKED |
| FB-29 | Football | FB-22 | Football Records Category | Full page | `/football/records/:category`<br>`src/routes/football.records.$category.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | empty, error | BLOCKED |
| FB-30 | Football | FB-22 | Football Teams Slug | Full page | `/football/teams/:slug`<br>`src/routes/football.teams.$slug.tsx` | SSR loader; JSON-LD; head meta | ads/AdSlot, seo/FaqSection, seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| FB-31 | Football | FB-22 | Football Top Scorers Year | Full page | `/football/top-scorers/:year`<br>`src/routes/football.top-scorers.$year.tsx` | SSR loader; JSON-LD; head meta | ads/AdSlot, seo/withYearNav | server fn / query | empty, error | BLOCKED |
| FB-32 | Football | FB-22 | Football Top Scorers | Full page | `/football/top-scorers`<br>`src/routes/football.top-scorers.index.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| FB-33 | Football | FB-22 | Football Tournaments Year | Full page | `/football/tournaments/:year`<br>`src/routes/football.tournaments.$year.tsx` | SSR loader; JSON-LD; head meta | seo/withYearNav | server fn / query | error | BLOCKED |
| FB-34 | Football | FB-22 | Football Venues | Full page | `/football/venues`<br>`src/routes/football.venues.tsx` | JSON-LD; head meta | — | static/local | not verified | BLOCKED |
| GUIDE-01 | Guides | GUIDE-02 | Guides Slug | Full page | `/guides/:slug`<br>`src/routes/guides.$slug.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | error | BLOCKED |
| GUIDE-02 | Guides | — | Guides | Full page | `/guides`<br>`src/routes/guides.index.tsx` | JSON-LD; head meta | — | static/local | not verified | BLOCKED |
| GUIDE-03 | Guides | GUIDE-02 | Highlights Slug | Full page | `/highlights/:slug`<br>`src/routes/highlights.$slug.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | loading, error | BLOCKED |
| GUIDE-04 | Guides | GUIDE-02 | Highlights | Full page | `/highlights`<br>`src/routes/highlights.index.tsx` | JSON-LD; head meta | — | static/local | not verified | BLOCKED |
| HOME-01 | Home | — | Home dashboard | Full page | `/`<br>`src/routes/index.tsx` | SSR hero feeds; live/upcoming/finals; sport chips; cricket + football slates; sport doors | home/CompactHero, home/StatusBar, home/SportChipTabs, home/ForYouStrip | espn.functions, wc2026.functions, cricket.functions | loading, empty, error+retry | DONE |
| LIVE-01 | Live | LIVE-02 | Live Sport | Full page | `/live/:sport`<br>`src/routes/live.$sport.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | not verified | BLOCKED |
| LIVE-02 | Live | — | Live Today | Full page | `/live/today`<br>`src/routes/live.today.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | empty | BLOCKED |
| MINE-01 | My Sports | — | Mine | Full page | `/mine`<br>`src/routes/mine.tsx` | head meta | common/FavoriteTeamPicker | static/local | loading, empty | BLOCKED |
| MLB-01 | MLB | MLB-04 | Mlb Champions | Full page | `/mlb/champions`<br>`src/routes/mlb.champions.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| MLB-02 | MLB | MLB-04 | Mlb Game Id | Full page | `/mlb/game/:id`<br>`src/routes/mlb.game.$id.tsx` | SSR loader; client query; JSON-LD; head meta | mlb/MlbLinescore, mlb/MlbBoxScore, mlb/MlbScoringPlays, mlb/MlbWinProbabilityChart | mlb.functions | loading | BLOCKED |
| MLB-03 | MLB | MLB-04 | Mlb History | Full page | `/mlb/history`<br>`src/routes/mlb.history.tsx` | JSON-LD; head meta | mlb/HistoryTimeline, mlb/MlbSeasonLeaderHistory, seo/withHubLinks | static/local | not verified | BLOCKED |
| MLB-04 | MLB | — | Mlb | Full page | `/mlb`<br>`src/routes/mlb.index.tsx` | SSR loader; client query; JSON-LD; head meta | sports/GameCard, mlb/LeaderBoard, ads/AdSlot, sports/DateScrubber | espn.functions, mlb.functions | loading, empty | BLOCKED |
| MLB-05 | MLB | MLB-04 | Mlb News | Full page | `/mlb/news`<br>`src/routes/mlb.news.tsx` | client query; JSON-LD; head meta | mlb/MlbNewsHub, sports/Skeletons, seo/withHubLinks | espn.functions | loading | BLOCKED |
| MLB-06 | MLB | MLB-04 | Mlb Player Id | Full page | `/mlb/player/:id`<br>`src/routes/mlb.player.$id.tsx` | SSR loader; client query; JSON-LD; head meta | mlb/PlayerProfile, affiliates/AffiliateStrip | mlb.functions | loading | BLOCKED |
| MLB-07 | MLB | MLB-04 | Mlb Players Slug | Full page | `/mlb/players/:slug`<br>`src/routes/mlb.players.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | error | BLOCKED |
| MLB-08 | MLB | MLB-04 | Mlb Players | Full page | `/mlb/players`<br>`src/routes/mlb.players.tsx` | client query; JSON-LD; head meta | mlb/LeaderBoard, seo/withHubLinks | mlb.functions | loading, empty | BLOCKED |
| MLB-09 | MLB | MLB-04 | Mlb Postseason | Full page | `/mlb/postseason`<br>`src/routes/mlb.postseason.tsx` | client query; JSON-LD; head meta | mlb/MlbPostseasonBracket, seo/withHubLinks | mlb.functions | loading | BLOCKED |
| MLB-10 | MLB | MLB-04 | Mlb Records Category | Full page | `/mlb/records/:category`<br>`src/routes/mlb.records.$category.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | error | BLOCKED |
| MLB-11 | MLB | MLB-04 | Mlb Scores | Full page | `/mlb/scores`<br>`src/routes/mlb.scores.tsx` | client query; JSON-LD; head meta | sports/GameCard, sports/DateScrubber, sports/Skeletons, seo/withHubLinks | espn.functions | loading, empty | BLOCKED |
| MLB-12 | MLB | MLB-04 | Mlb Standings | Full page | `/mlb/standings`<br>`src/routes/mlb.standings.tsx` | client query; JSON-LD; head meta | mlb/MlbStandingsPro, sports/Skeletons, seo/withHubLinks | mlb.functions | loading | BLOCKED |
| MLB-13 | MLB | MLB-04 | Mlb Team History Slug | Full page | `/mlb/team-history/:slug`<br>`src/routes/mlb.team-history.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| MLB-14 | MLB | MLB-04 | Mlb Team Id | Full page | `/mlb/team/:id`<br>`src/routes/mlb.team.$id.tsx` | SSR loader; head meta | mlb/MlbTeamView | server fn / query | not verified | BLOCKED |
| MLB-15 | MLB | MLB-04 | Mlb Teams | Full page | `/mlb/teams`<br>`src/routes/mlb.teams.tsx` | client query; JSON-LD; head meta | mlb/TeamCard, seo/withHubLinks | mlb.functions | loading | BLOCKED |
| MLB-16 | MLB | MLB-04 | Mlb Teams Slug | Full page | `/mlb/teams/:slug`<br>`src/routes/mlb.teams_.$slug.tsx` | SSR loader; JSON-LD; head meta | mlb/MlbTeamView | server fn / query | loading, error | BLOCKED |
| MLB-17 | MLB | MLB-04 | Mlb World Series Year | Full page | `/mlb/world-series/:year`<br>`src/routes/mlb.world-series.$year.tsx` | SSR loader; JSON-LD; head meta | seo/withYearNav | server fn / query | error | BLOCKED |
| MLS-01 | MLS | MLS-05 | Mls Champions | Full page | `/mls/champions`<br>`src/routes/mls.champions.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| MLS-02 | MLS | MLS-05 | Mls Cup Year | Full page | `/mls/cup/:year`<br>`src/routes/mls.cup.$year.tsx` | SSR loader; JSON-LD; head meta | seo/withYearNav | server fn / query | error | BLOCKED |
| MLS-03 | MLS | MLS-05 | Mls Game Id | Full page | `/mls/game/:id`<br>`src/routes/mls.game.$id.tsx` | SSR loader; client query; JSON-LD; head meta | mls/MlsLinescore, mls/MlsBoxScore, mls/MlsPlayByPlay, seo/MatchFaqBlock | mls.functions | loading | BLOCKED |
| MLS-04 | MLS | MLS-05 | Mls History | Full page | `/mls/history`<br>`src/routes/mls.history.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| MLS-05 | MLS | — | Mls | Full page | `/mls`<br>`src/routes/mls.index.tsx` | SSR loader; client query; JSON-LD; head meta | sports/GameCard, mls/MlsLeaderBoard, ads/AdSlot, sports/DateScrubber | mls.functions, espn.functions | loading, empty | BLOCKED |
| MLS-06 | MLS | MLS-05 | Mls Leaders | Full page | `/mls/leaders`<br>`src/routes/mls.leaders.tsx` | SSR loader; client query; JSON-LD; head meta | mls/MlsLeaderBoard, seo/withHubLinks | mls.functions | loading, empty | BLOCKED |
| MLS-07 | MLS | MLS-05 | Mls News | Full page | `/mls/news`<br>`src/routes/mls.news.tsx` | client query; JSON-LD; head meta | sports/NewsRail, seo/withHubLinks | espn.functions | loading | BLOCKED |
| MLS-08 | MLS | MLS-05 | Mls Player Id | Full page | `/mls/player/:id`<br>`src/routes/mls.player.$id.tsx` | SSR loader; client query; JSON-LD; head meta | — | mls.functions | loading, empty | BLOCKED |
| MLS-09 | MLS | MLS-05 | Mls Players Slug | Full page | `/mls/players/:slug`<br>`src/routes/mls.players.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | error | BLOCKED |
| MLS-10 | MLS | MLS-05 | Mls Scores | Full page | `/mls/scores`<br>`src/routes/mls.scores.tsx` | client query; JSON-LD; head meta | sports/GameCard, sports/DateScrubber, seo/withHubLinks | mls.functions | loading, empty | BLOCKED |
| MLS-11 | MLS | MLS-05 | Mls Standings | Full page | `/mls/standings`<br>`src/routes/mls.standings.tsx` | SSR loader; client query; JSON-LD; head meta | mls/MlsStandingsPro, seo/withHubLinks | mls.functions | loading | BLOCKED |
| MLS-12 | MLS | MLS-05 | Mls Team History Slug | Full page | `/mls/team-history/:slug`<br>`src/routes/mls.team-history.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| MLS-13 | MLS | MLS-05 | Mls Team Id | Full page | `/mls/team/:id`<br>`src/routes/mls.team.$id.tsx` | SSR loader; head meta | mls/MlsTeamView | server fn / query | not verified | BLOCKED |
| MLS-14 | MLS | MLS-05 | Mls Teams | Full page | `/mls/teams`<br>`src/routes/mls.teams.tsx` | SSR loader; client query; JSON-LD; head meta | mls/MlsTeamCard, seo/withHubLinks | mls.functions | loading | BLOCKED |
| MLS-15 | MLS | MLS-05 | Mls Teams Slug | Full page | `/mls/teams/:slug`<br>`src/routes/mls.teams_.$slug.tsx` | SSR loader; JSON-LD; head meta | mls/MlsTeamView | server fn / query | loading, error | BLOCKED |
| NBA-01 | NBA | NBA-05 | Nba Champions | Full page | `/nba/champions`<br>`src/routes/nba.champions.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| NBA-02 | NBA | NBA-05 | Nba Finals Year | Full page | `/nba/finals/:year`<br>`src/routes/nba.finals.$year.tsx` | SSR loader; JSON-LD; head meta | seo/withYearNav | server fn / query | error | BLOCKED |
| NBA-03 | NBA | NBA-05 | Nba Game Id | Full page | `/nba/game/:id`<br>`src/routes/nba.game.$id.tsx` | SSR loader; client query; JSON-LD; head meta | nba/NbaLinescore, nba/NbaBoxScore, nba/NbaPlayByPlay, seo/MatchFaqBlock | nba.functions | loading | BLOCKED |
| NBA-04 | NBA | NBA-05 | Nba History | Full page | `/nba/history`<br>`src/routes/nba.history.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| NBA-05 | NBA | — | Nba | Full page | `/nba`<br>`src/routes/nba.index.tsx` | SSR loader; client query; JSON-LD; head meta | sports/GameCard, nba/NbaLeaderBoard, ads/AdSlot, sports/DateScrubber | nba.functions, espn.functions | loading, empty | BLOCKED |
| NBA-06 | NBA | NBA-05 | Nba Leaders | Full page | `/nba/leaders`<br>`src/routes/nba.leaders.tsx` | SSR loader; client query; JSON-LD; head meta | nba/NbaLeaderBoard, seo/withHubLinks | nba.functions | loading, empty | BLOCKED |
| NBA-07 | NBA | NBA-05 | Nba News | Full page | `/nba/news`<br>`src/routes/nba.news.tsx` | client query; JSON-LD; head meta | sports/NewsRail, seo/withHubLinks | espn.functions | loading | BLOCKED |
| NBA-08 | NBA | NBA-05 | Nba Player Id | Full page | `/nba/player/:id`<br>`src/routes/nba.player.$id.tsx` | SSR loader; client query; JSON-LD; head meta | — | nba.functions | loading, empty | BLOCKED |
| NBA-09 | NBA | NBA-05 | Nba Players Slug | Full page | `/nba/players/:slug`<br>`src/routes/nba.players.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | error | BLOCKED |
| NBA-10 | NBA | NBA-05 | Nba Scores | Full page | `/nba/scores`<br>`src/routes/nba.scores.tsx` | client query; JSON-LD; head meta | sports/GameCard, sports/DateScrubber, seo/withHubLinks | nba.functions | loading, empty | BLOCKED |
| NBA-11 | NBA | NBA-05 | Nba Standings | Full page | `/nba/standings`<br>`src/routes/nba.standings.tsx` | SSR loader; client query; JSON-LD; head meta | nba/NbaStandingsPro, seo/withHubLinks | nba.functions | loading | BLOCKED |
| NBA-12 | NBA | NBA-05 | Nba Team History Slug | Full page | `/nba/team-history/:slug`<br>`src/routes/nba.team-history.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| NBA-13 | NBA | NBA-05 | Nba Team Id | Full page | `/nba/team/:id`<br>`src/routes/nba.team.$id.tsx` | SSR loader; head meta | nba/NbaTeamView | server fn / query | not verified | BLOCKED |
| NBA-14 | NBA | NBA-05 | Nba Teams | Full page | `/nba/teams`<br>`src/routes/nba.teams.tsx` | SSR loader; client query; JSON-LD; head meta | nba/NbaTeamCard, seo/withHubLinks | nba.functions | loading | BLOCKED |
| NBA-15 | NBA | NBA-05 | Nba Teams Slug | Full page | `/nba/teams/:slug`<br>`src/routes/nba.teams_.$slug.tsx` | SSR loader; JSON-LD; head meta | nba/NbaTeamView | server fn / query | loading, error | BLOCKED |
| NEWS-01 | News | NEWS-02 | News Slug | Full page | `/news/:slug`<br>`src/routes/news.$slug.tsx` | SSR loader; JSON-LD; head meta | sports/SportNav, nav/Breadcrumbs | server fn / query | loading, error | BLOCKED |
| NEWS-02 | News | — | News | Full page | `/news`<br>`src/routes/news.index.tsx` | SSR loader; JSON-LD; head meta | sports/SportNav, nav/Breadcrumbs | server fn / query | empty | BLOCKED |
| NHL-01 | NHL | NHL-04 | Nhl Champions | Full page | `/nhl/champions`<br>`src/routes/nhl.champions.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| NHL-02 | NHL | NHL-04 | Nhl Game Id | Full page | `/nhl/game/:id`<br>`src/routes/nhl.game.$id.tsx` | SSR loader; client query; JSON-LD; head meta | nhl/NhlLinescore, nhl/NhlBoxScore, nhl/NhlPlayByPlay, seo/MatchFaqBlock | nhl.functions | loading | BLOCKED |
| NHL-03 | NHL | NHL-04 | Nhl History | Full page | `/nhl/history`<br>`src/routes/nhl.history.tsx` | JSON-LD; head meta | seo/withHubLinks | static/local | not verified | BLOCKED |
| NHL-04 | NHL | — | Nhl | Full page | `/nhl`<br>`src/routes/nhl.index.tsx` | SSR loader; client query; JSON-LD; head meta | sports/GameCard, nhl/NhlLeaderBoard, ads/AdSlot, sports/DateScrubber | nhl.functions, espn.functions | loading, empty | BLOCKED |
| NHL-05 | NHL | NHL-04 | Nhl Leaders | Full page | `/nhl/leaders`<br>`src/routes/nhl.leaders.tsx` | SSR loader; client query; JSON-LD; head meta | nhl/NhlLeaderBoard, seo/withHubLinks | nhl.functions | loading, empty | BLOCKED |
| NHL-06 | NHL | NHL-04 | Nhl News | Full page | `/nhl/news`<br>`src/routes/nhl.news.tsx` | client query; JSON-LD; head meta | sports/NewsRail, seo/withHubLinks | espn.functions | loading | BLOCKED |
| NHL-07 | NHL | NHL-04 | Nhl Player Id | Full page | `/nhl/player/:id`<br>`src/routes/nhl.player.$id.tsx` | SSR loader; client query; JSON-LD; head meta | — | nhl.functions | loading, empty | BLOCKED |
| NHL-08 | NHL | NHL-04 | Nhl Players Slug | Full page | `/nhl/players/:slug`<br>`src/routes/nhl.players.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | error | BLOCKED |
| NHL-09 | NHL | NHL-04 | Nhl Scores | Full page | `/nhl/scores`<br>`src/routes/nhl.scores.tsx` | client query; JSON-LD; head meta | sports/GameCard, sports/DateScrubber, seo/withHubLinks | nhl.functions | loading, empty | BLOCKED |
| NHL-10 | NHL | NHL-04 | Nhl Standings | Full page | `/nhl/standings`<br>`src/routes/nhl.standings.tsx` | SSR loader; client query; JSON-LD; head meta | nhl/NhlStandingsPro, seo/withHubLinks | nhl.functions | loading | BLOCKED |
| NHL-11 | NHL | NHL-04 | Nhl Stanley Cup Year | Full page | `/nhl/stanley-cup/:year`<br>`src/routes/nhl.stanley-cup.$year.tsx` | SSR loader; JSON-LD; head meta | seo/withYearNav | server fn / query | error | BLOCKED |
| NHL-12 | NHL | NHL-04 | Nhl Team History Slug | Full page | `/nhl/team-history/:slug`<br>`src/routes/nhl.team-history.$slug.tsx` | SSR loader; JSON-LD; head meta | seo/RelatedLinks | server fn / query | empty, error | BLOCKED |
| NHL-13 | NHL | NHL-04 | Nhl Team Id | Full page | `/nhl/team/:id`<br>`src/routes/nhl.team.$id.tsx` | SSR loader; head meta | nhl/NhlTeamView | server fn / query | not verified | BLOCKED |
| NHL-14 | NHL | NHL-04 | Nhl Teams | Full page | `/nhl/teams`<br>`src/routes/nhl.teams.tsx` | SSR loader; client query; JSON-LD; head meta | nhl/NhlTeamCard, seo/withHubLinks | nhl.functions | loading | BLOCKED |
| NHL-15 | NHL | NHL-04 | Nhl Teams Slug | Full page | `/nhl/teams/:slug`<br>`src/routes/nhl.teams_.$slug.tsx` | SSR loader; JSON-LD; head meta | nhl/NhlTeamView | server fn / query | loading, error | BLOCKED |
| PLYR-01 | Players | PLYR-02 | Player Sport Slug | Full page | `/player/:sport/:slug`<br>`src/routes/player.$sport.$slug.tsx` | SSR loader; JSON-LD; head meta | affiliates/AffiliateStrip, ads/AdSlot | server fn / query | error | BLOCKED |
| PLYR-02 | Players | — | Players | Full page | `/players`<br>`src/routes/players.tsx` | client query; JSON-LD; head meta | ads/AdSlot, players/PlayerSubNav, players/FilterBar, players/FilterSheet | server fn / query | loading, empty | BLOCKED |
| PREM-01 | Premium | — | Premium | Full page | `/premium`<br>`src/routes/premium.tsx` | head meta | — | static/local | not verified | BLOCKED |
| UTIL-05 | Utility | — | Privacy | Full page | `/privacy`<br>`src/routes/privacy.tsx` | head meta | site/LegalLayout | static/local | loading, empty | BLOCKED |
| SRCH-01 | Search | — | Search | Full page | `/search`<br>`src/routes/search.tsx` | head meta | — | static/local | empty | BLOCKED |
| XSPT-02 | Cross-sport | — | Team Sport Slug | Full page | `/team/:sport/:slug`<br>`src/routes/team.$sport.$slug.tsx` | SSR loader; JSON-LD; head meta | affiliates/AffiliateStrip, ads/AdSlot | server fn / query | empty, error | BLOCKED |
| UTIL-06 | Utility | — | Terms | Full page | `/terms`<br>`src/routes/terms.tsx` | head meta | site/LegalLayout | static/local | loading, empty, error | BLOCKED |
| XSPT-03 | Cross-sport | — | Tournaments Tournament Leaderboard | Full page | `/tournaments/:tournament/:leaderboard`<br>`src/routes/tournaments.$tournament.$leaderboard.tsx` | SSR loader; JSON-LD; head meta | ads/AdSlot | server fn / query | error | BLOCKED |
| XSPT-04 | Cross-sport | — | Tournaments Fifa World Cup 2026 Stage | Full page | `/tournaments/fifa-world-cup-2026/:stage`<br>`src/routes/tournaments.fifa-world-cup-2026.$stage.tsx` | SSR loader; JSON-LD; head meta | — | server fn / query | error | BLOCKED |
| UTIL-07 | Utility | — | Unsubscribe | Full page | `/unsubscribe`<br>`src/routes/unsubscribe.tsx` | head meta | — | digest.functions | loading, error | BLOCKED |
| XSPT-05 | Cross-sport | — | Vs Sport Matchup | Full page | `/vs/:sport/:matchup`<br>`src/routes/vs.$sport.$matchup.tsx` | SSR loader; JSON-LD; head meta | affiliates/AffiliateStrip, ads/AdSlot | server fn / query | empty, error | BLOCKED |

## 4. Shared / global pieces and overlays

| ID | Module | Screen name | Type | Location | Notes | Status |
|---|---|---|---|---|---|---|
| GLB-01 | Global | Root layout, skip link, meta, JSON-LD | Layout | `src/routes/__root.tsx` | Header/footer/nav/notifications mount here | BLOCKED |
| GLB-02 | Global | Desktop header + sport switcher + search entry | Global | `src/components/sports/SportNav.tsx` | Sticky header, live badge, mobile menu | BLOCKED |
| GLB-03 | Global | Mobile tab bar + More menu | Global | `src/components/nav/MobileTabBar.tsx` | 5 tabs, More sheet | BLOCKED |
| GLB-04 | Global | Footer | Global | `src/components/site/SiteFooter.tsx` | Search, link columns, legal | BLOCKED |
| GLB-05 | Global | Breadcrumbs | Global | `src/components/nav/Breadcrumbs.tsx` | Route-derived trail | BLOCKED |
| GLB-06 | Global | Search overlay / page | Overlay | `src/routes/search.tsx` + search components | Query, results, empty state | BLOCKED |
| GLB-07 | Global | Player sheet / modal | Sheet | `src/components/cricket/CricketPlayerSheet.tsx` | Player stats drawer | BLOCKED |
| GLB-08 | Global | Auth page | Screen | `src/routes/auth.tsx` | Supabase auth | BLOCKED |
| GLB-09 | Global | 404 / error page | Screen | `src/lib/error-page.ts`, `src/server.ts` | Branded 404/500 | BLOCKED |
| GLB-10 | Global | PWA service worker + manifest | Asset | `vite.config.ts`, `src/lib/pwa-register.ts` | `/sw.js` currently 404s in production | BLOCKED |

## 5. Excluded route files

Layout-only or non-screen routes: `__root.tsx`, `cricket.tsx`, `football.tsx`, `mlb.tsx`, `mls.tsx`, `nba.tsx`, `nhl.tsx`, `football.$comp.tsx`, `football.$comp.teams.tsx`, `football.$comp.players.tsx`, `football.$comp.history.tsx`, `football.$comp.records.tsx`, `football.$comp.teams.$teamId.tsx`, `football.players.$slug.tsx`, `$key[.]txt.tsx`.

## 6. Notes on the generated columns

- "Has loading/empty/error states?" is a source-scan heuristic; each screen's real state audit is recorded in `plans/<ID>.md` when it is worked on.
- Route paths use `:param` notation for dynamic segments. TanStack file conventions with `_` layout escapes and optional `{$year}` params are normalised.
- Status values: TODO, PLANNING, IN-PROGRESS, DONE, BLOCKED.
