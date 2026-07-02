import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlbStandingsPro } from "@/lib/mlb.functions";
import { MlbStandingsPro } from "@/components/mlb/MlbStandingsPro";
import { StandingsSkeleton } from "@/components/sports/Skeletons";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/mlb/standings")({
  head: () => ({
    meta: [
      { title: "MLB Standings — AL · NL · Wild Card" },
      { name: "description", content: "Live MLB standings by Division, League, and Wild Card with GB, PCT, L10, streak, run differential, and playoff probability." },
      { property: "og:title", content: "MLB Standings — AL · NL · Wild Card" },
      { property: "og:description", content: "Live MLB standings with playoff probability and run differential." },
      { property: "og:url", content: "https://www.playsports.online/mlb/standings" },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb/standings" }],
    scripts: [ldScript(breadcrumbList([{ name: "Home", path: "/" }, { name: "MLB", path: "/mlb" }, { name: "Standings", path: "/mlb/standings" }]))],
  }),
  component: StandingsPage,
});

function StandingsPage() {
  const fn = useServerFn(getMlbStandingsPro);
  const q = useQuery({
    queryKey: ["mlb", "standings", "pro"],
    queryFn: () => fn(),
    staleTime: 15 * 60_000,
    refetchOnWindowFocus: false,
  });
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight">Standings</h2>
        <p className="text-xs text-muted-foreground">
          Division, league and wild-card races · auto-updates every 15 minutes
        </p>
      </div>
      {q.isLoading ? (
        <StandingsSkeleton />
      ) : (
        <MlbStandingsPro leagues={q.data?.leagues ?? []} />
      )}
    </div>
  );
}
