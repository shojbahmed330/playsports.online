import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SportNav } from "@/components/sports/SportNav";

export const Route = createFileRoute("/football")({
  component: () => (
    <>
      <SportNav />
      <Outlet />
    </>
  ),
});
