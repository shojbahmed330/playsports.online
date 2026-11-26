import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout so nested team pages can render; the list lives in .index.tsx. */
export const Route = createFileRoute("/football/$comp/teams")({
  component: () => <Outlet />,
});
