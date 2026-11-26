import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout so category pages can render; the hub lives in .index.tsx. */
export const Route = createFileRoute("/football/$comp/records")({
  component: () => <Outlet />,
});
