// Legacy id-based team route — 301 redirects to canonical slug URL when known.
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getNbaTeamByEspnId } from "@/lib/seo/nba-entities";
import { NbaTeamView } from "@/components/nba/NbaTeamView";

export const Route = createFileRoute("/nba/team/$id")({
  loader: ({ params }) => {
    const t = getNbaTeamByEspnId(params.id);
    if (t) throw redirect({ to: "/nba/teams/$slug", params: { slug: t.slug } });
    return null;
  },
  head: ({ params }) => ({
    meta: [
      { title: `NBA Team ${params.id} — Redirecting` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => {
    const { id } = Route.useParams();
    return <NbaTeamView id={id} />;
  },
});
