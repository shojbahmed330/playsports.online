import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Alias route that maps `/football/$comp/seasons/$year` → `/football/$comp/history/$year`.
 * Kept so the plan URL from Phase 3 stays clickable; history/$year is canonical.
 */
export const Route = createFileRoute("/football/$comp/seasons/$year")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/football/$comp/history/$year",
      params: { comp: params.comp, year: params.year },
    });
  },
});
