import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNbaStandingsPro } from "@/lib/nba.functions";
import { NbaStandingsPro } from "@/components/nba/NbaStandingsPro";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/nba/standings")({
  head: () => ({
    meta: [
      { title: "NBA Standings — East & West Conference" },
      { name: "description", content: "Live Eastern and Western Conference standings with division breakdowns, streaks, last 10, and point differential." },
      { property: "og:url", content: "https://www.playsports.online/nba/standings" },
      { property: "og:title", content: "NBA Standings — East & West Conference" },
      { property: "og:description", content: "Live Eastern and Western Conference standings with division breakdowns, streaks, last 10, and point differential." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NBA Standings — East & West Conference" },
      { name: "twitter:description", content: "Live Eastern and Western Conference standings with division breakdowns, streaks, last 10, and point differential." },
    
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/nba/standings" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "NBA", path: "/nba" }, { name: "Standings", path: "/nba/standings" }]))],
  }),
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["nba", "st"],
      queryFn: () => getNbaStandingsPro(),
      staleTime: 30 * 60_000,
    }).catch(() => null);
    return null;
  },
  component: NbaStandings,
});

function NbaStandings() {
  const fn = useServerFn(getNbaStandingsPro);
  const q = useQuery({ queryKey: ["nba", "st"], queryFn: () => fn(), staleTime: 30 * 60_000 });
  if (q.isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 rounded-2xl ring-1 ring-border bg-card animate-pulse" />)}
      </div>
    );
  }
  return <NbaStandingsPro conferences={q.data?.conferences ?? []} />;
}
