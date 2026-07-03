// Legacy id-based team route — 301 redirects to the canonical slug URL
// when the ESPN id maps to a known franchise; otherwise falls back to
// rendering the same team view (unknown ids still work).
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getMlbTeamByEspnId } from "@/lib/seo/mlb-entities";
import { MlbTeamView } from "@/components/mlb/MlbTeamView";

export const Route = createFileRoute("/mlb/team/$id")({
  loader: ({ params }) => {
    const t = getMlbTeamByEspnId(params.id);
    if (t) {
      throw redirect({ to: "/mlb/teams/$slug", params: { slug: t.slug } });
    }
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `MLB Team ${params.id} — Redirecting`, name: "robots", content: "noindex" },
    ],
  }),
  component: () => {
    const { id } = Route.useParams();
    return <MlbTeamView id={id} />;
  },
});
