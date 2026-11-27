# Changelog

## HOME-01 Home dashboard

- Kept: compact now-first hero, live ticker, sport chips, cricket/football slates, sport doors, newsletter.
- Removed: mounted hero gate, unused effect, duplicate loading condition.
- Fixed: SSR now awaits hero feeds (`ensureQueryData`) so the hero/ticker/counts are in the HTML; feed failure shows `ErrorState` with Retry; live dot no longer causes a hydration attribute mismatch.
- Added: shared `SectionHeader`, token-based live colour, reduced-motion support.
- Deferred: JS chunk splitting and merging ForYou/Pulse/Live.

## CRK-04 Cricket hub

- Kept: hero, live pulse, international block, featured series, auto-discovered series, live/today/upcoming/results.
- Removed: local `Section` markup, hardcoded empty box, unused `now` field.
- Fixed: SSR slate (`ensureQueryData`), feed error + Retry, shared empty state, 44 px “See all” links, reduced-motion live dots.

## CRK-19 Cricket scores

- Fixed: SSR live tab, error retry, dead series links, hydration-safe local today, 44 px filters/date buttons, reduced motion.
- Added: shared empty state with Reset filters.
- Kept: tabs, date strip, series/format filters, grouped match cards, canonical.

## CRK-13 Cricket match detail

- Fixed: canonical keeps non-default `leagueId`; missing match no longer prints raw server errors; branded not-found; live score region announced; 44 px CTAs.
- Added: validated search via `zodValidator`, friendly retry state.
- Global: cleaned search URLs (`?leagueId=8043` instead of `%228043%22`) while accepting old links.

## CRK-21 Cricket series hub

- Fixed: curated series SSR, error/retry states, 44 px filters, reduced-motion dots, polling only when live.
- Added: shared loading/empty states; bilateral tours no longer dehydrate on SSR (hydration-safe).
- Kept: bilateral block, format/type filters, series cards, canonical.

## CRK-24 Cricket teams

- Fixed: team cards now open the team profile when one exists (series fallback otherwise), instead of always opening a series.
- Added: SSR team lists, all-error + partial-error states, shared empty state, labelled search, 44 px chips, reduced-motion skeleton.
- Kept: league filters, crests, dedupe across leagues.

## CRK-23 Cricket team profile

- Fixed: meaningless international “home ground” FAQ; bare error/not-found replaced with branded states and 44 px CTAs.
- Added: Explore links (history/rankings/series/players), OG image and Twitter tags.
- Kept: SSR profile, rankings/franchise facts, FAQ schema, related teams.

## CRK-16 Cricket rankings

- Fixed: removed `any` from the rankings data path; typed JSON shape.
- Added: honest bundled-snapshot date/source note, shared empty state, table caption/sticky header, `aria-pressed`, 44 px controls.
- Kept: category × format selectors, player links, ratings and trends.

## CRK-18 Cricket records

- Fixed: removed `any` from the records data path; added links from every record card to its full category page.
- Added: shared empty state with Clear filters, labelled search, 44 px chips, table captions, snapshot date.
- Kept: static records, player links, format filter.

## CRK-15 Cricket players

- Fixed: removed `any` from rankings data; explained that ratings are format-specific.
- Added: visible count, snapshot date, full-rankings link, shared empty state, labelled search, `aria-pressed`, 44 px chips.
- Kept: player search, role/format filters, cards and player links.

## CRK-14 Cricket player profile

- Fixed: country FAQ no longer prints “null”; bare error/not-found replaced; empty records explained.
- Added: OG/Twitter tags, Explore links, 44 px related links, table caption; player index now links to profiles.
- Kept: SSR records, athlete/FAQ schema, related players, cached AI FAQs.

## CRK-17 Cricket record category

- Fixed: player links/schema now use the real slug and only link when a profile exists (search fallback otherwise).
- Added: OG/Twitter tags, snapshot date, branded error/not-found, empty leaderboard state, 44 px related links.
- Kept: SSR leaderboard, FAQs, ItemList schema and other-record links.

## CRK-06 IPL hub

- Fixed: feed-error banner now has Retry; standings team names link to franchise pages.
- Added: reduced-motion hero ping.
- Kept: SSR overview/history/caps, live/upcoming/recent sections, standings preview, champions list.

## CRK-09 IPL scores

- Fixed: feed-error banner has Retry; local empty state replaced with the shared one and a “Show all matches” action; invalid match ids are skipped globally.
- Added: filtered/total count, labelled season select, `aria-pressed`, 44 px status chips.
- Kept: SSR season loader, URL filters, match grid.

## CRK-10 IPL standings

- Fixed: feed Retry; franchise links; labelled season picker; shared empty state.
- Added: season in subtitle, table caption and `scope`.
- Kept: SSR table, top-4 highlighting, NRR and form chips.

## CRK-12 IPL teams

- Fixed: branded error boundary with retry; shared empty state; focus-visible card ring; reduced-motion hover; accessible title history.
- Added: CollectionPage JSON-LD.
- Kept: SSR team directory, gradient cards, title-first sorting.

## CRK-07 IPL players

- Fixed: shared retry banner for leaderboard failures; branded error boundary; labelled 44 px season picker; season-aware sixes heading; shared empty state.
- Added: CollectionPage JSON-LD.
- Kept: SSR leaderboards, Orange/Purple cap cards with historical fallback, six-hitting table.

## CRK-08 IPL records

- Fixed: season-leader errors now show Retry; branded error boundary; labelled search/sort/metric/season controls; `aria-pressed` chips; shared empty states; reduced-motion cards; accessible record counts.
- Added: CollectionPage JSON-LD; neutral season badge.
- Kept: static all-time record book, search/filter/sort, live leaderboard panel.

## CRK-11 IPL team profile

- Fixed: squad errors show Retry; branded error boundary and shared not-found state; associated season label; 44 px season/tab controls; `aria-pressed` tabs; shared empty states; reduced-motion hero/squad; accessible trophy counts.
- Added: OG/Twitter meta.
- Kept: hero, captain timeline, squad grid, fixtures, H2H and titles tabs.

## CRK-05 IPL history

- Fixed: bracket errors show Retry; branded error boundary; shared empty states; labelled filters; `aria-pressed` era chips; accordion `aria-expanded`/`aria-controls`; sr-only auction-bar data; removed discarded filter write; no in-place year sort; reduced-motion Hall cards; real auction count.
- Added: CollectionPage JSON-LD.
- Kept: season cards, Hall of Champions, auction trend/headlines and playoff brackets.

## CRK-20 cricket series detail

- Fixed: query failures now show a retryable shared error state; branded route error/not-found states; shared empty state; standings caption/`scope`; `h2` section titles; reduced-motion live pulse; hidden decorative emoji/icon.
- Kept: hero, live/upcoming/results grids, derived standings and SportNav live count.

## CRK-25 cricket tournament profile

- Fixed: shared retryable error and not-found states; table caption/`scope`; player links now use the shared `slugify`; `main-content` id; 44 px CTA/related links; shared empty state for missing champions.
- Added: OG site name and Twitter meta.
- Kept: champions/top runs/wickets, FAQs, related tournaments and JSON-LD.

## CRK-26 tournaments index

- Fixed: shared empty state; `main-content` id; focus-visible cards; `h3` card titles.
- Kept: grouped tournament hub and JSON-LD.

## CRK-02 cricket highlights index

- Fixed: shared empty state; `main-content` id; focus-visible cards; `h3` titles; human-readable dates.
- Kept: tournament-grouped highlight cards and JSON-LD.

## Global

- Fixed: removed duplicate `id="main-content"` from 24 page/component roots; the `__root` wrapper is now the single skip-link target.
- Fixed: football now renders `SportNav` once from the `/football` layout, so every football child route (campaigns, countries, top-scorers, venues, players, matches) has site navigation without duplicate headers.

## CRK-01 cricket highlight detail

- Fixed: shared retryable error and not-found states; `main-content` id; 44 px links; focus rings; hidden breadcrumb separators; human-readable dates; removed unused `itemList`.
- Added: OG site name/Twitter meta; privacy-enhanced `youtube-nocookie.com` embed.
- Kept: video/FAQ/breadcrumb JSON-LD, recap card, team profiles, related highlights.

## CRK-22 cricket team history

- Fixed: missing site header and cricket sub-nav; content now uses a padded max-width `main`; shared not-found/empty/error states; 44 px links; foreground/muted tokens instead of hardcoded white.
- Added: OG site name/Twitter meta.
- Kept: trophy/runner-up lists, related teams and JSON-LD.

## CRK-03 cricket history

- Fixed: champions list is now a real table with caption/`scope`; empty-data guard and empty states; `aria-pressed` 44 px tournament selector; hidden decorative icons; 44 px footer link.
- Kept: tournament switch, hero summary, leaderboards and JSON-LD.

## FB-19 / FB-32 football programmatic hubs

- Fixed: labelled 44 px filters (campaigns), focus-visible cards, hidden breadcrumb separators, shared empty states.
- Added: OG site name/Twitter meta and CollectionPage/itemList JSON-LD.
- Kept: year/team filtering and all-time featured card.

## FB-21 / FB-28 football directories

- Fixed: labelled breadcrumbs, hidden separators, focus-visible cards, shared empty states; 44 px A–Z letter/player targets; sticky rail offset below nav; truthful country meta copy.
- Added: OG site name/Twitter meta and CollectionPage/itemList JSON-LD.
- Kept: nation ranking and A–Z grouping.

## FB-34 football venues

- Fixed: stale future-tense copy after the 2026 tournament; labelled breadcrumb; hidden separators/icons/flags; 44 px related links; reduced-motion cards; shared empty state.
- Kept: 16-stadium country grouping, metadata and JSON-LD.

## FB-33 football tournament year

- Fixed: shared retryable error and not-found states; labelled breadcrumb; hidden separators/emoji/flags; 44 px scorer/year links.
- Added: OG site name/Twitter meta.
- Kept: podium, stats, awards, top scorers and JSON-LD.

## FB-31 football top scorers year

- Fixed: table caption/scopes; shared retryable error/not-found states; empty scorer row; labelled breadcrumb; hidden separators; 44 px player/team/year links.
- Added: OG site name/Twitter meta.
- Kept: year/all-time modes, FAQ JSON-LD and year nav.

## FB-09 / FB-10 / FB-14 football competition pages

- Fixed: shared retryable error, not-found and empty states; 44 px back/edition links with focus rings; reduced-motion spinner.
- Kept: record categories, decade roll-ups, standings/Copa fallbacks and competition head.

## FB-11 / FB-13 football records + seasons alias

- Fixed: Euro/Copa records now use `playsports.online` canonicals (old `allsportslive.lovable.app` URLs removed); added site name/Twitter/breadcrumb JSON-LD; shared error/not-found states; focus-visible cards, hidden icons and reduced motion.
- Verified: `/seasons/:year` alias returns 307 to canonical `/history/:year`.

## FB-17 football competition teams

- Fixed: Euro teams canonical now `playsports.online`; shared retryable error/empty states; hidden reduced-motion spinner; focus-visible/reduced-motion cards; breadcrumb JSON-LD and site/Twitter meta.
- Kept: club/nation directory and Euro teams page.

## FB-04 football competition history

- Fixed: Euro/Copa history canonical and item URLs now use `playsports.online`; shared error/not-found/empty states; 44 px links, hidden icons, focus rings, reduced motion; site/Twitter/breadcrumb JSON-LD.
- Kept: Euro/Copa history experiences and generic decade/edition history.

## FB-05 football competition overview

- Fixed: hydration mismatch risk from server-formatted local kickoff time (now mount-gated); scoreboard errors show a retry and no longer masquerade as off-season; shared not-found/error states; focus-visible quick links; hidden arrow icons.
- Kept: hero/countdown, facts, honours, scorers, news, H2H and archive widgets.

## FB-01 football competition fixtures

- Fixed: primary scoreboard failure now shows a retryable error instead of a false “no fixtures”; Euro zero-game empty state; shared not-found/error boundaries; hidden reduced-motion spinner/skeleton.
- Logged: up-to-181-request tournament date scan as a known perf follow-up in `DECISIONS.md`.
- Kept: Euro/Copa roadmaps, calendar strip and month groups.

## FB-12 football competition scores

- Fixed: local kickoff label and generic date heading mount-gated; query/payload errors now show a retryable ErrorState; shared not-found/error boundaries; reduced-motion skeleton.
- Logged: shared `DateScrubber` locale/UTC hydration risk in `BLOCKERS.md`.
- Kept: Euro/Copa heroes, ticker, date scrubber, jump bar and recap.

## FB-08 football competition players

- Fixed: Euro players canonical now `playsports.online`; shared retryable error/empty states; hidden reduced-motion spinner; focus-visible/reduced-motion leader rows; site/Twitter/breadcrumb JSON-LD.
- Kept: leader categories and Euro players page.

## Foundation

- Added overhaul documentation: `PROJECT_NOTES.md`, `HEALTH_BASELINE.md`, `SCREEN_INVENTORY.md`, `DESIGN_SYSTEM.md`, `PROGRESS.md`, `DECISIONS.md`, `BLOCKERS.md`, `SECURITY_FINDINGS.md`.
- Baseline: build pass, 24/24 tests pass, typecheck 59 errors, lint 84k problems, 66 dependency vulnerabilities.
- Fixed typecheck to **0 errors** (unknown error values, search param casts, typed dynamic links, root error boundary).
- Added Prettier `endOfLine: auto` to stop CRLF false positives.
- `bun audit fix`: 66 → 6 vulnerabilities (3 critical → 0 critical).
- Fixed PWA deploy: `scripts/postbuild-pwa.mjs` copies `sw.js`/workbox into Nitro output; `bun run build` runs it.
- Added security headers and SW cache headers in `vercel.json`.
- Added shared states `EmptyState`, `ErrorState`, `LoadingState`, `SectionHeader`, `InlineSpinner` in `src/components/ui/state.tsx`.
- Added `errorMessage()` helper + tests; tests now 27/27.
- Fixed a rules-of-hooks violation on the cross-sport team page.
