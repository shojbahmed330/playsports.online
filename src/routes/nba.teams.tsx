import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNbaTeams } from "@/lib/nba.functions";
import { NbaTeamCard } from "@/components/nba/NbaTeamCard";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/nba/teams")({
  head: () => ({
    meta: [
      { title: "NBA Teams — All 30 Franchises" },
      { name: "description", content: "All 30 NBA franchises with logos, colors, conference and quick links to roster and schedule." },
      { property: "og:url", content: "https://www.playsports.online/nba/teams" },
      { property: "og:title", content: "NBA Teams — All 30 Franchises" },
      { property: "og:description", content: "All 30 NBA franchises with logos, colors, conference and quick links to roster and schedule." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NBA Teams — All 30 Franchises" },
      { name: "twitter:description", content: "All 30 NBA franchises with logos, colors, conference and quick links to roster and schedule." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nba/teams" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NBA", path: "/nba" }, { name: "Teams", path: "/nba/teams" }]))],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["nba", "teams"],
      queryFn: () => getNbaTeams(),
      staleTime: 6 * 60 * 60_000,
    }).catch(() => null);
    return null;
  },
  component: NbaTeams,
});

function NbaTeams() {
  const fn = useServerFn(getNbaTeams);
  const q = useQuery({ queryKey: ["nba", "teams"], queryFn: () => fn(), staleTime: 6 * 60 * 60_000 });
  const teams = q.data?.teams ?? [];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {q.isLoading
        ? Array.from({ length: 30 }).map((_, i) => <div key={i} className="h-20 rounded-2xl ring-1 ring-border bg-card animate-pulse" />)
        : teams.map((t) => <NbaTeamCard key={t.id} team={t} />)}
    </div>
  );
}
