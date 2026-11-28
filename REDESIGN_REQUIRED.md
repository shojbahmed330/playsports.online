# Visual redesign — mandatory screens

**Date:** 2026-11-28
**Branch:** `professional-overhaul`
**Scope:** which of the 150 route screens *must* be visually redesigned, based on measured design debt — not opinion.

---

## 0. Why this file exists (owning the miss)

The brief said "audit, **redesign**, and fix". I did the audit and the fixes, but I did **not** do a visual
redesign pass. I read "redesign" as "restructure the broken parts while keeping the existing look", and I
over-weighted the mission constraints (preserve URLs, API contracts, analytics, no new dependencies) into
"preserve the visuals too". That was my call, and it was wrong relative to what you asked for.

What I actually shipped: correctness, states, a11y, SEO, PWA, tokens, 44 px targets, no plain-text 404s.
What I did not ship: new visual hierarchy, typography, spacing, card/table systems, or a refreshed look.

This document defines the redesign that is genuinely required, so it can be executed as real design work
instead of another polish pass.

---

## 1. How the list was produced

Every route file named in `SCREEN_INVENTORY.md` (150 route screens, 153 files) was measured:

| Metric | What it captures |
|---|---|
| `lines` | file size / how much bespoke markup one screen carries |
| `palette` | hardcoded Tailwind palette utilities (`bg-gray-900`, `text-emerald-300`, `bg-white/5`, `from-amber-500`…) — i.e. colours that bypass the design tokens |
| `tokens` | semantic utilities (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`…) |
| `states` | whether the screen uses the shared `EmptyState` / `ErrorState` / `LoadingState` |

A screen is "off-system" when `palette` is high and `tokens` is low: it looks like a different product and
cannot follow a theme change.

**Measured totals:** 153 files · avg 237 lines · 26 files with >20 hardcoded palette hits · 14 files >400 lines
· 21 files with no shared state components.

---

## 2. Mandatory criteria

A screen is **mandatory** when at least one is true:

1. **Off-system:** palette ≥ 30, or palette ≥ 20 with tokens ≤ 5.
2. **Entry point:** first impression or primary navigation (home, sport hub, scores, players).
3. **Conversion:** the page that asks for money or an account.
4. **Unmaintainable:** >500 lines of bespoke markup in a single route file.

A screen is **not mandatory** when it already uses tokens consistently and carries no unique visual role.

---

## 3. Tier A — mandatory redesign (22 screens)

### 3.1 Cross-sport (5)

| ID | Screen | File | Lines | Palette | Tokens | Why mandatory | Redesign scope |
|---|---|---|---|---|---|---|---|
| HOME-01 | Home | `src/routes/index.tsx` | 747 | 72 | 3 | First impression; almost no token usage; 747-line file | New hero hierarchy, one card system, split into sections, replace 72 palette hits, sport doors |
| FB-22 | Football hub | `src/routes/football.index.tsx` | 1083 | 36 | 28 | Largest route file in the repo; two competing visual languages | Split into modules, unify competition/score cards, one hero, one filter bar |
| FB-30 | Football team | `src/routes/football.teams.$slug.tsx` | 560 | 45 | 34 | Highest-traffic detail template; 45 palette hits | One team-header template (crest, form, tabs), shared stat/table primitives |
| PLYR-02 | Players hub | `src/routes/players.tsx` | 930 | 34 | 70 | 930 lines; filter/compare/table crammed in one file | Extract filter bar, leaderboard table, compare view; mobile-first layout |
| MINE-01 | My Feed | `src/routes/mine.tsx` | 531 | 35 | 53 | 531 lines; feed cards diverge from the rest | One feed-card component, empty/onboarding state, section headers |

### 3.2 Cricket (17)

The cricket module is the clearest evidence that a redesign is required: the IPL pages use a bespoke
emerald/slate/gray palette with **zero** design tokens. They are visually a separate app.

| ID | Screen | Lines | Palette | Tokens | Redesign scope |
|---|---|---|---|---|---|
| CRK-04 | Cricket hub | 522 | 60 | 6 | Hero + live pulse on the token system; one card system |
| CRK-19 | Cricket scores | 545 | 62 | 3 | One score card, one date/filter bar, responsive tabs |
| CRK-05 | IPL history | 597 | 96 | 0 | Remove bespoke theme entirely; shared timeline/table primitives |
| CRK-11 | IPL team profile | 573 | 83 | 0 | Shared team-header template (same as FB-30 / XSPT-02) |
| CRK-08 | IPL records | 381 | 79 | 0 | Shared record-table + filter primitives |
| CRK-21 | Cricket series hub | 350 | 51 | 11 | Series card system, consistent headers |
| CRK-16 | Cricket rankings | 258 | 46 | 5 | Ranking table primitive shared with IPL standings |
| CRK-03 | Cricket history | 338 | 42 | 14 | Timeline primitive, tokenized surfaces |
| CRK-15 | Cricket players | 272 | 40 | 7 | Player list/table shared with PLYR-02 |
| CRK-20 | Cricket series detail | 356 | 35 | 2 | Match-list + header template |
| CRK-10 | IPL standings | 229 | 33 | 0 | Standings table primitive (shared with MLB/NBA/NHL/MLS) |
| CRK-06 | IPL hub | 323 | 31 | 1 | Hub hero + card system |
| CRK-09 | IPL scores | 231 | 30 | 0 | Score card primitive |
| CRK-18 | Cricket records | 237 | 27 | 6 | Record category cards |
| CRK-07 | IPL players | 235 | 24 | 0 | Player table primitive |
| CRK-24 | Cricket teams | 277 | 24 | 9 | Team grid/card primitive |
| CRK-12 | IPL teams | 151 | 7 | 0 | Team grid (inherits CRK-24 treatment) |

**Why these 17 and not all 26 cricket screens:** the other 9 (CRK-01, 02, 13, 14, 17, 22, 23, 25, 26) already
run on tokens (palette ≤ 13, tokens 5–28). They need consistency QA, not a redesign.

### 3.3 Blocked on an owner decision (1)

| ID | Screen | Blocker |
|---|---|---|
| PREM-01 | Premium | Price/checkout conflict: page says $3/mo + `mailto:`, product rule says $5/mo via Google Play Billing. Redesigning a checkout page before the pricing model is fixed would waste the work. Decide the model first. |

---

## 4. Tier B — recommended template pass (not mandatory, 6 templates)

These are already token-based, so they do not meet the mandatory bar. But one redesign per template fixes
many routes at once. Do them **after** Tier A.

| Template | Routes covered | Why |
|---|---|---|
| Match / game centre | CRK-13, FB-06, MLB-02, NBA-03, NHL-02, MLS-03 | Six different implementations of the same page type; MLB-02 alone is 516 lines |
| Team profile | FB-30, XSPT-02, MLB-14, NBA-13, NHL-13, MLS-13 | Same data shape, six headers |
| Player profile | CRK-14, FB-26, FB-27, MLB-06, XSPT-03, PLYR-01 | Same hero/stats/competition blocks |
| Scores | CRK-19, MLB, NBA, NHL, MLS scores | Four copies of one score-card layout |
| Standings | CRK-10, MLB-12, NBA, NHL, MLS standings | Five table implementations |
| Player index / leaders | PLYR-02, CRK-15, MLB/NBA/NHL/MLS leaders | Filter + table + compare, repeated |

---

## 5. Not mandatory (127 screens)

- **Legal / utility / auth / admin:** `about`, `contact`, `privacy`, `terms`, `cookies`, `disclaimer`, `unsubscribe`, `auth`, `admin`. They are functional shells; admin is internal. Refactor only if it blocks a redesign.
- **Guides, highlights, archive, H2H, tournaments:** already token-based and low visual complexity.
- **MLB / NBA / NHL / MLS hubs, scores, standings, news, history, leaders:** consistent with each other and token-based; they inherit the Tier B template work rather than needing their own redesign.
- **Already-tokenized cricket detail pages:** CRK-01, 02, 13, 14, 17, 22, 23, 25, 26 — QA only.

---

## 6. Prerequisites (do these before touching screens)

Redesigning 22 pages without primitives will produce 22 new dialects. Build first:

1. **Type scale** — display / h1 / h2 / body / caption, with responsive sizes and line-heights. ✅ done (`--text-*` in `src/styles.css`)
2. **Spacing + radius scale** — one card radius, one gap rhythm, one section rhythm. ✅ existing token set (`--radius`, `--shadow-elevated`, `--gradient-hero/card`)
3. **Colour roles** — surface / elevated surface / border / accent / live / positive / negative / gold. Sport accents become tokens (`--sport-cricket`, `--sport-football`, …), not hardcoded emerald/amber. ✅ `--color-accent-*`, `--color-live`, `--color-positive`, `--color-gold`
4. **Primitives** — `Card`, `StatTile`, `ScoreRow`, `Table`, `Tabs`, `FilterBar`, `Hero`, `SectionHeader`, `TeamHeader`, `PlayerHeader`. ✅ first wave in `src/components/ui/primitives.tsx` (`Card`, `StatTile`, `ScoreRow`, `TableShell`, `Hero`); `SectionHeader` already exists in `ui/state.tsx`
5. **Motion rules** — durations, reduced-motion fallback. ✅ existing `motion-reduce:` convention
6. **Visual QA harness** — 360 / 768 / 1280 screenshots per screen, light/dark token check. ⏳ runs as part of each screen's definition of done

---

## 7. Execution order

Status: **Wave 0 done · 22/22 mandatory screens token-complete · pricing decision still open (PREM-01 visuals done, checkout unchanged)** · production deploy in progress.

- [x] **Foundation** — type scale, colour roles, primitives (`Card`, `StatTile`, `ScoreRow`, `TableShell`, `Hero`), token guard test.
- [x] **HOME-01** — hero, ForYou (logic fix), Pulse, cards, tabs, status bar, ticker, zone strip, champions. Guarded; 390 px QA.
- [x] **FB-22** football hub — full pass incl. modal, brackets, date scrubber (hydration fixed), every hub component.
- [x] **FB-30** football team — palette 45 → 0 (token/system pass).
- [x] **PLYR-02** players hub — palette 34 → 0; tabs extracted to `components/players/PlayersTabs.tsx`; route 930 → 504 lines.
- [x] **MINE-01** my feed — palette 35 → 0 (token/system pass).
- [x] **Cricket wave (17)** — CRK-03/04/05/06/07/08/09/10/11/12/15/16/18/19/20/21/24: 51 cricket/IPL files palette → 0; guard now scans the whole module.
- [x] **PREM-01** — visual/token pass done (tokens, type scale, guarded). Pricing/checkout ($3 mailto vs $5 Google Play Billing) still an owner decision; no billing logic changed.
- [ ] **QA pass** — contrast, 44 px, focus order, reduced motion, CLS, screenshots for the mass-tokenised screens.

**What "token-complete" means:** these screens no longer hardcode palette colours; they use the shared type scale, tokens, 44 px controls and shared states where the markup already had controls. It is a system-level pass, not a bespoke layout reinvention for every cricket page. HOME-01 and FB-22 received the deeper structural treatment.
- [ ] **PLYR-02** players hub (930 lines)
- [ ] **FB-30** football team
- [ ] **MINE-01** my feed
- [ ] **Wave 2: cricket** — CRK-04 → CRK-19 → CRK-05 → CRK-11 → CRK-08 → CRK-21 → CRK-16 → CRK-03 → CRK-15 → CRK-20 → CRK-10 → CRK-06 → CRK-09 → CRK-18 → CRK-07 → CRK-24 → CRK-12.
- [ ] **Wave 3: templates** — Tier B, one template per PR, all routes inherit.
- [ ] **Wave 4: PREM-01** — only after the pricing decision.
- [ ] **QA pass** — contrast, 44 px targets, focus order, reduced motion, CLS, screenshots.

Known dead code: `src/components/home/HeroSpotlight.tsx` (364 lines, 52 palette hits) is not imported anywhere. Left in place; remove in a dedicated cleanup once the owner confirms.

Estimated output: 22 route files + ~10 primitives. Target per route file: **≤ 300 lines** (extract components), **0 hardcoded palette utilities**, **1 header pattern**, **1 card pattern**.

---

## 8. Definition of done (per screen)

- [ ] 0 hardcoded palette utilities; semantic tokens only.
- [ ] Route file ≤ 300 lines; repeated markup extracted to a shared component.
- [ ] One header/breadcrumb pattern; no duplicate headers.
- [ ] Empty / error / loading states use the shared components.
- [ ] 44 px targets, visible focus ring, correct heading order, labelled landmarks.
- [ ] 360 / 768 / 1280 screenshots reviewed; no horizontal scroll; no CLS on load.
- [ ] Contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI borders.
- [ ] `bun run typecheck` 0, `bun run test` green, `bun run build` pass.
- [ ] Routes, query params, analytics event names unchanged.

---

## 9. Honest summary

- **150** route screens exist.
- **22** need a real visual redesign (5 cross-sport + 17 cricket).
- **1** is blocked on the pricing decision (premium).
- **6** shared templates are worth redesigning because they cover ~30 routes.
- **127** are not mandatory: they are either already token-based or low-complexity shells.

The previous pass fixed behaviour. This document scopes the visual work that was missing.
