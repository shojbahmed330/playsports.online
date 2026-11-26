import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout so the season page can render; the profile lives in .index.tsx. */
export const Route = createFileRoute("/football/$comp/teams/$teamId")({
  component: () => <Outlet />,
});
