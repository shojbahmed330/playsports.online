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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AllSportsLive — Live Scores, Stats & FIFA World Cup Archive" },
      { name: "description", content: "Live scores, standings and stats across MLB, NBA, NHL, MLS, Cricket & IPL — plus the complete FIFA World Cup archive 1930–2026." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "AllSportsLive" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "AllSportsLive",
          url: "https://allsportslive.lovable.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://allsportslive.lovable.app/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "AllSportsLive",
          url: "https://allsportslive.lovable.app",
          description: "Live scores, stats and historical archives across football, cricket, baseball, basketball, hockey and soccer.",
        }),
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Preconnect to the hosts we hit on first paint (ESPN APIs + CDN, Sofascore via RapidAPI, AdSense).
      { rel: "preconnect", href: "https://site.api.espn.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://a.espncdn.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://sports.core.api.espn.com" },
      { rel: "dns-prefetch", href: "https://pagead2.googlesyndication.com" },
      { rel: "dns-prefetch", href: "https://qooamytkkxeyfmmqirsy.supabase.co" },
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
      <CookieConsent />
      <Toaster position="bottom-right" theme="dark" richColors />
    </QueryClientProvider>
  );

}
