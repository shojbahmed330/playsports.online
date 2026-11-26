# Design System — PlaySports

The project already has a token-based dark theme. The overhaul **extends** it; it does not replace it.

## 1. Foundations (existing, keep)

### Colour tokens (`src/styles.css`)

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(0.16 0.02 255)` | page background |
| `--surface` / `--surface-2` / `--surface-3` | `0.20` / `0.24` / `0.28` L | nested surfaces |
| `--card` | `oklch(0.22 0.022 255)` | cards |
| `--foreground` | `oklch(0.985 0 0)` | primary text |
| `--muted-foreground` | `oklch(0.74 0.015 264)` | secondary text |
| `--primary` / `--gold` | `oklch(0.78 0.16 75)` | brand amber CTA |
| `--secondary` / `--muted` | `oklch(0.28 0.02 264)` | quiet surfaces |
| `--accent` | `oklch(0.32 0.02 264)` | hover surface |
| `--destructive` | `oklch(0.62 0.22 27)` | errors |
| `--live` | `oklch(0.68 0.22 22)` | live indicator |
| `--border` / `--input` | `oklch(0.32 0.02 264)` | borders |
| `--ring` | brand amber | focus ring |

Per-sport tokens: `--accent-football` (amber), `--accent-cricket` (emerald), `--accent-mlb` (blue), `--accent-nba` (orange), `--accent-nhl` (magenta), `--accent-mls` (green).

### Radius and elevation

- Base `--radius: 0.75rem`; `sm/md/lg/xl/2xl` derive from it.
- `--shadow-elevated`, `--gradient-hero`, `--gradient-card` are the only sanctioned elevation/gradients.
- **Rule:** no new hardcoded hex/oklch colours in page files; use tokens or sport accents.

### Typography

- `--font-sans`: Inter 400/500/600/700/800.
- `--font-display`: Sora Variable for headings and the wordmark.
- Scale in use: `text-[10px]` kicker, `text-xs` meta, `text-sm` body, `text-base` card title, `text-lg` section title, `text-2xl`/`text-3xl` page title, `text-4xl` hero.
- **Scores, tables, timers:** `tabular-nums`.
- Headings: tight tracking (`-0.01em`) via base layer.

### Spacing and layout

- 4/8 px grid; page gutters `px-3 sm:px-6` for full-bleed hubs, `px-4` for article shells.
- Max widths: `max-w-7xl` hubs, `max-w-6xl` competition pages, `max-w-3xl`/`4xl` match & article pages.
- Cards: `rounded-2xl border border-border bg-card/40` is the common surface; avoid one-off gradients.
- Touch target token: `--tap-target: 44px`.

### Breakpoints

Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`. Mobile-first; bottom tab bar below `sm`.

## 2. Core components (existing)

`src/components/ui` includes Button, Card, Badge, Tabs, Table, Skeleton, Dialog, Sheet, Drawer, Tooltip, Input, Select, Command, StatTable, ChipScroller and the rest of the Radix suite.

Shared sports components: `MatchCard`, `CompetitionStandingsTable`, `MatchHero`, `CricketSubNav`, `FootballHubSwitcher`, `Breadcrumbs`, `SiteFooter`, `SportNav`, `MobileTabBar`, `HubInternalLinks`.

## 3. Shared components added by this overhaul

| Component | File | Rules |
|---|---|---|
| `EmptyState` | `src/components/ui/state.tsx` | icon, title, description, optional action; used instead of ad-hoc dashed boxes |
| `ErrorState` | same | message + Retry button; never print raw server errors to users |
| `LoadingState` | same | skeleton rows with stable height (no layout shift) |
| `SectionHeader` | same | consistent kicker/title/action row |

## 4. Sports UI rules

- **Live** = red dot + `LIVE` + `aria-live="polite"` only when the match is actually live. No permanent pulsing badge.
- **Score hierarchy:** teams and score first, status/venue second, metadata third. Scores always `tabular-nums`.
- **Match card:** competition + status row, team rows with crests, score/result, one clear CTA (match centre).
- **Tables:** sticky header, `overflow-x-auto` wrapper, numeric right alignment, 44 px row height on mobile where tappable.
- **Numbers:** overs as `12.4` (not decimal), run rate 2 dp, strike rate/economy 1–2 dp, percentages whole numbers, dates via the shared UTC/news formatter, times via `formatLocalTime`.
- **Images:** crests `loading="lazy" decoding="async"`, explicit dimensions or fixed box to avoid CLS.
- **No emoji as the only icon** in primary navigation; emoji allowed inside sport chips where already established.

## 5. States

Every data screen must render:

1. Loading: skeleton matching final layout.
2. Empty: what happened + what to do next.
3. Error: human message + Retry, never a raw stack/API string.
4. Partial data: render what exists, hide missing modules instead of printing “undefined”.

## 6. Accessibility

- Visible `:focus-visible` ring from the base layer; do not remove outlines.
- Keyboard: dialogs/sheets from Radix already trap focus; custom overlays must too.
- Contrast: body text `--foreground` on `--background`; muted text only for secondary meta.
- Touch: 44 px minimum for icon buttons and mobile nav.
- Motion: honour `prefers-reduced-motion` for pulses/carousels.

## 7. Gaps to close

- No generic empty/error/loading components (fixed in foundation).
- Many one-off `bg-white/[0.03]` shells and arbitrary `text-[10px]` labels; standardise through the new state/section components over time.
- Header brand uses “PlaySports” consistently, but some pages still carry old “AllSportsLive” canonical URLs (`/football/euro/teams`, `/football/euro/players`). Fix when those screens are worked on.
- Dark theme only; tokens are structured so a light theme can be added later, but no light switch is in scope.
