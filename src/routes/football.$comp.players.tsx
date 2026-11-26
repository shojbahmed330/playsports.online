import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout so nested player pages can render; the list lives in .index.tsx. */
export const Route = createFileRoute("/football/$comp/players")({
  component: () => <Outlet />,
});
