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
      { title: "FIFA World Cup Archive — Complete History 1930-2022" },
      { name: "description", content: "Complete FIFA World Cup tournament history, fixtures, scores and results from 1930 to 2022. Browse every match, group stage and knockout round." },
      { property: "og:title", content: "FIFA World Cup Archive — Complete History 1930-2022" },
      { property: "og:description", content: "Complete FIFA World Cup tournament history, fixtures, scores and results from 1930 to 2022. Browse every match, group stage and knockout round." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "FIFA World Cup Archive — Complete History 1930-2022" },
      { name: "twitter:description", content: "Complete FIFA World Cup tournament history, fixtures, scores and results from 1930 to 2022. Browse every match, group stage and knockout round." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/110e40cc-d990-48af-a996-8f46b9fd0f97/id-preview-f9e73043--3e33a21e-e132-4b69-83ee-be28f3bc4583.lovable.app-1782037338724.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/110e40cc-d990-48af-a996-8f46b9fd0f97/id-preview-f9e73043--3e33a21e-e132-4b69-83ee-be28f3bc4583.lovable.app-1782037338724.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
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
      <AdSenseLoader />
      {/* Site-wide top banner — shows on every route once AdSense is configured. */}
      <AdSlot slot="header" className="px-4" />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      {/* Site-wide bottom banner. */}
      <AdSlot slot="footer" className="px-4" />
      {/* Always-on mobile bottom nav — picks tabs based on current route. */}
      <GlobalMobileNav />
      <Toaster position="bottom-right" theme="dark" richColors />
    </QueryClientProvider>
  );
}
