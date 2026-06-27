import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlbAthlete } from "@/lib/mlb.functions";
import { PlayerProfile } from "@/components/mlb/PlayerProfile";
import { athlete, breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";

export const Route = createFileRoute("/mlb/player/$id")({
  head: ({ params }) => {
    const url = `https://allsportslive.lovable.app/mlb/player/${params.id}`;
    return {
      meta: [
        { title: "MLB Player Profile — Career Stats & Game Logs" },
        { name: "description", content: "MLB player profile with career batting and pitching stats, season splits, and recent game logs." },
        { property: "og:title", content: "MLB Player Profile" },
        { property: "og:description", content: "Career stats, season splits and recent game logs." },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(athlete({ name: `MLB Player ${params.id}`, path: `/mlb/player/${params.id}`, sport: "Baseball" })),
        ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLB", path: "/mlb" }, { name: "Players", path: "/mlb/players" }, { name: "Player", path: `/mlb/player/${params.id}` }])),
      ],
    };
  },
  component: PlayerPage,
});

function PlayerPage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getMlbAthlete);
  const q = useQuery({ queryKey: ["mlb", "athlete", id], queryFn: () => fn({ data: { id } }), staleTime: 60 * 60_000 });

  if (q.isLoading) {
    return <div className="h-64 rounded-2xl bg-card ring-1 ring-border animate-pulse" />;
  }
  if (!q.data?.athlete) {
    return <div className="text-sm text-muted-foreground">Player not found.</div>;
  }
  return (
    <>
      <PlayerProfile athlete={q.data.athlete} career={q.data.career} />
      <div className="max-w-5xl mx-auto px-4">
        <AffiliateStrip placement="player_footer" sport="mlb" heading="MLB gear & partners" />
      </div>
    </>
  );
}
