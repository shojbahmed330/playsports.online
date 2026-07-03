// Legacy id-based MLS team route — 301 redirects to canonical slug URL when
// the ESPN id maps to a known franchise; otherwise falls back to the same
// team view (unknown ids still work).
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getMlsTeamByEspnId } from "@/lib/seo/mls-entities";
import { MlsTeamView } from "@/components/mls/MlsTeamView";

export const Route = createFileRoute("/mls/team/$id")({
  loader: ({ params }) => {
    const t = getMlsTeamByEspnId(params.id);
    if (t) {
      throw redirect({ to: "/mls/teams/$slug", params: { slug: t.slug } });
    }
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `MLS Team ${params.id} — Redirecting` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => {
    const { id } = Route.useParams();
    return <MlsTeamView id={id} />;
  },
});
