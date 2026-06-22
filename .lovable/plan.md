
# Plan — Pro Football Experience, 2026-First, Admin Match Videos

Goal: Bring `/football` (FIFA World Cup) up to the same polished, animated, mobile-first standard as the new sports hub. Surface 2026 fixtures on the homepage with live kickoff times/countdowns. Let admins attach match videos for 2026 games from the admin panel. Default the Football page to **2026**.

---

## 1. Default to 2026 + smarter year picker

- `/football` opens on **2026** (currently 2022). When 2026 has no live data yet, auto-fallback to 2022 with a small "Showing latest completed tournament" badge.
- Replace the bare `<select>` with a horizontal year strip (pill-style, snap-scroll on mobile) grouped by decade, with the current/upcoming edition highlighted in gold and a 🔴 LIVE pulse on 2026 while matches are in progress.
- Tournament switch animates (cross-fade + slide), keyboard arrow navigation, URL search param `?year=2026` so links are shareable.

## 2. Football page — pro UI upgrade (works for historical + 2026)

**Hero**
- Animated gradient using each tournament's host-country palette (data already in `wc_tournaments`).
- Trophy mark with subtle parallax. Quick-stat strip: teams · matches · goals · top scorer (computed from existing data; for 2026 from live API).
- For 2026: live status row — "Next match in 3h 42m" countdown + venue + broadcast.

**Sticky sub-nav (replaces single Groups/Knockout toggle)**
Tabs: **Overview · Groups · Knockout · Schedule · Top Scorers · Teams · Videos**. Underline slides on switch. Sticky under the header on scroll.

**Overview tab (new)**
- "Today / Next up" card (2026 only) with `Countdown` + flag pair + venue + TV.
- Featured-match hero (biggest upcoming or latest result).
- Mini bracket preview + top-5 scorers + champion card.

**Groups tab**
- Reuse `GroupStage` but add: form guide (last-5 dots per team), qualified ✓ / eliminated ✗ chips, animated row entry, sortable columns.

**Knockout tab**
- Keep `SymmetricBracket` on desktop. Add winner-path glow animation when hovering a final match (highlights the bracket spine).
- Mobile: keep accordion but add per-match countdown / live score pill and swipe-between-rounds gesture.

**Schedule tab (new)**
- Date scrubber (reuse `DateScrubber`) → fixtures grouped by date, with local time, countdown, broadcast badge, venue. Filters: All / Live / Upcoming / Final / By group.

**Top Scorers tab**
- Pull existing 2026 scorers component out into its own tab, add historical scorers for past tournaments (compute from match data + bundled player stats), animated bar chart, country flag, club.

**Teams tab (new)**
- Grid of all 32/48 teams for the selected tournament, flag + group + path-to-final. Tap → drawer with squad (from existing `players` data) + their matches.

**Videos tab (new — see §4)**
- Grid of admin-uploaded match videos for the active tournament. Filter by round. Each card: thumbnail, teams, score, round, "Watch" → existing `VideoPlayer` modal.

**Motion & polish**
- Framer-motion stagger on first paint, tab cross-fade, score-pulse on update (reuse `ScoreFlip`), skeletons matching final card shape (reuse `Skeletons.tsx`), 🔴 live pulse synced across page.
- Auto-refresh: when 2026 has any in-progress match, refetch fixtures every 30s.

## 3. Mobile-first rework

- Bottom-tab style sub-nav on `< sm`, sticky.
- Bracket → horizontal snap-scroll of rounds with dot indicators (instead of long accordion).
- Hero scales: trophy + year + 3-stat strip in one viewport.
- Tap targets ≥ 44px, safe-area padding, no horizontal overflow.
- Year strip becomes momentum-scroll.
- Match modal becomes a bottom sheet on mobile.

## 4. Homepage — Football upcoming events with times

`src/routes/index.tsx` currently slates today's football via `FootballSlate`, but only for `today`. Upgrade:

- **Football Live & Upcoming rail** (always visible, even when no game today): pulls next 7 days of 2026 fixtures, groups by Live → Today → Tomorrow → This week.
- Each card shows: flags, teams, **local kickoff time** + **live countdown chip** ("Starts in 2d 4h 12m"), venue, group/round, broadcast pill.
- Card click → `/football?year=2026&match=<id>` deep link that opens MatchModal.
- Featured "World Cup spotlight" hero rotates between the next marquee fixture and the most recent finished match (gradient = team colors).
- Live score auto-refresh every 30s when any match is `in`.

## 5. Admin: upload match videos for 2026

`wc_matches` already has `video_url`. The 2026 view currently uses adapted SofaScore IDs that are not in `wc_matches`. Approach:

**Schema (new migration)**
- New table `public.wc_match_videos` (works for any year, but UI gated to 2026 initially):
  - `id uuid pk`
  - `tournament_year int not null`
  - `external_match_id text` (SofaScore id for 2026; nullable for historical)
  - `home_team text not null`, `away_team text not null`
  - `round text` (e.g. "Group A", "Round of 32")
  - `match_date timestamptz`
  - `title text`, `video_url text not null`, `thumbnail_url text`
  - `created_by uuid references auth.users`, `created_at timestamptz default now()`
- RLS: public `SELECT` for everyone; `INSERT/UPDATE/DELETE` only for `has_role(auth.uid(),'admin')`.
- GRANTs: `SELECT` to `anon, authenticated`; full to `authenticated` admins via policy + `service_role`.

**Admin panel (`/admin`)**
- New "World Cup Videos" card. Form fields:
  - Year (defaults 2026), Round dropdown (Group A–L, R32, R16, QF, SF, Final, 3rd Place), Home & Away team pickers (autocomplete from current fixtures), Match date, Title, Video URL (YouTube / mp4), Thumbnail URL (optional, auto-derived from YouTube).
  - "Link to live match" — pick from current 2026 fixtures list (sets `external_match_id`, home, away, round, date).
- Table of existing videos with edit / delete, filter by year + round.

**Where videos appear**
- New **Videos** tab on `/football`.
- Inside `MatchModal`: if a video exists for this match, show "▶ Watch highlights" button → existing `VideoPlayer`.
- 2026 `MatchCard` gets a small ▶ badge when a video exists.

## 6. New / modified files

**New**
- `src/components/wc/YearStrip.tsx` — animated year picker
- `src/components/wc/FootballHero.tsx` — animated hero with stats
- `src/components/wc/OverviewTab.tsx`
- `src/components/wc/ScheduleTab.tsx`
- `src/components/wc/TeamsTab.tsx`
- `src/components/wc/VideosTab.tsx`
- `src/components/wc/FootballSubNav.tsx`
- `src/components/wc/FormGuide.tsx`
- `src/components/home/FootballUpcomingRail.tsx`
- `src/components/admin/WcVideosAdminCard.tsx`
- `src/lib/wc-videos.functions.ts` — list/create/update/delete server fns (admin-gated)
- Migration: `wc_match_videos` table + RLS + grants

**Modified**
- `src/routes/football.tsx` — default 2026, sub-nav, new tabs, mobile bracket, URL sync
- `src/routes/index.tsx` — add `FootballUpcomingRail`, deep-link cards
- `src/routes/admin.tsx` — mount `WcVideosAdminCard`
- `src/components/wc/MatchModal.tsx` — show video button when present
- `src/components/wc/MatchCard.tsx` — ▶ badge when video exists
- `src/components/wc/Wc2026View.tsx` — pass video map to cards, expose fixtures list to admin form

## 7. Out of scope (this batch)

- Direct video file uploads to storage (URL input only; can add a bucket later).
- Per-user favorites for football matches.
- Historical (1930–2022) video back-fill — schema supports it; UI only exposes 2026 initially.
- Live commentary / minute-by-minute feed (depends on API tier).

## 8. Risks

- 2026 fixtures use SofaScore IDs; `external_match_id` matching may drift if the upstream changes IDs — admin form also stores teams + date for fallback lookup.
- Auto-refresh raises API volume — guarded by existing 60s server cache and only polls when a live match exists.
- Default-to-2026 before draw is finalised could feel empty — overview tab handles empty state gracefully with a "Tournament starts in X days" countdown.

---

## Questions before I build

1. **Video source**: URL-only (YouTube / direct mp4) for now — okay? Or do you want a real uploader to Lovable Cloud storage (adds a storage bucket + size limits)?
2. **Default year fallback**: if 2026 has zero fixtures live, fall back to 2022 silently, or always stay on 2026 with an "awaiting draw" state?
3. **Scope split**: ship as **one big PR** (everything above), or in two passes — Pass A = Football page redesign + 2026 default + homepage upcoming rail; Pass B = admin videos table + Videos tab + MatchModal video button?
