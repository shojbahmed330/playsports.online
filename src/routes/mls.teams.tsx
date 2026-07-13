import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlsTeams } from "@/lib/mls.functions";
import { MlsTeamCard } from "@/components/mls/MlsTeamCard";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/mls/teams")({
  head: () => ({
    meta: [
      { title: "MLS Teams — All 30 Franchises" },
      { name: "description", content: "All 30 MLS franchises with logos, colors, conference and quick links to roster and schedule." },
      { property: "og:url", content: "https://www.playsports.online/mls/teams" },
      { property: "og:title", content: "MLS Teams — All 30 Franchises" },
      { property: "og:description", content: "All 30 MLS franchises with logos, colors, conference and quick links to roster and schedule." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "MLS Teams — All 30 Franchises" },
      { name: "twitter:description", content: "All 30 MLS franchises with logos, colors, conference and quick links to roster and schedule." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mls/teams" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLS", path: "/mls" }, { name: "Teams", path: "/mls/teams" }]))],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["mls", "teams"],
      queryFn: () => getMlsTeams(),
      staleTime: 6 * 60 * 60_000,
    }).catch(() => null);
    return null;
  },
  component: MlsTeams,
});

function MlsTeams() {
  const fn = useServerFn(getMlsTeams);
  const q = useQuery({ queryKey: ["mls", "teams"], queryFn: () => fn(), staleTime: 6 * 60 * 60_000 });
  const teams = q.data?.teams ?? [];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {q.isLoading
        ? Array.from({ length: 30 }).map((_, i) => <div key={i} className="h-20 rounded-2xl ring-1 ring-border bg-card animate-pulse" />)
        : teams.map((t) => <MlsTeamCard key={t.id} team={t} />)}
    </div>
  );
}
