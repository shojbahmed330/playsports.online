import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout so season pages can render; the hub lives in .index.tsx. */
export const Route = createFileRoute("/football/$comp/history")({
  component: () => <Outlet />,
});
