import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNhlTeams } from "@/lib/nhl.functions";
import { NhlTeamCard } from "@/components/nhl/NhlTeamCard";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/nhl/teams")({
  head: () => ({
    meta: [
      { title: "NHL Teams — All 30 Franchises" },
      { name: "description", content: "All 30 NHL franchises with logos, colors, conference and quick links to roster and schedule." },
      { property: "og:url", content: "https://www.playsports.online/nhl/teams" },
      { property: "og:title", content: "NHL Teams — All 30 Franchises" },
      { property: "og:description", content: "All 30 NHL franchises with logos, colors, conference and quick links to roster and schedule." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NHL Teams — All 30 Franchises" },
      { name: "twitter:description", content: "All 30 NHL franchises with logos, colors, conference and quick links to roster and schedule." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nhl/teams" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NHL", path: "/nhl" }, { name: "Teams", path: "/nhl/teams" }]))],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["nhl", "teams"],
      queryFn: () => getNhlTeams(),
      staleTime: 6 * 60 * 60_000,
    }).catch(() => null);
    return null;
  },
  component: withHubLinks(NhlTeams, { sport: "nhl", currentPath: "/nhl/teams" }),
});

function NhlTeams() {
  const fn = useServerFn(getNhlTeams);
  const q = useQuery({ queryKey: ["nhl", "teams"], queryFn: () => fn(), staleTime: 6 * 60 * 60_000 });
  const teams = q.data?.teams ?? [];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {q.isLoading
        ? Array.from({ length: 30 }).map((_, i) => <div key={i} className="h-20 rounded-2xl ring-1 ring-border bg-card animate-pulse" />)
        : teams.map((t) => <NhlTeamCard key={t.id} team={t} />)}
    </div>
  );
}
