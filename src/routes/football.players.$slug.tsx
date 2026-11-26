import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout for /football/players/$slug/*. The profile page lives in
 * `football.players.$slug.index.tsx`; the year/stat pages are children.
 * Keeping the layout empty prevents the profile head (canonical, title)
 * from leaking into child pages.
 */
export const Route = createFileRoute("/football/players/$slug")({
  component: () => <Outlet />,
});
