import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AdSenseLoader } from "../components/ads/AdSenseLoader";
import { AdSlot } from "../components/ads/AdSlot";
import { GlobalMobileNav } from "../components/nav/GlobalMobileNav";
import { AnalyticsLoader } from "../components/site/AnalyticsLoader";
import { CookieConsent } from "../components/site/CookieConsent";
import { SiteFooter } from "../components/site/SiteFooter";
import { FootballLiveBadge } from "../components/football/FootballLiveBadge";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error instanceof Error ? error : new Error(String(error)), {
      boundary: "tanstack_root_error_component",
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#000000" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "PlaySports" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "PlaySports — Live Cricket & Football Scores, Stats & History" },
      {
        name: "description",
        content:
          "Live cricket and football scores, fixtures, tables, stats and match history — internationals, IPL, Premier League, Champions League and more.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { property: "og:image", content: "https://www.playsports.online/og-default.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://www.playsports.online/og-default.png" },
      { name: "google-site-verification", content: "google57d393e7853831a6" },
      // Bing Webmaster Tools — replace `content` with the value from
      // https://www.bing.com/webmasters (Site → Ownership → Meta tag).
      // Leaving the placeholder is harmless — Bing simply won't verify.
      { name: "msvalidate.01", content: "7665E479090623A25F88358485292850" },
      // Yandex Webmaster — optional; replace with the value from
      // https://webmaster.yandex.com/ (Settings → Verification → Meta tag).
      { name: "yandex-verification", content: "REPLACE_WITH_YANDEX_VERIFICATION_CODE" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "PlaySports",
          alternateName: ["Play Sports", "PlaySports Online"],
          url: "https://www.playsports.online",
          inLanguage: "en",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.playsports.online/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://www.playsports.online/#organization",
          name: "PlaySports",
          url: "https://www.playsports.online",
          logo: "https://www.playsports.online/icon-512.png",
          description: "Live cricket and football scores, tables, stats and historical archives.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SiteNavigationElement",
          name: ["Cricket", "Football", "Live", "News", "MLB", "NBA", "NHL", "MLS"],
          url: [
            "https://www.playsports.online/cricket",
            "https://www.playsports.online/football",
            "https://www.playsports.online/live/today",
            "https://www.playsports.online/news",
            "https://www.playsports.online/mlb",
            "https://www.playsports.online/nba",
            "https://www.playsports.online/nhl",
            "https://www.playsports.online/mls",
          ],
        }),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Noto Color Emoji: makes flag emojis render on Windows Chromium
      // (default segoe UI emoji font has no country-flag glyphs; Chrome falls
      // back to the two-letter regional-indicator codes like "CA" / "MA").
      { rel: "preconnect", href: "https://fonts.googleapis.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
      // Preconnect to the hosts we hit on first paint (ESPN APIs + CDN, Sofascore via RapidAPI, AdSense).
      { rel: "preconnect", href: "https://site.api.espn.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://a.espncdn.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://sports.core.api.espn.com" },
      { rel: "dns-prefetch", href: "https://pagead2.googlesyndication.com" },
      { rel: "dns-prefetch", href: "https://vagqeperdsumxwukwbes.supabase.co" },
      // hreflang — declare English as the site language and set an x-default
      // fallback. Traffic is spread across UK/IN/CA/AU so a single English
      // canonical is correct; per-locale variants can be added later.
      { rel: "alternate", hrefLang: "en", href: "https://www.playsports.online/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://www.playsports.online/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    // Registers the PWA service worker in production top-level windows only.
    // Refuses (and unregisters stale SWs) in dev, iframes and Lovable preview.
    void import("../lib/pwa-register").then((m) => m.registerPwa());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to main content
      </a>
      <AdSenseLoader />
      <AnalyticsLoader />
      {/* Site-wide top banner — shows on every route once AdSense is configured. */}
      <AdSlot slot="header" className="px-4" />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <div id="main-content" tabIndex={-1} className="focus:outline-none">
        <Outlet />
      </div>
      {/* Site-wide bottom banner. */}
      <AdSlot slot="footer" className="px-4" />
      <SiteFooter />
      {/* Always-on mobile bottom nav — picks tabs based on current route. */}
      <GlobalMobileNav />
      {/* Global "Live now" pill — WC 2026 live match one-tap access. */}
      <FootballLiveBadge />
      <CookieConsent />
      <Toaster position="bottom-right" theme="dark" richColors />
    </QueryClientProvider>
  );
}
