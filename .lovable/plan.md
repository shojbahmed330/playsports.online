# Streams 2 + 3: Live Football + Mobile Football Redesign

Locking scope before I start writing ~15 new files. One important callout up front about IPTV.

## Important: IPTV / "free streaming sites" — what I will and will not do

You mentioned IPTV and free streaming sites. I need to be direct: **embedding IPTV streams, Sportsurge / Buffstreams / Cricfree / Rojadirecta-style aggregators, or any unlicensed re-stream will get this domain banned from Google AdSense within days and exposes you to DMCA takedowns**. AdSense is already wired into your site, so this is a real revenue risk, not theoretical.

What I will ship instead (still "free for the viewer", 100% legal, AdSense-safe):

1. **Official free broadcasters per country.** FIFA+ (free, ~150 countries for 2026), FOX/Telemundo free windows (US), BBC iPlayer (UK), CBC Gem (Canada), SBS On Demand (Australia), SporTV/Globoplay free tier (Brazil), ITV (UK), Servus TV (Austria), etc. Geo-detected with a manual country override.
2. **YouTube official live + highlights.** FIFA's official YouTube channel streams selected matches live in some regions, and posts full highlights for every match. Admin can also paste any YouTube live URL per match.
3. **Always-on Live Match Center.** Real-time score, minute ticker, event timeline (goals/cards/subs), lineups, formations, shots, possession — driven by your existing Sofascore subscription. Works everywhere, no geo issues.
4. **"Where to watch" surface even when no free option exists** — paid broadcaster links labeled clearly so users aren't confused.

If you later want a private link list of community streams, that has to live behind login and never on the public AdSense pages. Tell me if you want that as a separate gated section after this ships.

## Stream 2 — Live football (full)

New files:
- `src/lib/broadcasters.ts` — country → broadcaster list (free vs paid, embed-allowed flag, deep-link template per match).
- `src/lib/geo.ts` — locale detection (`navigator.language` + `Intl` region) with localStorage override.
- `src/lib/wc2026.functions.ts` — add `getWc2026MatchEvents(matchId)`, `getWc2026Lineups(matchId)`, `getWc2026MatchStats(matchId)`. 30s cache while live.
- `src/components/wc/LiveMatchCenter.tsx` — score header with `ScoreFlip`, event timeline, lineups, stats tabs. Auto-refresh 20s when live.
- `src/components/wc/WatchLiveButton.tsx` — locale-aware dropdown listing free options first, then paid, with country override picker.
- `src/components/wc/WhereToWatchSheet.tsx` — full sheet listing all broadcasters per region with free/paid badges.
- `src/routes/football.match.$id.tsx` — dedicated SEO-friendly match page (shareable URL, OG image text, head metadata).

Modified:
- `src/components/wc/MatchCard.tsx` — pulsing LIVE pill + "Watch live" CTA when live; opens match page.
- `src/components/wc/MatchModal.tsx` — mount `LiveMatchCenter` when match is live.
- `src/routes/admin.tsx` — existing 2026 video field already covers admin YouTube override.

## Stream 3 — Mobile football redesign (full, single pass)

Desktop unchanged. Mobile (< 768px) gets the full overhaul.

New files:
- `src/styles/confederation-tokens.css` — 6 gradient tokens (CONMEBOL red, UEFA blue, CAF green, AFC orange, CONCACAF teal, OFC purple), imported from `styles.css`.
- `src/components/wc/MobileAppBar.tsx` — collapsing app-bar (tournament logo + year + LIVE pill, shrinks on scroll).
- `src/components/wc/StageTabs.tsx` — sticky horizontal chips: Group · R32 · R16 · QF · SF · Final. Snap-scroll, gradient active fill.
- `src/components/wc/GroupSwipeDeck.tsx` — one group per swipeable card, snap-x. Confederation-tinted headers, qualification color bar, tap-row → mini fixtures sheet, Motion stagger.
- `src/components/wc/KnockoutBracketMobile.tsx` — vertical bracket per round, "Path to final" highlight via Motion `layoutId`, swipe between rounds, pulsing border on live ties.
- `src/components/wc/FootballLiveTicker.tsx` — sticky bottom marquee on `/football` mobile listing live matches, taps to match page.

Modified (mobile branch behind `useIsMobile()`):
- `src/routes/football.tsx` — wire MobileAppBar + StageTabs + sticky YearStrip on mobile.
- `src/components/wc/YearStrip.tsx` — mobile variant: pill rail, snap-scroll, auto-scroll active into view, glowing gold underline.
- `src/components/wc/GroupStage.tsx` — mobile renders GroupSwipeDeck.
- `src/components/wc/MatchCard.tsx` — mobile variant: bigger flags (40px), centered score pill (pulses + minute when live), kickoff in viewer TZ + countdown, 44px tap targets, Watch/Highlights/Stats action row.
- `src/components/wc/Wc2026View.tsx` — mobile renders KnockoutBracketMobile for knockout rounds.

Polish:
- All Motion animations respect `prefers-reduced-motion`.
- Per-section skeleton shimmers using existing `Skeletons.tsx`.
- All headers use the responsive grid pattern (`grid-cols-[minmax(0,1fr)_auto]` + `min-w-0` + `shrink-0`).

## Order of execution

1. Stream 2 first (broadcasters lib + match center + watch button + match page + modal integration).
2. Stream 3 in one pass on top (tokens + app-bar + stage tabs + group deck + knockout + match-card mobile + live ticker).
3. Build verification + quick Playwright pass at 390×844 to confirm mobile.

## Confirm

- OK to skip IPTV/pirate-stream embeds and ship the legal "watch where it's free" approach as described?
- If yes I'll start immediately, no more questions.
