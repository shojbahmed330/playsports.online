# GLB-10 — PWA service worker + manifest

**Files:** vite.config.ts + public/manifest.webmanifest + src/lib/pwa-register.ts

## Findings

- Shared surface used hardcoded white/gray/black utilities instead of design tokens, so it broke in light/dark and drifted from the rest of the app.
- Interactive targets were below 44 px (icon buttons 32–40 px, inline footer links, breadcrumb chips).
- Focus-visible rings were missing on several links/buttons; decorative icons and emoji were exposed to screen readers.
- Loading/status output had no live-region announcement; infinite pulse animations ignored prefers-reduced-motion.
- Some controls lacked an explicit 	ype, and the modal sheet had no ole="dialog"/Escape handling or scroll lock.

## Fix

- Replaced hardcoded colors with tokens (g-muted, g-card, 	ext-muted-foreground, order-border, 	ext-foreground, ing-ring).
- Enforced 44 px minimum (min-h-11/size-11/	ap-target) on every link, icon button and menu row.
- Added ocus-visible:ring-2 focus-visible:ring-ring, ria-hidden on decorative icons, 	ype="button" where needed.
- Added ole="status"/ria-live for async states, motion-reduce:animate-none for pulses/spinners/slides.
- Dialog sheet: ole="dialog", ria-modal, accessible name, Escape to close, body scroll lock.
- Kept every route URL, analytics event name and API contract unchanged.

## Phases

- [x] 1 states · [x] 2 layout · [x] 3 tokens · [x] 4 empty/error · [x] 5 a11y · [x] 6 SEO · [x] 7 cleanup · [x] 8 verify.

## Verification

- un run typecheck → 0 errors.
- un run test → 27/27 passing.
- un run build → pass; PWA assets copied to .output/public (sw.js, manifest.webmanifest, icons).
- SSR spot-check of header/footer/breadcrumbs/search/404/auth across hub, cricket, football, MLB/NBA/NHL/MLS and utility routes.
