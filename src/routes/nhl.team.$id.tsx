// Legacy id-based team route — 301 redirects to the canonical slug URL
// when the ESPN id maps to a known franchise; otherwise falls back to
// rendering the same team view (unknown ids still work).
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getNhlTeamByEspnId } from "@/lib/seo/nhl-entities";
import { NhlTeamView } from "@/components/nhl/NhlTeamView";

export const Route = createFileRoute("/nhl/team/$id")({
  loader: ({ params }) => {
    const t = getNhlTeamByEspnId(params.id);
    if (t) {
      throw redirect({ to: "/nhl/teams/$slug", params: { slug: t.slug } });
    }
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `NHL Team ${params.id} — Redirecting` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => {
    const { id } = Route.useParams();
    return <NhlTeamView id={id} />;
  },
});
