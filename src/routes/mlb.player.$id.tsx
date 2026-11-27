import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlbAthlete } from "@/lib/mlb.functions";
import { PlayerProfile } from "@/components/mlb/PlayerProfile";
import { athlete, breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { AffiliateStrip } from "@/components/affiliates/AffiliateStrip";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

export const Route = createFileRoute("/mlb/player/$id")({
  loader: async ({ context, params }) => {
    return await context.queryClient
      .ensureQueryData({
        queryKey: ["mlb", "athlete", params.id],
        queryFn: () => getMlbAthlete({ data: { id: params.id } }),
        staleTime: 60 * 60_000,
      })
      .catch(() => null);
  },
  head: ({ params, loaderData }) => {
    const url = `https://www.playsports.online/mlb/player/${params.id}`;
    const a =
      (
        loaderData as {
          athlete?: {
            name?: string;
            headshot?: string | null;
            team?: { name?: string } | null;
            position?: string | null;
          };
        } | null
      )?.athlete ?? null;
    const name = a?.name ?? `MLB Player ${params.id}`;
    const teamPart = a?.team?.name ? ` — ${a.team.name}` : "";
    const title = a
      ? `${name}${teamPart} — MLB Career Stats & Game Logs`
      : "MLB Player Profile — Career Stats & Game Logs";
    const desc = a
      ? `${name}${a.position ? ` (${a.position})` : ""}${teamPart} — career batting/pitching stats, season splits and recent game logs on PlaySports.`
      : "MLB player profile with career batting and pitching stats, season splits, and recent game logs.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "PlaySports" },
        ...(a?.headshot ? [{ property: "og:image", content: a.headshot }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(a ? [] : [{ name: "robots", content: "noindex" }]),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(
          athlete({
            name,
            path: `/mlb/player/${params.id}`,
            sport: "Baseball",
            image: a?.headshot ?? undefined,
            team: a?.team?.name ?? undefined,
          }),
        ),
        ldScript(
          breadcrumbList([
            { name: "Home", path: "/" },
            { name: "MLB", path: "/mlb" },
            { name: "Players", path: "/mlb/players" },
            { name, path: `/mlb/player/${params.id}` },
          ]),
        ),
      ],
    };
  },
  component: PlayerPage,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ErrorState
        title="Could not load this player"
        message={errorMessage(error)}
        onRetry={reset}
      />
    </div>
  ),
});

function PlayerPage() {
  const { id } = Route.useParams();
  const fn = useServerFn(getMlbAthlete);
  const q = useQuery({
    queryKey: ["mlb", "athlete", id],
    queryFn: () => fn({ data: { id } }),
    staleTime: 60 * 60_000,
  });

  if (q.isLoading) {
    return (
      <div
        className="h-64 rounded-2xl bg-card ring-1 ring-border animate-pulse"
        role="status"
        aria-label="Loading player profile"
      />
    );
  }
  if (q.error) {
    return (
      <ErrorState
        title="Could not load this player"
        message={errorMessage(q.error)}
        onRetry={() => void q.refetch()}
      />
    );
  }
  if (!q.data?.athlete) {
    return (
      <EmptyState title="Player not found" description="This player is not in the MLB directory." />
    );
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
