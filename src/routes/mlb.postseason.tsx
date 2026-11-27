import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMlbPostseason } from "@/lib/mlb.functions";
import { currentSeason } from "@/lib/tournament-config";
import { MlbPostseasonBracket } from "@/components/mlb/MlbPostseasonBracket";
import { breadcrumbList, ldScript } from "@/lib/seo/jsonld";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { errorMessage } from "@/lib/error-message";

import { withHubLinks } from "@/components/seo/withHubLinks";
export const Route = createFileRoute("/mlb/postseason")({
  head: () => ({
    meta: [
      { title: "MLB Postseason Bracket — Wild Card, ALDS/NLDS, ALCS/NLCS, World Series" },
      {
        name: "description",
        content:
          "Live MLB playoff bracket: Wild Card, Division Series, League Championship, and World Series with series scores and game-by-game results.",
      },
      { property: "og:title", content: "MLB Postseason Bracket" },
      {
        property: "og:description",
        content: "Wild Card → Division Series → LCS → World Series with live updates.",
      },
      { property: "og:url", content: "https://www.playsports.online/mlb/postseason" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PlaySports" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "MLB Postseason Bracket — Wild Card, ALDS/NLDS, ALCS/NLCS, World Series",
      },
      {
        name: "twitter:description",
        content:
          "Live MLB playoff bracket: Wild Card, Division Series, League Championship, and World Series with series scores and game-by-game results.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.playsports.online/mlb/postseason" }],
    scripts: [
      ldScript(
        breadcrumbList([
          { name: "Home", path: "/" },
          { name: "MLB", path: "/mlb" },
          { name: "Postseason", path: "/mlb/postseason" },
        ]),
      ),
    ],
  }),
  component: withHubLinks(PostseasonPage, { sport: "mlb", currentPath: "/mlb/postseason" }),
});

const CURRENT = currentSeason("mlb");
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT - i);

function PostseasonPage() {
  const fetcher = useServerFn(getMlbPostseason);
  const [year, setYear] = useState<number>(CURRENT);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["mlb-postseason", year],
    queryFn: () => fetcher({ data: { year } }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Postseason Bracket</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Wild Card → Division Series → LCS → World Series
          </p>
        </div>
        <select
          aria-label="Postseason year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="min-h-11 rounded-xl bg-card ring-1 ring-border px-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </header>

      {isLoading ? (
        <div
          className="rounded-2xl ring-1 ring-border bg-card p-8 text-center text-sm text-muted-foreground"
          role="status"
        >
          Loading {year} postseason…
        </div>
      ) : error ? (
        <ErrorState
          title={`Could not load the ${year} postseason`}
          message={errorMessage(error)}
          onRetry={() => void refetch()}
        />
      ) : (data?.series.length ?? 0) === 0 ? (
        <EmptyState
          title={`No ${year} postseason bracket`}
          description="This postseason is not in the archive yet."
        />
      ) : (
        <MlbPostseasonBracket series={data?.series ?? []} />
      )}
    </div>
  );
}
